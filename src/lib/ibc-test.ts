type ProspectProgressUser = {
	role: string;
	test_passed: Date | null;
	meeting_1_date?: Date | null;
	meeting_2_date?: Date | null;
	meeting_3_date?: Date | null;
};

export function prospectMeetingCount(user: ProspectProgressUser): number {
	return [user.meeting_1_date, user.meeting_2_date, user.meeting_3_date].filter(Boolean).length;
}

export function hasCompletedProspectMeetings(user: ProspectProgressUser): boolean {
	return prospectMeetingCount(user) >= 3;
}

export function canTakeIbcTest(user: ProspectProgressUser): boolean {
	if (user.role === "admin" || user.role === "member") return true;
	if (user.test_passed != null) return true;
	return hasCompletedProspectMeetings(user);
}

/**
 * Whether the user must complete the IBC test for invitation eligibility.
 * Full members are exempt (e.g. imported accounts may never have `test_passed` set).
 */
export function requiresIbcTest(user: ProspectProgressUser): boolean {
	if (user.test_passed != null) return false;
	if (user.role === "member") return false;
	return true;
}

export function canAccessMemberDirectoryAndStats(user: ProspectProgressUser): boolean {
	return user.role === "admin" || user.role === "member";
}

/**
 * Members-only published events and member-scoped event metrics (e.g. dashboard “events this year”).
 * Admins and full members qualify; prospects do not.
 */
export function canViewMembersOnlyClubEvents(user: ProspectProgressUser): boolean {
	return canAccessMemberDirectoryAndStats(user);
}
