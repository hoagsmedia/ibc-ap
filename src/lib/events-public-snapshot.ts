import type { Event } from "$lib/server/db/schema.js";

/** Shape written by `scripts/export-events-public-snapshot.ts` — ISO strings for timestamps. */
export type EventsPublicSnapshotFile = {
	exportedAt: string;
	events: SnapshotEventRow[];
};

export type SnapshotEventRow = Omit<
	Event,
	"event_date" | "created_at" | "updated_at"
> & {
	event_date: string;
	created_at: string;
	updated_at: string;
};

export function reviveEventRow(r: SnapshotEventRow): Event {
	return {
		...r,
		event_date: new Date(r.event_date),
		created_at: new Date(r.created_at),
		updated_at: new Date(r.updated_at)
	};
}

export function publishedPublicEventsFromSnapshot(s: EventsPublicSnapshotFile): Event[] {
	return s.events.map(reviveEventRow);
}
