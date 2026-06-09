import { invalidateAllSessionsForUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import type { User } from "$lib/server/db/schema";
import { generateInvitationToken } from "$lib/server/invitations";
import { and, asc, count, eq, gte, isNotNull, isNull, min, ne, sql } from "drizzle-orm";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

/** Max member rollout activation emails an inviter may create in a rolling window. */
export const MEMBER_ROLLOUT_MAX_PER_ROLLING_WINDOW = 4;
/** Rolling window length (days) for the limit above. */
export const MEMBER_ROLLOUT_WINDOW_DAYS = 4;
export const MEMBER_ROLLOUT_WINDOW_MS = MEMBER_ROLLOUT_WINDOW_DAYS * DAY_IN_MS;

const TOKEN_EXPIRATION_DAYS = 14;

/** Admins always; members after their own first website login. */
export function canUserSendMemberRolloutInvites(
	user: Pick<User, "role" | "website_first_login_at">
): boolean {
	if (user.role === "admin") return true;
	return user.website_first_login_at != null;
}

/** Eligible recipients: current members who need website onboarding only (not prospects, not deceased). */
export function isEligibleMemberRolloutRecipient(u: User): boolean {
	if (u.role !== "member") return false;
	if (u.mbr == null || u.mbr <= 0) return false;
	if (u.dops === true || u.dops_date != null) return false;
	if (u.account_active === true) return false;
	if (u.website_first_login_at != null) return false;
	if (!u.email?.trim()) return false;
	return true;
}

export async function countMemberRolloutTokensCreatedInWindow(inviterId: string): Promise<number> {
	const windowStart = new Date(Date.now() - MEMBER_ROLLOUT_WINDOW_MS);
	const [row] = await db
		.select({ n: count() })
		.from(table.memberRolloutTokens)
		.where(
			and(
				eq(table.memberRolloutTokens.created_by_id, inviterId),
				gte(table.memberRolloutTokens.created_at, windowStart)
			)
		);
	return Number(row?.n ?? 0);
}

/** When at limit: earliest creation time in the current window (for “next send after” UI). */
export async function getOldestMemberRolloutInWindow(inviterId: string): Promise<Date | null> {
	const windowStart = new Date(Date.now() - MEMBER_ROLLOUT_WINDOW_MS);
	const [row] = await db
		.select({ t: min(table.memberRolloutTokens.created_at) })
		.from(table.memberRolloutTokens)
		.where(
			and(
				eq(table.memberRolloutTokens.created_by_id, inviterId),
				gte(table.memberRolloutTokens.created_at, windowStart)
			)
		);
	const t = row?.t;
	if (t == null) return null;
	return t instanceof Date ? t : new Date(t as unknown as string);
}

export function nextRolloutSlotAvailableAt(oldestInWindow: Date): Date {
	return new Date(oldestInWindow.getTime() + MEMBER_ROLLOUT_WINDOW_MS);
}

export async function hasUnusedMemberRolloutTokenForPair(
	inviterId: string,
	targetUserId: string
): Promise<boolean> {
	const now = new Date();
	const [row] = await db
		.select({ n: count() })
		.from(table.memberRolloutTokens)
		.where(
			and(
				eq(table.memberRolloutTokens.created_by_id, inviterId),
				eq(table.memberRolloutTokens.target_user_id, targetUserId),
				isNull(table.memberRolloutTokens.used_at),
				gte(table.memberRolloutTokens.expires_at, now)
			)
		);
	return Number(row?.n ?? 0) > 0;
}

export async function searchMemberRolloutRecipients(params: {
	query: string;
	limit: number;
	excludeUserId: string;
}): Promise<Array<Pick<User, "id" | "name" | "email" | "mbr"> & { email: string }>> {
	const q = params.query.trim();
	if (q.length < 2) return [];


	const needle = `%${q}%`;
	const mbrDigits = q.replace(/\D/g, "");

	const rows = await db
		.select({
			id: table.users.id,
			name: table.users.name,
			email: table.users.email,
			mbr: table.users.mbr
		})
		.from(table.users)
		.where(
			and(
				ne(table.users.id, params.excludeUserId),
				isNotNull(table.users.email),
				eq(table.users.role, "member"),
				isNotNull(table.users.mbr),
				sql`${table.users.mbr} > 0`,
				eq(table.users.dops, false),
				isNull(table.users.dops_date),
				eq(table.users.account_active, false),
				isNull(table.users.website_first_login_at),
				mbrDigits.length > 0
					? sql`(
						${table.users.name} ILIKE ${needle}
						OR lower(trim(${table.users.email})) LIKE lower(${needle})
						OR CAST(${table.users.mbr} AS text) LIKE ${`%${mbrDigits}%`}
					)`
					: sql`(
						${table.users.name} ILIKE ${needle}
						OR lower(trim(${table.users.email})) LIKE lower(${needle})
					)`
			)
		)
		.orderBy(asc(table.users.name))
		.limit(params.limit);

	return rows
		.filter((r) => r.email != null && r.mbr != null)
		.map((r) => ({
			id: r.id,
			name: r.name,
			email: r.email as string,
			mbr: r.mbr as number
		}));
}

export async function getMemberRolloutTargetById(
	targetId: string,
	excludeInviterId: string
): Promise<User | null> {
	const [row] = await db.select().from(table.users).where(eq(table.users.id, targetId)).limit(1);
	if (!row || row.id === excludeInviterId) return null;
	if (!isEligibleMemberRolloutRecipient(row)) return null;
	return row;
}

export async function createMemberRolloutToken(
	createdById: string,
	targetUserId: string,
	recipientEmail: string
): Promise<table.MemberRolloutToken> {
	const token = generateInvitationToken();
	const id = crypto.randomUUID();
	const row: table.MemberRolloutToken = {
		id,
		token,
		created_by_id: createdById,
		target_user_id: targetUserId,
		recipient_email_snapshot: recipientEmail.trim(),
		created_at: new Date(),
		expires_at: new Date(Date.now() + TOKEN_EXPIRATION_DAYS * DAY_IN_MS),
		used_at: null
	};
	await db.insert(table.memberRolloutTokens).values(row);
	return row;
}

export async function validateMemberRolloutToken(token: string): Promise<{
	valid: boolean;
	row?: table.MemberRolloutToken;
	target?: User;
}> {
	const [row] = await db
		.select()
		.from(table.memberRolloutTokens)
		.where(eq(table.memberRolloutTokens.token, token));

	if (!row || row.used_at) return { valid: false };
	if (Date.now() >= row.expires_at.getTime()) return { valid: false };

	const [target] = await db
		.select()
		.from(table.users)
		.where(eq(table.users.id, row.target_user_id))
		.limit(1);

	if (!target) return { valid: false };

	return { valid: true, row, target };
}

export async function completeMemberRolloutActivation(
	token: string,
	passwordHash: string
): Promise<{ ok: true } | { ok: false; message: string }> {
	const state = await validateMemberRolloutToken(token);
	if (!state.valid || !state.row || !state.target) {
		return {
			ok: false,
			message: "This link is invalid or has expired. Ask for a new rollout email."
		};
	}

	const targetUser = state.target;

	await db.transaction(async (tx) => {
		await tx
			.update(table.users)
			.set({
				password_hash: passwordHash,
				account_active: true,
				updated_at: new Date()
			})
			.where(eq(table.users.id, targetUser.id));

		await tx
			.update(table.memberRolloutTokens)
			.set({ used_at: new Date() })
			.where(eq(table.memberRolloutTokens.token, token));

	});

	await invalidateAllSessionsForUser(targetUser.id);

	return { ok: true };
}

export async function deleteUnusedMemberRolloutTokenForOwner(
	token: string,
	createdById: string
): Promise<void> {
	await db
		.delete(table.memberRolloutTokens)
		.where(
			and(
				eq(table.memberRolloutTokens.token, token),
				eq(table.memberRolloutTokens.created_by_id, createdById),
				isNull(table.memberRolloutTokens.used_at)
			)
		);
}
