import { describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

// Synthetic DB: records the query shape and returns fixed rows. No env, no network.
const captured = vi.hoisted(() => ({
	fields: undefined as Record<string, unknown> | undefined,
	where: undefined as unknown,
	selects: 0,
	rows: [] as Array<{ mbr: number | null; account_active: boolean }>
}));

vi.mock("$lib/server/db", () => {
	const chain = {
		select(fields: Record<string, unknown>) {
			captured.selects += 1;
			captured.fields = fields;
			return chain;
		},
		from() {
			return chain;
		},
		async where(condition: unknown) {
			captured.where = condition;
			return captured.rows;
		}
	};
	return { db: chain };
});

const { getMemberRolloutProgress, memberRolloutPopulationWhere } = await import(
	"$lib/server/member-rollout"
);

const toSql = (condition: SQL | undefined) => {
	if (!condition) throw new Error("expected a where condition");
	return new PgDialect().sqlToQuery(condition);
};

describe("member rollout progress query scope", () => {
	it("limits the population to living numbered members and admins", () => {
		const { sql, params } = toSql(memberRolloutPopulationWhere());
		expect(sql).toContain('"users"."role" in ($1, $2)');
		expect(params.slice(0, 2)).toEqual(["member", "admin"]);
		expect(sql).toContain('"users"."mbr" is not null');
		expect(sql).toContain('"users"."mbr" > $3');
		expect(params[2]).toBe(0);
		expect(sql).toContain('"users"."dops" = $4');
		expect(params[3]).toBe(false);
		expect(sql).toContain('"users"."dops_date" is null');
	});

	it("does not filter on email, rollout links, search or pagination", () => {
		const { sql } = toSql(memberRolloutPopulationWhere());
		expect(sql).not.toMatch(/email|member_rollout_tokens|limit|offset|like/i);
		expect(sql).not.toContain("guest");
	});

	it("reads only mbr and account_active in one query and aggregates them", async () => {
		captured.rows = [
			{ mbr: 1, account_active: true },
			{ mbr: 1, account_active: false },
			{ mbr: 2.5, account_active: false },
			{ mbr: 3, account_active: true }
		];
		captured.selects = 0;

		await expect(getMemberRolloutProgress()).resolves.toEqual({ active: 2, total: 3 });
		expect(captured.selects).toBe(1);
		expect(Object.keys(captured.fields ?? {}).sort()).toEqual(["account_active", "mbr"]);
		expect(toSql(captured.where as SQL).sql).toBe(toSql(memberRolloutPopulationWhere()).sql);
	});

	it("returns zero counts when the population is empty", async () => {
		captured.rows = [];
		await expect(getMemberRolloutProgress()).resolves.toEqual({ active: 0, total: 0 });
	});
});
