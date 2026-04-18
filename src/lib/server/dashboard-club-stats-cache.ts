import { db as defaultDb } from "$lib/server/db";
import { events, statsBeerConsumed, users } from "$lib/server/db/schema";
import { and, count, eq, gte, inArray, isNotNull, lt } from "drizzle-orm";

type DB = typeof defaultDb;

/** How long aggregated dashboard stats are reused before refreshing (per server instance). */
const TTL_MS = 5 * 60 * 1000;

export type DashboardClubStatsCached = {
	totalMembers: number;
	activeMembers: number;
	/** Published events this calendar year (UTC), excluding members-only. */
	eventsThisYearGuest: number;
	/** Published events this calendar year (UTC), including members-only. */
	eventsThisYearMember: number;
	kegsConsumed: number;
};

let cache: { expiresAt: number; data: DashboardClubStatsCached } | null = null;
let inflight: Promise<DashboardClubStatsCached> | null = null;

function num(rows: { n: number | bigint }[]): number {
	return Number(rows[0]?.n ?? 0);
}

async function loadClubStats(db: DB): Promise<DashboardClubStatsCached> {
	const memberOrAdmin = inArray(users.role, ["member", "admin"]);

	const year = new Date().getFullYear();
	const yearStart = new Date(Date.UTC(year, 0, 1));
	const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

	const baseEvents = and(
		eq(events.is_published, 1),
		isNotNull(events.event_date),
		gte(events.event_date, yearStart),
		lt(events.event_date, yearEnd)
	);

	const [
		totalMembersRows,
		activeMembersRows,
		eventsGuestRows,
		eventsMemberRows,
		kegsConsumedRows
	] = await Promise.all([
		db.select({ n: count() }).from(users).where(memberOrAdmin),
		db.select({ n: count() }).from(users).where(and(memberOrAdmin, isNotNull(users.mbr))),
		db.select({ n: count() }).from(events).where(and(baseEvents, eq(events.members_only, false))),
		db.select({ n: count() }).from(events).where(baseEvents),
		db.select({ n: count() }).from(statsBeerConsumed)
	]);

	return {
		totalMembers: num(totalMembersRows),
		activeMembers: num(activeMembersRows),
		eventsThisYearGuest: num(eventsGuestRows),
		eventsThisYearMember: num(eventsMemberRows),
		kegsConsumed: num(kegsConsumedRows)
	};
}

/**
 * Returns cached club-wide aggregates for the dashboard “Club stats” card.
 * Refreshes at most every {@link TTL_MS}; concurrent requests share one DB round-trip.
 */
export async function getDashboardClubStats(db: DB = defaultDb): Promise<DashboardClubStatsCached> {
	const now = Date.now();
	if (cache && cache.expiresAt > now) {
		return cache.data;
	}
	if (inflight) {
		return inflight;
	}

	inflight = loadClubStats(db)
		.then((data) => {
			cache = { expiresAt: Date.now() + TTL_MS, data };
			return data;
		})
		.finally(() => {
			inflight = null;
		});

	return inflight;
}

/** Clears the in-memory cache (e.g. after tests). Not used in production paths. */
export function __resetDashboardClubStatsCacheForTests(): void {
	cache = null;
	inflight = null;
}
