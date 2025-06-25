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

	if (!valid || !invitation) {
		error(404, 'Invalid or expired invitation link');
	}

	// Fetch the sponsor's name (user who created the invitation)
	const [sponsor] = await db
		.select({ name: table.users.name })
		.from(table.users)
		.where(eq(table.users.id, invitation.created_by_id));

	return {
		token,
		invitation,
		sponsorName: sponsor?.name || 'Unknown'
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
			const newUser: table.User = {
				id: userId,
				name,
				email,
				password_hash: passwordHash, // Using bcrypt for password hashing
				phone: null,
				address: null,
				bio: bio || null,
				hobbies: hobbies || null,
				img: null,
				role: 'guest', // Users invited get guest role by default
				likes: likes || null,
				mbr: null,
				msd: null,
				sponsor: sponsor || null,
				test_passed: null,
				created_at: new Date(),
				updated_at: new Date()
			};

			await db.insert(table.users).values(newUser);

			// Mark invitation as used
			await markInvitationTokenAsUsed(token, userId);

			// Create session and log user in
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, userId);
			setSessionTokenCookie(event, sessionToken, session.expires_at);
		} catch (error) {
			console.error('Registration error:', error);
			return fail(500, { message: 'Failed to create account. Please try again.' });
		}

		// Redirect after successful registration (outside try-catch)
		redirect(302, '/dashboard');
	}
};
