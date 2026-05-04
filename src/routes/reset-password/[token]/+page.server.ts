import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { hash } from "argon2";
import { z } from "zod";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { getActivePasswordResetByToken } from "$lib/server/password-reset";
import type { Actions, PageServerLoad } from "./$types";

const resetSchema = z
	.object({
		password: z.string().min(6, "At least 6 characters").max(24, "At most 24 characters"),
		confirmPassword: z.string().min(6).max(24)
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Passwords must match",
		path: ["confirmPassword"]
	});

export const load: PageServerLoad = async ({ params }) => {
	const token = params.token?.trim();
	if (!token) {
		return { valid: false as const };
	}
	const row = await getActivePasswordResetByToken(token);
	if (!row) {
		return { valid: false as const };
	}
	return { valid: true as const };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const token = params.token?.trim();
		if (!token) {
			return fail(400, { message: "Invalid link." });
		}

		const formData = await request.formData();
		const parsed = resetSchema.safeParse({
			password: formData.get("password"),
			confirmPassword: formData.get("confirmPassword")
		});
		if (!parsed.success) {
			const fe = parsed.error.flatten().fieldErrors;
			return fail(400, {
				message: fe.password?.[0] ?? fe.confirmPassword?.[0] ?? "Check the form and try again."
			});
		}

		const row = await getActivePasswordResetByToken(token);
		if (!row) {
			return fail(400, {
				message: "This reset link is invalid or has expired. Request a new one from the login page."
			});
		}

		const passwordHash = await hash(parsed.data.password);

		try {
			await db.transaction(async (tx) => {
				await tx
					.update(table.users)
					.set({ password_hash: passwordHash, updated_at: new Date() })
					.where(eq(table.users.id, row.user_id));
				await tx
					.update(table.passwordResetTokens)
					.set({ used_at: new Date() })
					.where(eq(table.passwordResetTokens.id, row.id));
				await tx.delete(table.session).where(eq(table.session.userId, row.user_id));
			});
		} catch (err) {
			console.error("[reset-password] transaction failed", err);
			return fail(500, { message: "Could not update your password. Please try again." });
		}

		throw redirect(302, "/login?reset=1");
	}
};
