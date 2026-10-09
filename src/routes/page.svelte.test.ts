import { describe, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import Page from "./+page.svelte";

describe("Home page", () => {
	test("should render hero h1", () => {
		render(Page);
		const h1 = screen.getByRole("heading", { level: 1 });
		expect(h1).toBeInTheDocument();
		expect(h1).toHaveTextContent(/We have more time than money/i);
	});

	test("does not link to the removed public contact page", () => {
		const { container } = render(Page);
		expect(container.querySelector('a[href*="contact"]')).toBeNull();
	});
});
