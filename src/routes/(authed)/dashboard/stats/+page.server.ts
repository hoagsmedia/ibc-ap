import { requireMemberDirectoryAccess } from "$lib/server/authz.js";
import { db } from "$lib/server/db/index.js";
import { statsBeerConsumed, statsKegCredits } from "$lib/server/db/schema.js";
import { beerTotalsFromGallonSum, buildKegCreditsDisplay } from "$lib/stats-snapshot.js";
import { asc, sum } from "drizzle-orm";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	requireMemberDirectoryAccess(locals);

	const [creditRows, gallonSum] = await Promise.all([
		db.select().from(statsKegCredits).orderBy(asc(statsKegCredits.sort_order)),
		db.select({ s: sum(statsBeerConsumed.gallons) }).from(statsBeerConsumed)
	]);

	return {
		statsSource: "live" as const,
		totals: beerTotalsFromGallonSum(gallonSum[0]?.s),
		kegCreditsDisplay: buildKegCreditsDisplay(creditRows)
	};
};
