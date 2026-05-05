import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import * as auth from "$lib/server/auth.js";
import { canAccessPlatform } from "$lib/server/account-access";
import { ensureWebsiteAccessUserColumns } from "$lib/server/ensure-website-access-columns";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";

const log = dev && ibcDebugEnabled();

const handleAuth: Handle = async ({ event, resolve }) => {
	await ensureWebsiteAccessUserColumns();

	const sessionToken = event.cookies.get(auth.sessionCookieName);

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
