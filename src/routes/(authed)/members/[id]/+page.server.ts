import { error, redirect } from "@sveltejs/kit";
import { getMemberById } from "$lib/server/member-lookup";
import { userWithoutPasswordHash } from "$lib/server/user-client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const id = params.id;
	if (!id) {
		throw error(400, "Member id is required");
	}

	const member = await getMemberById(id);
	if (!member) {
		throw error(404, "Member not found");
	}

	return { member: userWithoutPasswordHash(member) };
};
