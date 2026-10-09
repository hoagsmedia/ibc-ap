import { beforeEach, describe, expect, it, vi } from "vitest";
import { isActionFailure, isRedirect } from "@sveltejs/kit";
import { CONTACT_HONEYPOT_FIELD, CONTACT_LOADED_AT_FIELD } from "$lib/contact-honeypot";
import { CONTACT_FORM_REJECT_MESSAGE } from "$lib/server/contact-form-abuse";

// Delivery is mocked: no Resend client, no network, no real email.
const delivery = vi.hoisted(() => ({
	configured: true,
	result: { ok: true } as { ok: true } | { ok: false; message: string },
	sent: [] as Array<{ name: string; email: string; message: string }>
}));

vi.mock("$lib/server/send-contact-form-email", () => ({
	isResendContactFormConfigured: () => delivery.configured,
	sendContactFormEmail: async (input: { name: string; email: string; message: string }) => {
		delivery.sent.push(input);
		return delivery.result;
	}
}));

const { load, actions } = await import("./+page.server");

type LoadEvent = Parameters<typeof load>[0];
type ActionEvent = Parameters<(typeof actions)["default"]>[0];

// Synthetic users only.
const member = {
	id: "synthetic-member",
	name: "Sam Member",
	email: "sam.member@example.test",
	role: "member",
	account_active: true
};
const admin = {
	...member,
	id: "synthetic-admin",
	name: "Ada Admin",
	role: "admin",
	account_active: false
};
const prospect = { ...member, id: "synthetic-prospect", role: "guest", meeting_1_date: new Date() };
// Passed the IBC test and finished all three meetings, but still a guest: not a member yet.
const passedTestProspect = {
	...member,
	id: "synthetic-passed-prospect",
	role: "guest",
	meeting_1_date: new Date("2026-01-01"),
	meeting_2_date: new Date("2026-02-01"),
	meeting_3_date: new Date("2026-03-01"),
	test_passed: new Date("2026-03-15T00:00:00Z")
};
const guest = { ...member, id: "synthetic-guest", role: "guest" };
const inactiveMember = { ...member, id: "synthetic-inactive", account_active: false };

const loadEvent = (user: unknown) => ({ locals: { user, session: null } }) as unknown as LoadEvent;

let formDataReads = 0;
function postEvent(user: unknown, fields: Record<string, string>) {
	const body = new FormData();
	for (const [k, v] of Object.entries(fields)) body.set(k, v);
	const request = new Request("http://test.local/dashboard/contact", { method: "POST", body });
	const formData = request.formData.bind(request);
	request.formData = () => {
		formDataReads += 1;
		return formData();
	};
	return { request, locals: { user, session: null } } as unknown as ActionEvent;
}

const validFields = () => ({
	name: "Sam Member",
	email: "sam.member@example.test",
	message: "Synthetic test message for the club inbox.",
	[CONTACT_LOADED_AT_FIELD]: String(Date.now() - 10_000),
	[CONTACT_HONEYPOT_FIELD]: ""
});

async function redirectOf(run: () => unknown) {
	try {
		await run();
	} catch (error) {
		if (isRedirect(error)) return error;
		throw error;
	}
	throw new Error("expected a redirect");
}

beforeEach(() => {
	delivery.configured = true;
	delivery.result = { ok: true };
	delivery.sent = [];
	formDataReads = 0;
});

describe("/dashboard/contact GET (load) authorization", () => {
	it("redirects unauthenticated direct requests to login", async () => {
		const r = await redirectOf(() => load(loadEvent(null)));
		expect(r.location).toBe("/login");
	});

	it.each([
		["guest", guest],
		["prospect with meeting progress", prospect],
		["prospect who passed the IBC test", passedTestProspect],
		["inactive member account", inactiveMember]
	])("redirects %s to the dashboard", async (_label, user) => {
		const r = await redirectOf(() => load(loadEvent(user)));
		expect(r.location).toBe("/dashboard");
	});

	it.each([
		["active member", member],
		["admin (always platform-active)", admin]
	])("returns a form prefilled from the session for an %s", async (_label, user) => {
		const result = (await load(loadEvent(user))) as {
			form: { data: Record<string, string>; errors: Record<string, unknown> };
		};
		expect(result.form.data).toEqual({ name: user.name, email: user.email, message: "" });
		expect(result.form.errors).toEqual({});
	});
});

describe("/dashboard/contact POST authorization", () => {
	it("redirects unauthenticated direct POSTs to login without reading the form or sending", async () => {
		const r = await redirectOf(() => actions.default(postEvent(null, validFields())));
		expect(r.location).toBe("/login");
		expect(formDataReads).toBe(0);
		expect(delivery.sent).toEqual([]);
	});

	it.each([
		["guest", guest],
		["prospect with meeting progress", prospect],
		["prospect who passed the IBC test", passedTestProspect],
		["inactive member account", inactiveMember]
	])("denies direct POSTs from %s without sending", async (_label, user) => {
		const r = await redirectOf(() => actions.default(postEvent(user, validFields())));
		expect(r.location).toBe("/dashboard");
		expect(formDataReads).toBe(0);
		expect(delivery.sent).toEqual([]);
	});

	it.each([
		["active member", member],
		["admin", admin]
	])(
		"delivers a valid submission from an %s with the submitted reply-to details",
		async (_l, user) => {
			const result = (await actions.default(postEvent(user, validFields()))) as {
				form: { message: string };
			};
			expect(isActionFailure(result)).toBe(false);
			expect(result.form.message).toBe("Thank you for your message! We will get back to you soon.");
			expect(delivery.sent).toEqual([
				{
					name: "Sam Member",
					email: "sam.member@example.test",
					message: "Synthetic test message for the club inbox."
				}
			]);
		}
	);
});

describe("/dashboard/contact POST validation and delivery (regression)", () => {
	it("rejects a tripped honeypot without sending", async () => {
		const result = await actions.default(
			postEvent(member, { ...validFields(), [CONTACT_HONEYPOT_FIELD]: "bot" })
		);
		expect(isActionFailure(result) && result.status).toBe(400);
		expect(JSON.stringify(result)).toContain(CONTACT_FORM_REJECT_MESSAGE);
		expect(delivery.sent).toEqual([]);
	});

	it("rejects a too-fast submission without sending", async () => {
		const result = await actions.default(
			postEvent(member, { ...validFields(), [CONTACT_LOADED_AT_FIELD]: String(Date.now()) })
		);
		expect(isActionFailure(result) && result.status).toBe(400);
		expect(delivery.sent).toEqual([]);
	});

	it("keeps the existing field limits", async () => {
		const result = await actions.default(
			postEvent(member, { ...validFields(), name: "S", email: "not-an-email", message: "short" })
		);
		expect(isActionFailure(result) && result.status).toBe(400);
		const errors = (result as unknown as { data: { form: { errors: Record<string, unknown> } } })
			.data.form.errors;
		expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
		expect(delivery.sent).toEqual([]);
	});

	it("returns 503 when delivery is not configured", async () => {
		delivery.configured = false;
		const result = await actions.default(postEvent(member, validFields()));
		expect(isActionFailure(result) && result.status).toBe(503);
		expect(delivery.sent).toEqual([]);
	});

	it("returns 502 when delivery fails", async () => {
		delivery.result = { ok: false, message: "synthetic failure" };
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		const result = await actions.default(postEvent(member, validFields()));
		expect(isActionFailure(result) && result.status).toBe(502);
		spy.mockRestore();
	});
});
