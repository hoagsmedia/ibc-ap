import clubStatsSnapshot from "$lib/data/club-stats.json";
import { pageDataFromSnapshot, type ClubStatsSnapshotFile } from "$lib/stats-snapshot.js";
import type { PageServerLoad } from "./$types.js";

/** Bundled JSON only — no database (`pnpm db:export:stats` to refresh). */
export const prerender = true;

/** Public stats always use the bundled snapshot (`pnpm db:export:stats`). */
export const load: PageServerLoad = async () => {
	return pageDataFromSnapshot(clubStatsSnapshot as ClubStatsSnapshotFile);
};
