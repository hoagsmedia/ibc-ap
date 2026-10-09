import { redirect } from "@sveltejs/kit";
import { canAccessMemberDirectoryAndStats } from "$lib/ibc-test";
import { canUseMemberContactForm } from "$lib/account-access";

type SessionUser = NonNullable<App.Locals["user"]>;

export function requireUser(locals: App.Locals, loginPath = "/login"): SessionUser {
	if (!locals.user) {
		throw redirect(302, loginPath);
	}
	return locals.user;
}

export function isAdmin(user: Pick<SessionUser, "role">): user is SessionUser & { role: "admin" } {
	return user.role === "admin";
}

export function requireAdmin(
	locals: App.Locals,
	options: { loginPath?: string; forbiddenPath?: string } = {}
): SessionUser & { role: "admin" } {
	const user = requireUser(locals, options.loginPath ?? "/login");
	if (!isAdmin(user)) {
		throw redirect(302, options.forbiddenPath ?? "/");
	}
	return user;
}

export function requireMemberDirectoryAccess(
	locals: App.Locals,
	options: { loginPath?: string; forbiddenPath?: string } = {}
): SessionUser {
	const user = requireUser(locals, options.loginPath ?? "/login");
	if (!canAccessMemberDirectoryAndStats(user)) {
		throw redirect(302, options.forbiddenPath ?? "/dashboard");
	}
	return user;
}

/** Members-only contact form guard; re-checks eligibility here, not only in hooks or navigation. */
export function requireMemberContactAccess(
	locals: App.Locals,
	options: { loginPath?: string; forbiddenPath?: string } = {}
): SessionUser {
	const user = requireUser(locals, options.loginPath ?? "/login");
	if (!canUseMemberContactForm(user)) {
		throw redirect(302, options.forbiddenPath ?? "/dashboard");
	}
	return user;
}
