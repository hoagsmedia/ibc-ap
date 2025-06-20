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

	// console.log('Member details:', member);

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
	default: async ({ request }) => {
		const form = await superValidate(request, zod(memberSchema));
		console.log(form);

		if (!form.valid) return fail(400, { form });

		return message(form, 'Form posted successfully!');
	}
};
