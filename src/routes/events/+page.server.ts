import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	// Only show published events to the public, ordered by event date (most recent first)
	const publishedEvents = await db
		.select()
		.from(events)
		.where(eq(events.is_published, 1))
		.orderBy(desc(events.event_date));

	return {
		events: publishedEvents
	};
};
