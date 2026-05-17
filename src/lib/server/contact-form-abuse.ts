import { CONTACT_HONEYPOT_FIELD } from "$lib/contact-honeypot";

export { CONTACT_HONEYPOT_FIELD };

/** Shown for honeypot and future abuse checks; do not reveal which check failed. */
export const CONTACT_FORM_REJECT_MESSAGE =
	"We could not send your message. Please check your details and try again.";

export function isContactHoneypotTripped(formData: FormData): boolean {
	const raw = formData.get(CONTACT_HONEYPOT_FIELD);
	if (raw == null) return false;
	return String(raw).trim().length > 0;
}
