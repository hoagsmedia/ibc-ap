import type { PageServerLoad, Actions } from './$types';
import { validateInvitationToken, markInvitationTokenAsUsed } from '$lib/server/invitations';
import { error, redirect, fail } from '@sveltejs/kit';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const { token } = params;

	if (!token) {
		error(404, 'Invalid invitation link');
	}

	const { valid, invitation } = await validateInvitationToken(token);

	if (!valid) {
		error(404, 'Invalid or expired invitation link');
	}

	return {
		token,
		invitation
	};
};

export const actions: Actions = {
	register: async (event) => {
		const { params, request } = event;
		const { token } = params;

		if (!token) {
			return fail(400, { message: 'Invalid invitation token' });
		}

		// Validate token again
		const { valid } = await validateInvitationToken(token);
		if (!valid) {
			return fail(400, { message: 'Invalid or expired invitation link' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;
		const bio = formData.get('bio') as string;
		const hobbies = formData.get('hobbies') as string;
		const likes = formData.get('likes') as string;
		const sponsor = formData.get('sponsor') as string;

		// Validation
		if (!name || name.length < 2) {
			return fail(400, { message: 'Name must be at least 2 characters long' });
		}

		if (!email || !email.includes('@')) {
			return fail(400, { message: 'Valid email address is required' });
		}

		if (!password || password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters long' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		// Validate optional fields
		if (bio && bio.length > 500) {
			return fail(400, { message: 'Bio must be 500 characters or less' });
		}

		if (hobbies && hobbies.length > 200) {
			return fail(400, { message: 'Hobbies must be 200 characters or less' });
		}

		if (likes && likes.length > 200) {
			return fail(400, { message: 'Beer preferences must be 200 characters or less' });
		}

		if (sponsor && sponsor.length > 100) {
			return fail(400, { message: 'Sponsor name must be 100 characters or less' });
		}

		try {
			// Check if email already exists
			const [existingUser] = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, email));

			if (existingUser) {
				return fail(400, { message: 'Email address is already registered' });
			}

			// Hash password
			const passwordHash = await hash(password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			// Create user
			const userId = crypto.randomUUID();
			const newUser = {
				id: userId,
				name,
				email,
				passwordHash,
				bio: bio || null,
				hobbies: hobbies || null,
				img: null,
				role: 'member' as const, // Users invited get member role by default
				likes: likes || null,
				mbr: null,
				msd: null,
				sponsor: sponsor || null
			};

			await db.insert(table.users).values(newUser);

			// Mark invitation as used
			await markInvitationTokenAsUsed(token, userId);

			// Create session and log user in
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, userId);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);

			redirect(302, '/dashboard');
		} catch (error) {
			// Check if this is a redirect (which is expected behavior)
			if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
				// This is a redirect, re-throw it to let SvelteKit handle it
				throw error;
			}

			console.error('Registration error:', error);
			console.error('Error details:', {
				message: error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
				formData: { name, email, bio, hobbies, likes, sponsor }
			});
			return fail(500, {
				message: `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`
			});
		}
	}
};
