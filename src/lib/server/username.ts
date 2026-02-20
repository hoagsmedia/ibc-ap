import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { and, isNotNull, ne } from "drizzle-orm";

/**
 * Same style as seed: base from last name (lowercase, alphanumeric).
 * For new signups without MBR we use base + _1, _2, ... to ensure uniqueness.
 */
function baseFromName(name: string): string {
	const trimmed = (name || "").trim();
	const parts = trimmed.split(/\s+/).filter(Boolean);
	const last = parts.length > 0 ? parts[parts.length - 1]! : "user";
	const sanitized = last.toLowerCase().replace(/\W/g, "");
	return sanitized.slice(0, 50) || "user";
}

/**
 * Same format as seed: lastname + mbr (e.g. "smith" + 123 → "smith123").
 */
function lastnameMbr(name: string, mbr: number): string {
	const last = baseFromName(name);
	const m = String(mbr).trim().replace(/\./g, "_").replace(/\W/g, "");
	return last + m;
}

/**
 * Returns a username unique in the DB: base, or base_1, base_2, ...
 */
export async function getUniqueUsernameForNewUser(name: string): Promise<string> {
	const base = baseFromName(name);
	const rows = await db
		.select({ username: users.username })
		.from(users)
		.where(isNotNull(users.username));
	const taken = new Set(rows.map((r) => r.username).filter(Boolean) as string[]);

	let candidate = base;
	let suffix = 0;
	while (taken.has(candidate)) {
		suffix++;
		candidate = base.length > 55 ? `${base.slice(0, 55)}_${suffix}` : `${base}_${suffix}`;
	}
	return candidate;
}

/**
 * Returns a unique username for a member when assigning MBR: lastname + mbr, or lastname + mbr + _1, _2, ...
 * Excludes the given userId so the current user's existing username doesn't count as taken.
 */
export async function getUsernameForMemberWithMbr(
	name: string,
	mbr: number,
	userId: string
): Promise<string> {
	const base = lastnameMbr(name, mbr);
	const rows = await db
		.select({ username: users.username, id: users.id })
		.from(users)
		.where(and(isNotNull(users.username), ne(users.id, userId)));
	const taken = new Set(rows.map((r) => r.username).filter(Boolean) as string[]);

	let candidate = base;
	let suffix = 0;
	while (taken.has(candidate)) {
		suffix++;
		candidate = base.length > 55 ? `${base.slice(0, 55)}_${suffix}` : `${base}_${suffix}`;
	}
	return candidate;
}
