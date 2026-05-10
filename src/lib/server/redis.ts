import { dev } from "$app/environment";
import { Redis as UpstashRedis } from "@upstash/redis";
import { createClient } from "redis";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";

export type SearchCacheNamespace =
	| "member-search"
	| "admin-member-search"
	| "prospect-search"
	| "rollout-eligible-member-search";

type CacheBackend = "upstash-rest" | "redis-url" | "disabled";

type KeyPart =
	| string
	| number
	| boolean
	| null
	| undefined
	| KeyPart[]
	| { [key: string]: KeyPart };

interface ReadThroughJsonOptions<T> {
	namespace: SearchCacheNamespace;
	keyParts: Record<string, KeyPart>;
	ttlSeconds: number;
	label: string;
	loader: () => Promise<T>;
}

const logEnabled = dev && ibcDebugEnabled();
const cachePrefix = process.env.IBC_CACHE_REDIS_PREFIX?.trim() || "ibc-cache:v1";
const upstashRestUrl =
	process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim() || "";
const upstashRestToken =
	process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim() || "";
const localRedisUrl = process.env.REDIS_URL?.trim() || "";

let upstashClient: UpstashRedis | null | undefined;
type LocalRedisClient = ReturnType<typeof createClient>;

let localRedisClientPromise: Promise<LocalRedisClient | null> | null = null;
let localRedisDisabled = false;

function getBackend(): CacheBackend {
	if (upstashRestUrl && upstashRestToken) return "upstash-rest";
	if (localRedisUrl) return "redis-url";
	return "disabled";
}

function stableNormalize(value: KeyPart): unknown {
	if (value == null) return null;
	if (Array.isArray(value)) return value.map((item) => stableNormalize(item));
	if (typeof value === "object") {
		return Object.keys(value)
			.sort()
			.reduce<Record<string, unknown>>((acc, key) => {
				acc[key] = stableNormalize((value as Record<string, KeyPart>)[key]);
				return acc;
			}, {});
	}
	return value;
}

export function normalizeSearchQuery(value: string): string {
	return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function buildSearchCacheKey(
	namespace: SearchCacheNamespace,
	keyParts: Record<string, KeyPart>
): string {
	return `${cachePrefix}:${namespace}:${JSON.stringify(stableNormalize(keyParts))}`;
}

function getUpstashClient(): UpstashRedis | null {
	if (upstashClient !== undefined) return upstashClient;
	if (!upstashRestUrl || !upstashRestToken) {
		upstashClient = null;
		return upstashClient;
	}
	upstashClient = new UpstashRedis({ url: upstashRestUrl, token: upstashRestToken });
	return upstashClient;
}

async function getLocalRedisClient(): Promise<LocalRedisClient | null> {
	if (localRedisDisabled || !localRedisUrl) return null;
	if (!localRedisClientPromise) {
		localRedisClientPromise = (async () => {
			const client = createClient({ url: localRedisUrl });
			client.on("error", (error) => {
				if (!localRedisDisabled) {
					console.error("[IBC-LOG] [redis] Local Redis client error", error);
				}
			});
			try {
				await client.connect();
				return client;
			} catch (error) {
				localRedisDisabled = true;
				console.error("[IBC-LOG] [redis] Failed to connect to local Redis", error);
				try {
					await client.quit();
				} catch {
					// ignore cleanup failures after a failed connect attempt
				}
				return null;
			}
		})();
	}
	return localRedisClientPromise;
}

async function getJson<T>(key: string): Promise<T | null> {
	const backend = getBackend();
	if (backend === "upstash-rest") {
		const client = getUpstashClient();
		if (!client) return null;
		return (await client.get<T>(key)) ?? null;
	}
	if (backend === "redis-url") {
		const client = await getLocalRedisClient();
		if (!client) return null;
		const raw = await client.get(key);
		return raw ? (JSON.parse(raw) as T) : null;
	}
	return null;
}

async function setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
	const backend = getBackend();
	if (backend === "upstash-rest") {
		const client = getUpstashClient();
		if (!client) return;
		await client.set(key, value, { ex: ttlSeconds });
		return;
	}
	if (backend === "redis-url") {
		const client = await getLocalRedisClient();
		if (!client) return;
		await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
	}
}

export async function readThroughJson<T>(options: ReadThroughJsonOptions<T>): Promise<T> {
	const { namespace, keyParts, ttlSeconds, label, loader } = options;
	const key = buildSearchCacheKey(namespace, keyParts);
	const backend = getBackend();

	if (backend === "disabled") {
		if (logEnabled) {
			console.log(`[IBC-LOG] [redis] bypass (${label}) no backend configured`);
		}
		return loader();
	}

	try {
		const cached = await getJson<T>(key);
		if (cached !== null) {
			if (logEnabled) {
				console.log(`[IBC-LOG] [redis] hit (${label})`, { namespace, backend, key });
			}
			return cached;
		}

		if (logEnabled) {
			console.log(`[IBC-LOG] [redis] miss (${label})`, { namespace, backend, key });
		}
	} catch (error) {
		console.error(`[IBC-LOG] [redis] read failed (${label})`, error);
	}

	const fresh = await loader();

	try {
		await setJson(key, fresh, ttlSeconds);
	} catch (error) {
		console.error(`[IBC-LOG] [redis] write failed (${label})`, error);
	}

	return fresh;
}
