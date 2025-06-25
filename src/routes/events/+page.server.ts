import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { desc, eq, isNotNull, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	// Only show published events that have dates, ordered by event date (most recent first)
	const publishedEvents = await db
		.select()
		.from(events)
		.where(and(eq(events.is_published, 1), isNotNull(events.event_date)))
		.orderBy(desc(events.event_date));

	return {
		events: publishedEvents
	};
};
