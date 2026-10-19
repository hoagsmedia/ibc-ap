import { verify } from "argon2";
import { fail, redirect } from "@sveltejs/kit";
import { eq, or } from "drizzle-orm";
import * as auth from "$lib/server/auth";
import { canAccessPlatform } from "$lib/server/account-access";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user && canAccessPlatform(event.locals.user)) {
		return redirect(302, "/dashboard");
	}

	const registered = event.url.searchParams.get("registered") === "1";
	const passwordResetDone = event.url.searchParams.get("reset") === "1";
	const memberRolloutActivated = event.url.searchParams.get("memberRolloutActivated") === "1";
	const email = event.url.searchParams.get("email")?.trim() ?? "";

	return {
		registered,
		passwordResetDone,
		memberRolloutActivated,
		email
	};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const emailOrUsername = formData.get("email");
		const password = formData.get("password");

		if (!validateEmailOrUsername(emailOrUsername)) {
			return fail(400, {
				message: "Invalid email or username"
			});
		}
		if (!validatePassword(password)) {
			return fail(400, { message: "Invalid password (min 6, max 255 characters)" });
		}

		const results = await db
			.select()
			.from(table.users)
			.where(
				or(
					eq(table.users.email, emailOrUsername as string),
					eq(table.users.username, emailOrUsername as string)
				)
			);

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: "Incorrect email or password" });
		}

		// Argon2 hashes are in PHC format and must start with $
		const hash = existingUser.password_hash?.trim() ?? "";
		if (!hash.startsWith("$")) {
			return fail(400, { message: "Incorrect email or password" });
		}
		const validPassword = await verify(hash, password);
		if (!validPassword) {
			return fail(400, { message: "Incorrect email or password" });
		}

		if (!canAccessPlatform(existingUser)) {
			return fail(403, {
				message:
					"Your account isn't activated for the website yet. Use the member rollout link from your email, or ask an admin to resend it."
			});
		}

		const sessionToken = auth.generateSessionToken();

		const session = await auth.createSession(sessionToken, existingUser.id);

		if (existingUser.website_first_login_at == null) {
			await db
				.update(table.users)
				.set({ website_first_login_at: new Date(), updated_at: new Date() })
				.where(eq(table.users.id, existingUser.id));
		}

		auth.setSessionTokenCookie(event, sessionToken, session.expires_at);

		throw redirect(302, "/dashboard");
	}
};

function validateEmailOrUsername(input: unknown): input is string {
	if (typeof input !== "string" || input.length < 1 || input.length > 255) return false;
	if (input.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
	// Username: alphanumeric, underscore, 1–64 chars
	return /^[a-zA-Z0-9_]{1,64}$/.test(input.trim());
}

function validatePassword(password: unknown): password is string {
	return typeof password === "string" && password.length >= 6 && password.length <= 24;
}
