import type { RequestEvent } from "@sveltejs/kit";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { incrementWithExpiry } from "$lib/server/redis";

/**
 * Redis-backed fixed-window rate limiter for auth endpoints (login,
 * forgot-password, token activation). Modeled on the existing Redis cache
 * helpers: when no backend is configured it fails open (never blocks), so
 * local dev and unconfigured deploys behave exactly as before.
 *
 * The window is a simple fixed bucket: the first request in a window sets the
 * TTL, and the counter resets when it expires. Good enough to blunt
 * brute-force and enumeration hammering without the complexity of a sliding
 * log.
 */

const RATE_LIMIT_PREFIX = process.env.IBC_RATE_LIMIT_REDIS_PREFIX?.trim() || "ibc-rl:v1";

const MINUTE = 60;

export interface RateLimitRule {
	/** Max requests allowed within the window before requests are limited. */
	limit: number;
	/** Window length in seconds. */
	windowSeconds: number;
}

export interface RateLimitResult {
	/** True when the caller has exceeded the rule and should be rejected. */
	limited: boolean;
	/** Requests remaining in the current window (0 once limited). */
	remaining: number;
	/** Suggested Retry-After in seconds (0 when not limited). */
	retryAfterSeconds: number;
}

/** Injectable increment primitive so the decision logic is unit-testable. */
export type IncrementFn = (key: string, windowSeconds: number) => Promise<number | null>;

function envInt(name: string, fallback: number): number {
	const raw = process.env[name]?.trim();
	if (!raw) return fallback;
	const parsed = Number.parseInt(raw, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function rule(
	limitEnv: string,
	windowEnv: string,
	limit: number,
	windowSeconds: number
): RateLimitRule {
	return {
		limit: envInt(limitEnv, limit),
		windowSeconds: envInt(windowEnv, windowSeconds)
	};
}

// Defaults are deliberately generous for real users but tight against
// automated abuse. All are overridable via env.
export const LOGIN_IP_RULE = rule("IBC_RL_LOGIN_IP_LIMIT", "IBC_RL_LOGIN_WINDOW", 20, 15 * MINUTE);
export const LOGIN_IDENTIFIER_RULE = rule(
	"IBC_RL_LOGIN_ID_LIMIT",
	"IBC_RL_LOGIN_WINDOW",
	8,
	15 * MINUTE
);
export const PASSWORD_RESET_IP_RULE = rule(
	"IBC_RL_RESET_IP_LIMIT",
	"IBC_RL_RESET_WINDOW",
	10,
	15 * MINUTE
);
export const PASSWORD_RESET_EMAIL_RULE = rule(
	"IBC_RL_RESET_EMAIL_LIMIT",
	"IBC_RL_RESET_EMAIL_WINDOW",
	4,
	60 * MINUTE
);
export const TOKEN_ACTIVATION_IP_RULE = rule(
	"IBC_RL_ACTIVATE_IP_LIMIT",
	"IBC_RL_ACTIVATE_WINDOW",
	15,
	15 * MINUTE
);
export const TOKEN_ACTIVATION_TOKEN_RULE = rule(
	"IBC_RL_ACTIVATE_TOKEN_LIMIT",
	"IBC_RL_ACTIVATE_WINDOW",
	10,
	15 * MINUTE
);

/** Best-effort client IP; falls back to a constant so the limiter still keys something. */
export function getClientIp(event: RequestEvent): string {
	try {
		return event.getClientAddress();
	} catch {
		return "unknown";
	}
}

/** Normalize an email/username so casing/whitespace don't split the bucket. */
export function normalizeIdentifier(value: string): string {
	return value.trim().toLowerCase();
}

/** Hash a secret identifier (e.g. a reset/activation token) so it never lands in a Redis key. */
export function hashIdentifier(value: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(value))).slice(0, 32);
}

export function buildRateLimitKey(scope: string, identifier: string): string {
	return `${RATE_LIMIT_PREFIX}:${scope}:${identifier}`;
}

/**
 * Pure decision from a raw count. `null` (no backend / error) fails open.
 * A request is limited once its own increment pushes the count past `limit`.
 */
export function evaluateCount(count: number | null, r: RateLimitRule): RateLimitResult {
	if (count === null) {
		return { limited: false, remaining: r.limit, retryAfterSeconds: 0 };
	}
	const limited = count > r.limit;
	return {
		limited,
		remaining: Math.max(0, r.limit - count),
		retryAfterSeconds: limited ? r.windowSeconds : 0
	};
}

/** Consume one unit against a single bucket and return the decision. */
export async function consumeRateLimit(
	scope: string,
	identifier: string,
	r: RateLimitRule,
	increment: IncrementFn = incrementWithExpiry
): Promise<RateLimitResult> {
	const count = await increment(buildRateLimitKey(scope, identifier), r.windowSeconds);
	return evaluateCount(count, r);
}

export interface RateLimitCheck {
	scope: string;
	identifier: string;
	rule: RateLimitRule;
}

/**
 * Consume across several buckets (e.g. per-IP AND per-email) in one call.
 * Every bucket is incremented; the result reports limited=true if any bucket
 * is over, with the longest Retry-After.
 */
export async function enforceRateLimits(
	checks: RateLimitCheck[],
	increment: IncrementFn = incrementWithExpiry
): Promise<RateLimitResult> {
	const results = await Promise.all(
		checks.map((c) => consumeRateLimit(c.scope, c.identifier, c.rule, increment))
	);
	const limited = results.some((res) => res.limited);
	return {
		limited,
		remaining: results.reduce((min, res) => Math.min(min, res.remaining), Number.POSITIVE_INFINITY),
		retryAfterSeconds: results.reduce((max, res) => Math.max(max, res.retryAfterSeconds), 0)
	};
}

/** Generic, non-enumerating message shown when a request is throttled. */
export const RATE_LIMITED_MESSAGE = "Too many attempts. Please wait a few minutes and try again.";
