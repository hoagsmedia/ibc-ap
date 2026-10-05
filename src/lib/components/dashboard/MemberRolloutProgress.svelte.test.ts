import { describe, expect, test } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import MemberRolloutProgress from "./MemberRolloutProgress.svelte";

describe("MemberRolloutProgress", () => {
	test("shows active of total and a one-decimal percentage with scope", () => {
		render(MemberRolloutProgress, { active: 1, total: 3 });
		const box = screen.getByTestId("member-rollout-progress");
		expect(box).toHaveTextContent("Active website accounts");
		expect(box).toHaveTextContent("1 active of 3 members · 33.3%");
		expect(box).toHaveTextContent(/admins included/i);
		expect(box).toHaveTextContent(/excluding deceased members and prospects/i);
		expect(box).toHaveTextContent(/each member number counts once/i);
	});

	test("shows inactive-only and fully active populations", () => {
		const { unmount } = render(MemberRolloutProgress, { active: 0, total: 4 });
		expect(screen.getByTestId("member-rollout-progress")).toHaveTextContent(
			"0 active of 4 members · 0.0%"
		);
		unmount();
		render(MemberRolloutProgress, { active: 4, total: 4 });
		expect(screen.getByTestId("member-rollout-progress")).toHaveTextContent(
			"4 active of 4 members · 100.0%"
		);
	});

	test("shows no members instead of NaN for an empty population", () => {
		render(MemberRolloutProgress, { active: 0, total: 0 });
		const box = screen.getByTestId("member-rollout-progress");
		expect(box).toHaveTextContent("No members in scope yet.");
		expect(box).not.toHaveTextContent(/NaN|%/);
	});
});
