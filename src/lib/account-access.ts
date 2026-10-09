type AccessUser = { role: "guest" | "member" | "admin"; account_active: boolean };

/** Dashboard session access: admins always; others need `account_active`. Safe for client and server. */
export function canAccessPlatform(user: AccessUser): boolean {
	return user.role === "admin" || user.account_active === true;
}

/**
 * Members-only contact form: an active platform account with the `member` or `admin` role.
 * Guests/prospects are denied. The server guard (`requireMemberContactAccess`) is the real gate;
 * navigation uses this only to hide the link.
 */
export function canUseMemberContactForm(user: AccessUser): boolean {
	return canAccessPlatform(user) && (user.role === "member" || user.role === "admin");
}
