import type { Handle } from "@sveltejs/kit";
import * as auth from "$lib/server/auth.js";

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	console.log("[IBC-LOG] [hooks.server] Incoming request", {
		url: event.url.pathname,
		hasSessionToken: !!sessionToken
	});

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
	console.log("[IBC-LOG] [hooks.server] Session/user set", {
		userId: user?.id,
		sessionId: session?.id
	});
	return resolve(event);
};

export const handle: Handle = handleAuth;
