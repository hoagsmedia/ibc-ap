import { describe, expect, it } from "vitest";
import { parseLegacyMemberLabel } from "./parse-member-label.js";

describe("parseLegacyMemberLabel", () => {
	it("splits name, number, and date suffix", () => {
		expect(parseLegacyMemberLabel("Steve Farguson #47-1Nov17")).toEqual({
			displayName: "Steve Farguson",
			memberNumber: 47
		});
	});

	it("splits name and number without date", () => {
		expect(parseLegacyMemberLabel("John Muncy #3")).toEqual({
			displayName: "John Muncy",
			memberNumber: 3
		});
	});

	it("handles comma names", () => {
		expect(parseLegacyMemberLabel("Smith, Gary #126")).toEqual({
			displayName: "Smith, Gary",
			memberNumber: 126
		});
	});

	it("handles CIK-style row with date", () => {
		expect(parseLegacyMemberLabel("Kitty Sexton #305-8Jan20")).toEqual({
			displayName: "Kitty Sexton",
			memberNumber: 305
		});
	});

	it("normalizes whitespace", () => {
		expect(parseLegacyMemberLabel("  Rob Crenshaw   #5-8Jan20  ")).toEqual({
			displayName: "Rob Crenshaw",
			memberNumber: 5
		});
	});

	it("returns null number when no # pattern", () => {
		expect(parseLegacyMemberLabel("Mystery Member")).toEqual({
			displayName: "Mystery Member",
			memberNumber: null
		});
	});

	it("strips only the -suffix after the number, not inner hyphens in name", () => {
		expect(parseLegacyMemberLabel("Bill Plunkett #184-30Jan17")).toEqual({
			displayName: "Bill Plunkett",
			memberNumber: 184
		});
	});

	it("strips space-separated date after #mbr (no hyphen)", () => {
		expect(parseLegacyMemberLabel("Ed Carney #58 17Apr19")).toEqual({
			displayName: "Ed Carney",
			memberNumber: 58
		});
	});
});
