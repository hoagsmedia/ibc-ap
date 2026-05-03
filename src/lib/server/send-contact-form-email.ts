import { createHash } from "node:crypto";
import { env } from "$env/dynamic/private";
import { Resend } from "resend";

const DEFAULT_CONTACT_TO = "contact.form@islandbeerclub.com";

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function contactFormIdempotencyKey(input: {
	name: string;
	email: string;
	message: string;
}): string {
	const raw = `${input.name.trim().toLowerCase()}|${input.email.trim().toLowerCase()}|${input.message}`;
	const digest = createHash("sha256").update(raw).digest("hex").slice(0, 48);
	return `contact-form/${digest}`;
}

export function isResendContactFormConfigured(): boolean {
	const key = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM_EMAIL?.trim();
	return Boolean(key && from);
}

export type SendContactFormEmailResult = { ok: true } | { ok: false; message: string };

/** Delivers website contact submissions to the club inbox (Resend → forwarding address). */
export async function sendContactFormEmail(input: {
	name: string;
	email: string;
	message: string;
}): Promise<SendContactFormEmailResult> {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM_EMAIL?.trim();
	const to = env.RESEND_CONTACT_TO_EMAIL?.trim() || DEFAULT_CONTACT_TO;

	if (!apiKey || !from) {
		return { ok: false, message: "Email sending is not configured (missing Resend env vars)." };
	}

	const name = input.name.trim();
	const email = input.email.trim();
	const message = input.message.trim();
	const subject = `IBC website contact — ${name.slice(0, 60)}`;

	const text = [`Name: ${name}`, `Email: ${email}`, "", "Message:", message].join("\n");

	const html = `
<p><strong>Name:</strong> ${escapeHtml(name)}<br/>
<strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Message</strong></p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>
`.trim();

	const resend = new Resend(apiKey);
	const idempotencyKey = contactFormIdempotencyKey({ name, email, message });

	const { data, error } = await resend.emails.send(
		{
			from,
			to,
			subject,
			text,
			html,
			replyTo: email,
			tags: [{ name: "source", value: "website-contact" }]
		},
		{ idempotencyKey }
	);

	if (error) {
		console.error("[resend] contact form email failed", error);
		return {
			ok: false,
			message: typeof error.message === "string" ? error.message : "Could not send message."
		};
	}
	if (!data?.id) {
		return { ok: false, message: "Message did not send (no message id)." };
	}
	return { ok: true };
}
