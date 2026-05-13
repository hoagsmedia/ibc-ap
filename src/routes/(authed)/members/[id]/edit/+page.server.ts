import type { Actions, PageServerLoad } from "./$types";
import { error, fail, isRedirect, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { getMemberById, isMemberRecordId } from "$lib/server/member-lookup";
import { getUsernameForMemberWithMbr } from "$lib/server/username";
import { eq } from "drizzle-orm";
import { getEmailConflictMessage, getMbrConflictMessage } from "$lib/server/mbr-uniqueness";
import { superValidate } from "sveltekit-superforms";
import { memberSchema } from "./edit-member-schema";
import { zod } from "sveltekit-superforms/adapters";
import { createPasswordResetToken } from "$lib/server/password-reset";
import {
	isResendPasswordResetConfigured,
	sendPasswordResetEmail
} from "$lib/server/send-password-reset-email";
import { userWithoutPasswordHash } from "$lib/server/user-client";
import { msdFromDateInput, msdToDateInputValue } from "$lib/server/msd";
import { resolveMemberBackLink } from "$lib/server/member-back-link";

/** Must match the main `superForm` `id` on the edit page (multiple forms share `data.form`). */
const MEMBER_EDIT_FORM_ID = "member-edit";

export const load: PageServerLoad = async ({ locals, params, url, request }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (locals.user.role !== "admin") {
		throw error(403, "Access denied. Admin role required.");
	}

	const id = params.id;
	if (!id || !isMemberRecordId(id)) {
		throw error(400, "Invalid member id");
	}

	const member = await getMemberById(id);
	if (!member) {
		throw error(404, "Member not found");
	}

	const memberData = {
		id: member.id,
		name: member.name,
		email: member.email ?? "",
		phone: member.phone ?? "",
		address: member.address ?? "",
		bio: member.bio ?? "",
		hobbies: member.hobbies ?? "",
		img: member.img ?? "",
		role: member.role,
		likes: member.likes ?? "",
		mbr: member.mbr ?? 0,
		msd: msdToDateInputValue(member.msd),
		dops: member.dops ?? false,
		dops_date: member.dops_date ?? "",
		rung_in_date: member.rung_in_date ?? "",
		sponsor: member.sponsor ?? "",
		test_passed: member.test_passed?.toISOString() ?? "",
		created_at: member.created_at?.toISOString(),
		updated_at: member.updated_at?.toISOString()
	};

	return {
		member: userWithoutPasswordHash(member),
		user: locals.user,
		form: await superValidate(memberData, zod(memberSchema), { id: MEMBER_EDIT_FORM_ID }),
		backLink: resolveMemberBackLink({
			backQuery: url.searchParams.get("back"),
			referer: request.headers.get("referer"),
			urlOrigin: url.origin
		})
	};
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") throw error(403, "Access denied. Admin role required.");

		const routeId = params.id;
		if (!routeId || !isMemberRecordId(routeId)) {
			return fail(400, { message: "Invalid member id" });
		}

		const form = await superValidate(request, zod(memberSchema), { id: MEMBER_EDIT_FORM_ID });
		if (!form.valid) return fail(400, { form });

		if (form.data.id !== routeId) {
			return fail(400, { form, message: "Form data does not match this member profile." });
		}

		const member = await getMemberById(routeId);
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
				rung_in_date,
				sponsor,
				test_passed
			} = form.data;

			const newRole = (role as "guest" | "member" | "admin") || "member";
			const mbrNum = mbr || 0;
			const resolvedRole: "guest" | "member" | "admin" =
				mbrNum > 0 && newRole !== "admin" ? "member" : newRole;

			const testPassedValue =
				resolvedRole === "admin"
					? new Date()
					: test_passed && test_passed.trim() !== ""
						? new Date(test_passed)
						: (member.test_passed ?? null);
			let setUsername: string | undefined;
			if (mbrNum > 0) {
				const mbrConflict = await getMbrConflictMessage(db, mbrNum, id);
				if (mbrConflict) return fail(400, { form, message: mbrConflict });
				setUsername = await getUsernameForMemberWithMbr(name || member.name, mbrNum, id);
			}

			const emailNorm = (email && email.trim()) || null;
			const emailConflict = await getEmailConflictMessage(db, emailNorm, id);
			if (emailConflict) return fail(400, { form, message: emailConflict });

			const updatePayload: Record<string, unknown> = {
				name: name || "",
				email: emailNorm,
				phone: phone || null,
				address: address || null,
				bio: bio || "",
				hobbies: hobbies || null,
				role: resolvedRole,
				likes: likes || null,
				mbr: mbrNum,
				msd: msdFromDateInput(msd),
				dops: dops,
				dops_date: dops_date ? new Date(dops_date).toISOString().split("T")[0] : null,
				rung_in_date: rung_in_date ? new Date(rung_in_date).toISOString().split("T")[0] : null,
				sponsor: sponsor || null,
				test_passed: testPassedValue,
				updated_at: new Date()
			};
			if (setUsername != null) updatePayload.username = setUsername;
			if (resolvedRole === "admin") {
				updatePayload.account_active = true;
			}

			const updated = await db.update(users).set(updatePayload).where(eq(users.id, id)).returning();

			if (!updated.length) return fail(500, { form, message: "Failed to update member" });
			throw redirect(303, `/members/${updated[0].id}/edit`);
		} catch (err) {
			if (isRedirect(err)) throw err;
			console.error("Error updating member:", err);
			return fail(500, { form, message: "An error occurred while updating the member" });
		}
	},

	delete: async ({ request, locals, params }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") throw error(403, "Access denied. Admin role required.");

		const routeId = params.id;
		if (!routeId || !isMemberRecordId(routeId)) {
			return fail(400, { message: "Invalid member id" });
		}

		const formData = await request.formData();
		if (formData.get("confirmText") !== "DELETE") {
			return fail(400, { message: "Incorrect confirmation text" });
		}

		const idFromForm = formData.get("id")?.toString();
		if (idFromForm !== routeId) {
			return fail(400, { message: "Form data does not match this member profile." });
		}

		const member = await getMemberById(routeId);
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
		throw redirect(302, "/dashboard/members");
	},

	resetPassword: async ({ request, locals, params, url }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") throw error(403, "Access denied. Admin role required.");

		const routeId = params.id;
		if (!routeId || !isMemberRecordId(routeId)) {
			return fail(400, { message: "Invalid member id" });
		}

		const resetFormData = await request.formData();
		const idFromForm = resetFormData.get("userId")?.toString();
		if (idFromForm !== routeId) {
			return fail(400, { message: "Form data does not match this member profile." });
		}

		const member = await getMemberById(routeId);
		if (!member) return fail(404, { message: "Member not found" });
		if (member.id === locals.user.id) {
			return fail(400, {
				message:
					"You cannot reset your own password through this method. Use the settings page instead."
			});
		}

		const email = member.email?.trim();
		if (!email) {
			return fail(400, {
				message: "This member has no email on file. Add an email before sending a password reset."
			});
		}

		if (!isResendPasswordResetConfigured()) {
			return fail(503, {
				message:
					"Password reset emails are not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server."
			});
		}

		try {
			const { id: resetRequestId, token } = await createPasswordResetToken({
				userId: member.id,
				source: "admin",
				createdByAdminId: locals.user.id
			});
			const resetUrl = `${url.origin}/reset-password/${token}`;
			const sent = await sendPasswordResetEmail({
				resetRequestId,
				kind: "admin",
				to: email,
				recipientName: member.name,
				resetUrl
			});

			if (!sent.ok) {
				console.error("[admin reset password] email failed", sent.message);
				return fail(502, {
					message: sent.message ?? "Could not send the reset email. Check Resend configuration."
				});
			}

			return {
				success: true,
				message: `A reset link was sent to ${email}. It expires in one hour.`
			};
		} catch (err) {
			console.error("Error resetting password:", err);
			return fail(500, { message: "Failed to send password reset" });
		}
	}
};
