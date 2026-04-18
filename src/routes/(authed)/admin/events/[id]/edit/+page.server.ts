import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types.js';

const editEventSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
	description: z.string().optional(),
	content: z.string().optional(),
	event_date: z.string().min(1, 'Event date is required'),
	location: z.string().optional(),
	is_published: z.boolean().default(false),
	members_only: z.boolean().default(false),
	img: z.string().optional()
});

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(302, '/');
	}

	const event = await db.select().from(events).where(eq(events.id, params.id)).limit(1);

	if (!event[0]) {
		throw error(404, 'Event not found');
	}

	const eventData = event[0];

	// Format the date for datetime-local input
	const formattedEventDate = eventData.event_date
		? eventData.event_date.toISOString().slice(0, 16)
		: '';
	return {
		event: eventData,
		form: await superValidate(
			{
				title: eventData.title,
				description: eventData.description || '',
				content: eventData.content || '',
				event_date: formattedEventDate,
				location: eventData.location || '',
				is_published: Boolean(eventData.is_published),
				members_only: Boolean(eventData.members_only),
				img: eventData.img || ''
			},
			zod(editEventSchema)
		)
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { message: 'Forbidden' });
		}

		const form = await superValidate(request, zod(editEventSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const eventDate = form.data.event_date ? new Date(form.data.event_date) : null;

			await db
				.update(events)
				.set({
					title: form.data.title,
					description: form.data.description || null,
					content: form.data.content || null,
					event_date: eventDate,
					location: form.data.location || null,
					is_published: form.data.is_published ? 1 : 0,
					members_only: form.data.members_only,
					img: form.data.img || null,
					updated_at: new Date()
				})
				.where(eq(events.id, params.id));
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error updating event:', error);
			return fail(500, { form, message: 'Failed to update event' });
		}

		throw redirect(302, '/admin/events');
	}
};
