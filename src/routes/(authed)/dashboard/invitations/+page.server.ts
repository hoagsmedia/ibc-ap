import { redirect } from "@sveltejs/kit";
import { canAccessMemberDirectoryAndStats } from "$lib/ibc-test";
import type { PageServerLoad } from "./$types";
import { getInvitationsByUser } from "$lib/server/invitations";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (!canAccessMemberDirectoryAndStats(locals.user)) {
		throw redirect(302, "/dashboard?restricted=invitations");
	}

	const invitations = await getInvitationsByUser(locals.user.id);

	return {
		user: locals.user,
		invitations,
		baseUrl: url.origin
	};
};
