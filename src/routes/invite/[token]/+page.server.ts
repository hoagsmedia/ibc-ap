import type { PageServerLoad, Actions } from "./$types";
import { validateInvitationToken, markInvitationTokenAsUsed } from "$lib/server/invitations";
import { getUniqueUsernameForNewUser } from "$lib/server/username";
import { error, redirect, fail } from "@sveltejs/kit";
import { hash } from "argon2";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (locals.user) {
		throw redirect(302, "/dashboard");
	}

	const { token } = params;

	if (!token) {
		throw error(404, "Invalid invitation link");
	}

	const { valid, invitation } = await validateInvitationToken(token);

	if (!valid || !invitation) {
		throw error(404, "Invalid or expired invitation link");
	}

	return {
		token,
		invitation,
		sponsorName: invitation.inviter_name?.trim() || "Unknown"
	};
};

export const actions: Actions = {
	register: async (event) => {
		if (event.locals.user) {
			throw redirect(302, "/dashboard");
		}

		const { params, request } = event;
		const { token } = params;

		if (!token) {
			return fail(400, { message: "Invalid invitation token" });
		}

		const { valid, invitation } = await validateInvitationToken(token);
		if (!valid || !invitation) {
			return fail(400, { message: "Invalid or expired invitation link" });
		}

		const formData = await request.formData();
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "")
			.trim()
			.toLowerCase();
		const password = String(formData.get("password") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");
		const phone = String(formData.get("phone") ?? "").trim();
		const address = String(formData.get("address") ?? "").trim();
		const bio = String(formData.get("bio") ?? "").trim();
		const hobbies = String(formData.get("hobbies") ?? "").trim();
		const likes = String(formData.get("likes") ?? "").trim();
		const sponsorName = invitation.inviter_name?.trim() || null;

		if (!name || name.length < 2) {
			return fail(400, { message: "Name must be at least 2 characters long" });
		}

		if (!email || !email.includes("@")) {
			return fail(400, { message: "Valid email address is required" });
		}

		if (!password || password.length < 8) {
			return fail(400, { message: "Password must be at least 8 characters long" });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: "Passwords do not match" });
		}

		try {
			const [existingUser] = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, email));

			if (existingUser) {
				return fail(400, { message: "Email address is already registered" });
			}

			const passwordHash = await hash(password);
			const username = await getUniqueUsernameForNewUser(name);

			const userId = crypto.randomUUID();
			const newUser = {
				id: userId,
				name,
				username,
				email,
				password_hash: passwordHash,
				phone: phone || null,
				address: address || null,
				bio: bio || null,
				hobbies: hobbies || null,
				img: null,
				role: "guest" as const,
				likes: likes || null,
				mbr: null,
				msd: null,
				sponsor: sponsorName,
				dops: false,
				dops_date: null,
				meeting_1_date: null,
				meeting_2_date: null,
				meeting_3_date: null,
				test_passed: null,
				created_at: new Date(),
				updated_at: new Date()
			};

			await db.insert(table.users).values(newUser);
			await markInvitationTokenAsUsed(token, userId);
		} catch (error) {
			console.error("Registration error:", error);
			return fail(500, { message: "Failed to create account. Please try again." });
		}

		const loginParams = new URLSearchParams({
			registered: "1",
			email
		});
		throw redirect(302, `/login?${loginParams.toString()}`);
	}
};
