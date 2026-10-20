import { dev } from "$app/environment";
import { Redis as UpstashRedis } from "@upstash/redis";
import { createClient } from "redis";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";

export type SearchCacheNamespace =
	| "member-search"
	| "admin-member-search"
	| "prospect-search"
	| "rollout-eligible-member-search"
	| "session-validation"
	| "dashboard-club-stats"
	| "admin-stats-overview";

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
	// No client-side retries: its default (5 retries with backoff, ~4s) cannot finish inside the
	// 1s cache timeout, so it only hid the real error. A failure now surfaces and trips the cooldown.
	upstashClient = new UpstashRedis({ url: upstashRestUrl, token: upstashRestToken, retry: false });
	return upstashClient;
}

async function getLocalRedisClient(): Promise<LocalRedisClient | null> {
	if (localRedisDisabled || !localRedisUrl) return null;
	if (!localRedisClientPromise) {
		localRedisClientPromise = (async () => {
			const client = createClient({
				url: localRedisUrl,
				socket: {
					reconnectStrategy: () => false
				}
			});
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
				console.error(
					"[IBC-LOG] [redis] Failed to connect to local Redis; caching disabled for this process",
					error
				);
				try {
					client.destroy();
				} catch {
					// ignore cleanup failures after a failed connect attempt
				}
				return null;
			}
		})();
	}
	return localRedisClientPromise;
}

/**
 * Upper bound on how long a request waits for any single cache read, write or delete, including
 * connection setup. See "Cache timeouts" in DEPLOYMENT.md.
 *
 * Healthy Upstash REST round trips usually take tens of milliseconds; 1s leaves headroom for a cold
 * TLS/DNS handshake while keeping a stuck or unreachable cache from holding a request until the
 * platform's function timeout. A slow healthy call can also exceed it and is treated as a miss.
 * The timeout stops the wait only: the underlying call is not cancelled and may still complete
 * (a timed-out write can land later). On timeout the cache is skipped and data comes from the
 * loader / database.
 */
export const CACHE_OPERATION_TIMEOUT_MS = 1000;

/**
 * After a cache read or write fails or times out, skip reads and writes in this process for this
 * long and go straight to the loader / database. Without it, an unreachable cache costs every
 * request a full timeout per operation (seconds per page). Deletes are still attempted so session
 * invalidation is never skipped.
 */
export const CACHE_FAILURE_COOLDOWN_MS = 60_000;

let cacheUnavailableUntil = 0;

function cacheInCooldown(): boolean {
	return Date.now() < cacheUnavailableUntil;
}

function markCacheFailure(): void {
	if (!cacheInCooldown()) {
		console.error(
			`[IBC-LOG] [redis] cache failing; bypassing reads and writes for ${CACHE_FAILURE_COOLDOWN_MS / 1000}s`
		);
	}
	cacheUnavailableUntil = Date.now() + CACHE_FAILURE_COOLDOWN_MS;
}

class CacheTimeoutError extends Error {
	constructor(operation: string) {
		super(`[redis] ${operation} timed out after ${CACHE_OPERATION_TIMEOUT_MS}ms`);
		this.name = "CacheTimeoutError";
	}
}

function withCacheTimeout<T>(operation: Promise<T>, label: string): Promise<T> {
	let timedOut = false;
	// If the timeout wins, the operation may still reject later; observe it so it is never unhandled,
	// and log it so the underlying cause (DNS, auth, network) is visible behind the timeout.
	operation.catch((error: unknown) => {
		if (timedOut) console.error(`[IBC-LOG] [redis] ${label} failed after its timeout`, error);
	});
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			timedOut = true;
			reject(new CacheTimeoutError(label));
		}, CACHE_OPERATION_TIMEOUT_MS);
	});
	return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
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

async function deleteJson(key: string): Promise<void> {
	const backend = getBackend();
	if (backend === "upstash-rest") {
		const client = getUpstashClient();
		if (client) await client.del(key);
		return;
	}
	if (backend === "redis-url") {
		const client = await getLocalRedisClient();
		if (client) await client.del(key);
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
	if (cacheInCooldown()) return loader();

	try {
		const cached = await withCacheTimeout(getJson<T>(key), `read (${label})`);
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
		markCacheFailure();
	}

	const fresh = await loader();
	if (cacheInCooldown()) return fresh;

	try {
		await withCacheTimeout(setJson(key, fresh, ttlSeconds), `write (${label})`);
	} catch (error) {
		console.error(`[IBC-LOG] [redis] write failed (${label})`, error);
		markCacheFailure();
	}

	return fresh;
}

export async function deleteCachedJson(
	namespace: SearchCacheNamespace,
	keyParts: Record<string, KeyPart>
): Promise<void> {
	const backend = getBackend();
	if (backend === "disabled") return;

	const key = buildSearchCacheKey(namespace, keyParts);
	try {
		await withCacheTimeout(deleteJson(key), `delete (${namespace})`);
	} catch (error) {
		console.error(`[IBC-LOG] [redis] delete failed (${namespace})`, error);
		markCacheFailure();
	}
}

/** Resolves `null` (a cache miss) when the cache errors or times out, so callers fall back to the database. */
export async function getCachedJson<T>(
	namespace: SearchCacheNamespace,
	keyParts: Record<string, KeyPart>
): Promise<T | null> {
	if (getBackend() === "disabled" || cacheInCooldown()) return null;
	try {
		return await withCacheTimeout(
			getJson<T>(buildSearchCacheKey(namespace, keyParts)),
			`read (${namespace})`
		);
	} catch (error) {
		console.error(`[IBC-LOG] [redis] read failed (${namespace})`, error);
		markCacheFailure();
		return null;
	}
}

export async function setCachedJson<T>(
	namespace: SearchCacheNamespace,
	keyParts: Record<string, KeyPart>,
	value: T,
	ttlSeconds: number
): Promise<void> {
	if (getBackend() === "disabled" || cacheInCooldown()) return;
	try {
		await withCacheTimeout(
			setJson(buildSearchCacheKey(namespace, keyParts), value, ttlSeconds),
			`write (${namespace})`
		);
	} catch (error) {
		console.error(`[IBC-LOG] [redis] write failed (${namespace})`, error);
		markCacheFailure();
	}
}
