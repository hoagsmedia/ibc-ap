import { fail, redirect } from "@sveltejs/kit";
import { and, ilike, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { createPasswordResetToken } from "$lib/server/password-reset";
import {
	isResendPasswordResetConfigured,
	sendPasswordResetEmail
} from "$lib/server/send-password-reset-email";
import {
	enforceRateLimits,
	getClientIp,
	normalizeIdentifier,
	PASSWORD_RESET_IP_RULE,
	PASSWORD_RESET_EMAIL_RULE,
	RATE_LIMITED_MESSAGE
} from "$lib/server/rate-limit";
import type { Actions, PageServerLoad } from "./$types";

const forgotSchema = z.object({
	email: z.string().trim().email("Enter a valid email address.").max(255)
});

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, "/dashboard");
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, url } = event;
		const formData = await request.formData();
		const parsed = forgotSchema.safeParse({ email: formData.get("email") });
		if (!parsed.success) {
			return fail(400, {
				emailError: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email."
			});
		}

		const emailNorm = parsed.data.email.trim().toLowerCase();

		// Throttle reset requests per IP and per email to blunt inbox flooding
		// and enumeration. The message stays generic and account-neutral.
		const rate = await enforceRateLimits([
			{ scope: "reset:ip", identifier: getClientIp(event), rule: PASSWORD_RESET_IP_RULE },
			{
				scope: "reset:email",
				identifier: normalizeIdentifier(emailNorm),
				rule: PASSWORD_RESET_EMAIL_RULE
			}
		]);
		if (rate.limited) {
			return fail(429, { emailError: RATE_LIMITED_MESSAGE });
		}

		const [user] = await db
			.select({
				id: table.users.id,
				email: table.users.email,
				name: table.users.name,
				password_hash: table.users.password_hash
			})
			.from(table.users)
			.where(and(isNotNull(table.users.email), ilike(table.users.email, emailNorm)))
			.limit(1);

		const genericSuccess = {
			sent: true as const,
			message:
				"If an account exists for that email, we sent a reset link. Check your inbox (and spam) in the next few minutes."
		};

		if (!user?.email?.trim()) {
			return genericSuccess;
		}

		const hash = user.password_hash?.trim() ?? "";
		if (!hash.startsWith("$")) {
			return genericSuccess;
		}

		if (!isResendPasswordResetConfigured()) {
			console.warn("[forgot-password] Resend not configured; skipping email send.");
			return genericSuccess;
		}

		try {
			const { id: resetRequestId, token } = await createPasswordResetToken({
				userId: user.id,
				source: "user"
			});
			const resetUrl = `${url.origin}/reset-password/${token}`;
			const sent = await sendPasswordResetEmail({
				resetRequestId,
				kind: "user",
				to: user.email.trim(),
				recipientName: user.name,
				resetUrl
			});
			if (!sent.ok) {
				console.error("[forgot-password] send failed", sent.message);
			}
		} catch (err) {
			console.error("[forgot-password] error", err);
		}

		return genericSuccess;
	}
};
