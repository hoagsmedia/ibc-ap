/**
 * Whether the user must complete the IBC test for invitation eligibility.
 * Full members are exempt (e.g. imported accounts may never have `test_passed` set).
 */
export function requiresIbcTest(user: { role: string; test_passed: Date | null }): boolean {
	if (user.test_passed != null) return false;
	if (user.role === "member") return false;
	return true;
}
