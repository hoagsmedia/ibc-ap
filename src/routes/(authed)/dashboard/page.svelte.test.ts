import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/svelte";

vi.mock("$app/forms", () => ({ enhance: () => ({ destroy() {} }) }));
vi.mock("$app/state", () => ({
	navigating: { to: null },
	page: { url: new URL("http://test.local/dashboard") }
}));

const { default: Page } = await import("./page-test-harness.svelte");

// Synthetic fixtures only — no real members, no backend.
function dashboardData(overrides: Record<string, unknown> = {}) {
	const memberRollout = {
		showCard: true,
		canSend: true,
		usedInWindow: 1,
		remaining: 3,
		maxPerWindow: 4,
		windowDays: 4,
		nextSlotAt: null,
		resendConfigured: true,
		eligibleInviter: true,
		progress: { active: 65, total: 546 }
	};
	return {
		user: {
			id: "synthetic-admin",
			name: "Synthetic Admin",
			email: null,
			username: "synthetic",
			role: "admin",
			img: null,
			mbr: 9999,
			msd: null,
			test_passed: new Date("2026-01-01T00:00:00Z"),
			meeting_1_date: null,
			meeting_2_date: null,
			meeting_3_date: null,
			account_active: true,
			website_first_login_at: new Date("2026-01-02T00:00:00Z")
		},
		invitations: [],
		invitationYear: 2026,
		canAccessExclusiveFeatures: true,
		prospectGate: null,
		pendingMembers: [],
		pendingMembersCount: 0,
		baseUrl: "http://test.local",
		resendInviteConfigured: true,
		upcomingEvents: [],
		clubStats: {
			totalMembers: 546,
			activeMembers: 500,
			eventsThisYear: 12,
			eventsThisMonth: 1,
			kegsConsumed: 300,
			membersJoinedThisMonth: 0,
			kegsAddedThisMonth: 0
		},
		...overrides,
		memberRollout: { ...memberRollout, ...((overrides.memberRollout as object) ?? {}) }
	};
}

function rolloutCard() {
	const heading = screen.getByText("Existing member rollout");
	const card = heading.closest('[data-slot="card"]');
	if (!(card instanceof HTMLElement)) throw new Error("rollout card not found");
	return card;
}

describe("dashboard: existing member rollout card", () => {
	test("puts the compact metric badge in the card header next to the title", () => {
		render(Page, { data: dashboardData() as never });
		const card = rolloutCard();
		const badge = within(card).getByTestId("member-rollout-progress");
		expect(badge).toHaveTextContent("65/546 active · 11.9%");

		const header = card.querySelector('[data-slot="card-header"]');
		expect(header).toContainElement(badge);
		// Title group and badge share one row container, title first, badge last.
		const row = badge.parentElement as HTMLElement;
		expect(row.lastElementChild).toBe(badge);
		expect(row.firstElementChild).toContainElement(
			within(card).getByText("Existing member rollout")
		);
	});

	test("shows no visible scope or methodology paragraph", () => {
		render(Page, { data: dashboardData() as never });
		const card = rolloutCard();
		expect(card).not.toHaveTextContent(/admins included|excluding deceased|counts once/i);
		expect(card).not.toHaveTextContent(/Active website accounts/i);
	});

	test("keeps send limits, search and short guidance", () => {
		render(Page, { data: dashboardData() as never });
		const card = rolloutCard();
		expect(card).toHaveTextContent("3 of 4 sends left · 4-day limit");
		expect(within(card).getByLabelText("Find member (name, email, or #)")).toHaveAttribute(
			"placeholder",
			"Type at least 2 characters"
		);
		expect(card).toHaveTextContent("Email website activation links to current members.");
	});

	test("shows the empty population state in the badge", () => {
		render(Page, {
			data: dashboardData({ memberRollout: { progress: { active: 0, total: 0 } } }) as never
		});
		expect(within(rolloutCard()).getByTestId("member-rollout-progress")).toHaveTextContent(
			"No members"
		);
	});

	test("explains the first-login requirement briefly for ineligible inviters", () => {
		render(Page, {
			data: dashboardData({ memberRollout: { eligibleInviter: false, canSend: false } }) as never
		});
		const card = rolloutCard();
		expect(card).toHaveTextContent(
			"You can send activation emails after your first website login."
		);
		expect(within(card).queryByLabelText("Find member (name, email, or #)")).toBeNull();
	});

	test("keeps the limit-reached warning with its next send date", () => {
		render(Page, {
			data: dashboardData({
				memberRollout: { remaining: 0, canSend: false, nextSlotAt: "2026-10-08T12:00:00.000Z" }
			}) as never
		});
		const card = rolloutCard();
		expect(card).toHaveTextContent(/Limit reached\. Next send after/);
		expect(within(card).getByLabelText("Find member (name, email, or #)")).toBeDisabled();
	});
	test("shows a plain unavailable message when email is not configured", () => {
		render(Page, {
			data: dashboardData({ memberRollout: { resendConfigured: false } }) as never
		});
		const card = rolloutCard();
		expect(card).toHaveTextContent("Email is unavailable. Please contact the site administrator.");
		expect(card).not.toHaveTextContent(/RESEND_|Configure/);
		expect(within(card).queryByLabelText("Find member (name, email, or #)")).toBeNull();
	});
});

describe("dashboard: simplified copy", () => {
	test("uses short headings and drops redundant descriptions", () => {
		render(Page, { data: dashboardData() as never });
		expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /My profile/ })).toHaveAttribute("href", "/settings");
		expect(document.body).not.toHaveTextContent(/home base|keep the island pouring/i);
		expect(document.body).not.toHaveTextContent(/Shortcuts to common member tools/);
		expect(document.body).not.toHaveTextContent(/Next on the club calendar/);
		expect(document.body).toHaveTextContent("No upcoming events.");
		expect(screen.getByText("Invitation links")).toBeInTheDocument();
		expect(document.body).toHaveTextContent(
			"Each invite emails a one-time signup link. Use the mail icon to resend, or copy the link."
		);
	});

	test("hides the rollout card when the loader does not show it", () => {
		const data = dashboardData();
		render(Page, { data: { ...data, memberRollout: undefined } as never });
		expect(screen.queryByText("Existing member rollout")).toBeNull();
	});

	test("keeps the acceptance requirement for prospects without a member number", () => {
		const base = dashboardData();
		render(Page, {
			data: {
				...base,
				user: { ...base.user, role: "member", mbr: null },
				canAccessExclusiveFeatures: false,
				memberRollout: undefined
			} as never
		});
		expect(document.body).toHaveTextContent(
			"You need club approval and a member number to create invitation links."
		);
		expect(document.body).toHaveTextContent(
			"You passed the IBC test. An admin will assign your member number once you are accepted."
		);
	});

	test("labels the admin stat cards plainly", () => {
		render(Page, { data: dashboardData() as never });
		expect(screen.getByText("Member numbers")).toBeInTheDocument();
		expect(screen.getByText("Club activity")).toBeInTheDocument();
		expect(document.body).not.toHaveTextContent(/Engagement|Season pace/);
	});
});
