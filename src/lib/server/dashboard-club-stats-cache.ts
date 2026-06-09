import { db as defaultDb } from "$lib/server/db";
import { events, statsBeerConsumed, users } from "$lib/server/db/schema";
import { readThroughJson } from "$lib/server/redis";
import { and, count, eq, gte, inArray, isNotNull, lt } from "drizzle-orm";

type DB = typeof defaultDb;

const TTL_SECONDS = 5 * 60;

export type DashboardClubStatsCached = {
	totalMembers: number;
	activeMembers: number;
	/** Published events this calendar year (UTC), excluding members-only. */
	eventsThisYearGuest: number;
	/** Published events this calendar year (UTC), including members-only. */
	eventsThisYearMember: number;
	kegsConsumed: number;
	/** Member/admin accounts created this calendar month (UTC). */
	membersJoinedThisMonth: number;
	/** Keg rows with finished_on in this calendar month (UTC). */
	kegsAddedThisMonth: number;
	/** Published events with event_date in this calendar month (UTC), excluding members-only. */
	eventsThisMonthGuest: number;
	/** Published events with event_date in this calendar month (UTC), including members-only. */
	eventsThisMonthMember: number;
};

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

	const u = new Date();
	const yUtc = u.getUTCFullYear();
	const moUtc = u.getUTCMonth();
	const monthStart = new Date(Date.UTC(yUtc, moUtc, 1, 0, 0, 0, 0));
	const monthEnd = new Date(Date.UTC(yUtc, moUtc + 1, 1, 0, 0, 0, 0));

	const membersJoinedThisMonth = and(
		memberOrAdmin,
		gte(users.created_at, monthStart),
		lt(users.created_at, monthEnd)
	);
	const kegsFinishedThisMonth = and(
		isNotNull(statsBeerConsumed.finished_on),
		gte(statsBeerConsumed.finished_on, monthStart),
		lt(statsBeerConsumed.finished_on, monthEnd)
	);
	const baseEventsThisMonth = and(
		eq(events.is_published, 1),
		isNotNull(events.event_date),
		gte(events.event_date, monthStart),
		lt(events.event_date, monthEnd)
	);

	const [
		totalMembersRows,
		activeMembersRows,
		eventsGuestRows,
		eventsMemberRows,
		kegsConsumedRows,
		membersJoinedThisMonthRows,
		kegsAddedThisMonthRows,
		eventsThisMonthGuestRows,
		eventsThisMonthMemberRows
	] = await Promise.all([
		db.select({ n: count() }).from(users).where(memberOrAdmin),
		db.select({ n: count() }).from(users).where(and(memberOrAdmin, isNotNull(users.mbr))),
		db.select({ n: count() }).from(events).where(and(baseEvents, eq(events.members_only, false))),
		db.select({ n: count() }).from(events).where(baseEvents),
		db.select({ n: count() }).from(statsBeerConsumed),
		db.select({ n: count() }).from(users).where(membersJoinedThisMonth),
		db.select({ n: count() }).from(statsBeerConsumed).where(kegsFinishedThisMonth),
		db.select({ n: count() }).from(events).where(and(baseEventsThisMonth, eq(events.members_only, false))),
		db.select({ n: count() }).from(events).where(baseEventsThisMonth)
	]);

	return {
		totalMembers: num(totalMembersRows),
		activeMembers: num(activeMembersRows),
		eventsThisYearGuest: num(eventsGuestRows),
		eventsThisYearMember: num(eventsMemberRows),
		kegsConsumed: num(kegsConsumedRows),
		membersJoinedThisMonth: num(membersJoinedThisMonthRows),
		kegsAddedThisMonth: num(kegsAddedThisMonthRows),
		eventsThisMonthGuest: num(eventsThisMonthGuestRows),
		eventsThisMonthMember: num(eventsThisMonthMemberRows)
	};
}

function utcYearMonth(): { year: number; month: number } {
	const u = new Date();
	return { year: u.getUTCFullYear(), month: u.getUTCMonth() };
}

/**
 * Returns cached club-wide aggregates for the dashboard “Club stats” card.
 * Shared via Redis when configured; concurrent misses on one instance share one DB round-trip.
 */
export async function getDashboardClubStats(db: DB = defaultDb): Promise<DashboardClubStatsCached> {
	const { year, month } = utcYearMonth();
	return readThroughJson({
		namespace: "dashboard-club-stats",
		keyParts: { year, month },
		ttlSeconds: TTL_SECONDS,
		label: "dashboard-club-stats",
		loader: () => {
			if (inflight) return inflight;
			inflight = loadClubStats(db).finally(() => {
				inflight = null;
			});
			return inflight;
		}
	});
}

