/** Parse HTML date input (yyyy-mm-dd) or empty → DB `date` */
export function parseOptionalDate(s: string | undefined | null): Date | null {
	if (s == null || String(s).trim() === "") return null;
	const t = Date.parse(s);
	return Number.isNaN(t) ? null : new Date(t);
}

export function formatDateInput(d: Date | null): string {
	if (!d) return "";
	return d.toISOString().slice(0, 10);
}
