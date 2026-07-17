import { describe, expect, it, vi } from "vitest";
import {
	buildRateLimitKey,
	consumeRateLimit,
	enforceRateLimits,
	evaluateCount,
	hashIdentifier,
	normalizeIdentifier,
	type IncrementFn,
	type RateLimitRule
} from "./rate-limit";

const rule: RateLimitRule = { limit: 3, windowSeconds: 900 };

describe("evaluateCount", () => {
	it("fails open when the backend returns null (no Redis)", () => {
		const r = evaluateCount(null, rule);
		expect(r.limited).toBe(false);
		expect(r.remaining).toBe(rule.limit);
		expect(r.retryAfterSeconds).toBe(0);
	});

	it("allows requests up to and including the limit", () => {
		expect(evaluateCount(1, rule).limited).toBe(false);
		expect(evaluateCount(3, rule).limited).toBe(false);
		expect(evaluateCount(3, rule).remaining).toBe(0);
	});

	it("limits the request that exceeds the limit and reports retry-after", () => {
		const r = evaluateCount(4, rule);
		expect(r.limited).toBe(true);
		expect(r.remaining).toBe(0);
		expect(r.retryAfterSeconds).toBe(rule.windowSeconds);
	});
});

describe("buildRateLimitKey / identifiers", () => {
	it("namespaces keys by scope and identifier", () => {
		expect(buildRateLimitKey("login:ip", "1.2.3.4")).toMatch(/:login:ip:1\.2\.3\.4$/);
	});

	it("normalizes identifiers so casing/whitespace share a bucket", () => {
		expect(normalizeIdentifier("  Foo@Bar.COM ")).toBe("foo@bar.com");
	});

	it("hashes secret identifiers to a stable non-reversible hex", () => {
		const h = hashIdentifier("super-secret-token");
		expect(h).toMatch(/^[0-9a-f]{32}$/);
		expect(h).not.toContain("super-secret-token");
		expect(hashIdentifier("super-secret-token")).toBe(h);
		expect(hashIdentifier("different")).not.toBe(h);
	});
});

describe("consumeRateLimit", () => {
	it("increments the correct key with the window and returns the decision", async () => {
		const increment = vi.fn<IncrementFn>().mockResolvedValue(2);
		const r = await consumeRateLimit("login:ip", "1.2.3.4", rule, increment);
		expect(increment).toHaveBeenCalledWith(buildRateLimitKey("login:ip", "1.2.3.4"), 900);
		expect(r.limited).toBe(false);
		expect(r.remaining).toBe(1);
	});
});

describe("enforceRateLimits", () => {
	it("increments every bucket even when the first is already over", async () => {
		const increment = vi.fn<IncrementFn>().mockResolvedValue(1);
		await enforceRateLimits(
			[
				{ scope: "login:ip", identifier: "1.2.3.4", rule },
				{ scope: "login:id", identifier: "foo@bar.com", rule }
			],
			increment
		);
		expect(increment).toHaveBeenCalledTimes(2);
	});

	it("reports limited with the longest retry-after when any bucket is over", async () => {
		const increment = vi
			.fn<IncrementFn>()
			.mockResolvedValueOnce(1) // ip: ok
			.mockResolvedValueOnce(9); // id: over
		const r = await enforceRateLimits(
			[
				{ scope: "login:ip", identifier: "1.2.3.4", rule },
				{ scope: "login:id", identifier: "foo@bar.com", rule: { limit: 2, windowSeconds: 3600 } }
			],
			increment
		);
		expect(r.limited).toBe(true);
		expect(r.retryAfterSeconds).toBe(3600);
	});

	it("fails open across buckets when Redis is unavailable", async () => {
		const increment = vi.fn<IncrementFn>().mockResolvedValue(null);
		const r = await enforceRateLimits(
			[{ scope: "login:ip", identifier: "1.2.3.4", rule }],
			increment
		);
		expect(r.limited).toBe(false);
	});
});
