import { membersPublicRosterSnapshot } from "$lib/config/members-public-stats";
import type { PageServerLoad } from "./$types";

/** Public marketing page for everyone: static snapshot only (no DB). Full directory: `/dashboard/members`. */
export const load: PageServerLoad = async ({ locals }) => {
	const signedIn = Boolean(locals.user);
	return {
		isAuthenticated: signedIn,
		publicStats: membersPublicRosterSnapshot
	};
};
