/**
 * Existing member rollout progress: how many club members have an active website account.
 *
 * Population (denominator): numbered club members — role `member` or `admin`, member number > 0,
 * not marked deceased (`dops` / `dops_date`). Prospects/guests are excluded; members without an
 * email are included. Rows come from `users` only, so rollout links never affect the counts.
 *
 * Each distinct member number counts once (exact value, so `408.1` and `408` are different
 * members). A member number is active when any row carrying it has `account_active = true`.
 */
export type RolloutPopulationRow = {
	mbr: number | null;
	account_active: boolean;
};

export type RolloutProgress = {
	/** Distinct member numbers with an active website account. */
	active: number;
	/** Distinct member numbers in the population. */
	total: number;
};

export function aggregateRolloutProgress(rows: readonly RolloutPopulationRow[]): RolloutProgress {
	const activeByMbr = new Map<number, boolean>();
	for (const row of rows) {
		// The query already filters these; skip defensively so a stray row cannot skew the totals.
		if (row.mbr == null || !Number.isFinite(row.mbr) || row.mbr <= 0) continue;
		activeByMbr.set(row.mbr, activeByMbr.get(row.mbr) === true || row.account_active === true);
	}
	let active = 0;
	for (const isActive of activeByMbr.values()) {
		if (isActive) active += 1;
	}
	return { active, total: activeByMbr.size };
}

/**
 * Percentage with one decimal place, or `null` when there are no members (never NaN).
 * Rounding never reports 100.0% unless everyone is active, nor 0.0% unless no one is.
 */
export function formatRolloutPercent({ active, total }: RolloutProgress): string | null {
	if (total <= 0) return null;
	let percent = Math.round((active / total) * 1000) / 10;
	if (active < total && percent >= 100) percent = 99.9;
	if (active > 0 && percent <= 0) percent = 0.1;
	return `${percent.toFixed(1)}%`;
}
