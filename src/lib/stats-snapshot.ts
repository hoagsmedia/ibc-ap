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
	/** From export: `users.dops` when matched by `member_number` ↔ `mbr` — deceased, excluded from duty. */
	dops?: boolean;
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

/** Gallon aggregate from SQL — same derived figures as {@link computeBeerTotals}. */
export function beerTotalsFromGallonSum(totalGallonsRaw: unknown) {
	const totalGallons = Number(totalGallonsRaw ?? 0);
	const g = Number.isFinite(totalGallons) ? totalGallons : 0;
	return {
		totalGallons: g,
		totalPintGlasses16oz: g * 8,
		totalBarrels55Gal: g / 55,
		sixPersonHotTubs450Gal: g / 450
	};
}

export type KegCreditsDisplay =
	| { mode: "all"; rows: StatsKegCredit[] }
	| { mode: "split"; top: StatsKegCredit[]; bottom: StatsKegCredit[] };

/** Top 5 + bottom 5 by `sort_order`; if there are 10 or fewer rows, returns a single list (no overlap). */
export function buildKegCreditsDisplay(allCredits: StatsKegCredit[]): KegCreditsDisplay {
	const sorted = [...allCredits].sort((a, b) => a.sort_order - b.sort_order);
	const n = sorted.length;
	if (n === 0) return { mode: "all", rows: [] };
	if (n <= 10) return { mode: "all", rows: sorted };
	return {
		mode: "split",
		top: sorted.slice(0, 5),
		bottom: sorted.slice(-5)
	};
}

export function beerPreviewLatest3(allBeer: StatsBeerConsumedRow[]): StatsBeerConsumedRow[] {
	return [...allBeer].sort((a, b) => b.keg_number - a.keg_number).slice(0, 3);
}

export function pageDataFromSnapshot(s: ClubStatsSnapshotFile) {
	const credits = s.kegCredits.map(reviveKegCreditRow);
	const beerRows = s.beerConsumed.map(reviveBeerRow);
	return {
		totals: computeBeerTotals(beerRows),
		kegCreditsDisplay: buildKegCreditsDisplay(credits),
		beerPreview: beerPreviewLatest3(beerRows),
		/** Anonymous users read bundled snapshot — not live DB. */
		statsSource: "snapshot" as const,
		/** ISO 8601 — when `club-stats.json` was exported. */
		snapshotExportedAt: s.exportedAt
	};
}
