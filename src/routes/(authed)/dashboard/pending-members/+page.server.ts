import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { getMbrConflictMessage } from "$lib/server/mbr-uniqueness";
import { getUsernameForMemberWithMbr } from "$lib/server/username";
import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";

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
	assignMember: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, "/login");
		if (locals.user.role !== "admin") return fail(403, { message: "Admin required" });

		const formData = await request.formData();
		const userId = formData.get("userId") as string | null;
		const mbrRaw = formData.get("mbr");

		if (!userId) return fail(400, { message: "Missing user" });
		const mbr = mbrRaw != null && mbrRaw !== "" ? parseInt(String(mbrRaw), 10) : NaN;
		if (Number.isNaN(mbr) || mbr < 1)
			return fail(400, { message: "Enter a valid member number (1 or higher)" });

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
				username,
				updated_at: new Date()
			})
			.where(eq(users.id, userId));

		return {
			success: true,
			message: `${member.name} is now member #${mbr}.`,
			assignedId: userId,
			memberId: userId
		};
	}
};
