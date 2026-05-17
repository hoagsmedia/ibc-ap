import { describe, expect, it } from "vitest";
import {
	CONTACT_HONEYPOT_FIELD,
	isContactHoneypotTripped
} from "$lib/server/contact-form-abuse";

describe("contact form honeypot", () => {
	it("is not tripped when field is missing or empty", () => {
		expect(isContactHoneypotTripped(new FormData())).toBe(false);

		const empty = new FormData();
		empty.set(CONTACT_HONEYPOT_FIELD, "");
		expect(isContactHoneypotTripped(empty)).toBe(false);

		const whitespace = new FormData();
		whitespace.set(CONTACT_HONEYPOT_FIELD, "   ");
		expect(isContactHoneypotTripped(whitespace)).toBe(false);
	});

	it("is tripped when field has any non-whitespace value", () => {
		const filled = new FormData();
		filled.set(CONTACT_HONEYPOT_FIELD, "https://spam.example");
		expect(isContactHoneypotTripped(filled)).toBe(true);
	});
});
