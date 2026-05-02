import { canViewMembersOnlyClubEvents } from "$lib/ibc-test";
import { requireUser } from "$lib/server/authz.js";
import { db } from "$lib/server/db/index.js";
import { events } from "$lib/server/db/schema.js";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const canViewMembersOnly = canViewMembersOnlyClubEvents(user);
	/** Full members & admins: no filter — both public and members-only published events. Prospects: public only. */
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
