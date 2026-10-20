import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Synthetic Upstash client: each test decides how get/set/del settle. No network, no live env.
const upstash = vi.hoisted(() => ({
	get: vi.fn<(key: string) => Promise<unknown>>(),
	set: vi.fn<(key: string, value: unknown, opts: unknown) => Promise<unknown>>(),
	del: vi.fn<(key: string) => Promise<unknown>>()
}));

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

const never = () => new Promise<never>(() => {});
const rejectAfter = (ms: number) =>
	new Promise<never>((_, reject) => setTimeout(() => reject(new Error("late failure")), ms));

const unhandled: unknown[] = [];
const onUnhandled = (reason: unknown) => unhandled.push(reason);

async function loadRedis() {
	vi.resetModules();
	return import("$lib/server/redis");
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://cache.example.invalid");
	vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "synthetic-token");
	vi.stubEnv("KV_REST_API_URL", "");
	vi.stubEnv("KV_REST_API_TOKEN", "");
	vi.stubEnv("REDIS_URL", "");
	upstash.get.mockReset().mockResolvedValue(null);
	upstash.set.mockReset().mockResolvedValue("OK");
	upstash.del.mockReset().mockResolvedValue(1);
	vi.spyOn(console, "error").mockImplementation(() => {});
	unhandled.length = 0;
	process.on("unhandledRejection", onUnhandled);
});

afterEach(() => {
	process.off("unhandledRejection", onUnhandled);
	vi.useRealTimers();
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

/** Resolves once `promise` settles, or reports that it is still pending. */
async function settledWithin<T>(promise: Promise<T>, ms: number) {
	let done = false;
	let value: T | undefined;
	promise.then((v) => {
		done = true;
		value = v;
	});
	await vi.advanceTimersByTimeAsync(ms);
	return { done, value };
}

describe("readThroughJson cache timeouts", () => {
	it("returns a cache hit without calling the loader", async () => {
		const { readThroughJson } = await loadRedis();
		upstash.get.mockResolvedValue({ n: 1 });
		const loader = vi.fn(async () => ({ n: 2 }));

		const result = await readThroughJson({
			namespace: "member-search",
			keyParts: { q: "a" },
			ttlSeconds: 60,
			label: "test",
			loader
		});

		expect(result).toEqual({ n: 1 });
		expect(loader).not.toHaveBeenCalled();
		expect(vi.getTimerCount()).toBe(0);
	});

	it("loads and writes on a miss", async () => {
		const { readThroughJson } = await loadRedis();

		const result = await readThroughJson({
			namespace: "member-search",
			keyParts: { q: "a" },
			ttlSeconds: 60,
			label: "test",
			loader: async () => ({ n: 2 })
		});

		expect(result).toEqual({ n: 2 });
		expect(upstash.set).toHaveBeenCalledWith(expect.any(String), { n: 2 }, { ex: 60 });
		expect(vi.getTimerCount()).toBe(0);
	});

	it("falls back to the loader when the read rejects", async () => {
		const { readThroughJson } = await loadRedis();
		upstash.get.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));

		const result = await readThroughJson({
			namespace: "member-search",
			keyParts: { q: "a" },
			ttlSeconds: 60,
			label: "test",
			loader: async () => "fresh"
		});

		expect(result).toBe("fresh");
	});

	it("falls back to the loader when the read never settles", async () => {
		const { readThroughJson, CACHE_OPERATION_TIMEOUT_MS } = await loadRedis();
		upstash.get.mockImplementation(never);
		const loader = vi.fn(async () => "fresh");

		const pending = readThroughJson({
			namespace: "member-search",
			keyParts: { q: "a" },
			ttlSeconds: 60,
			label: "test",
			loader
		});

		expect((await settledWithin(pending, CACHE_OPERATION_TIMEOUT_MS - 1)).done).toBe(false);
		expect(loader).not.toHaveBeenCalled();
		const after = await settledWithin(pending, 1);
		expect(after).toEqual({ done: true, value: "fresh" });
		expect(loader).toHaveBeenCalledTimes(1);
	});

	it("returns fresh data when the write never settles", async () => {
		const { readThroughJson, CACHE_OPERATION_TIMEOUT_MS } = await loadRedis();
		upstash.set.mockImplementation(never);

		const pending = readThroughJson({
			namespace: "member-search",
			keyParts: { q: "a" },
			ttlSeconds: 60,
			label: "test",
			loader: async () => "fresh"
		});

		expect(await settledWithin(pending, CACHE_OPERATION_TIMEOUT_MS)).toEqual({
			done: true,
			value: "fresh"
		});
	});

	it("returns fresh data when the write rejects", async () => {
		const { readThroughJson } = await loadRedis();
		upstash.set.mockRejectedValue(new Error("write refused"));

		await expect(
			readThroughJson({
				namespace: "member-search",
				keyParts: { q: "a" },
				ttlSeconds: 60,
				label: "test",
				loader: async () => "fresh"
			})
		).resolves.toBe("fresh");
	});

	it("does not surface late rejections after a timeout", async () => {
		const { readThroughJson, CACHE_OPERATION_TIMEOUT_MS } = await loadRedis();
		upstash.get.mockImplementation(() => rejectAfter(CACHE_OPERATION_TIMEOUT_MS * 5));
		upstash.set.mockImplementation(() => rejectAfter(CACHE_OPERATION_TIMEOUT_MS * 5));

		const pending = readThroughJson({
			namespace: "member-search",
			keyParts: { q: "a" },
			ttlSeconds: 60,
			label: "test",
			loader: async () => "fresh"
		});

		expect((await settledWithin(pending, CACHE_OPERATION_TIMEOUT_MS * 2)).value).toBe("fresh");
		await vi.advanceTimersByTimeAsync(CACHE_OPERATION_TIMEOUT_MS * 10);
		vi.useRealTimers();
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(unhandled).toEqual([]);
	});
});

describe("session cache helpers (getCachedJson / setCachedJson / deleteCachedJson)", () => {
	it("returns the cached value on success", async () => {
		const { getCachedJson } = await loadRedis();
		upstash.get.mockResolvedValue({ ok: true });

		await expect(getCachedJson("session-validation", { sessionId: "s" })).resolves.toEqual({
			ok: true
		});
	});

	it("treats a rejected read as a miss instead of throwing", async () => {
		const { getCachedJson } = await loadRedis();
		upstash.get.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));

		await expect(getCachedJson("session-validation", { sessionId: "s" })).resolves.toBeNull();
	});

	it("treats a never-settling read as a miss after the timeout", async () => {
		const { getCachedJson, CACHE_OPERATION_TIMEOUT_MS } = await loadRedis();
		upstash.get.mockImplementation(never);

		const pending = getCachedJson("session-validation", { sessionId: "s" });
		expect((await settledWithin(pending, CACHE_OPERATION_TIMEOUT_MS - 1)).done).toBe(false);
		expect(await settledWithin(pending, 1)).toEqual({ done: true, value: null });
	});

	it("bounds and swallows write and delete failures", async () => {
		const { setCachedJson, deleteCachedJson, CACHE_OPERATION_TIMEOUT_MS } = await loadRedis();
		upstash.set.mockImplementation(never);
		upstash.del.mockImplementation(never);

		const write = setCachedJson("session-validation", { sessionId: "s" }, { ok: true }, 90);
		const remove = deleteCachedJson("session-validation", { sessionId: "s" });
		expect((await settledWithin(write, CACHE_OPERATION_TIMEOUT_MS)).done).toBe(true);
		expect((await settledWithin(remove, 0)).done).toBe(true);

		upstash.set.mockRejectedValue(new Error("write refused"));
		upstash.del.mockRejectedValue(new Error("delete refused"));
		await expect(
			setCachedJson("session-validation", { sessionId: "s" }, { ok: true }, 90)
		).resolves.toBeUndefined();
		await expect(
			deleteCachedJson("session-validation", { sessionId: "s" })
		).resolves.toBeUndefined();
	});

	it("does not surface late rejections from session helpers", async () => {
		const { getCachedJson, setCachedJson, deleteCachedJson, CACHE_OPERATION_TIMEOUT_MS } =
			await loadRedis();
		upstash.get.mockImplementation(() => rejectAfter(CACHE_OPERATION_TIMEOUT_MS * 3));
		upstash.set.mockImplementation(() => rejectAfter(CACHE_OPERATION_TIMEOUT_MS * 3));
		upstash.del.mockImplementation(() => rejectAfter(CACHE_OPERATION_TIMEOUT_MS * 3));

		const all = Promise.all([
			getCachedJson("session-validation", { sessionId: "s" }),
			setCachedJson("session-validation", { sessionId: "s" }, {}, 90),
			deleteCachedJson("session-validation", { sessionId: "s" })
		]);
		expect((await settledWithin(all, CACHE_OPERATION_TIMEOUT_MS)).done).toBe(true);
		await vi.advanceTimersByTimeAsync(CACHE_OPERATION_TIMEOUT_MS * 5);
		vi.useRealTimers();
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(unhandled).toEqual([]);
	});
});

describe("cache failure cooldown", () => {
	it("skips the cache after a timeout, then retries once the cooldown passes", async () => {
		const {
			readThroughJson,
			getCachedJson,
			setCachedJson,
			CACHE_OPERATION_TIMEOUT_MS,
			CACHE_FAILURE_COOLDOWN_MS
		} = await loadRedis();
		upstash.get.mockImplementation(never);
		const options = {
			namespace: "dashboard-club-stats" as const,
			keyParts: { v: 1 },
			ttlSeconds: 60,
			label: "test",
			loader: async () => "fresh"
		};

		// First request pays one timeout and skips the write.
		const first = readThroughJson(options);
		expect(await settledWithin(first, CACHE_OPERATION_TIMEOUT_MS)).toEqual({
			done: true,
			value: "fresh"
		});
		expect(upstash.set).not.toHaveBeenCalled();

		// During the cooldown nothing waits on the cache.
		upstash.get.mockClear();
		expect(await settledWithin(readThroughJson(options), 0)).toEqual({
			done: true,
			value: "fresh"
		});
		expect(await settledWithin(getCachedJson("session-validation", { sessionId: "s" }), 0)).toEqual(
			{
				done: true,
				value: null
			}
		);
		await setCachedJson("session-validation", { sessionId: "s" }, {}, 90);
		expect(upstash.get).not.toHaveBeenCalled();
		expect(upstash.set).not.toHaveBeenCalled();

		// After the cooldown a healthy cache is used again.
		await vi.advanceTimersByTimeAsync(CACHE_FAILURE_COOLDOWN_MS);
		upstash.get.mockResolvedValue("cached");
		await expect(readThroughJson(options)).resolves.toBe("cached");
	});

	it("still attempts deletes during the cooldown so sessions can be invalidated", async () => {
		const { getCachedJson, deleteCachedJson } = await loadRedis();
		upstash.get.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
		await getCachedJson("session-validation", { sessionId: "s" });

		await deleteCachedJson("session-validation", { sessionId: "s" });
		expect(upstash.del).toHaveBeenCalledTimes(1);
	});
});
