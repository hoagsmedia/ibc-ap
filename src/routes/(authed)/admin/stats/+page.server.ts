import { kegCreditBuyingResponsibility } from "$lib/keg-credits-responsibility.js";
import { db } from "$lib/server/db/index.js";
import { statsBeerConsumed, statsKegCredits, users } from "$lib/server/db/schema.js";
import { beerTotalsFromGallonSum } from "$lib/stats-snapshot.js";
import { count, desc, eq, sum } from "drizzle-orm";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async () => {
	const [kegRows, beerCountRes, beerGallonsRes, deceasedRes, latestKegRes] = await Promise.all([
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
		db.select().from(statsBeerConsumed).orderBy(desc(statsBeerConsumed.keg_number)).limit(1)
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
		}
	};
};
