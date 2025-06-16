import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { asc, count, desc, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const ITEMS_PER_PAGE = 10;

export const load: PageServerLoad = async ({ locals, url }) => {
	// Check if user is authenticated
	if (!locals.user) {
		return redirect(302, '/login');
	}

	// Check if user has admin role
	if (locals.user.role !== 'admin') {
		return error(403, 'Access denied. Admin role required.');
	}

	// Get pagination parameters from URL
	const page = parseInt(url.searchParams.get('page') || '1');
	const search = url.searchParams.get('search') || '';
	const sortBy = url.searchParams.get('sort') || 'name';
	const sortOrder = url.searchParams.get('order') || 'asc';

	// Validate page number
	if (page < 1) {
		return redirect(302, '/members?page=1');
	}

	// Calculate offset
	const offset = (page - 1) * ITEMS_PER_PAGE;

	// Build where conditions for search
	const whereConditions = search
		? sql`${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`}`
		: undefined;

	// Build order by clause
	const orderBy = (() => {
		const column =
			sortBy === 'name'
				? users.name
				: sortBy === 'email'
					? users.email
					: sortBy === 'role'
						? users.role
						: sortBy === 'mbr'
							? users.mbr
							: sortBy === 'created_at'
								? users.created_at
								: users.name;

		return sortOrder === 'desc' ? desc(column) : asc(column);
	})();

	try {
		// Get total count for pagination
		const totalCountResult = await db.select({ count: count() }).from(users).where(whereConditions);

		const totalItems = totalCountResult[0]?.count || 0;
		const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

		// Get paginated members
		const members = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				img: users.img,
				phone: users.phone,
				role: users.role,
				mbr: users.mbr,
				msd: users.msd,
				test_passed: users.test_passed,
				created_at: users.created_at
			})
			.from(users)
			.where(whereConditions)
			.orderBy(orderBy)
			.limit(ITEMS_PER_PAGE)
			.offset(offset);

		return {
			members,
			pagination: {
				currentPage: page,
				totalPages,
				totalItems,
				itemsPerPage: ITEMS_PER_PAGE,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1
			},
			search,
			sortBy,
			sortOrder
		};
	} catch (err) {
		console.error('Failed to load members:', err);
		return error(500, 'Failed to load members');
	}
};
