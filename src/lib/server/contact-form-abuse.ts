import { CONTACT_HONEYPOT_FIELD, CONTACT_LOADED_AT_FIELD } from "$lib/contact-honeypot";

export { CONTACT_HONEYPOT_FIELD, CONTACT_LOADED_AT_FIELD };

export const CONTACT_MIN_SUBMIT_MS = 3000;

/** Shown for honeypot and future abuse checks; do not reveal which check failed. */
export const CONTACT_FORM_REJECT_MESSAGE =
	"We could not send your message. Please check your details and try again.";

export function isContactHoneypotTripped(formData: FormData): boolean {
	const raw = formData.get(CONTACT_HONEYPOT_FIELD);
	if (raw == null) return false;
	return String(raw).trim().length > 0;
}

/** False when timing field is missing, invalid, or elapsed time is under {@link CONTACT_MIN_SUBMIT_MS}. */
export function passesContactMinSubmitTime(
	formData: FormData,
	nowMs: number = Date.now()
): boolean {
	const raw = formData.get(CONTACT_LOADED_AT_FIELD);
	if (raw == null) return false;
	const loadedAt = Number(String(raw).trim());
	if (!Number.isFinite(loadedAt) || loadedAt <= 0) return false;
	if (loadedAt > nowMs + 5000) return false;
	return nowMs - loadedAt >= CONTACT_MIN_SUBMIT_MS;
}
