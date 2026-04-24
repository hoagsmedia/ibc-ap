/**
 * MSD (member since) is stored as `timestamptz` with the convention:
 * the chosen calendar day at **00:00:00.000 UTC** (matches legacy `date` semantics).
 */

export function msdFromDateInput(isoDate: string | null | undefined): Date | null {
	const t = isoDate?.trim();
	if (!t) return null;
	const d = new Date(`${t}T00:00:00.000Z`);
	return Number.isFinite(d.getTime()) ? d : null;
}

/** Value for `<input type="date" />` from a stored MSD. */
export function msdToDateInputValue(msd: Date | string | null | undefined): string {
	if (msd == null) return "";
	const d = typeof msd === "string" ? new Date(msd) : msd;
	if (!Number.isFinite(d.getTime())) return "";
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}
