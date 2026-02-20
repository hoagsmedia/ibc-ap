import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

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
	console.log("[IBC-LOG] [auth] Session created", {
		userId: userId.slice(0, 5) + "...",
		sessionId: sessionId.slice(0, 5) + "..."
	});
	return session;
}

export async function validateSessionToken(token: string) {
	if (!token) {
		return { session: null, user: null };
	}

	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	console.log("[IBC-LOG] [auth] Validating session token", {
		sessionId: sessionId.slice(0, 5) + "..."
	});

	try {
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
					test_passed: table.users.test_passed
				},
				session: table.session
			})
			.from(table.session)
			.innerJoin(table.users, eq(table.session.userId, table.users.id))
			.where(eq(table.session.id, sessionId));

		if (!result) {
			return { session: null, user: null };
		}

		const { session, user } = result;

		const sessionExpired = Date.now() >= session.expires_at.getTime();
		if (sessionExpired) {
			await db.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}

		const renewSession = Date.now() >= session.expires_at.getTime() - DAY_IN_MS * 15;
		if (renewSession) {
			session.expires_at = new Date(Date.now() + DAY_IN_MS * 30);
			await db
				.update(table.session)
				.set({ expires_at: session.expires_at })
				.where(eq(table.session.id, session.id));
		}

		return { session, user };
	} catch (err) {
		console.error("Error validating session token:", err);
		return { session: null, user: null, error: "An error occurred" };
	}
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
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
