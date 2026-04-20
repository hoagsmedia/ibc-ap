/**
 * Who buys the next keg is driven by **lowest keg credits**, not legacy rank (`sort_order`).
 * Members with `users.dops === true` are treated as deceased and excluded from all buying duty.
 */
export type KegCreditDutyInput = {
	credits: number;
	member_number: number | null;
	member_label: string;
	sort_order: number;
	/** From `users.dops` (or snapshot export) — when true, member is excluded from duty. */
	dops?: boolean | null;
};

export type KegCreditDutyRow = {
	member_label: string;
	member_number: number | null;
	credits: number;
	sort_order: number;
};

export type KegBuyingDuty = {
	/** Rows eligible for buying duty (not deceased). */
	eligibleCount: number;
	/** Everyone tied for the minimum credits among eligible members. */
	nextToBuy: KegCreditDutyRow[];
	/** Everyone tied for the maximum credits among eligible members (furthest from buying). */
	lastInQueue: KegCreditDutyRow[];
};

function isExcludedFromDuty(r: KegCreditDutyInput): boolean {
	return r.dops === true;
}

function toDutyRow(r: KegCreditDutyInput): KegCreditDutyRow {
	return {
		member_label: r.member_label,
		member_number: r.member_number,
		credits: r.credits,
		sort_order: r.sort_order
	};
}

/** @param rows — full keg-credits table (or snapshot); deceased flagged via `dops`. */
export function kegCreditBuyingResponsibility(rows: KegCreditDutyInput[]): KegBuyingDuty {
	const eligible = rows.filter((r) => !isExcludedFromDuty(r));
	if (eligible.length === 0) {
		return { eligibleCount: 0, nextToBuy: [], lastInQueue: [] };
	}

	const minC = Math.min(...eligible.map((r) => r.credits));
	const maxC = Math.max(...eligible.map((r) => r.credits));

	const nextToBuy = eligible.filter((r) => r.credits === minC).map(toDutyRow);
	const lastInQueue = eligible.filter((r) => r.credits === maxC).map(toDutyRow);

	const byRank = (a: KegCreditDutyRow, b: KegCreditDutyRow) => a.sort_order - b.sort_order;
	nextToBuy.sort(byRank);
	lastInQueue.sort(byRank);

	return {
		eligibleCount: eligible.length,
		nextToBuy,
		lastInQueue
	};
}
