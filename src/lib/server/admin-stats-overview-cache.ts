import { kegCreditBuyingResponsibility } from "$lib/keg-credits-responsibility.js";
import { db as defaultDb } from "$lib/server/db";
import { statsBeerConsumed, statsKegCredits, users } from "$lib/server/db/schema";
import type { StatsBeerConsumedRow } from "$lib/server/db/schema";
import { readThroughJson } from "$lib/server/redis";
import { beerTotalsFromGallonSum } from "$lib/stats-snapshot.js";
import { and, count, desc, eq, inArray, isNotNull, sql, sum } from "drizzle-orm";

type DB = typeof defaultDb;

const TTL_SECONDS = 10 * 60;

export type AdminStatsOverview = {
	kegWidget: {
		totalMembers: number;
		cikCount: number;
		duty: ReturnType<typeof kegCreditBuyingResponsibility>;
	};
	beerWidget: {
		totalKegs: number;
		totals: ReturnType<typeof beerTotalsFromGallonSum>;
		latestKeg: StatsBeerConsumedRow | null;
	};
	membersJoinedByYear: { year: number; count: number }[];
};

function reviveDate(value: Date | string | null | undefined): Date | null {
	if (value == null) return null;
	if (value instanceof Date) return value;
	return new Date(value.includes("T") ? value : `${value}T00:00:00.000Z`);
}

function reviveLatestKeg(
	keg: StatsBeerConsumedRow | null
): StatsBeerConsumedRow | null {
	if (!keg) return null;
	return {
		...keg,
		purchased_on: reviveDate(keg.purchased_on),
		delivered_on: reviveDate(keg.delivered_on),
		finished_on: reviveDate(keg.finished_on),
		created_at: reviveDate(keg.created_at) ?? new Date(0),
		updated_at: reviveDate(keg.updated_at) ?? new Date(0)
	};
}

function reviveAdminStatsOverview(data: AdminStatsOverview): AdminStatsOverview {
	return {
		...data,
		beerWidget: {
			...data.beerWidget,
			latestKeg: reviveLatestKeg(data.beerWidget.latestKeg)
		}
	};
}

async function loadAdminStatsOverview(db: DB): Promise<AdminStatsOverview> {
	const yearFromMsd = sql<number>`extract(year from ${users.msd})::int`.mapWith(Number);

	const [kegRows, beerCountRes, beerGallonsRes, deceasedRes, latestKegRes, membersByYearRows] =
		await Promise.all([
			db
				.select({
					id: statsKegCredits.id,
					credits: statsKegCredits.credits,
					member_label: statsKegCredits.member_label,
					member_number: statsKegCredits.member_number,
					sort_order: statsKegCredits.sort_order,
					is_cik: statsKegCredits.is_cik
				})
				.from(statsKegCredits),
			db.select({ n: count() }).from(statsBeerConsumed),
			db.select({ s: sum(statsBeerConsumed.gallons) }).from(statsBeerConsumed),
			db.select({ mbr: users.mbr }).from(users).where(eq(users.dops, true)),
			db.select().from(statsBeerConsumed).orderBy(desc(statsBeerConsumed.keg_number)).limit(1),
			db
				.select({
					year: yearFromMsd,
					n: count()
				})
				.from(users)
				.where(and(inArray(users.role, ["member", "admin"]), isNotNull(users.msd)))
				.groupBy(yearFromMsd)
				.orderBy(yearFromMsd)
		]);

	const kegTotal = kegRows.length;
	const beerTotal = Number(beerCountRes[0]?.n ?? 0);
	const cikCount = kegRows.filter((r) => r.is_cik).length;
	const latestKeg = latestKegRes[0] ?? null;

	const deceasedMbr = new Set(
		deceasedRes.map((r) => r.mbr).filter((m): m is number => m != null && Number.isFinite(m))
	);
	const duty = kegCreditBuyingResponsibility(
		kegRows.map((r) => ({
			credits: r.credits,
			member_number: r.member_number,
			member_label: r.member_label,
			sort_order: r.sort_order,
			dops: r.member_number != null && deceasedMbr.has(r.member_number)
		}))
	);

	return {
		kegWidget: {
			totalMembers: kegTotal,
			cikCount,
			duty
		},
		beerWidget: {
			totalKegs: beerTotal,
			totals: beerTotalsFromGallonSum(beerGallonsRes[0]?.s),
			latestKeg
		},
		membersJoinedByYear: membersByYearRows.map((r) => ({
			year: Number(r.year),
			count: Number(r.n)
		}))
	};
}

/** Cached admin stats overview (`/admin/stats` widgets). */
export async function getAdminStatsOverview(db: DB = defaultDb): Promise<AdminStatsOverview> {
	const data = await readThroughJson({
		namespace: "admin-stats-overview",
		keyParts: { scope: "global" },
		ttlSeconds: TTL_SECONDS,
		label: "admin-stats-overview",
		loader: () => loadAdminStatsOverview(db)
	});
	return reviveAdminStatsOverview(data);
}
