import { describe, expect, it } from "vitest";
import {
	aggregateRolloutProgress,
	formatRolloutPercent,
	type RolloutPopulationRow
} from "./member-rollout-progress";

const row = (mbr: number | null, account_active: boolean): RolloutPopulationRow => ({
	mbr,
	account_active
});

describe("aggregateRolloutProgress", () => {
	it("counts active and inactive members", () => {
		expect(aggregateRolloutProgress([row(1, true), row(2, false), row(3, true)])).toEqual({
			active: 2,
			total: 3
		});
	});

	it("counts a member number once and active if any duplicate row is active", () => {
		expect(
			aggregateRolloutProgress([row(408, false), row(408, true), row(409, false), row(409, false)])
		).toEqual({ active: 1, total: 2 });
		expect(aggregateRolloutProgress([row(410, true), row(410, false)])).toEqual({
			active: 1,
			total: 1
		});
	});

	it("treats fractional member numbers as distinct exact values", () => {
		expect(
			aggregateRolloutProgress([
				row(408, false),
				row(408.1, true),
				row(408.1, false),
				row(408.5, false)
			])
		).toEqual({ active: 1, total: 3 });
	});

	it("ignores rows without a positive finite member number", () => {
		expect(
			aggregateRolloutProgress([
				row(null, true),
				row(0, true),
				row(-3, true),
				row(Number.NaN, true),
				row(Number.POSITIVE_INFINITY, true),
				row(5, false)
			])
		).toEqual({ active: 0, total: 1 });
	});

	it("returns zero counts for an empty population", () => {
		expect(aggregateRolloutProgress([])).toEqual({ active: 0, total: 0 });
	});
});

describe("formatRolloutPercent", () => {
	it("returns null instead of NaN when there are no members", () => {
		expect(formatRolloutPercent({ active: 0, total: 0 })).toBeNull();
	});

	it("formats to one decimal place", () => {
		expect(formatRolloutPercent({ active: 1, total: 3 })).toBe("33.3%");
		expect(formatRolloutPercent({ active: 2, total: 3 })).toBe("66.7%");
		expect(formatRolloutPercent({ active: 0, total: 7 })).toBe("0.0%");
		expect(formatRolloutPercent({ active: 7, total: 7 })).toBe("100.0%");
		expect(formatRolloutPercent({ active: 1, total: 8 })).toBe("12.5%");
	});

	it("never rounds a partial rollout to 100.0% or a started one to 0.0%", () => {
		expect(formatRolloutPercent({ active: 1999, total: 2000 })).toBe("99.9%");
		expect(formatRolloutPercent({ active: 1, total: 5000 })).toBe("0.1%");
	});
});
