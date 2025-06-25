import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	console.log(`[Auth Hook] Session token exists: ${!!sessionToken}`);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	console.log(`[Auth Hook] Session valid: ${!!session}, User: ${user ? user.email : 'none'}`);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expires_at);
		console.log(`[Auth Hook] Session cookie refreshed with expiry: ${session.expires_at}`);
	} else {
		auth.deleteSessionTokenCookie(event);
		console.log(`[Auth Hook] Invalid session, cookie deleted`);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = handleAuth;
