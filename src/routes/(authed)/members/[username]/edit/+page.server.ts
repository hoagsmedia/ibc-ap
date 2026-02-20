import type { Actions, PageServerLoad } from "./$types";
import { error, redirect, fail } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { getMemberByUsernameOrId } from "$lib/server/member-lookup";
import { getUsernameForMemberWithMbr } from "$lib/server/username";
import { eq } from "drizzle-orm";
import { superValidate, message } from "sveltekit-superforms";
import { memberSchema } from "./edit-member-schema";
import { zod } from "sveltekit-superforms/adapters";
import { hash } from "argon2";
import { encodeBase32LowerCase } from "@oslojs/encoding";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (locals.user.role !== "admin") {
		throw error(403, "Access denied. Admin role required.");
	}

	const identifier = params.username;
	if (!identifier) {
		throw error(400, "Member identifier is required");
	}

	const member = await getMemberByUsernameOrId(identifier);
	if (!member) {
		throw error(404, "Member not found");
	}

	// Canonical URL: if they used id but member has username, redirect to username URL
	const isUuid = UUID_REGEX.test(identifier);
	if (isUuid && member.username) {
		throw redirect(302, `/members/${member.username}/edit`);
	}

	const memberData = {
		id: member.id,
		name: member.name,
		email: member.email ?? "",
		password_hash: member.password_hash,
		phone: member.phone ?? "",
		address: member.address ?? "",
		bio: member.bio ?? "",
		hobbies: member.hobbies ?? "",
		img: member.img ?? "",
		role: member.role,
		likes: member.likes ?? "",
		mbr: member.mbr ?? 0,
		msd: member.msd ?? "",
		dops: member.dops ?? false,
		dops_date: member.dops_date ?? "",
		sponsor: member.sponsor ?? "",
		test_passed: member.test_passed?.toISOString() ?? "",
		created_at: member.created_at?.toISOString(),
		updated_at: member.updated_at?.toISOString()
	};

	return {
		member,
		user: locals.user,
		form: await superValidate(memberData, zod(memberSchema))
	};
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") throw error(403, "Access denied. Admin role required.");

		const form = await superValidate(request, zod(memberSchema));
		if (!form.valid) return fail(400, { form });

		const member = await getMemberByUsernameOrId(params.username);
		if (!member) return fail(404, { form, message: "Member not found" });
		const id = member.id;

		try {
			const {
				name,
				email,
				phone,
				address,
				bio,
				hobbies,
				role,
				likes,
				mbr,
				msd,
				dops,
				dops_date,
				sponsor,
				test_passed
			} = form.data;

			const newRole = (role as "guest" | "member" | "admin") || "member";
			const testPassedValue =
				newRole === "admin"
					? new Date()
					: test_passed && test_passed.trim() !== ""
						? new Date(test_passed)
						: (member.test_passed ?? null);

			const mbrNum = mbr || 0;
			let setUsername: string | undefined;
			if (mbrNum > 0) {
				setUsername = await getUsernameForMemberWithMbr(name || member.name, mbrNum, id);
			}

			const updatePayload: Record<string, unknown> = {
				name: name || "",
				email: (email && email.trim()) || null,
				phone: phone || null,
				address: address || null,
				bio: bio || "",
				hobbies: hobbies || null,
				role: newRole,
				likes: likes || null,
				mbr: mbrNum,
				msd: msd || new Date().toISOString().split("T")[0],
				dops: dops,
				dops_date: dops_date ? new Date(dops_date).toISOString().split("T")[0] : null,
				sponsor: sponsor || null,
				test_passed: testPassedValue,
				updated_at: new Date()
			};
			if (setUsername != null) updatePayload.username = setUsername;

			const updated = await db.update(users).set(updatePayload).where(eq(users.id, id)).returning();

			if (!updated.length) return fail(500, { form, message: "Failed to update member" });
			return message(form, "Member updated successfully!");
		} catch (err) {
			console.error("Error updating member:", err);
			return fail(500, { form, message: "An error occurred while updating the member" });
		}
	},

	delete: async ({ request, locals, params }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") throw error(403, "Access denied. Admin role required.");

		const formData = await request.formData();
		if (formData.get("confirmText") !== "DELETE") {
			return fail(400, { message: "Incorrect confirmation text" });
		}

		const member = await getMemberByUsernameOrId(params.username);
		if (!member) return fail(404, { message: "Member not found" });
		if (member.id === locals.user.id) {
			return fail(400, { message: "You cannot delete your own account" });
		}

		try {
			await db.delete(users).where(eq(users.id, member.id));
		} catch (err) {
			console.error("Error deleting member:", err);
			return fail(500, { message: "Failed to delete member" });
		}
		throw redirect(302, "/members");
	},

	resetPassword: async ({ locals, params }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") throw error(403, "Access denied. Admin role required.");

		const member = await getMemberByUsernameOrId(params.username);
		if (!member) return fail(404, { message: "Member not found" });
		if (member.id === locals.user.id) {
			return fail(400, {
				message:
					"You cannot reset your own password through this method. Use the settings page instead."
			});
		}

		try {
			const tempPassword = generateTemporaryPassword();
			const passwordHash = await hash(tempPassword);
			await db
				.update(users)
				.set({ password_hash: passwordHash, updated_at: new Date() })
				.where(eq(users.id, member.id));

			return {
				success: true,
				message: "Password reset successfully",
				tempPassword,
				memberName: member.name,
				memberEmail: member.email
			};
		} catch (err) {
			console.error("Error resetting password:", err);
			return fail(500, { message: "Failed to reset password" });
		}
	}
};

function generateTemporaryPassword(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(12));
	return encodeBase32LowerCase(bytes).slice(0, 16);
}
