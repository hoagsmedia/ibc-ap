import { beforeEach, describe, expect, it, vi } from "vitest";

// Synthetic env and a mocked Resend client: no real key, no network, no real email.
const state = vi.hoisted(() => ({
	env: {} as Record<string, string | undefined>,
	calls: [] as Array<{ payload: Record<string, unknown>; options: unknown }>
}));

vi.mock("$env/dynamic/private", () => ({ env: state.env }));
vi.mock("resend", () => ({
	Resend: class {
		emails = {
			send: async (payload: Record<string, unknown>, options: unknown) => {
				state.calls.push({ payload, options });
				return { data: { id: "synthetic-id" }, error: null };
			}
		};
	}
}));

const { sendContactFormEmail, isResendContactFormConfigured } = await import(
	"./send-contact-form-email"
);

const input = {
	name: " Sam Member ",
	email: " sam.member@example.test ",
	message: "Synthetic message."
};

beforeEach(() => {
	for (const k of Object.keys(state.env)) delete state.env[k];
	Object.assign(state.env, {
		RESEND_API_KEY: "synthetic-key",
		RESEND_FROM_EMAIL: "from@example.test"
	});
	state.calls = [];
});

describe("sendContactFormEmail", () => {
	it("delivers to the club contact inbox with the submitter as Reply-To", async () => {
		expect(await sendContactFormEmail(input)).toEqual({ ok: true });
		const { payload } = state.calls[0];
		expect(payload.to).toBe("contact.form@islandbeerclub.com");
		expect(payload.from).toBe("from@example.test");
		expect(payload.replyTo).toBe("sam.member@example.test");
		expect(payload.subject).toBe("IBC website contact — Sam Member");
		expect(payload.template).toMatchObject({
			id: "contact-form-submission",
			variables: {
				MESSAGE: "Synthetic message.",
				SENDER_EMAIL: "sam.member@example.test",
				SENDER_NAME: "Sam Member"
			}
		});
	});

	it("honours recipient, template and subject overrides", async () => {
		Object.assign(state.env, {
			RESEND_CONTACT_TO_EMAIL: "override@example.test",
			RESEND_CONTACT_TEMPLATE_ID: "synthetic-template",
			RESEND_CONTACT_SUBJECT: "Synthetic subject"
		});
		await sendContactFormEmail(input);
		const { payload } = state.calls[0];
		expect(payload.to).toBe("override@example.test");
		expect(payload.subject).toBe("Synthetic subject");
		expect(payload.template).toMatchObject({ id: "synthetic-template" });
	});

	it("does not send when Resend is not configured", async () => {
		delete state.env.RESEND_API_KEY;
		expect(isResendContactFormConfigured()).toBe(false);
		expect((await sendContactFormEmail(input)).ok).toBe(false);
		expect(state.calls).toEqual([]);
	});
});
