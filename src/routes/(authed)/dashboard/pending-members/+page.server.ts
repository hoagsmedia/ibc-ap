import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { and, asc, isNotNull, isNull } from "drizzle-orm";

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
			name: r.name,
			email: r.email,
			test_passed: r.test_passed as Date
		}));

	return { pendingMembers };
};
