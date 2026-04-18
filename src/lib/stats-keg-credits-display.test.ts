import { describe, expect, it } from "vitest";
import { formatKegCreditsForDisplay, isJeffWilkensFounderKegCredit } from "./stats-keg-credits-display.js";

describe("Jeff Wilkens founder credit display", () => {
	const founder = {
		member_label: "Jeff Wilkens",
		member_number: 1 as number | null,
		credits: 0
	};

	it("shows Capital Man for founder #1", () => {
		expect(isJeffWilkensFounderKegCredit(founder)).toBe(true);
		expect(formatKegCreditsForDisplay(founder)).toBe("Capital Man");
	});

	it("shows numeric credits for everyone else", () => {
		expect(
			formatKegCreditsForDisplay({
				member_label: "Steve Farguson",
				member_number: 47,
				credits: 26
			})
		).toBe("26");
	});
});
