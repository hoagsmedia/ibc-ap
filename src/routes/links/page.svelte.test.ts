import { describe, expect, test } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/svelte";
import Page from "./+page.svelte";

describe("Links page", () => {
	test("does not link to the removed public contact page", () => {
		const { container } = render(Page);
		expect(container.querySelector('a[href*="contact"]')).toBeNull();
	});
});
