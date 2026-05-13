import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { getMbrConflictMessage } from "$lib/server/mbr-uniqueness";
import { getUsernameForMemberWithMbr } from "$lib/server/username";
import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { assignMemberSchema } from "./assign-member-schema";
import { sendProspectPromotedToMemberEmail } from "$lib/server/send-prospect-promoted-email";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (locals.user.role !== "admin") {
		throw error(403, "Access denied. Admin role required.");
	}

	// Anyone who passed the test but has no member number yet (still guest until admin assigns MBR)
	const rows = await db
		.select({
			id: users.id,
			username: users.username,
			name: users.name,
			email: users.email,
			test_passed: users.test_passed
		})
		.from(users)
		.where(and(isNotNull(users.test_passed), isNull(users.mbr)))
		.orderBy(asc(users.test_passed));

	const pendingMembers = rows
		.filter((r) => r.test_passed != null)
		.map((r) => ({
			id: r.id,
			username: r.username,
			name: r.name,
			email: r.email,
			test_passed: r.test_passed as Date
		}));

	return { pendingMembers };
};

export const actions: Actions = {
	assignMember: async ({ request, locals, url }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") return fail(403, { message: "Admin required" });

		const formData = await request.formData();
		const parsed = assignMemberSchema.safeParse({
			userId: formData.get("userId"),
			mbr: formData.get("mbr"),
			rungInDate: formData.get("rungInDate")
		});
		if (!parsed.success) {
			return fail(400, {
				message:
					parsed.error.issues[0]?.message ??
					"Enter a valid member number (1 or higher) and rung-in date"
			});
		}
		const { userId, mbr, rungInDate } = parsed.data;

		const [member] = await db.select().from(users).where(eq(users.id, userId));
		if (!member) return fail(404, { message: "Member not found" });

		const mbrConflict = await getMbrConflictMessage(db, mbr, userId);
		if (mbrConflict) return fail(400, { message: mbrConflict });

		const username = await getUsernameForMemberWithMbr(member.name, mbr, userId);

		await db
			.update(users)
			.set({
				mbr,
				role: "member",
				rung_in_date: rungInDate,
				username,
				updated_at: new Date()
			})
			.where(eq(users.id, userId));

		let message = `${member.name} is now member #${mbr}.`;
		const email = member.email?.trim();
		if (email) {
			const profileUrl = `${url.origin}/members/${userId}`;
			const sent = await sendProspectPromotedToMemberEmail({
				userId,
				to: email,
				memberName: member.name,
				memberNumber: mbr,
				profileUrl
			});
			if (!sent.ok) {
				message += ` Welcome email was not sent (${sent.message})`;
			}
		}

		return {
			success: true,
			message,
			assignedId: userId,
			memberId: userId
		};
	}
};
