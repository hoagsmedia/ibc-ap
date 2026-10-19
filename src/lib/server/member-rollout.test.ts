import { describe, expect, it } from "vitest";
import type { User } from "./db/schema.js";
import {
	MEMBER_ROLLOUT_WINDOW_MS,
	canUserSendMemberRolloutInvites,
	isEligibleMemberRolloutRecipient,
	nextRolloutSlotAvailableAt
} from "./member-rollout.js";

function baseUser(overrides: Partial<User> = {}): User {
	const t = new Date("2026-01-01T12:00:00.000Z");
	return {
		id: "user-1",
		name: "Test Member",
		username: null,
		email: "member@example.com",
		phone: null,
		address: null,
		password_hash: "$argon2dummy",
		img: null,
		role: "member",
		mbr: 42,
		msd: null,
		sponsor: null,
		dops: false,
		dops_date: null,
		rung_in_date: null,
		meeting_1_date: null,
		meeting_2_date: null,
		meeting_3_date: null,
		bio: null,
		hobbies: null,
		likes: null,
		test_passed: null,
		account_active: false,
		website_first_login_at: null,
		created_at: t,
		updated_at: t,
		...overrides
	};
}

describe("canUserSendMemberRolloutInvites", () => {
	it("allows admins without a prior website login", () => {
		expect(
			canUserSendMemberRolloutInvites({
				role: "admin",
				website_first_login_at: null
			})
		).toBe(true);
	});

	it("denies members who have not logged in to the website yet", () => {
		expect(
			canUserSendMemberRolloutInvites({
				role: "member",
				website_first_login_at: null
			})
		).toBe(false);
	});

	it("denies guests and prospects even after a website login", () => {
		expect(
			canUserSendMemberRolloutInvites({
				role: "guest",
				website_first_login_at: new Date()
			})
		).toBe(false);
	});

	it("allows members after their first website login", () => {
		expect(
			canUserSendMemberRolloutInvites({
				role: "member",
				website_first_login_at: new Date()
			})
		).toBe(true);
	});
});

describe("isEligibleMemberRolloutRecipient", () => {
	it("returns true for an inactive member with mbr, email, not deceased, no prior login", () => {
		expect(isEligibleMemberRolloutRecipient(baseUser())).toBe(true);
	});

	it("returns false for guests", () => {
		expect(isEligibleMemberRolloutRecipient(baseUser({ role: "guest" }))).toBe(false);
	});

	it("returns false for admins", () => {
		expect(isEligibleMemberRolloutRecipient(baseUser({ role: "admin" }))).toBe(false);
	});

	it("returns false when mbr is missing or non-positive", () => {
		expect(isEligibleMemberRolloutRecipient(baseUser({ mbr: null }))).toBe(false);
		expect(isEligibleMemberRolloutRecipient(baseUser({ mbr: 0 }))).toBe(false);
	});

	it("returns false when deceased flags are set", () => {
		expect(isEligibleMemberRolloutRecipient(baseUser({ dops: true }))).toBe(false);
		expect(isEligibleMemberRolloutRecipient(baseUser({ dops_date: "2025-01-01" }))).toBe(false);
	});

	it("returns false when account is already active", () => {
		expect(isEligibleMemberRolloutRecipient(baseUser({ account_active: true }))).toBe(false);
	});

	it("returns false after first website login", () => {
		expect(
			isEligibleMemberRolloutRecipient(
				baseUser({ website_first_login_at: new Date("2026-02-01T00:00:00.000Z") })
			)
		).toBe(false);
	});

	it("returns false without a usable email", () => {
		expect(isEligibleMemberRolloutRecipient(baseUser({ email: null }))).toBe(false);
		expect(isEligibleMemberRolloutRecipient(baseUser({ email: "   " }))).toBe(false);
	});
});

describe("nextRolloutSlotAvailableAt", () => {
	it("adds the rolling window length to the oldest token time", () => {
		const oldest = new Date("2026-03-01T10:00:00.000Z");
		const next = nextRolloutSlotAvailableAt(oldest);
		expect(next.getTime()).toBe(oldest.getTime() + MEMBER_ROLLOUT_WINDOW_MS);
	});
});
