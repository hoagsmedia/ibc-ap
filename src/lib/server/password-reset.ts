import { encodeBase64url } from "@oslojs/encoding";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";

const RESET_LINK_TTL_MS = 1000 * 60 * 60; // 1 hour

export type PasswordResetSource = "user" | "admin";

export function generatePasswordResetRawToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return encodeBase64url(bytes);
}

/** Removes stale unused tokens (expired). Best-effort cleanup. */
export async function deleteExpiredPasswordResetTokens(): Promise<void> {
	const now = new Date();
	await db
		.delete(table.passwordResetTokens)
		.where(
			and(isNull(table.passwordResetTokens.used_at), lt(table.passwordResetTokens.expires_at, now))
		);
}

export async function revokeUnusedPasswordResetsForUser(userId: string): Promise<void> {
	await db
		.delete(table.passwordResetTokens)
		.where(
			and(eq(table.passwordResetTokens.user_id, userId), isNull(table.passwordResetTokens.used_at))
		);
}

export async function createPasswordResetToken(input: {
	userId: string;
	source: PasswordResetSource;
	createdByAdminId?: string | null;
}): Promise<{ id: string; token: string; expiresAt: Date }> {
	await deleteExpiredPasswordResetTokens();
	await revokeUnusedPasswordResetsForUser(input.userId);

	const id = crypto.randomUUID();
	const token = generatePasswordResetRawToken();
	const expiresAt = new Date(Date.now() + RESET_LINK_TTL_MS);

	await db.insert(table.passwordResetTokens).values({
		id,
		user_id: input.userId,
		token,
		expires_at: expiresAt,
		used_at: null,
		source: input.source,
		created_by_admin_id: input.createdByAdminId ?? null
	});

	return { id, token, expiresAt };
}

export async function getActivePasswordResetByToken(
	token: string
): Promise<typeof table.passwordResetTokens.$inferSelect | null> {
	const now = new Date();
	const [row] = await db
		.select()
		.from(table.passwordResetTokens)
		.where(
			and(
				eq(table.passwordResetTokens.token, token),
				isNull(table.passwordResetTokens.used_at),
				gt(table.passwordResetTokens.expires_at, now)
			)
		)
		.limit(1);
	return row ?? null;
}

export async function markPasswordResetTokenUsed(tokenId: string): Promise<void> {
	await db
		.update(table.passwordResetTokens)
		.set({ used_at: new Date() })
		.where(eq(table.passwordResetTokens.id, tokenId));
}
