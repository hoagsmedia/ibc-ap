/**
 * Whether the user must complete the IBC test for invitation eligibility.
 * Full members are exempt (e.g. imported accounts may never have `test_passed` set).
 */
export function requiresIbcTest(user: { role: string; test_passed: Date | null }): boolean {
	if (user.test_passed != null) return false;
	if (user.role === "member") return false;
	return true;
}

/**
 * Members-only published events and member-scoped event metrics (e.g. dashboard “events this year”).
 * Admins and anyone with a member number always qualify; other roles qualify once they pass the IBC test.
 */
export function canViewMembersOnlyClubEvents(user: {
	role: string;
	test_passed: Date | null;
}): boolean {
	if (user.role === "admin" || user.role === "member") return true;
	return user.test_passed != null;
}
