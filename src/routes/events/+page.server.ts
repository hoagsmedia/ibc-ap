import { publishedPublicEventsFromSnapshot } from "$lib/events-public-snapshot.js";
import eventsPublicSnapshot from "$lib/data/events-public.json";
import type { PageServerLoad } from "./$types.js";

/** Public marketing page — published events from the static snapshot (same data unauthenticated users always saw). */
export const load: PageServerLoad = async () => {
	return {
		events: publishedPublicEventsFromSnapshot(eventsPublicSnapshot)
	};
};
