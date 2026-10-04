import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Synthetic Upstash client and DB: no network, no live env, no real accounts.
const upstash = vi.hoisted(() => ({
	get: vi.fn<(key: string) => Promise<unknown>>(),
	set: vi.fn<(key: string, value: unknown, opts: unknown) => Promise<unknown>>(),
	del: vi.fn<(key: string) => Promise<unknown>>()
}));

const dbRows = vi.hoisted(() => ({ rows: [] as unknown[] }));

vi.mock("@upstash/redis", () => ({
	Redis: class {
		get(key: string) {
			return upstash.get(key);
		}
		set(key: string, value: unknown, opts: unknown) {
			return upstash.set(key, value, opts);
		}
		del(key: string) {
			return upstash.del(key);
		}
	}
}));

vi.mock("$lib/server/db", () => {
	const chain = {
		select: () => chain,
		from: () => chain,
		innerJoin: () => chain,
		where: async () => dbRows.rows
	};
	return { db: chain };
});

const never = () => new Promise<never>(() => {});

const syntheticUser = {
	id: "user-synthetic",
	name: "Synthetic Member",
	email: null,
	username: "synthetic",
	role: "member" as const,
	img: null,
	mbr: 999,
	msd: null,
	test_passed: null,
	meeting_1_date: null,
	meeting_2_date: null,
	meeting_3_date: null,
	account_active: true,
	website_first_login_at: null
};

beforeEach(() => {
	vi.useFakeTimers();
	vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://cache.example.invalid");
	vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "synthetic-token");
	vi.stubEnv("KV_REST_API_URL", "");
	vi.stubEnv("KV_REST_API_TOKEN", "");
	vi.stubEnv("REDIS_URL", "");
	upstash.get.mockReset();
	upstash.set.mockReset();
	upstash.del.mockReset();
	vi.spyOn(console, "error").mockImplementation(() => {});
	dbRows.rows = [
		{
			// Far from the renewal window, so no session UPDATE is attempted.
			session: {
				id: "ignored",
				userId: syntheticUser.id,
				expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 29)
			},
			user: syntheticUser
		}
	];
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

describe("validateSessionToken with an unavailable session cache", () => {
	it("falls back to the database when the cache read and write never settle", async () => {
		vi.resetModules();
		const { validateSessionToken } = await import("$lib/server/auth");
		const { CACHE_OPERATION_TIMEOUT_MS } = await import("$lib/server/redis");
		upstash.get.mockImplementation(never);
		upstash.set.mockImplementation(never);

		const pending = validateSessionToken("synthetic-token-value");
		let result: Awaited<typeof pending> | undefined;
		pending.then((r) => (result = r));

		await vi.advanceTimersByTimeAsync(CACHE_OPERATION_TIMEOUT_MS * 2);

		expect(result?.user?.id).toBe(syntheticUser.id);
		expect(result?.session).not.toBeNull();
	});

	it("falls back to the database instead of signing out when the cache read rejects", async () => {
		vi.resetModules();
		const { validateSessionToken } = await import("$lib/server/auth");
		upstash.get.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
		upstash.set.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));

		const result = await validateSessionToken("synthetic-token-value");

		expect(result.user?.id).toBe(syntheticUser.id);
		expect(result.session).not.toBeNull();
	});
});
