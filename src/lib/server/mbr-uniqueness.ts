import { and, eq, ne } from "drizzle-orm";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";

type DbClient = typeof db;

/**
 * If another user (not `excludeUserId`) already has this MBR, returns an error message for admins.
 */
export async function getMbrConflictMessage(
	database: DbClient,
	mbr: number,
	excludeUserId: string
): Promise<string | null> {
	const [existing] = await database
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.mbr, mbr), ne(users.id, excludeUserId)));

	return existing ? `Member #${mbr} is already assigned to another member.` : null;
}

/**
 * If another user already has this email (non-empty), returns an error message for admins.
 */
export async function getEmailConflictMessage(
	database: DbClient,
	email: string | null | undefined,
	excludeUserId: string
): Promise<string | null> {
	const normalized = email?.trim();
	if (!normalized) return null;

	const [existing] = await database
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.email, normalized), ne(users.id, excludeUserId)));

	return existing ? `Another member already uses the email ${normalized}.` : null;
}
