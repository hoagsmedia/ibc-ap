import { describe, expect, it } from "vitest";
import { isAdmin, requireAdmin, requireMemberDirectoryAccess, requireUser } from "./authz";

type Role = "guest" | "member" | "admin";

function locals(role: Role | null): App.Locals {
	const user = role === null ? null : ({ id: "u1", name: "T", role } as App.Locals["user"]);
	return { user } as App.Locals;
}

/** Capture a thrown SvelteKit redirect ({ status, location }) or fail if none thrown. */
function caughtRedirect(fn: () => unknown): { status: number; location: string } {
	try {
		fn();
	} catch (err) {
		return err as { status: number; location: string };
	}
	throw new Error("expected a redirect to be thrown");
}

describe("isAdmin", () => {
	it("is true only for the admin role", () => {
		expect(isAdmin({ role: "admin" })).toBe(true);
		expect(isAdmin({ role: "member" })).toBe(false);
		expect(isAdmin({ role: "guest" })).toBe(false);
	});
});

describe("requireUser", () => {
	it("returns the user when present", () => {
		expect(requireUser(locals("member"))?.role).toBe("member");
	});

	it("redirects to the login path when there is no user", () => {
		const r = caughtRedirect(() => requireUser(locals(null)));
		expect(r.status).toBe(302);
		expect(r.location).toBe("/login");
	});

	it("honors a custom login path", () => {
		expect(caughtRedirect(() => requireUser(locals(null), "/enter")).location).toBe("/enter");
	});
});

describe("requireAdmin", () => {
	it("returns the user for admins", () => {
		expect(requireAdmin(locals("admin")).role).toBe("admin");
	});

	it("redirects non-admins to the forbidden path", () => {
		const r = caughtRedirect(() => requireAdmin(locals("member")));
		expect(r.status).toBe(302);
		expect(r.location).toBe("/");
	});

	it("redirects anonymous callers to login before the admin check", () => {
		expect(caughtRedirect(() => requireAdmin(locals(null))).location).toBe("/login");
	});
});

describe("requireMemberDirectoryAccess", () => {
	it("allows admins and members", () => {
		expect(requireMemberDirectoryAccess(locals("admin")).role).toBe("admin");
		expect(requireMemberDirectoryAccess(locals("member")).role).toBe("member");
	});

	it("redirects guests to the dashboard", () => {
		const r = caughtRedirect(() => requireMemberDirectoryAccess(locals("guest")));
		expect(r.status).toBe(302);
		expect(r.location).toBe("/dashboard");
	});
});
