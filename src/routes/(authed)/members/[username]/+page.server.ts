import { error, redirect } from "@sveltejs/kit";
import { getMemberByUsernameOrId } from "$lib/server/member-lookup";
import { userWithoutPasswordHash } from "$lib/server/user-client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const identifier = params.username;
	if (!identifier) {
		throw error(400, "Member identifier is required");
	}

	const member = await getMemberByUsernameOrId(identifier);
	if (!member) {
		throw error(404, "Member not found");
	}

	// Canonical URL: if they used id in URL but member has username, redirect to username URL
	const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
	if (isUuid && member.username) {
		throw redirect(302, `/members/${member.username}`);
	}

	return { member: userWithoutPasswordHash(member) };
};
