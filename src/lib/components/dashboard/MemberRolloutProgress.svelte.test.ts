import { describe, expect, test } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import MemberRolloutProgress from "./MemberRolloutProgress.svelte";

describe("MemberRolloutProgress badge", () => {
	test("shows a compact count and one-decimal percentage", () => {
		render(MemberRolloutProgress, { active: 65, total: 546 });
		const badge = screen.getByTestId("member-rollout-progress");
		expect(badge).toHaveTextContent("65/546 active · 11.9%");
	});

	test("gives screen readers a full sentence instead of the compact text", () => {
		render(MemberRolloutProgress, { active: 1, total: 3 });
		const badge = screen.getByTestId("member-rollout-progress");
		expect(badge.querySelector(".sr-only")).toHaveTextContent(
			"1 of 3 members have an active website account, 33.3%"
		);
		expect(badge.querySelector('[aria-hidden="true"]')).toHaveTextContent("1/3 active · 33.3%");
	});

	test("has no visible or hover scope explanation", () => {
		render(MemberRolloutProgress, { active: 2, total: 4 });
		const badge = screen.getByTestId("member-rollout-progress");
		expect(badge.tagName).toBe("SPAN");
		expect(badge.querySelector("p")).toBeNull();
		expect(badge).not.toHaveAttribute("title");
		expect(badge).not.toHaveTextContent(/admins|deceased|counts once/i);
	});

	test("shows inactive-only and fully active populations", () => {
		const { unmount } = render(MemberRolloutProgress, { active: 0, total: 4 });
		expect(screen.getByTestId("member-rollout-progress")).toHaveTextContent("0/4 active · 0.0%");
		unmount();
		render(MemberRolloutProgress, { active: 4, total: 4 });
		expect(screen.getByTestId("member-rollout-progress")).toHaveTextContent("4/4 active · 100.0%");
	});

	test("shows no members instead of NaN for an empty population", () => {
		render(MemberRolloutProgress, { active: 0, total: 0 });
		const badge = screen.getByTestId("member-rollout-progress");
		expect(badge).toHaveTextContent("No members");
		expect(badge).not.toHaveTextContent(/NaN|%|\//);
		expect(badge.querySelector(".sr-only")).toHaveTextContent("No members to count yet");
	});
});
