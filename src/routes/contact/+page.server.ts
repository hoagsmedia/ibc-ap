import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
	CONTACT_FORM_REJECT_MESSAGE,
	isContactHoneypotTripped
} from "$lib/server/contact-form-abuse";
import {
	isResendContactFormConfigured,
	sendContactFormEmail
} from "$lib/server/send-contact-form-email";
import { contactSchema } from "./contact-schema";

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(contactSchema));

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		if (isContactHoneypotTripped(formData)) {
			const form = await superValidate(formData, zod(contactSchema));
			return message(form, CONTACT_FORM_REJECT_MESSAGE, { status: 400 });
		}

		const form = await superValidate(formData, zod(contactSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!isResendContactFormConfigured()) {
			return message(
				form,
				"The contact form is not available right now. Please email us directly at info@islandbeerclub.com.",
				{ status: 503 }
			);
		}

		const sent = await sendContactFormEmail({
			name: form.data.name,
			email: form.data.email,
			message: form.data.message
		});

		if (!sent.ok) {
			console.error("[contact] send failed", sent.message);
			return message(
				form,
				"We could not send your message. Please try again in a few minutes or email info@islandbeerclub.com.",
				{ status: 502 }
			);
		}

		return message(form, "Thank you for your message! We will get back to you soon.");
	}
};
