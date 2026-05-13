import { createHash } from "node:crypto";
import { env } from "$env/dynamic/private";
import { Resend } from "resend";

const DEFAULT_CONTACT_TO = "contact.form@islandbeerclub.com";
/** Template alias in Resend (vars: MESSAGE, SENDER_EMAIL, SENDER_NAME, SUBMITTED_AT). */
const DEFAULT_CONTACT_TEMPLATE_ID = "contact-form-submission";

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
	const templateId = env.RESEND_CONTACT_TEMPLATE_ID?.trim() || DEFAULT_CONTACT_TEMPLATE_ID;
	const subject =
		env.RESEND_CONTACT_SUBJECT?.trim() || `IBC website contact — ${name.slice(0, 60)}`;
	const submittedAt = new Date().toLocaleString("en-US", {
		timeZone: "America/Los_Angeles",
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short"
	});

	const resend = new Resend(apiKey);
	const idempotencyKey = contactFormIdempotencyKey({ name, email, message });

	const { data, error } = await resend.emails.send(
		{
			from,
			to,
			subject,
			replyTo: email,
			template: {
				id: templateId,
				variables: {
					MESSAGE: message,
					SENDER_EMAIL: email,
					SENDER_NAME: name,
					SUBMITTED_AT: submittedAt
				}
			},
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
