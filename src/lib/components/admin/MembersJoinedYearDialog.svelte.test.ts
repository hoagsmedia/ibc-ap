import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, within, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import MembersJoinedYearDialog from "./MembersJoinedYearDialog.svelte";
import type { MembersJoinedYear } from "$lib/admin-stats-members-joined";

// Synthetic fixtures only.
const year2019: MembersJoinedYear = {
	year: 2019,
	count: 3,
	members: [
		{ name: "Pat Example", mbr: 400 },
		{ name: "Pat Example", mbr: 400 },
		{ name: "Sam Sample", mbr: null }
	]
};
const year2021: MembersJoinedYear = {
	year: 2021,
	count: 1,
	members: [{ name: "Lee Test", mbr: 401.5 }]
};

const list = () => screen.getByTestId("members-joined-year-list");

describe("MembersJoinedYearDialog", () => {
	test("titles the year with its count and lists every counted row", async () => {
		render(MembersJoinedYearDialog, { open: true, year: 2019, entry: year2019 });
		await tick();
		const dialog = screen.getByRole("dialog");
		expect(within(dialog).getByRole("heading", { name: "2019 · 3 members" })).toBeInTheDocument();
		const items = within(list()).getAllByRole("listitem");
		expect(items).toHaveLength(3);
		expect(items.map((li) => li.textContent?.replace(/\s+/g, " ").trim())).toEqual([
			"Pat Example #400",
			"Pat Example #400",
			"Sam Sample No #"
		]);
		expect(list()).toHaveAccessibleName("Members who joined in 2019");
	});

	test("uses singular wording and fractional member numbers as stored", async () => {
		render(MembersJoinedYearDialog, { open: true, year: 2021, entry: year2021 });
		await tick();
		expect(screen.getByRole("heading", { name: "2021 · 1 member" })).toBeInTheDocument();
		expect(list()).toHaveTextContent(/Lee Test\s*#401\.5/);
	});

	test("switching years replaces the list with no stale rows", async () => {
		const { rerender } = render(MembersJoinedYearDialog, {
			open: true,
			year: 2019,
			entry: year2019
		});
		await tick();
		expect(within(list()).getAllByRole("listitem")).toHaveLength(3);

		await rerender({ open: true, year: 2021, entry: year2021 });
		await tick();
		expect(screen.getByRole("heading", { name: "2021 · 1 member" })).toBeInTheDocument();
		expect(within(list()).getAllByRole("listitem")).toHaveLength(1);
		expect(list()).not.toHaveTextContent(/Pat Example|Sam Sample/);
	});

	test("shows a plain empty state when the year has no bucket", async () => {
		render(MembersJoinedYearDialog, { open: true, year: 1999, entry: undefined });
		await tick();
		expect(screen.getByRole("heading", { name: "1999 · 0 members" })).toBeInTheDocument();
		expect(screen.getByText("No members counted for this year.")).toBeInTheDocument();
		expect(screen.queryByTestId("members-joined-year-list")).toBeNull();
	});

	test("closes with the close button", async () => {
		render(MembersJoinedYearDialog, { open: true, year: 2019, entry: year2019 });
		await tick();
		await fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await tick();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	test("closes with Escape", async () => {
		render(MembersJoinedYearDialog, { open: true, year: 2019, entry: year2019 });
		await tick();
		await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		await tick();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	test("hands focus return to the caller on close button and Escape", async () => {
		for (const close of ["button", "escape"] as const) {
			const onCloseAutoFocus = vi.fn((event: Event) => event.preventDefault());
			const { unmount } = render(MembersJoinedYearDialog, {
				open: true,
				year: 2019,
				entry: year2019,
				onCloseAutoFocus
			});
			await tick();
			if (close === "button") {
				await fireEvent.click(screen.getByRole("button", { name: "Close" }));
			} else {
				await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
			}
			await vi.waitFor(() => expect(onCloseAutoFocus).toHaveBeenCalledTimes(1));
			unmount();
		}
	});

	test("renders nothing while closed", () => {
		render(MembersJoinedYearDialog, { open: false, year: 2019, entry: year2019 });
		expect(screen.queryByRole("dialog")).toBeNull();
	});
});
