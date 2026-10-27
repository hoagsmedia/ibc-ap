import { describe, expect, it } from "vitest";
import { canAccessPlatform } from "./account-access";

describe("canAccessPlatform", () => {
	it("always allows admins, even when not marked active", () => {
		expect(canAccessPlatform({ role: "admin", account_active: false })).toBe(true);
		expect(canAccessPlatform({ role: "admin", account_active: true })).toBe(true);
	});

	it("allows active members and guests", () => {
		expect(canAccessPlatform({ role: "member", account_active: true })).toBe(true);
		expect(canAccessPlatform({ role: "guest", account_active: true })).toBe(true);
	});

	it("denies non-admins that are not active", () => {
		expect(canAccessPlatform({ role: "member", account_active: false })).toBe(false);
		expect(canAccessPlatform({ role: "guest", account_active: false })).toBe(false);
	});
});
