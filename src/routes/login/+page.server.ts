import { hash, verify } from 'argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq, or } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const emailOrUsername = formData.get('email');
		const password = formData.get('password');

		if (!validateEmailOrUsername(emailOrUsername)) {
			return fail(400, {
				message: 'Invalid email or username'
			});
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}

		const results = await db
			.select()
			.from(table.users)
			.where(
				or(
					eq(table.users.email, emailOrUsername as string),
					eq(table.users.username, emailOrUsername as string)
				)
			);

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		// Handle users with dev-hash (first-time login)
		// if (existingUser.password_hash === 'dev-hash') {
		// 	const newpassword_hash = await hash(password, {
		// 		memoryCost: 19456,
		// 		timeCost: 2,
		// 		parallelism: 1
		// 	});

		// 	// Update the user's password hash
		// 	await db
		// 		.update(table.users)
		// 		.set({ password_hash: newpassword_hash })
		// 		.where(eq(table.users.id, existingUser.id));

		// 	const sessionToken = auth.generateSessionToken();
		// 	const session = await auth.createSession(sessionToken, existingUser.id);
		// 	auth.setSessionTokenCookie(event, sessionToken, session.expires_at);

		// 	return redirect(302, '/dashboard');
		// }

		// Normal password verification for users with proper hashes
		const validPassword = await verify(existingUser.password_hash, password);
		if (!validPassword) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const sessionToken = auth.generateSessionToken();

		const session = await auth.createSession(sessionToken, existingUser.id);

		auth.setSessionTokenCookie(event, sessionToken, session.expires_at);

		// Use the standard SvelteKit redirect with explicit options
		throw redirect(302, '/dashboard');
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const email = formData.get('email');
		const password = formData.get('password');

		if (!validateName(name)) {
			return fail(400, { message: 'Invalid name (min 2, max 100 characters)' });
		}
		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email address' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 24 characters)' });
		}

		const userId = generateUserId();
		const password_hash = await hash(password);

		try {
			await db.insert(table.users).values({
				id: userId,
				name: name as string,
				email: email as string,
				password_hash,
				role: 'guest'
			});

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expires_at);
		} catch {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/dashboard');
	}
};

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

function validateName(name: unknown): name is string {
	return typeof name === 'string' && name.length >= 2 && name.length <= 100;
}

function validateEmail(email: unknown): email is string {
	return (
		typeof email === 'string' &&
		email.length >= 3 &&
		email.length <= 255 &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	);
}

function validateEmailOrUsername(input: unknown): input is string {
	if (typeof input !== 'string' || input.length < 1 || input.length > 255) return false;
	if (input.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
	// Username: alphanumeric, underscore, 1–64 chars
	return /^[a-zA-Z0-9_]{1,64}$/.test(input.trim());
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 24;
}
