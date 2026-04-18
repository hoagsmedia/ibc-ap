import clubStatsSnapshot from "$lib/data/club-stats.json";
import { db } from "$lib/server/db/index.js";
import { statsBeerConsumed, statsKegCredits } from "$lib/server/db/schema.js";
import {
	pageDataFromDatabase,
	pageDataFromSnapshot,
	type ClubStatsSnapshotFile
} from "$lib/stats-snapshot.js";
import { asc } from "drizzle-orm";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		const credits = await db
			.select()
			.from(statsKegCredits)
			.orderBy(asc(statsKegCredits.sort_order));

		const beerRows = await db
			.select()
			.from(statsBeerConsumed)
			.orderBy(asc(statsBeerConsumed.keg_number));

		return pageDataFromDatabase(credits, beerRows);
	}

	return pageDataFromSnapshot(clubStatsSnapshot as ClubStatsSnapshotFile);
};
