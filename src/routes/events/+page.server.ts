import { canViewMembersOnlyClubEvents } from '$lib/ibc-test';
import { publishedPublicEventsFromSnapshot } from '$lib/events-public-snapshot.js';
import eventsPublicSnapshot from '$lib/data/events-public.json';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { desc, eq, isNotNull, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	const canViewMembersOnly = user ? canViewMembersOnlyClubEvents(user) : false;

	if (!user) {
		return {
			events: publishedPublicEventsFromSnapshot(eventsPublicSnapshot),
			canViewMembersOnly: false
		};
	}

	const visibilityFilter = canViewMembersOnly ? undefined : eq(events.members_only, false);

	const publishedEvents = await db
		.select()
		.from(events)
		.where(
			and(
				eq(events.is_published, 1),
				isNotNull(events.event_date),
				...(visibilityFilter ? [visibilityFilter] : [])
			)
		)
		.orderBy(desc(events.event_date));

	return {
		events: publishedEvents,
		canViewMembersOnly
	};
};
