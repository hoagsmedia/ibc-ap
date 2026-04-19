import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getInvitationsByUser } from "$lib/server/invitations";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const invitations = await getInvitationsByUser(locals.user.id);

	return {
		user: locals.user,
		invitations,
		baseUrl: url.origin
	};
};
