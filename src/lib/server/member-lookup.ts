import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isMemberRecordId(value: string | undefined): value is string {
	return Boolean(value && UUID_REGEX.test(value));
}

/** Member profile/edit routes use `/members/{uuid}`. */
export async function getMemberById(id: string) {
	if (!isMemberRecordId(id)) return null;
	const member = await db.query.users.findFirst({
		where: eq(users.id, id)
	});
	return member ?? null;
}

/**
 * Resolve by UUID or legacy username (e.g. scripts, old bookmarks).
 * Prefer {@link getMemberById} for route handlers.
 */
export async function getMemberByUsernameOrId(identifier: string) {
	if (!identifier) return null;
	const byId = UUID_REGEX.test(identifier);
	const member = await db.query.users.findFirst({
		where: byId ? eq(users.id, identifier) : eq(users.username, identifier)
	});
	return member ?? null;
}
