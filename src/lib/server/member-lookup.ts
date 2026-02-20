import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a member by username or by id (UUID).
 * Use for dynamic route [username] so URLs work with either /members/john-doe-42 or /members/{id} (e.g. pending users).
 */
export async function getMemberByUsernameOrId(identifier: string) {
	if (!identifier) return null;
	const byId = UUID_REGEX.test(identifier);
	const member = await db.query.users.findFirst({
		where: byId ? eq(users.id, identifier) : eq(users.username, identifier)
	});
	return member ?? null;
}
