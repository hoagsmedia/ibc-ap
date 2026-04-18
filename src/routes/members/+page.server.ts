import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";
import { membersPublicRosterSnapshot } from "$lib/config/members-public-stats";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";
import { asc, or, ilike, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return {
			isAuthenticated: false as const,
			publicStats: membersPublicRosterSnapshot
		};
	}

	const page = Number(url.searchParams.get("page") || "1");
	const perPage = Number(url.searchParams.get("perPage") || "10");
	const searchTerm = url.searchParams.get("search") || "";
	const useCache = url.searchParams.get("useCache") === "true";

	if (useCache && searchTerm) {
		if (dev && ibcDebugEnabled()) {
			console.log("[IBC-LOG] [members] Using cached results for search term:", searchTerm);
		}
		return {
			isAuthenticated: true as const,
			members: [],
			searchTerm,
			pagination: {
				page: 1,
				perPage,
				totalCount: 0,
				totalPages: 0
			},
			cached: true
		};
	}

	if (isNaN(page) || page < 1) throw error(400, "Invalid page number");
	if (isNaN(perPage) || perPage < 1 || perPage > 100) throw error(400, "Invalid items per page");

	const offset = (page - 1) * perPage;

	let conditions = undefined;

	if (searchTerm) {
		const numericSearchTerm = !isNaN(Number(searchTerm)) ? Number(searchTerm) : null;

		if (numericSearchTerm !== null) {
			conditions = or(
				ilike(users.name, `%${searchTerm}%`),
				ilike(users.email, `%${searchTerm}%`),
				ilike(users.username, `%${searchTerm}%`),
				sql`CAST(${users.mbr} AS TEXT) LIKE ${`%${searchTerm}%`}`,
				sql`${users.mbr} = ${numericSearchTerm}`
			);
		} else {
			conditions = or(
				ilike(users.name, `%${searchTerm}%`),
				ilike(users.email, `%${searchTerm}%`),
				ilike(users.username, `%${searchTerm}%`),
				sql`CAST(${users.mbr} AS TEXT) LIKE ${`%${searchTerm}%`}`
			);
		}
	}

	const membersWithCount = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			username: users.username,
			mbr: users.mbr,
			role: users.role,
			dops: users.dops,
			dops_date: users.dops_date,
			created_at: users.created_at,
			test_passed: users.test_passed,
			img: users.img,
			totalCount: sql<number>`COUNT(*) OVER()`.as("total_count")
		})
		.from(users)
		.where(conditions)
		.orderBy(asc(users.mbr))
		.limit(perPage)
		.offset(offset);

	const members = membersWithCount.map((row) => ({
		id: row.id,
		name: row.name,
		email: row.email,
		username: row.username,
		mbr: row.mbr,
		role: row.role,
		dops: row.dops,
		dops_date: row.dops_date,
		created_at: row.created_at,
		test_passed: row.test_passed,
		img: row.img
	}));
	const totalCount = membersWithCount.length > 0 ? Number(membersWithCount[0].totalCount) : 0;
	const totalPages = Math.ceil(totalCount / perPage);

	return {
		isAuthenticated: true as const,
		members,
		searchTerm,
		pagination: {
			page,
			perPage,
			totalCount,
			totalPages
		},
		cached: false
	};
};
