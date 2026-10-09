import { describe, expect, it } from "vitest";
import { dropdownLinks, navLinks } from "./navigation";

describe("public navigation", () => {
	it("no longer links to a public contact page", () => {
		const hrefs = [...navLinks, ...dropdownLinks].map((l) => l.href);
		expect(hrefs.some((h) => h.includes("contact"))).toBe(false);
	});
});
