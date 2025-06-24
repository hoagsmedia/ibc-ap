import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(302, '/');
	}

	const allEvents = await db.select().from(events).orderBy(desc(events.created_at));

	console.log('Admin events found:', allEvents.length);
	allEvents.forEach((event) => {
		console.log(
			`Event: ${event.title}, Published: ${event.is_published} (type: ${typeof event.is_published})`
		);
	});

	return {
		events: allEvents
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
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
	}
};
