/**
 * Public /stats: show given names only — drops the last whitespace-delimited segment
 * (treated as surname). Single-token labels are unchanged.
 */
export function statsPublicMemberLabel(label: string): string {
	const t = label.trim();
	if (!t) return t;
	const parts = t.split(/\s+/);
	if (parts.length <= 1) return t;
	return parts.slice(0, -1).join(" ");
}
