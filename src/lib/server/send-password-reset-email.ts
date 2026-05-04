import { env } from "$env/dynamic/private";
import { Resend } from "resend";
import { isResendInviteConfigured } from "$lib/server/send-invitation-email";

/** Default aliases — match published templates in Resend. */
const DEFAULT_USER_RESET_TEMPLATE_ID = "forgot-password-rest";
const DEFAULT_ADMIN_RESET_TEMPLATE_ID = "admin-password-reset";

export type SendPasswordResetEmailResult = { ok: true } | { ok: false; message: string };

export type PasswordResetEmailKind = "user" | "admin";

/** Same env as invitations: `RESEND_API_KEY` + `RESEND_FROM_EMAIL`. */
export function isResendPasswordResetConfigured(): boolean {
	return isResendInviteConfigured();
}

/**
 * Sends via Resend templates. Variable keys must match your Resend dashboard exactly.
 * Sends `name` and `reset_url` only — user vs admin copy comes from the two different templates (`kind`).
 */
export async function sendPasswordResetEmail(input: {
	/** Row id of `password_reset_tokens` — idempotency key for this send. */
	resetRequestId: string;
	/** Self-service forgot password vs admin-initiated (picks template id). */
	kind: PasswordResetEmailKind;
	to: string;
	recipientName: string;
	resetUrl: string;
}): Promise<SendPasswordResetEmailResult> {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM_EMAIL?.trim();
	if (!apiKey || !from) {
		return { ok: false, message: "Email sending is not configured (missing Resend env vars)." };
	}

	const templateId =
		input.kind === "admin"
			? env.RESEND_PASSWORD_RESET_ADMIN_TEMPLATE_ID?.trim() || DEFAULT_ADMIN_RESET_TEMPLATE_ID
			: env.RESEND_PASSWORD_RESET_USER_TEMPLATE_ID?.trim() || DEFAULT_USER_RESET_TEMPLATE_ID;

	const name = input.recipientName.trim() || "there";
	const subject =
		env.RESEND_PASSWORD_RESET_SUBJECT?.trim() || "Reset your Island Beer Club password";

	const resend = new Resend(apiKey);
	const idempotencyKey = `password-reset-email/${input.resetRequestId}`;

	const { data, error } = await resend.emails.send(
		{
			from,
			to: input.to,
			subject,
			template: {
				id: templateId,
				variables: {
					name,
					reset_url: input.resetUrl
				}
			},
			tags: [
				{ name: "source", value: "password-reset" },
				{ name: "password_reset_kind", value: input.kind }
			]
		},
		{ idempotencyKey }
	);

	if (error) {
		console.error("[resend] password reset email failed", error);
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
