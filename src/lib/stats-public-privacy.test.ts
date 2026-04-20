import { describe, expect, it } from "vitest";
import { statsPublicMemberLabel } from "./stats-public-privacy.js";

describe("statsPublicMemberLabel", () => {
	it("drops the last name", () => {
		expect(statsPublicMemberLabel("Jeff Wilkens")).toBe("Jeff");
		expect(statsPublicMemberLabel("Steve Farguson")).toBe("Steve");
	});

	it("keeps a single token", () => {
		expect(statsPublicMemberLabel("Madonna")).toBe("Madonna");
	});

	it("handles multiple given names", () => {
		expect(statsPublicMemberLabel("Mary Jane Watson")).toBe("Mary Jane");
	});
});
