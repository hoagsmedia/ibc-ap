import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { contactSchema } from './contact-schema';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(contactSchema));

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(contactSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		return message(form, 'Thank you for your message! We will get back to you soon.');
	}
};
