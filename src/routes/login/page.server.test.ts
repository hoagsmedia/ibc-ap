import { describe, expect, it, vi } from "vitest";

// No database or sessions: only the exported action set is inspected.
vi.mock("$lib/server/db", () => ({ db: {} }));
vi.mock("$lib/server/auth", () => ({}));

const { actions } = await import("./+page.server");

describe("/login actions", () => {
	it("exposes only login; open self-registration is not available", () => {
		expect(Object.keys(actions)).toEqual(["login"]);
	});
});
