import type { RequestEvent } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";
import {
	deleteCachedJson,
	getCachedJson,
	setCachedJson
} from "$lib/server/redis";
import * as table from "$lib/server/db/schema";

const logAuth = dev && ibcDebugEnabled();

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const SESSION_CACHE_TTL_SECONDS = 90;
const SESSION_CACHE_NAMESPACE = "session-validation" as const;

type SessionUser = {
	id: string;
	name: string;
	email: string | null;
	username: string | null;
	role: "guest" | "member" | "admin";
	img: string | null;
	mbr: number | null;
	msd: Date | null;
	test_passed: Date | null;
	meeting_1_date: Date | null;
	meeting_2_date: Date | null;
	meeting_3_date: Date | null;
	account_active: boolean;
	website_first_login_at: Date | null;
};

type CachedSessionValidation = {
	session: {
		id: string;
		userId: string;
		expires_at: string;
	};
	user: {
		id: string;
		name: string;
		email: string | null;
		username: string | null;
		role: "guest" | "member" | "admin";
		img: string | null;
		mbr: number | null;
		msd: string | null;
		test_passed: string | null;
		meeting_1_date: string | null;
		meeting_2_date: string | null;
		meeting_3_date: string | null;
		account_active: boolean;
		website_first_login_at: string | null;
	};
};

function toDate(value: string | null): Date | null {
	return value ? new Date(value) : null;
}

function serializeSessionValidation(session: table.Session, user: SessionUser): CachedSessionValidation {
	return {
		session: {
			id: session.id,
			userId: session.userId,
			expires_at: session.expires_at.toISOString()
		},
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			username: user.username,
			role: user.role,
			img: user.img,
			mbr: user.mbr,
			msd: user.msd?.toISOString() ?? null,
			test_passed: user.test_passed?.toISOString() ?? null,
			meeting_1_date: user.meeting_1_date?.toISOString() ?? null,
			meeting_2_date: user.meeting_2_date?.toISOString() ?? null,
			meeting_3_date: user.meeting_3_date?.toISOString() ?? null,
			account_active: user.account_active,
			website_first_login_at: user.website_first_login_at?.toISOString() ?? null
		}
	};
}

function deserializeSessionValidation(cached: CachedSessionValidation): {
	session: table.Session;
	user: SessionUser;
} {
	return {
		session: {
			id: cached.session.id,
			userId: cached.session.userId,
			expires_at: new Date(cached.session.expires_at)
		},
		user: {
			id: cached.user.id,
			name: cached.user.name,
			email: cached.user.email,
			username: cached.user.username,
			role: cached.user.role,
			img: cached.user.img,
			mbr: cached.user.mbr,
			msd: toDate(cached.user.msd),
			test_passed: toDate(cached.user.test_passed),
			meeting_1_date: toDate(cached.user.meeting_1_date),
			meeting_2_date: toDate(cached.user.meeting_2_date),
			meeting_3_date: toDate(cached.user.meeting_3_date),
			account_active: cached.user.account_active,
			website_first_login_at: toDate(cached.user.website_first_login_at)
		}
	};
}

async function invalidateSessionCache(sessionId: string) {
	await deleteCachedJson(SESSION_CACHE_NAMESPACE, { sessionId });
}

function sessionNeedsRenewal(expires_at: Date): boolean {
	return Date.now() >= expires_at.getTime() - DAY_IN_MS * 15;
}

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expires_at: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	if (logAuth) {
		console.log("[IBC-LOG] [auth] Session created", {
			userId: userId.slice(0, 5) + "...",
			sessionId: sessionId.slice(0, 5) + "..."
		});
	}
	return session;
}

export async function validateSessionToken(token: string) {
	if (!token) {
		return { session: null, user: null };
	}

	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	if (logAuth) {
		console.log("[IBC-LOG] [auth] Validating session token", {
			sessionId: sessionId.slice(0, 5) + "..."
		});
	}

	try {
		const cached = await getCachedJson<CachedSessionValidation>(SESSION_CACHE_NAMESPACE, {
			sessionId
		});
		if (cached) {
			const { session, user } = deserializeSessionValidation(cached);
			const sessionExpired = Date.now() >= session.expires_at.getTime();
			if (sessionExpired) {
				await invalidateSession(session.id);
				return { session: null, user: null };
			}
			if (!sessionNeedsRenewal(session.expires_at)) {
				if (logAuth) {
					console.log("[IBC-LOG] [auth] Session cache hit", {
						sessionId: sessionId.slice(0, 5) + "..."
					});
				}
				return { session, user };
			}
			if (logAuth) {
				console.log("[IBC-LOG] [auth] Session cache skip (renewal window)", {
					sessionId: sessionId.slice(0, 5) + "..."
				});
			}
		} else if (logAuth) {
			console.log("[IBC-LOG] [auth] Session cache miss", {
				sessionId: sessionId.slice(0, 5) + "..."
			});
		}

		const [result] = await db
			.select({
				// Adjust user table here to tweak returned data
				user: {
					id: table.users.id,
					name: table.users.name,
					email: table.users.email,
					username: table.users.username,
					role: table.users.role,
					img: table.users.img,
					mbr: table.users.mbr,
					msd: table.users.msd,
					test_passed: table.users.test_passed,
					meeting_1_date: table.users.meeting_1_date,
					meeting_2_date: table.users.meeting_2_date,
					meeting_3_date: table.users.meeting_3_date,
					account_active: table.users.account_active,
					website_first_login_at: table.users.website_first_login_at
				},
				session: table.session
			})
			.from(table.session)
			.innerJoin(table.users, eq(table.session.userId, table.users.id))
			.where(eq(table.session.id, sessionId));

		if (!result) {
			await invalidateSessionCache(sessionId);
			return { session: null, user: null };
		}

		const { session, user } = result;

		const sessionExpired = Date.now() >= session.expires_at.getTime();
		if (sessionExpired) {
			await invalidateSession(session.id);
			return { session: null, user: null };
		}

		if (sessionNeedsRenewal(session.expires_at)) {
			session.expires_at = new Date(Date.now() + DAY_IN_MS * 30);
			await db
				.update(table.session)
				.set({ expires_at: session.expires_at })
				.where(eq(table.session.id, session.id));
		}

		await setCachedJson(
			SESSION_CACHE_NAMESPACE,
			{ sessionId },
			serializeSessionValidation(session, user),
			SESSION_CACHE_TTL_SECONDS
		);

		return { session, user };
	} catch (err) {
		console.error("Error validating session token:", err);
		return { session: null, user: null, error: "An error occurred" };
	}
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await invalidateSessionCache(sessionId);
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export async function invalidateAllSessionsForUser(userId: string) {
	const rows = await db
		.select({ id: table.session.id })
		.from(table.session)
		.where(eq(table.session.userId, userId));
	await Promise.all(rows.map((row) => invalidateSessionCache(row.id)));
	await db.delete(table.session).where(eq(table.session.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expires_at: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expires_at,
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax"
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax"
	});
}
