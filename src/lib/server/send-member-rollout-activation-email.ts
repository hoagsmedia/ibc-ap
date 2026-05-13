import { createHash } from "node:crypto";
import { env } from "$env/dynamic/private";
import { escapeHtml } from "$lib/server/escape-html.js";
import { Resend } from "resend";
import { isResendInviteConfigured } from "$lib/server/send-invitation-email";

/** Published template id: 0fff1da1-6276-4223-89c3-8ab3ad583859 */
const DEFAULT_MEMBER_ROLLOUT_TEMPLATE_ID = "island-beer-club-invite";

function idempotencyKey(memberRolloutRowId: string, to: string): string {
	const recipient = to.trim().toLowerCase();
	const suffix = createHash("sha256").update(recipient).digest("hex").slice(0, 16);
	return `member-rollout-email/${memberRolloutRowId}/${suffix}`;
}

export type SendMemberRolloutActivationEmailResult = { ok: true } | { ok: false; message: string };

export function isMemberRolloutEmailConfigured(): boolean {
	return isResendInviteConfigured();
}

/** Separate from prospect invitation emails - Resend template (default alias `island-beer-club-invite`; override via env). */
export async function sendMemberRolloutActivationEmail(input: {
	memberRolloutRowId: string;
	to: string;
	recipientName: string;
	invitingMemberName: string;
	activationUrl: string;
}): Promise<SendMemberRolloutActivationEmailResult> {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM_EMAIL?.trim();
	if (!apiKey || !from) {
		return { ok: false, message: "Email sending is not configured (missing Resend env vars)." };
	}

	const name = input.recipientName.trim() || "there";
	const subject =
		env.RESEND_MEMBER_ROLLOUT_SUBJECT?.trim() ??
		"Activate your Island Beer Club member website account";

	const rawTemplate = env.RESEND_MEMBER_ROLLOUT_TEMPLATE_ID;
	const templateId =
		rawTemplate === undefined || rawTemplate === null
			? DEFAULT_MEMBER_ROLLOUT_TEMPLATE_ID
			: rawTemplate.trim();

	const htmlBody = `
<p>Hi ${escapeHtml(name)},</p>
<p>${escapeHtml(input.invitingMemberName.trim() || "An administrator")} invited you to access the Island Beer Club member website using your existing member profile.</p>
<p><a href="${escapeHtml(input.activationUrl)}">Set your password and activate your account</a></p>
<p>This link is for current members only and does not start a new membership application.</p>
`.trim();

	const resend = new Resend(apiKey);
	const idk = idempotencyKey(input.memberRolloutRowId, input.to);

	if (templateId) {
		const { data, error } = await resend.emails.send(
			{
				from,
				to: input.to,
				subject,
				template: {
					id: templateId,
					variables: {
						inviterName: input.invitingMemberName.trim() || "An administrator",
						memberName: name,
						activationUrl: input.activationUrl
					}
				},
				tags: [{ name: "source", value: "member-rollout" }]
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
			tags: [{ name: "source", value: "member-rollout" }]
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
