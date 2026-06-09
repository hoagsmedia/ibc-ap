import { getAdminStatsOverview } from "$lib/server/admin-stats-overview-cache.js";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async () => {
	return getAdminStatsOverview();
};
