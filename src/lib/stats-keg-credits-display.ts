/**
 * Legacy stats.htm listed founder Jeff Wilkens with "Capital Man" in the credits column (non-numeric).
 * Import stores credits as 0; we show that phrase in the UI for his row.
 */
export function isJeffWilkensFounderKegCredit(row: {
	member_label: string;
	member_number: number | null;
}): boolean {
	return (
		row.member_number === 1 && /\bjeff\b.*\bwilkens\b/i.test(row.member_label.trim())
	);
}

export function formatKegCreditsForDisplay(row: {
	credits: number;
	member_label: string;
	member_number: number | null;
}): string {
	if (isJeffWilkensFounderKegCredit(row)) {
		return "Capital Man";
	}
	return String(row.credits);
}
