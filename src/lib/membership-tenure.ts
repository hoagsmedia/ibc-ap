/**
 * MSD = member since date (calendar). Tenure uses UTC date parts so it is stable across time zones.
 */

function utcMidnight(d: Date): Date {
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function parseMsd(msd: Date | string | null | undefined): Date | null {
	if (msd == null) return null;
	const d = typeof msd === "string" ? new Date(msd) : msd;
	if (!Number.isFinite(d.getTime())) return null;
	return utcMidnight(d);
}

/** Whole calendar days from MSD (UTC midnight) through today (UTC midnight), inclusive of start day as day 0 style count. */
export function membershipTotalDays(msd: Date | string | null | undefined): number | null {
	const start = parseMsd(msd);
	if (!start) return null;
	const end = utcMidnight(new Date());
	const ms = end.getTime() - start.getTime();
	return Math.max(0, Math.floor(ms / 86400000));
}

/** Calendar years / months / days between MSD and today (UTC). */
export function membershipTenureParts(
	msd: Date | string | null | undefined
): { years: number; months: number; days: number; totalDays: number } | null {
	const start = parseMsd(msd);
	if (!start) return null;
	const end = utcMidnight(new Date());
	if (start.getTime() > end.getTime()) {
		return { years: 0, months: 0, days: 0, totalDays: 0 };
	}

	let years = end.getUTCFullYear() - start.getUTCFullYear();
	let months = end.getUTCMonth() - start.getUTCMonth();
	let days = end.getUTCDate() - start.getUTCDate();

	if (days < 0) {
		months -= 1;
		const prevMonthLast = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0));
		days += prevMonthLast.getUTCDate();
	}
	if (months < 0) {
		years -= 1;
		months += 12;
	}

	const totalDays = membershipTotalDays(msd) ?? 0;
	return { years, months, days, totalDays };
}

/** Display MSD as a calendar date (UTC) — matches legacy club date fields. */
export function formatMsdDate(msd: Date | string | null | undefined): string | null {
	if (msd == null) return null;
	const d = typeof msd === "string" ? new Date(msd) : msd;
	if (!Number.isFinite(d.getTime())) return null;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC"
	}).format(d);
}

const unit = (n: number, singular: string, plural: string) =>
	`${n} ${n === 1 ? singular : plural}`;

/** Readable "X years, Y months, Z days" plus total days for beer-club tenure from MSD. */
export function formatMembershipTenureHuman(msd: Date | string | null | undefined): string | null {
	const parts = membershipTenureParts(msd);
	if (!parts) return null;
	const start = parseMsd(msd);
	const end = utcMidnight(new Date());
	if (start && start.getTime() > end.getTime()) {
		return "Member since date is in the future.";
	}

	const chunks: string[] = [];
	if (parts.years > 0) chunks.push(unit(parts.years, "year", "years"));
	if (parts.months > 0) chunks.push(unit(parts.months, "month", "months"));
	if (parts.days > 0 || chunks.length === 0) chunks.push(unit(parts.days, "day", "days"));

	const calendar = chunks.join(", ");
	const days = unit(parts.totalDays, "day", "days");
	return `${calendar} (${days} total)`;
}
