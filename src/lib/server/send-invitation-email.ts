import { createHash } from "node:crypto";
import { env } from "$env/dynamic/private";
import { Resend } from "resend";

const DEFAULT_INVITATION_TEMPLATE_ID = "invitation-to-join";

/** Resend idempotency key: same invite + recipient must dedupe; different recipient must not 409. */
function invitationEmailIdempotencyKey(invitationId: string, to: string): string {
	const recipient = to.trim().toLowerCase();
	const suffix = createHash("sha256").update(recipient).digest("hex").slice(0, 16);
	return `invite-email/${invitationId}/${suffix}`;
}

export function isResendInviteConfigured(): boolean {
	const key = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM_EMAIL?.trim();
	return Boolean(key && from);
}

export type SendInvitationEmailResult = { ok: true } | { ok: false; message: string };

/** Sends invite URL via Resend template (`prospectName`, `invitingMemberName`, `inviteUrl`). */
export async function sendInvitationLinkEmail(input: {
	/** DB row id — used for Resend `Idempotency-Key` (safe retries, no duplicate sends). */
	invitationId: string;
	to: string;
	inviteUrl: string;
	inviteLabel: string;
	inviterName: string;
}): Promise<SendInvitationEmailResult> {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM_EMAIL?.trim();
	if (!apiKey || !from) {
		return { ok: false, message: "Email sending is not configured (missing Resend env vars)." };
	}

	const templateId = env.RESEND_INVITATION_TEMPLATE_ID?.trim() || DEFAULT_INVITATION_TEMPLATE_ID;

	const resend = new Resend(apiKey);
	const subject =
		env.RESEND_INVITATION_SUBJECT?.trim() ||
		`Island Beer Club invitation — ${input.inviteLabel.slice(0, 80)}`;

	const idempotencyKey = invitationEmailIdempotencyKey(input.invitationId, input.to);

	const { data, error } = await resend.emails.send(
		{
			from,
			to: input.to,
			subject,
			template: {
				id: templateId,
				variables: {
					prospectName: input.inviteLabel,
					invitingMemberName: input.inviterName,
					inviteUrl: input.inviteUrl
				}
			}
		},
		{ idempotencyKey }
	);

	if (error) {
		console.error("[resend] invitation email failed", error);
		return {
			ok: false,
			message: typeof error.message === "string" ? error.message : "Could not send email."
		};
	}
	if (!data?.id) {
		return { ok: false, message: "Email did not send (no message id)." };
	}
	return { ok: true };
}
