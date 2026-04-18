import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { encodeBase64url } from '@oslojs/encoding';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const INVITATION_COOLDOWN_DAYS = 7;

/** Returns the created_at of the most recent invitation by this user, or null if none. */
export async function getLastInvitationCreatedAt(createdById: string): Promise<Date | null> {
	const [row] = await db
		.select({ created_at: table.invitationTokens.created_at })
		.from(table.invitationTokens)
		.where(eq(table.invitationTokens.created_by_id, createdById))
		.orderBy(desc(table.invitationTokens.created_at))
		.limit(1);
	return row?.created_at ?? null;
}

export function generateInvitationToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return encodeBase64url(bytes);
}

export async function createInvitationToken(
	createdById: string,
	expirationDays = 7
): Promise<table.InvitationToken> {
	const token = generateInvitationToken();
	const id = crypto.randomUUID();

	const invitationToken: table.InvitationToken = {
		id,
		token,
		created_by_id: createdById,
		created_at: new Date(),
		expires_at: new Date(Date.now() + DAY_IN_MS * expirationDays),
		used_at: null,
		used_by_id: null
	};

	await db.insert(table.invitationTokens).values(invitationToken);
	return invitationToken;
}

export async function validateInvitationToken(
	token: string
): Promise<{ valid: boolean; invitation?: table.InvitationToken }> {
	const [invitation] = await db
		.select()
		.from(table.invitationTokens)
		.where(eq(table.invitationTokens.token, token));

	if (!invitation) {
		return { valid: false };
	}

	// Check if token is expired
	if (Date.now() >= invitation.expires_at.getTime()) {
		return { valid: false };
	}

	// Check if token has already been used
	if (invitation.used_at) {
		return { valid: false };
	}

	return { valid: true, invitation };
}

export async function markInvitationTokenAsUsed(token: string, usedById: string): Promise<void> {
	await db
		.update(table.invitationTokens)
		.set({
			used_at: new Date(),
			used_by_id: usedById
		})
		.where(eq(table.invitationTokens.token, token));
}

export async function getInvitationsByUser(
	userId: string,
	options?: { limit?: number }
): Promise<table.InvitationToken[]> {
	const q = db
		.select()
		.from(table.invitationTokens)
		.where(eq(table.invitationTokens.created_by_id, userId))
		.orderBy(desc(table.invitationTokens.created_at));
	if (options?.limit != null) {
		return await q.limit(options.limit);
	}
	return await q;
}
