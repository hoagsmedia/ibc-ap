import { describe, expect, it, vi } from "vitest";

// Synthetic record and mocked lookup: no database.
const record = {
	id: "00000000-0000-4000-8000-000000000001",
	name: "Sam Member",
	username: "sam",
	email: "sam.member@example.test",
	role: "member",
	img: null,
	mbr: 999,
	msd: null,
	dops: false,
	dops_date: null,
	bio: "Synthetic bio",
	hobbies: null,
	likes: null,
	sponsor: null,
	test_passed: null,
	rung_in_date: null,
	password_hash: "$argon2id$synthetic",
	phone: "555-0100",
	address: "1 Synthetic St",
	meeting_1_date: new Date(),
	account_active: true,
	website_first_login_at: new Date()
};

vi.mock("$lib/server/member-lookup", () => ({ getMemberById: async () => record }));

const { load } = await import("./+page.server");
type LoadEvent = Parameters<typeof load>[0];

describe("/members/[id] load", () => {
	it("returns only profile fields to other members", async () => {
		const result = (await load({
			locals: { user: { id: "viewer", role: "member", account_active: true } },
			params: { id: record.id },
			url: new URL(`http://test.local/members/${record.id}`),
			request: new Request(`http://test.local/members/${record.id}`)
		} as unknown as LoadEvent)) as { member: Record<string, unknown> };
		for (const key of [
			"password_hash",
			"phone",
			"address",
			"meeting_1_date",
			"account_active",
			"website_first_login_at"
		]) {
			expect(result.member).not.toHaveProperty(key);
		}
		expect(result.member).toMatchObject({
			id: record.id,
			name: "Sam Member",
			bio: "Synthetic bio"
		});
	});
});
