import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import * as auth from "$lib/server/auth.js";

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (dev) {
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

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expires_at);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	if (dev) {
		console.log("[IBC-LOG] [hooks.server] Session/user set", {
			userId: user?.id.slice(0, 5) + "..." || "null"
		});
	}
	return resolve(event);
};

export const handle: Handle = handleAuth;
