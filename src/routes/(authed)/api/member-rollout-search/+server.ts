import { json } from "@sveltejs/kit";
import { canAccessPlatform } from "$lib/server/account-access";
import {
	canUserSendMemberRolloutInvites,
	searchMemberRolloutRecipients
} from "$lib/server/member-rollout";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user || !canAccessPlatform(locals.user)) {
		return json({ results: [] }, { status: 401 });
	}
	if (!canUserSendMemberRolloutInvites(locals.user)) {
		return json({ results: [] });
	}

	const q = url.searchParams.get("q") ?? "";
	const results = await searchMemberRolloutRecipients({
		query: q,
		limit: 15,
		excludeUserId: locals.user.id
	});

	return json({ results });
};
