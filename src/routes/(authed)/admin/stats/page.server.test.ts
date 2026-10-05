import { describe, expect, it, vi, beforeEach } from "vitest";
import { isRedirect } from "@sveltejs/kit";

const overview = vi.hoisted(() => ({ calls: 0 }));

// Any cache or DB read would go through this module; count calls to prove none happen.
vi.mock("$lib/server/admin-stats-overview-cache.js", () => ({
	getAdminStatsOverview: async () => {
		overview.calls += 1;
		return { membersJoinedByYear: [] };
	}
}));

const { load } = await import("./+page.server");

type LoadEvent = Parameters<typeof load>[0];
const eventFor = (user: unknown) => ({ locals: { user, session: null } }) as unknown as LoadEvent;

async function redirectOf(promise: Promise<unknown>) {
	try {
		await promise;
	} catch (error) {
		if (isRedirect(error)) return error;
		throw error;
	}
	throw new Error("expected a redirect");
}

beforeEach(() => {
	overview.calls = 0;
});

describe("/admin/stats page load authorization", () => {
	it("redirects unauthenticated requests to login without reading stats", async () => {
		const redirect = await redirectOf(Promise.resolve().then(() => load(eventFor(null))));
		expect(redirect.location).toBe("/login");
		expect(overview.calls).toBe(0);
	});

	it("redirects non-admin members without reading stats", async () => {
		const redirect = await redirectOf(
			Promise.resolve().then(() => load(eventFor({ id: "u1", role: "member", mbr: 5 })))
		);
		expect(redirect.location).toBe("/");
		expect(overview.calls).toBe(0);
	});

	it("redirects guests/prospects without reading stats", async () => {
		await redirectOf(Promise.resolve().then(() => load(eventFor({ id: "u2", role: "guest" }))));
		expect(overview.calls).toBe(0);
	});

	it("returns the overview for admins", async () => {
		const result = await load(eventFor({ id: "a1", role: "admin", mbr: 1 }));
		expect(result).toEqual({ membersJoinedByYear: [] });
		expect(overview.calls).toBe(1);
	});
});
