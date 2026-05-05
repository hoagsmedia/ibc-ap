import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { hash } from "argon2";
import { encodeBase32LowerCase } from "@oslojs/encoding";
import { sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { getMbrConflictMessage } from "$lib/server/mbr-uniqueness";
import { getUsernameForMemberWithMbr } from "$lib/server/username";
import type { Actions, PageServerLoad } from "./$types";
import { createMemberSchema } from "./create-member-schema";

const FORM_ID = "dashboard-create-member";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (locals.user.role !== "admin") {
		throw error(403, "Access denied. Admin role required.");
	}

	return {
		form: await superValidate(
			{ name: "", email: "", mbr: undefined, phone: "" },
			zod(createMemberSchema),
			{ id: FORM_ID }
		)
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") {
			return fail(403, { message: "Admin role required." });
		}

		const form = await superValidate(request, zod(createMemberSchema), { id: FORM_ID });
		if (!form.valid) {
			return fail(400, { form });
		}

		const name = form.data.name.trim();
		const email = form.data.email.trim();
		const mbr = form.data.mbr;
		const phone = form.data.phone?.trim() || "";
		const userId = crypto.randomUUID();

		const emailLower = email.toLowerCase();
		const [existing] = await db
			.select({ id: users.id })
			.from(users)
			.where(sql`lower(trim(${users.email})) = ${emailLower}`)
			.limit(1);

		if (existing) {
			return fail(400, {
				form,
				message: "That email is already registered to another profile."
			});
		}

		const mbrConflict = await getMbrConflictMessage(db, mbr, userId);
		if (mbrConflict) {
			return fail(400, { form, message: mbrConflict });
		}

		const username = await getUsernameForMemberWithMbr(name, mbr, userId);
		const randomSecret = encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(32)));
		const password_hash = await hash(randomSecret);

		try {
			await db.insert(users).values({
				id: userId,
				name,
				username,
				email,
				password_hash,
				phone: phone || null,
				role: "member",
				mbr,
				msd: null,
				sponsor: null,
				address: null,
				bio: null,
				hobbies: null,
				likes: null,
				img: null,
				dops: false,
				dops_date: null,
				test_passed: null,
				account_active: false
			});
		} catch (e) {
			console.error("admin create member:", e);
			return fail(500, {
				form,
				message: "Could not create the profile. Try again or check for a duplicate email."
			});
		}

		throw redirect(303, `/members/${userId}/edit`);
	}
};
