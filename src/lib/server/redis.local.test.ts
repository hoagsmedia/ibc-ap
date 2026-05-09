import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createClient, type RedisClientType } from "redis";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

let client: RedisClientType;

beforeAll(async () => {
	client = createClient({ url: redisUrl });
	await client.connect();
});

afterAll(async () => {
	await client.quit();
});

describe("local redis cache path", () => {
	it("stores and reuses read-through results", async () => {
		const prefix = `ibc-test-${randomUUID()}`;
		process.env.REDIS_URL = redisUrl;
		process.env.IBC_CACHE_REDIS_PREFIX = prefix;
		delete process.env.UPSTASH_REDIS_REST_URL;
		delete process.env.UPSTASH_REDIS_REST_TOKEN;
		delete process.env.KV_REST_API_URL;
		delete process.env.KV_REST_API_TOKEN;
		vi.resetModules();

		const { buildSearchCacheKey, readThroughJson } = await import("$lib/server/redis");
		const key = buildSearchCacheKey("member-search", {
			searchTerm: "cache me",
			page: 1,
			perPage: 10
		});

		await client.del(key);

		let loadCount = 0;
		const first = await readThroughJson({
			namespace: "member-search",
			keyParts: { searchTerm: "cache me", page: 1, perPage: 10 },
			ttlSeconds: 60,
			label: "redis-local-test",
			loader: async () => {
				loadCount += 1;
				return { ok: true, source: "db" };
			}
		});

		const second = await readThroughJson({
			namespace: "member-search",
			keyParts: { searchTerm: "cache me", page: 1, perPage: 10 },
			ttlSeconds: 60,
			label: "redis-local-test",
			loader: async () => {
				loadCount += 1;
				return { ok: true, source: "db-2" };
			}
		});

		expect(first).toEqual({ ok: true, source: "db" });
		expect(second).toEqual({ ok: true, source: "db" });
		expect(loadCount).toBe(1);
		expect(await client.exists(key)).toBe(1);
	});
});
