import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	console.log(
		`[Authed Layout] User in locals: ${event.locals.user ? event.locals.user.email : 'none'}`
	);
	console.log(`[Authed Layout] Session in locals: ${event.locals.session ? 'exists' : 'none'}`);

	if (!event.locals.user) {
		console.log(`[Authed Layout] No user found, redirecting to login`);
		throw redirect(302, '/login');
	}

	console.log(`[Authed Layout] User authenticated: ${event.locals.user.email}`);
	return {
		user: event.locals.user
	};
};
