import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types.js';
import { isAdmin, requireAdmin, requireUser } from '$lib/server/authz';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const allEvents = await db.select().from(events).orderBy(desc(events.created_at));

	return {
		events: allEvents
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const user = requireUser(locals);
		if (!isAdmin(user)) {
			return fail(403, { message: 'Forbidden' });
		}

		const data = await request.formData();
		const eventId = data.get('eventId') as string;

		if (!eventId) {
			return fail(400, { message: 'Event ID is required' });
		}

		try {
			await db.delete(events).where(eq(events.id, eventId));
			return { success: true };
		} catch (error) {
			console.error('Error deleting event:', error);
			return fail(500, { message: 'Failed to delete event' });
		}
	},

	togglePublish: async ({ request, locals }) => {
		const user = requireUser(locals);
		if (!isAdmin(user)) {
			return fail(403, { message: 'Forbidden' });
		}

		const data = await request.formData();
		const eventId = data.get('eventId') as string;
		const currentStatus = data.get('currentStatus') as string;

		if (!eventId || currentStatus === null) {
			return fail(400, { message: 'Event ID and current status are required' });
		}

		try {
			// Toggle the publication status (1 -> 0, 0 -> 1)
			const newStatus = currentStatus === '1' ? 0 : 1;

			await db.update(events).set({ is_published: newStatus }).where(eq(events.id, eventId));

			return { success: true };
		} catch (error) {
			console.error('Error toggling event publication status:', error);
			return fail(500, { message: 'Failed to update event publication status' });
		}
	}
};
