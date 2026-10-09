import { describe, expect, it } from "vitest";
import { canAccessPlatform, canUseMemberContactForm } from "./account-access";

describe("canUseMemberContactForm", () => {
	it.each([
		["active member", "member", true, true],
		["inactive member", "member", false, false],
		["admin with account_active", "admin", true, true],
		["admin without account_active (always platform-active)", "admin", false, true],
		["active guest / prospect", "guest", true, false],
		["inactive guest", "guest", false, false]
	] as const)("%s -> %s", (_label, role, account_active, expected) => {
		expect(canUseMemberContactForm({ role, account_active })).toBe(expected);
	});

	it("does not treat a passed IBC test as membership", () => {
		const passedProspect = {
			role: "guest" as const,
			account_active: true,
			test_passed: new Date()
		};
		expect(canUseMemberContactForm(passedProspect)).toBe(false);
	});

	it("keeps canAccessPlatform semantics unchanged", () => {
		expect(canAccessPlatform({ role: "admin", account_active: false })).toBe(true);
		expect(canAccessPlatform({ role: "guest", account_active: true })).toBe(true);
		expect(canAccessPlatform({ role: "member", account_active: false })).toBe(false);
	});
});
