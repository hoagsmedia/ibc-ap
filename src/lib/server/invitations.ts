import { client, db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { and, count, desc, eq, gte, isNull, lt } from "drizzle-orm";
import { encodeBase64url } from "@oslojs/encoding";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const INVITATION_LIMIT_WINDOW_DAYS = 7;
export const INVITATION_MEMBER_WEEKLY_LIMIT = 3;

export type InvitationWithProspectProgress = table.InvitationToken & {
	/** Prospect meeting slots filled; UI uses this only when redeemer has no `mbr` */
	prospectMeetingCount: number | null;
	/** If set, invite progress shows Member regardless of meeting dates (legacy-safe) */
	redeemerMbr: number | null;
};

/** Matches `scripts/ensure-invitation-tokens-schema.ts` — local DBs often lag Vercel build ensures. */
let invitationTokenColumnsEnsured = false;

async function ensureInvitationTokenColumns(): Promise<void> {
	if (invitationTokenColumnsEnsured) return;
	try {
		await client.unsafe(
			`ALTER TABLE public.invitation_tokens ADD COLUMN IF NOT EXISTS invite_name text`
		);
		await client.unsafe(
			`ALTER TABLE public.invitation_tokens ADD COLUMN IF NOT EXISTS inviter_name text`
		);
		invitationTokenColumnsEnsured = true;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("does not exist") && msg.includes("invitation_tokens")) {
			invitationTokenColumnsEnsured = true;
			return;
		}
		throw err;
	}
}

/** Returns how many invitations this user created in the rolling lookback window. */
export async function getInvitationCountInWindow(
	createdById: string,
	windowDays = INVITATION_LIMIT_WINDOW_DAYS
): Promise<number> {
	await ensureInvitationTokenColumns();
	const windowStart = new Date(Date.now() - windowDays * DAY_IN_MS);
	const [row] = await db
		.select({ n: count() })
		.from(table.invitationTokens)
		.where(
			and(
				eq(table.invitationTokens.created_by_id, createdById),
				gte(table.invitationTokens.created_at, windowStart)
			)
		);
	return Number(row?.n ?? 0);
}

export function generateInvitationToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return encodeBase64url(bytes);
}

export async function createInvitationToken(
	createdById: string,
	inviteName: string,
	inviterName: string,
	expirationDays = 7
): Promise<table.InvitationToken> {
	await ensureInvitationTokenColumns();
	const token = generateInvitationToken();
	const id = crypto.randomUUID();

	const invitationToken: table.InvitationToken = {
		id,
		token,
		invite_name: inviteName,
		inviter_name: inviterName,
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
	await ensureInvitationTokenColumns();
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
	await ensureInvitationTokenColumns();
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
	options?: { limit?: number; year?: number }
): Promise<InvitationWithProspectProgress[]> {
	await ensureInvitationTokenColumns();
	const conditions = [eq(table.invitationTokens.created_by_id, userId)];
	if (options?.year != null) {
		const y = options.year;
		const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
		const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0, 0));
		conditions.push(gte(table.invitationTokens.created_at, start));
		conditions.push(lt(table.invitationTokens.created_at, end));
	}
	const base = db
		.select({
			invitation: table.invitationTokens,
			usedByUser: {
				meeting_1_date: table.users.meeting_1_date,
				meeting_2_date: table.users.meeting_2_date,
				meeting_3_date: table.users.meeting_3_date,
				mbr: table.users.mbr
			}
		})
		.from(table.invitationTokens)
		.leftJoin(table.users, eq(table.invitationTokens.used_by_id, table.users.id))
		.where(and(...conditions))
		.orderBy(desc(table.invitationTokens.created_at));
	const rows = options?.limit != null ? await base.limit(options.limit) : await base;
	return rows.map(({ invitation, usedByUser }) => ({
		...invitation,
		prospectMeetingCount: usedByUser
			? [usedByUser.meeting_1_date, usedByUser.meeting_2_date, usedByUser.meeting_3_date].filter(
					Boolean
				).length
			: null,
		redeemerMbr: usedByUser?.mbr ?? null
	}));
}

/** Active, unused invite owned by this user (for email / resend flows). */
export async function getSendableInvitationForUser(
	token: string,
	userId: string
): Promise<table.InvitationToken | null> {
	await ensureInvitationTokenColumns();
	const [row] = await db
		.select()
		.from(table.invitationTokens)
		.where(eq(table.invitationTokens.token, token))
		.limit(1);
	if (!row || row.created_by_id !== userId) return null;
	if (row.used_at) return null;
	if (Date.now() >= row.expires_at.getTime()) return null;
	return row;
}

/** Removes an unused invite owned by `userId` (e.g. rollback after email send failure). */
export async function deleteUnusedInvitationForOwner(
	token: string,
	userId: string
): Promise<boolean> {
	await ensureInvitationTokenColumns();
	const deleted = await db
		.delete(table.invitationTokens)
		.where(
			and(
				eq(table.invitationTokens.token, token),
				eq(table.invitationTokens.created_by_id, userId),
				isNull(table.invitationTokens.used_at)
			)
		)
		.returning({ id: table.invitationTokens.id });

	return deleted.length > 0;
}

export async function deleteExpiredInvitationByUser(
	userId: string,
	token: string
): Promise<boolean> {
	await ensureInvitationTokenColumns();
	const now = new Date();
	const deleted = await db
		.delete(table.invitationTokens)
		.where(
			and(
				eq(table.invitationTokens.created_by_id, userId),
				eq(table.invitationTokens.token, token),
				lt(table.invitationTokens.expires_at, now)
			)
		)
		.returning({ id: table.invitationTokens.id });

	return deleted.length > 0;
}
