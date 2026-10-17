import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

// Synthetic users, mocked DB lookup and mocked delivery: no database, no network, no real email.
const state = vi.hoisted(() => ({
	user: null as null | { id: string; email: string; name: string; password_hash: string },
	where: null as unknown,
	recent: false,
	tokens: 0,
	sent: [] as Array<{ to: string; kind: string }>
}));

vi.mock("$lib/server/db", () => ({
	db: {
		select: () => ({
			from: () => ({
				where: (cond: unknown) => {
					state.where = cond;
					return { limit: async () => (state.user ? [state.user] : []) };
				}
			})
		})
	}
}));
vi.mock("$lib/server/password-reset", () => ({
	hasRecentUserPasswordReset: async () => state.recent,
	createPasswordResetToken: async () => {
		state.tokens += 1;
		return {
			id: `synthetic-reset-${state.tokens}`,
			token: "synthetic-token",
			expiresAt: new Date()
		};
	}
}));
vi.mock("$lib/server/send-password-reset-email", () => ({
	isResendPasswordResetConfigured: () => true,
	sendPasswordResetEmail: async (input: { to: string; kind: string }) => {
		state.sent.push({ to: input.to, kind: input.kind });
		return { ok: true };
	}
}));

const { actions } = await import("./+page.server");
type ActionEvent = Parameters<(typeof actions)["default"]>[0];

function post(email: string) {
	const body = new FormData();
	body.set("email", email);
	return {
		request: new Request("http://test.local/forgot-password", { method: "POST", body }),
		url: new URL("http://test.local/forgot-password")
	} as unknown as ActionEvent;
}

const member = {
	id: "synthetic-member",
	email: "sam.member@example.test",
	name: "Sam Member",
	password_hash: "$argon2id$synthetic"
};

beforeEach(() => {
	state.user = member;
	state.where = null;
	state.recent = false;
	state.tokens = 0;
	state.sent = [];
});

describe("/forgot-password", () => {
	it("sends one reset email for an existing account", async () => {
		const result = await actions.default(post("Sam.Member@example.test"));
		expect(result).toMatchObject({ sent: true });
		expect(state.sent).toEqual([{ to: "sam.member@example.test", kind: "user" }]);
	});

	it("looks the email up by exact case-insensitive match, not a LIKE pattern", async () => {
		await actions.default(post("S_m.Member@example.test"));
		const { sql, params } = new PgDialect().sqlToQuery(state.where as SQL);
		expect(sql).toMatch(/lower\(trim\("users"\."email"\)\) = \$1/);
		expect(sql).not.toMatch(/like/i);
		expect(params).toEqual(["s_m.member@example.test"]);
	});

	it("skips sending during the per-account cooldown with the same generic response", async () => {
		state.recent = true;
		const result = await actions.default(post(member.email));
		expect(result).toMatchObject({ sent: true });
		expect(state.tokens).toBe(0);
		expect(state.sent).toEqual([]);
	});

	it("returns the same generic response for an unknown email without sending", async () => {
		state.user = null;
		const result = await actions.default(post("nobody@example.test"));
		expect(result).toMatchObject({ sent: true });
		expect(state.sent).toEqual([]);
	});
});
