import { beforeEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";

const pageState = vi.hoisted(() => ({
	url: new URL("http://test.local/dashboard"),
	data: { user: null as unknown }
}));

vi.mock("$app/forms", () => ({ enhance: () => ({ destroy() {} }) }));
vi.mock("$app/state", () => ({ navigating: { to: null }, page: pageState }));

const { default: MemberHubShell } = await import("./MemberHubShell.svelte");

const children = createRawSnippet(() => ({ render: () => "<p>synthetic child</p>" }));

// Synthetic users only.
function user(role: "guest" | "member" | "admin", account_active: boolean) {
	return {
		id: `synthetic-${role}`,
		name: `Synthetic ${role}`,
		email: null,
		username: null,
		role,
		img: null,
		mbr: role === "guest" ? null : 9999,
		account_active
	};
}

function contactLink() {
	const { container } = render(MemberHubShell, { props: { children } });
	return container.querySelector('a[href="/dashboard/contact"]');
}

beforeEach(() => {
	pageState.url = new URL("http://test.local/dashboard");
});

describe("member hub sidebar contact link", () => {
	test.each([
		["active member", user("member", true)],
		["admin", user("admin", false)]
	])("is shown to an %s", (_label, u) => {
		pageState.data.user = u;
		expect(contactLink()).not.toBeNull();
	});

	test.each([
		["guest / prospect", user("guest", true)],
		["inactive member", user("member", false)]
	])("is hidden from a %s", (_label, u) => {
		pageState.data.user = u;
		expect(contactLink()).toBeNull();
	});
});
