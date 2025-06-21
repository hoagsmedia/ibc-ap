import type { Actions, PageServerLoad } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { superValidate, message } from 'sveltekit-superforms';
import { memberSchema } from './edit-member-schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user has admin role
	if (locals.user.role !== 'admin') {
		throw error(403, 'Access denied. Admin role required.');
	}

	const { id } = params;

	if (!id) {
		throw error(400, 'User ID is required');
	}

	// Fetch the member details
	const member = await db.query.users.findFirst({
		where: eq(users.id, id)
	});
	if (!member) {
		throw error(404, 'Member not found');
	}

	// Transform member data to match schema expectations
	const memberData = {
		id: member.id,
		name: member.name,
		email: member.email,
		password_hash: member.password_hash,
		bio: member.bio ?? '',
		hobbies: null,
		img: member.img ?? '',
		role: member.role,
		likes: member.likes ?? '',
		mbr: member.mbr ?? 0,
		msd: member.msd ?? '',
		sponsor: member.sponsor ?? '',
		test_passed: member.test_passed?.toISOString() ?? '',
		created_at: member.created_at?.toISOString(),
		updated_at: member.updated_at?.toISOString()
	};

	return {
		member,
		form: await superValidate(memberData, zod(memberSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		// Check authentication and authorization
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		if (locals.user.role !== 'admin') {
			throw error(403, 'Access denied. Admin role required.');
		}

		const form = await superValidate(request, zod(memberSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = params;
		if (!id) {
			throw error(400, 'User ID is required');
		}

		try {
			// Extract the form data
			const {
				name,
				email,
				phone,
				address,
				bio,
				hobbies,
				role,
				likes,
				mbr,
				msd,
				sponsor,
				test_passed
			} = form.data;

			// Verify the member exists before updating
			const existingMember = await db.query.users.findFirst({
				where: eq(users.id, id)
			});

			if (!existingMember) {
				return fail(404, { form, message: 'Member not found' });
			}

			// Update the member in the database
			const updatedMember = await db
				.update(users)
				.set({
					name: name || '',
					email: email || '',
					phone: phone || null,
					address: address || null,
					bio: bio || '',
					hobbies: hobbies || null,
					role: (role as 'guest' | 'member' | 'admin') || 'member',
					likes: likes || null,
					mbr: mbr || 0,
					msd: msd || new Date().toISOString().split('T')[0],
					sponsor: sponsor || null,
					test_passed: test_passed ? new Date(test_passed) : null,
					updated_at: new Date()
				})
				.where(eq(users.id, id))
				.returning();

			if (!updatedMember.length) {
				return fail(500, { form, message: 'Failed to update member' });
			}

			return message(form, 'Member updated successfully!');
		} catch (err) {
			console.error('Error updating member:', err);
			return fail(500, { form, message: 'An error occurred while updating the member' });
		}
	}
};
