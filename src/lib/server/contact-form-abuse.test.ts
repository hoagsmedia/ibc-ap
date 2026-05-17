import { describe, expect, it } from "vitest";
import { CONTACT_LOADED_AT_FIELD } from "$lib/contact-honeypot";
import {
	CONTACT_HONEYPOT_FIELD,
	CONTACT_MIN_SUBMIT_MS,
	isContactHoneypotTripped,
	passesContactMinSubmitTime
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

describe("contact form min submit time", () => {
	const now = 1_700_000_000_000;

	it("rejects missing, invalid, future, or too-fast timestamps", () => {
		expect(passesContactMinSubmitTime(new FormData(), now)).toBe(false);

		const invalid = new FormData();
		invalid.set(CONTACT_LOADED_AT_FIELD, "not-a-number");
		expect(passesContactMinSubmitTime(invalid, now)).toBe(false);

		const future = new FormData();
		future.set(CONTACT_LOADED_AT_FIELD, String(now + 10_000));
		expect(passesContactMinSubmitTime(future, now)).toBe(false);

		const fast = new FormData();
		fast.set(CONTACT_LOADED_AT_FIELD, String(now - CONTACT_MIN_SUBMIT_MS + 1));
		expect(passesContactMinSubmitTime(fast, now)).toBe(false);
	});

	it("accepts when at least CONTACT_MIN_SUBMIT_MS has elapsed", () => {
		const ok = new FormData();
		ok.set(CONTACT_LOADED_AT_FIELD, String(now - CONTACT_MIN_SUBMIT_MS));
		expect(passesContactMinSubmitTime(ok, now)).toBe(true);
	});
});
