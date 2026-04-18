/**
 * Legacy stats.htm "Member" cells often look like:
 * `Steve Farguson #47-1Nov17` | `John Muncy #3` | `Smith, Gary #126`
 *
 * Strips `#<digits>` and an optional `-suffix` (usually a date) after the number.
 * The suffix is not always present; when absent, only `#N` is removed.
 */
export function parseLegacyMemberLabel(raw: string): {
	displayName: string;
	memberNumber: number | null;
} {
	const s = raw.replace(/\s+/g, " ").trim();
	if (!s) {
		return { displayName: "", memberNumber: null };
	}

	// First ` #123` wins. Suffix after the number is often `-1Nov17` or ` 17Apr19` (no hyphen).
	const m = s.match(/^(.*?)\s*#\s*(\d+)(?:-.+|\s+[^\s#]+)?$/);
	if (!m) {
		return { displayName: s, memberNumber: null };
	}

	const displayName = m[1].trim();
	const n = parseInt(m[2], 10);
	return {
		displayName: displayName || s,
		memberNumber: Number.isFinite(n) ? n : null
	};
}
