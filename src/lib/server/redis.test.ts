import { describe, expect, it } from "vitest";
import { buildSearchCacheKey, normalizeSearchQuery } from "$lib/server/redis";

describe("redis search cache helpers", () => {
	it("normalizes repeated whitespace and case for cache queries", () => {
		expect(normalizeSearchQuery("  John   SMITH  ")).toBe("john smith");
	});

	it("builds deterministic keys for equivalent objects", () => {
		const a = buildSearchCacheKey("member-search", {
			searchTerm: "john smith",
			page: 1,
			perPage: 10,
			filters: { role: "member", active: true }
		});
		const b = buildSearchCacheKey("member-search", {
			perPage: 10,
			filters: { active: true, role: "member" },
			page: 1,
			searchTerm: "john smith"
		});

		expect(a).toBe(b);
	});
});
