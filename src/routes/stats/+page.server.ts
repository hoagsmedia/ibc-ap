import { db } from "$lib/server/db/index.js";
import { statsBeerConsumed, statsKegCredits } from "$lib/server/db/schema.js";
import { asc } from "drizzle-orm";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async () => {
	const credits = await db
		.select()
		.from(statsKegCredits)
		.orderBy(asc(statsKegCredits.sort_order));

	const beerRows = await db
		.select()
		.from(statsBeerConsumed)
		.orderBy(asc(statsBeerConsumed.keg_number));

	let totalGallons = 0;
	for (const r of beerRows) {
		totalGallons += r.gallons;
	}

	const totalPintGlasses16oz = totalGallons * 8;
	const totalBarrels55Gal = totalGallons / 55;
	const sixPersonHotTubs450Gal = totalGallons / 450;

	return {
		credits,
		beerRows,
		totals: {
			totalGallons,
			totalPintGlasses16oz,
			totalBarrels55Gal,
			sixPersonHotTubs450Gal
		}
	};
};
