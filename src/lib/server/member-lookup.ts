import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** First `/members/{uuid}` capture from a URL string (e.g. `Referer`). */
const MEMBERS_PATH_ID = /\/members\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export function parseMemberRecordIdFromMembersUrl(url: string | null | undefined): string | null {
	if (!url) return null;
	const m = url.match(MEMBERS_PATH_ID);
	return m?.[1] ?? null;
}

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

