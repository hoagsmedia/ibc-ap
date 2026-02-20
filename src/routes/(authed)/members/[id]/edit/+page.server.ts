import type { Actions, PageServerLoad } from "./$types";
import { error, redirect, fail } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { getUsernameForMemberWithMbr } from "$lib/server/username";
import { eq } from "drizzle-orm";
import { superValidate, message } from "sveltekit-superforms";
import { memberSchema } from "./edit-member-schema";
import { zod } from "sveltekit-superforms/adapters";
import { hash } from "argon2";
import { encodeBase32LowerCase } from "@oslojs/encoding";

export const load: PageServerLoad = async ({ locals, params }) => {
	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	// Check if user has admin role
	if (locals.user.role !== "admin") {
		throw error(403, "Access denied. Admin role required.");
	}

	const { id } = params;

	if (!id) {
		throw error(400, "User ID is required");
	}

	// Fetch the member details
	const member = await db.query.users.findFirst({
		where: eq(users.id, id)
	});
	if (!member) {
		throw error(404, "Member not found");
	}

	// Transform member data to match schema expectations
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
		dops: member.dops ?? false, // Default to false if not set
		dops_date: member.dops_date ?? "", // Date of Permanent Sobriety
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
		// Check authentication and authorization
		if (!locals.user) {
			throw redirect(302, "/login");
		}

		if (locals.user.role !== "admin") {
			throw error(403, "Access denied. Admin role required.");
		}

		const form = await superValidate(request, zod(memberSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = params;
		if (!id) {
			throw error(400, "User ID is required");
		}

		try {
			// Extract the form data
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

			// Verify the member exists before updating
			const existingMember = await db.query.users.findFirst({
				where: eq(users.id, id)
			});

			if (!existingMember) {
				return fail(404, { form, message: "Member not found" });
			}

			// When promoting to admin, set test_passed to now (IBC-51)
			const newRole = (role as "guest" | "member" | "admin") || "member";
			const testPassedValue =
				newRole === "admin"
					? new Date()
					: test_passed && test_passed.trim() !== ""
						? new Date(test_passed)
						: existingMember.test_passed ?? null;

			const mbrNum = mbr || 0;

			// When assigning a member number, set username to lastname + mbr (same format as seed)
			let setUsername: string | undefined;
			if (mbrNum > 0) {
				setUsername = await getUsernameForMemberWithMbr(name || existingMember.name, mbrNum, id);
			}

			// Update the member in the database
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
			if (setUsername != null) {
				updatePayload.username = setUsername;
			}

			const updatedMember = await db
				.update(users)
				.set(updatePayload)
				.where(eq(users.id, id))
				.returning();

			if (!updatedMember.length) {
				return fail(500, { form, message: "Failed to update member" });
			}

			return message(form, "Member updated successfully!");
		} catch (err) {
			console.error("Error updating member:", err);
			return fail(500, { form, message: "An error occurred while updating the member" });
		}
	},

	delete: async ({ request, locals, params }) => {
		// Check authentication and authorization
		if (!locals.user) {
			throw redirect(302, "/login");
		}

		if (locals.user.role !== "admin") {
			throw error(403, "Access denied. Admin role required.");
		}

		const formData = await request.formData();
		const confirmText = formData.get("confirmText");

		// Validate confirmation text
		if (confirmText !== "DELETE") {
			return fail(400, { message: "Incorrect confirmation text" });
		}

		const { id } = params;
		if (!id) {
			throw error(400, "User ID is required");
		}

		try {
			// Verify the member exists before deleting
			const existingMember = await db.query.users.findFirst({
				where: eq(users.id, id)
			});

			if (!existingMember) {
				return fail(404, { message: "Member not found" });
			}

			// Prevent deleting yourself
			if (existingMember.id === locals.user.id) {
				return fail(400, { message: "You cannot delete your own account" });
			}

			// Delete the member
			await db.delete(users).where(eq(users.id, id));
		} catch (err) {
			console.error("Error deleting member:", err);
			return fail(500, { message: "Failed to delete member" });
		}
		// Redirect to members list after successful deletion
		throw redirect(302, "/members");
	},

	resetPassword: async ({ locals, params }) => {
		// Check authentication and authorization
		if (!locals.user) {
			throw redirect(302, "/login");
		}

		if (locals.user.role !== "admin") {
			throw error(403, "Access denied. Admin role required.");
		}

		const { id } = params;
		if (!id) {
			throw error(400, "User ID is required");
		}

		try {
			// Verify the member exists before resetting password
			const existingMember = await db.query.users.findFirst({
				where: eq(users.id, id)
			});

			if (!existingMember) {
				return fail(404, { message: "Member not found" });
			}

			// Prevent resetting your own password through this method
			if (existingMember.id === locals.user.id) {
				return fail(400, {
					message:
						"You cannot reset your own password through this method. Use the settings page instead."
				});
			}

			// Generate a secure temporary password
			const tempPassword = generateTemporaryPassword();
			const passwordHash = await hash(tempPassword);

			// Update the member's password
			await db
				.update(users)
				.set({
					password_hash: passwordHash,
					updated_at: new Date()
				})
				.where(eq(users.id, id));

			// Return success with the temporary password (should be shown once to admin)
			return {
				success: true,
				message: "Password reset successfully",
				tempPassword: tempPassword,
				memberName: existingMember.name,
				memberEmail: existingMember.email
			};
		} catch (err) {
			console.error("Error resetting password:", err);
			return fail(500, { message: "Failed to reset password" });
		}
	}
};

// Generate a secure temporary password
function generateTemporaryPassword(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(12));
	return encodeBase32LowerCase(bytes).slice(0, 16);
}
