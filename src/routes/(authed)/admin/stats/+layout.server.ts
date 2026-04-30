import type { LayoutServerLoad } from "./$types.js";
import { requireAdmin } from "$lib/server/authz";

export const load: LayoutServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	return {};
};
