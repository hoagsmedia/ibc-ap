import { dev } from "$app/environment";
import { redirect, error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";
import { asc, or, ilike, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	// Authentication checks
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	// Get pagination parameters from URL
	const page = Number(url.searchParams.get("page") || "1");
	const perPage = Number(url.searchParams.get("perPage") || "10");
	const searchTerm = url.searchParams.get("search") || "";
	const useCache = url.searchParams.get("useCache") === "true"; // Client hint to use cache

	// If client indicates it's using cache and has results, return minimal data
	if (useCache && searchTerm) {
		if (dev && ibcDebugEnabled()) {
			console.log("[IBC-LOG] [members] Using cached results for search term:", searchTerm);
		}
		return {
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

	// Validate pagination parameters
	if (isNaN(page) || page < 1) throw error(400, "Invalid page number");
	if (isNaN(perPage) || perPage < 1 || perPage > 100) throw error(400, "Invalid items per page");

	// Calculate offset
	const offset = (page - 1) * perPage;

	// Build query conditions
	let conditions = undefined;

	if (searchTerm) {
		// Convert searchTerm to number for potential member number comparison
		const numericSearchTerm = !isNaN(Number(searchTerm)) ? Number(searchTerm) : null;

		if (numericSearchTerm !== null) {
			// If searchTerm is a valid number, we can search directly in the numeric field
			// and also in text fields with the string version
			conditions = or(
				ilike(users.name, `%${searchTerm}%`),
				ilike(users.email, `%${searchTerm}%`),
				ilike(users.username, `%${searchTerm}%`),
				sql`CAST(${users.mbr} AS TEXT) LIKE ${`%${searchTerm}%`}`,
				sql`${users.mbr} = ${numericSearchTerm}`
			);
		} else {
			// If searchTerm is not a number, we only search in text fields
			conditions = or(
				ilike(users.name, `%${searchTerm}%`),
				ilike(users.email, `%${searchTerm}%`),
				ilike(users.username, `%${searchTerm}%`),
				sql`CAST(${users.mbr} AS TEXT) LIKE ${`%${searchTerm}%`}`
			);
		}
	}

	// Fetch members with pagination and search filter, plus total count in a single query
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

	// Calculate total pages
	const totalPages = Math.ceil(totalCount / perPage);

	return {
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
