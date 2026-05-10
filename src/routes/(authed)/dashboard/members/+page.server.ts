import { dev } from "$app/environment";
import { error, redirect } from "@sveltejs/kit";
import { canAccessMemberDirectoryAndStats } from "$lib/ibc-test";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";
import { asc, or, ilike, sql } from "drizzle-orm";
import { readThroughJson } from "$lib/server/redis";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (!canAccessMemberDirectoryAndStats(locals.user)) {
		throw redirect(302, "/dashboard?restricted=directory");
	}

	const page = Number(url.searchParams.get("page") || "1");
	const perPage = Number(url.searchParams.get("perPage") || "10");
	const searchTerm = url.searchParams.get("search") || "";

	if (isNaN(page) || page < 1) throw error(400, "Invalid page number");
	if (isNaN(perPage) || perPage < 1 || perPage > 100) throw error(400, "Invalid items per page");

	const offset = (page - 1) * perPage;
	const namespace = locals.user.role === "admin" ? "admin-member-search" : "member-search";

	return readThroughJson({
		namespace,
		keyParts: {
			page,
			perPage,
			searchTerm: searchTerm.trim(),
			role: locals.user.role
		},
		ttlSeconds: locals.user.role === "admin" ? 45 : 60,
		label: "dashboard/members",
		loader: async () => {
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
					dops: users.dops,
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
				dops: row.dops,
				img: row.img
			}));
			const totalCount = membersWithCount.length > 0 ? Number(membersWithCount[0].totalCount) : 0;
			const totalPages = Math.ceil(totalCount / perPage);

			if (dev && ibcDebugEnabled()) {
				console.log("[IBC-LOG] [dashboard/members] Queried Neon", {
					searchTerm,
					page,
					perPage,
					totalCount,
					namespace
				});
			}

			return {
				members,
				searchTerm,
				pagination: {
					page,
					perPage,
					totalCount,
					totalPages
				}
			};
		}
	});
};
