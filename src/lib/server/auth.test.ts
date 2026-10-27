import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEvent } from "@sveltejs/kit";
import {
	deleteSessionTokenCookie,
	generateSessionToken,
	sessionCookieName,
	sessionNeedsRenewal,
	setSessionTokenCookie
} from "./auth";

const DAY = 1000 * 60 * 60 * 24;

function fakeEvent() {
	const set = vi.fn();
	const del = vi.fn();
	const event = { cookies: { set, delete: del } } as unknown as RequestEvent;
	return { event, set, del };
}

describe("generateSessionToken", () => {
	it("returns a URL-safe base64 token (18 bytes → 24 chars)", () => {
		const token = generateSessionToken();
		expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(token).toHaveLength(24);
	});

	it("produces a unique token each call", () => {
		const tokens = new Set(Array.from({ length: 50 }, () => generateSessionToken()));
		expect(tokens.size).toBe(50);
	});
});

describe("sessionNeedsRenewal", () => {
	it("is false for a session comfortably far from expiry", () => {
		expect(sessionNeedsRenewal(new Date(Date.now() + 30 * DAY))).toBe(false);
	});

	it("is true once within the 15-day renewal window", () => {
		expect(sessionNeedsRenewal(new Date(Date.now() + 10 * DAY))).toBe(true);
	});

	it("is true for an already-expired session", () => {
		expect(sessionNeedsRenewal(new Date(Date.now() - DAY))).toBe(true);
	});
});

describe("setSessionTokenCookie", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("sets an httpOnly, lax, root-path cookie with the given expiry", () => {
		const { event, set } = fakeEvent();
		const expires = new Date(Date.now() + 30 * DAY);
		setSessionTokenCookie(event, "tok", expires);

		expect(set).toHaveBeenCalledTimes(1);
		const [name, value, opts] = set.mock.calls[0];
		expect(name).toBe(sessionCookieName);
		expect(value).toBe("tok");
		expect(opts).toMatchObject({
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			expires
		});
	});

	it("marks the cookie secure only in production", () => {
		vi.stubEnv("NODE_ENV", "development");
		const dev = fakeEvent();
		setSessionTokenCookie(dev.event, "tok", new Date());
		expect(dev.set.mock.calls[0][2].secure).toBe(false);

		vi.stubEnv("NODE_ENV", "production");
		const prod = fakeEvent();
		setSessionTokenCookie(prod.event, "tok", new Date());
		expect(prod.set.mock.calls[0][2].secure).toBe(true);
	});
});

describe("deleteSessionTokenCookie", () => {
	it("clears the session cookie with matching security options", () => {
		const { event, del } = fakeEvent();
		deleteSessionTokenCookie(event);
		expect(del).toHaveBeenCalledTimes(1);
		const [name, opts] = del.mock.calls[0];
		expect(name).toBe(sessionCookieName);
		expect(opts).toMatchObject({ path: "/", httpOnly: true, sameSite: "lax" });
	});
});
