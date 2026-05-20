import type { Handle } from "@sveltejs/kit";
import { building, dev } from "$app/environment";
import { canAccessPlatform } from "$lib/server/account-access";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";

const log = dev && ibcDebugEnabled();
const sessionCookieName = "auth-session";

const handleAuth: Handle = async ({ event, resolve }) => {
	// Local dev convenience only. Vercel build already runs the schema ensure scripts; doing
	// this during production requests adds cold-start database work to public marketing pages.
	if (dev && !building && process.env.DATABASE_URL?.trim()) {
		const { ensureWebsiteAccessUserColumns } = await import(
			"$lib/server/ensure-website-access-columns"
		);
		await ensureWebsiteAccessUserColumns();
	}

	const sessionToken = event.cookies.get(sessionCookieName);

	if (log) {
		console.log("[IBC-LOG] [hooks.server] Incoming request", {
			url: event.url.pathname,
			hasSessionToken: !!sessionToken
		});
	}

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const auth = await import("$lib/server/auth.js");
	const { session, user } = await auth.validateSessionToken(sessionToken);

	let effectiveUser = user;
	let effectiveSession = session;

	if (session && user && !canAccessPlatform(user)) {
		await auth.invalidateSession(session.id);
		auth.deleteSessionTokenCookie(event);
		effectiveUser = null;
		effectiveSession = null;
	}

	if (effectiveSession && effectiveUser) {
		auth.setSessionTokenCookie(event, sessionToken, effectiveSession.expires_at);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = effectiveUser;
	event.locals.session = effectiveSession;
	if (log) {
		console.log("[IBC-LOG] [hooks.server] Session/user set", {
			userId: effectiveUser?.id.slice(0, 5) + "..." || "null"
		});
	}
	return resolve(event);
};

export const handle: Handle = handleAuth;
