import { getAdminStatsOverview } from "$lib/server/admin-stats-overview-cache.js";
import { requireAdmin } from "$lib/server/authz";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	// The layout also checks, but layout and page loads run in parallel: guard before any read.
	requireAdmin(locals);
	return getAdminStatsOverview();
};
