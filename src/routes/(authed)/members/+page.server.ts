import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { asc, or, ilike, sql, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Authentication checks
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// if (locals.user.role !== 'admin') {
	// 	throw error(403, 'Unauthorized');
	// }

	// Get pagination parameters from URL
	const page = Number(url.searchParams.get('page') || '1');
	const perPage = Number(url.searchParams.get('perPage') || '10');
	const searchTerm = url.searchParams.get('search') || '';

	// Validate pagination parameters
	if (isNaN(page) || page < 1) throw error(400, 'Invalid page number');
	if (isNaN(perPage) || perPage < 1 || perPage > 100) throw error(400, 'Invalid items per page');

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
				sql`CAST(${users.mbr} AS TEXT) LIKE ${`%${searchTerm}%`}`,
				sql`${users.mbr} = ${numericSearchTerm}`
			);
		} else {
			// If searchTerm is not a number, we only search in text fields
			conditions = or(
				ilike(users.name, `%${searchTerm}%`),
				ilike(users.email, `%${searchTerm}%`),
				sql`CAST(${users.mbr} AS TEXT) LIKE ${`%${searchTerm}%`}`
			);
		}
	}

	// Fetch members with pagination and search filter
	const members = await db.query.users.findMany({
		where: conditions,
		orderBy: [asc(users.mbr)],
		limit: perPage,
		offset
	});

	// Count total number of members for pagination with search filter applied
	const totalCountResult = await db.select({ count: count() }).from(users).where(conditions);

	const totalCount = Number(totalCountResult[0].count);

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
		}
	};
};
