import { describe, expect, it, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

// Synthetic DB and cache only: no env, no network, no real member data.
const state = vi.hoisted(() => ({
	memberRows: [] as Array<{ year: number | string; name: string; mbr: number | null }>,
	memberSelectFields: [] as string[][],
	cacheCalls: [] as Array<{ namespace: string; keyParts: Record<string, unknown> }>
}));

vi.mock("$lib/server/redis", () => ({
	readThroughJson: async (opts: {
		namespace: string;
		keyParts: Record<string, unknown>;
		loader: () => Promise<unknown>;
	}) => {
		state.cacheCalls.push({ namespace: opts.namespace, keyParts: opts.keyParts });
		return opts.loader();
	}
}));

vi.mock("$lib/server/db", () => {
	const resultFor = (fields: Record<string, unknown> | undefined): unknown[] => {
		const keys = Object.keys(fields ?? {}).sort();
		if (keys.join(",") === "mbr,name,year") {
			state.memberSelectFields.push(keys);
			return state.memberRows;
		}
		if (keys.join(",") === "n") return [{ n: 0 }];
		if (keys.join(",") === "s") return [{ s: null }];
		return [];
	};
	const db = {
		select(fields?: Record<string, unknown>) {
			const rows = resultFor(fields);
			const chain = {
				from: () => chain,
				where: () => chain,
				orderBy: () => chain,
				groupBy: () => chain,
				limit: () => chain,
				then: (resolve: (v: unknown[]) => unknown, reject?: (e: unknown) => unknown) =>
					Promise.resolve(rows).then(resolve, reject)
			};
			return chain;
		}
	};
	return { db };
});

const { getAdminStatsOverview, groupMembersJoinedByYear, membersJoinedWhere, yearFromMsd } =
	await import("$lib/server/admin-stats-overview-cache");

const toSql = (fragment: SQL | undefined) => {
	if (!fragment) throw new Error("expected SQL");
	return new PgDialect().sqlToQuery(fragment);
};

beforeEach(() => {
	state.memberRows = [];
	state.memberSelectFields = [];
	state.cacheCalls = [];
});

describe("groupMembersJoinedByYear", () => {
	it("keeps every counted row, including duplicate member numbers and names", () => {
		const groups = groupMembersJoinedByYear([
			{ year: 2019, name: "Pat Example", mbr: 400 },
			{ year: 2019, name: "Pat Example", mbr: 400 },
			{ year: 2019, name: "Sam Sample", mbr: null },
			{ year: 2021, name: "Lee Test", mbr: 401.5 }
		]);
		expect(groups).toEqual([
			{
				year: 2019,
				count: 3,
				members: [
					{ name: "Pat Example", mbr: 400 },
					{ name: "Pat Example", mbr: 400 },
					{ name: "Sam Sample", mbr: null }
				]
			},
			{ year: 2021, count: 1, members: [{ name: "Lee Test", mbr: 401.5 }] }
		]);
	});

	it("always reports count equal to the listed rows and sorts years ascending", () => {
		const groups = groupMembersJoinedByYear([
			{ year: "2024", name: "A", mbr: 3 },
			{ year: 2004, name: "B", mbr: 1 },
			{ year: "2024", name: "C", mbr: 2 }
		]);
		expect(groups.map((g) => g.year)).toEqual([2004, 2024]);
		for (const g of groups) expect(g.count).toBe(g.members.length);
		expect(groups.reduce((sum, g) => sum + g.count, 0)).toBe(3);
	});

	it("returns no buckets for no rows", () => {
		expect(groupMembersJoinedByYear([])).toEqual([]);
	});
});

describe("members-joined query scope", () => {
	it("uses the same year extraction as before (database calendar year of msd)", () => {
		expect(toSql(yearFromMsd()).sql).toBe('extract(year from "users"."msd")::int');
	});

	it("counts members and admins with an msd, and nothing else is filtered", () => {
		const { sql, params } = toSql(membersJoinedWhere());
		expect(sql).toBe('("users"."role" in ($1, $2) and "users"."msd" is not null)');
		expect(params).toEqual(["member", "admin"]);
		// Deceased, inactive and un-numbered rows stay included; no rollout-style rules.
		expect(sql).not.toMatch(/dops|account_active|"mbr"|email/);
	});
});

describe("getAdminStatsOverview", () => {
	it("builds bar counts and lists from one query of display fields only", async () => {
		state.memberRows = [
			{ year: 2018, name: "Deceased Member", mbr: 12 },
			{ year: 2018, name: "Inactive Member", mbr: 12 },
			{ year: 2018, name: "No Number Admin", mbr: null },
			{ year: 2020, name: "Recent Member", mbr: 500 }
		];

		const overview = await getAdminStatsOverview();

		expect(state.memberSelectFields).toEqual([["mbr", "name", "year"]]);
		expect(overview.membersJoinedByYear).toEqual([
			{
				year: 2018,
				count: 3,
				members: [
					{ name: "Deceased Member", mbr: 12 },
					{ name: "Inactive Member", mbr: 12 },
					{ name: "No Number Admin", mbr: null }
				]
			},
			{ year: 2020, count: 1, members: [{ name: "Recent Member", mbr: 500 }] }
		]);
		for (const bucket of overview.membersJoinedByYear) {
			expect(bucket.count).toBe(bucket.members.length);
			for (const member of bucket.members) {
				expect(Object.keys(member).sort()).toEqual(["mbr", "name"]);
			}
		}
	});

	it("reads a versioned cache key so the old cached shape is never reused", async () => {
		await getAdminStatsOverview();
		expect(state.cacheCalls).toEqual([
			{ namespace: "admin-stats-overview", keyParts: { scope: "global", version: 2 } }
		]);
	});
});
