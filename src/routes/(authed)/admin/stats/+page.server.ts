import { kegCreditBuyingResponsibility } from "$lib/keg-credits-responsibility.js";
import { db } from "$lib/server/db/index.js";
import { statsBeerConsumed, statsKegCredits, users } from "$lib/server/db/schema.js";
import { beerTotalsFromGallonSum } from "$lib/stats-snapshot.js";
import { and, count, desc, eq, inArray, isNotNull, sql, sum } from "drizzle-orm";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async () => {
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

	const membersJoinedByYear = membersByYearRows.map((r) => ({
		year: Number(r.year),
		count: Number(r.n)
	}));

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
		membersJoinedByYear
	};
};
