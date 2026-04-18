import type { StatsBeerConsumedRow, StatsKegCredit } from "$lib/server/db/schema.js";

/** Shape written by `scripts/export-club-stats-snapshot.ts` — ISO strings for timestamps/dates. */
export type ClubStatsSnapshotFile = {
	exportedAt: string;
	kegCredits: SnapshotKegCreditRow[];
	beerConsumed: SnapshotBeerRow[];
};

export type SnapshotKegCreditRow = Omit<StatsKegCredit, "created_at" | "updated_at"> & {
	created_at: string;
	updated_at: string;
};

export type SnapshotBeerRow = Omit<
	StatsBeerConsumedRow,
	"created_at" | "updated_at" | "purchased_on" | "delivered_on" | "finished_on"
> & {
	created_at: string;
	updated_at: string;
	purchased_on: string | null;
	delivered_on: string | null;
	finished_on: string | null;
};

function parseDateOnly(s: string | null): Date | null {
	if (!s || !String(s).trim()) return null;
	const d = new Date(s);
	return Number.isFinite(d.getTime()) ? d : null;
}

export function reviveKegCreditRow(r: SnapshotKegCreditRow): StatsKegCredit {
	return {
		...r,
		created_at: new Date(r.created_at),
		updated_at: new Date(r.updated_at)
	};
}

export function reviveBeerRow(r: SnapshotBeerRow): StatsBeerConsumedRow {
	return {
		...r,
		purchased_on: parseDateOnly(r.purchased_on),
		delivered_on: parseDateOnly(r.delivered_on),
		finished_on: parseDateOnly(r.finished_on),
		created_at: new Date(r.created_at),
		updated_at: new Date(r.updated_at)
	};
}

export function computeBeerTotals(beerRows: StatsBeerConsumedRow[]) {
	let totalGallons = 0;
	for (const r of beerRows) {
		totalGallons += r.gallons;
	}
	return {
		totalGallons,
		totalPintGlasses16oz: totalGallons * 8,
		totalBarrels55Gal: totalGallons / 55,
		sixPersonHotTubs450Gal: totalGallons / 450
	};
}

export function pageDataFromSnapshot(s: ClubStatsSnapshotFile) {
	const credits = s.kegCredits.map(reviveKegCreditRow);
	const beerRows = s.beerConsumed.map(reviveBeerRow);
	return {
		credits,
		beerRows,
		totals: computeBeerTotals(beerRows),
		/** Anonymous users read bundled snapshot — not live DB. */
		statsSource: "snapshot" as const
	};
}

export function pageDataFromDatabase(
	credits: StatsKegCredit[],
	beerRows: StatsBeerConsumedRow[]
) {
	return {
		credits,
		beerRows,
		totals: computeBeerTotals(beerRows),
		statsSource: "database" as const
	};
}
