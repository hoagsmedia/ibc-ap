import { json } from "@sveltejs/kit";
import { canAccessPlatform } from "$lib/server/account-access";
import {
	canUserSendMemberRolloutInvites,
	searchMemberRolloutRecipients
} from "$lib/server/member-rollout";
import { normalizeSearchQuery, readThroughJson } from "$lib/server/redis";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user || !canAccessPlatform(locals.user)) {
		return json({ results: [] }, { status: 401 });
	}
	const user = locals.user;
	if (!canUserSendMemberRolloutInvites(user)) {
		return json({ results: [] });
	}

	const q = url.searchParams.get("q") ?? "";
	if (q.trim().length < 2) {
		return json({ results: [] });
	}

	const limit = 15;
	const results = await readThroughJson({
		namespace: "rollout-eligible-member-search",
		keyParts: {
			query: normalizeSearchQuery(q),
			limit,
			excludeUserId: user.id
		},
		ttlSeconds: 20,
		label: "member-rollout-search",
		loader: () =>
			searchMemberRolloutRecipients({
				query: q,
				limit,
				excludeUserId: user.id
			})
	});

	return json({ results });
};
