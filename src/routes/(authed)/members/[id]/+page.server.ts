import { error, redirect } from "@sveltejs/kit";
import { canAccessMemberDirectoryAndStats } from "$lib/ibc-test";
import { getMemberById } from "$lib/server/member-lookup";
import { resolveMemberBackLink } from "$lib/server/member-back-link";
import { userWithoutPasswordHash } from "$lib/server/user-client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params, url, request }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (!canAccessMemberDirectoryAndStats(locals.user)) {
		throw redirect(302, "/dashboard?restricted=member-profile");
	}

	const id = params.id;
	if (!id) {
		throw error(400, "Member id is required");
	}

	const member = await getMemberById(id);
	if (!member) {
		throw error(404, "Member not found");
	}

	const backLink = resolveMemberBackLink({
		backQuery: url.searchParams.get("back"),
		referer: request.headers.get("referer"),
		urlOrigin: url.origin
	});

	return { member: userWithoutPasswordHash(member), backLink };
};
