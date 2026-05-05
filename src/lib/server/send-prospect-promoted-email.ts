import { createHash } from "node:crypto";
import { env } from "$env/dynamic/private";
import { Resend } from "resend";

/** Published template id: a7b68c45-a3ba-4e63-b90d-8d3f1506c0ec */
const DEFAULT_PROSPECT_PROMOTED_TEMPLATE_ID = "island-beer-club-number";

function idempotencyKey(userId: string, mbr: number, to: string): string {
	const recipient = to.trim().toLowerCase();
	const suffix = createHash("sha256").update(recipient).digest("hex").slice(0, 16);
	return `prospect-promoted-email/${userId}/${mbr}/${suffix}`;
}

export type SendProspectPromotedEmailResult = { ok: true } | { ok: false; message: string };

/** Sent when an admin assigns an MBR on Prospects (`/dashboard/pending-members`). */
export async function sendProspectPromotedToMemberEmail(input: {
	userId: string;
	to: string;
	memberName: string;
	memberNumber: number;
	profileUrl: string;
}): Promise<SendProspectPromotedEmailResult> {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM_EMAIL?.trim();
	if (!apiKey || !from) {
		return { ok: false, message: "Email sending is not configured (missing Resend env vars)." };
	}

	const name = input.memberName.trim() || "there";
	const mbr = input.memberNumber;
	const subject =
		env.RESEND_PROSPECT_PROMOTED_SUBJECT?.trim() ??
		`Welcome to Island Beer Club — you're member #${mbr}`;

	const rawTemplate = env.RESEND_PROSPECT_PROMOTED_TEMPLATE_ID;
	const templateId =
		rawTemplate === undefined || rawTemplate === null
			? DEFAULT_PROSPECT_PROMOTED_TEMPLATE_ID
			: rawTemplate.trim();

	const htmlBody = `
<p>Hi ${escapeHtml(name)},</p>
<p>Your member number is <strong>#${escapeHtml(String(mbr))}</strong>. You're now an official Island Beer Club member.</p>
<p><a href="${escapeHtml(input.profileUrl)}">View your member profile</a></p>
`.trim();

	const resend = new Resend(apiKey);
	const idk = idempotencyKey(input.userId, mbr, input.to);

	if (templateId) {
		const { data, error } = await resend.emails.send(
			{
				from,
				to: input.to,
				subject,
				template: {
					id: templateId,
					variables: {
						memberName: name,
						memberNumber: String(mbr),
						profileUrl: input.profileUrl
					}
				},
				tags: [{ name: "source", value: "prospect-promoted" }]
			},
			{ idempotencyKey: idk }
		);
		if (error) {
			return {
				ok: false,
				message: typeof error.message === "string" ? error.message : "Could not send email."
			};
		}
		if (!data?.id) return { ok: false, message: "Email did not send (no message id)." };
		return { ok: true };
	}

	const { data, error } = await resend.emails.send(
		{
			from,
			to: input.to,
			subject,
			html: htmlBody,
			tags: [{ name: "source", value: "prospect-promoted" }]
		},
		{ idempotencyKey: idk }
	);
	if (error) {
		return {
			ok: false,
			message: typeof error.message === "string" ? error.message : "Could not send email."
		};
	}
	if (!data?.id) return { ok: false, message: "Email did not send (no message id)." };
	return { ok: true };
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
