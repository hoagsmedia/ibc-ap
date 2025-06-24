import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import type { PageServerLoad, Actions } from './$types.js';

function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const createEventSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
	description: z.string().optional(),
	content: z.string().optional(),
	event_date: z.string().optional(),
	location: z.string().optional(),
	is_published: z.boolean().default(false)
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(302, '/');
	}

	return {
		form: await superValidate(zod(createEventSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { message: 'Forbidden' });
		}

		const form = await superValidate(request, zod(createEventSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const eventId = generateId();
			const eventDate = form.data.event_date ? new Date(form.data.event_date) : null;

			await db.insert(events).values({
				id: eventId,
				title: form.data.title,
				description: form.data.description || null,
				content: form.data.content || null,
				event_date: eventDate,
				location: form.data.location || null,
				is_published: form.data.is_published ? 1 : 0,
				created_by_id: locals.user.id
			});

			throw redirect(302, '/admin/events');
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error creating event:', error);
			return fail(500, { form, message: 'Failed to create event' });
		}
	}
};
