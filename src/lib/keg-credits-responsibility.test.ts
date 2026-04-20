import { describe, expect, it } from "vitest";
import { kegCreditBuyingResponsibility, type KegCreditDutyInput } from "./keg-credits-responsibility.js";

function row(
	partial: Pick<KegCreditDutyInput, "sort_order" | "member_label" | "credits"> &
		Partial<KegCreditDutyInput>
): KegCreditDutyInput {
	return {
		member_number: null,
		dops: false,
		...partial
	};
}

describe("kegCreditBuyingResponsibility", () => {
	it("picks lowest credits, excluding dops", () => {
		const duty = kegCreditBuyingResponsibility([
			row({ sort_order: 1, member_label: "A", credits: 0 }),
			row({ sort_order: 2, member_label: "B", credits: 5 }),
			row({ sort_order: 3, member_label: "Ghost", credits: 0, dops: true })
		]);
		expect(duty.eligibleCount).toBe(2);
		expect(duty.nextToBuy.map((r) => r.member_label)).toEqual(["A"]);
		expect(duty.lastInQueue.map((r) => r.member_label)).toEqual(["B"]);
	});

	it("returns all ties for min and max credits", () => {
		const duty = kegCreditBuyingResponsibility([
			row({ sort_order: 2, member_label: "B", credits: 1 }),
			row({ sort_order: 1, member_label: "A", credits: 1 }),
			row({ sort_order: 3, member_label: "C", credits: 10 })
		]);
		expect(duty.nextToBuy.map((r) => r.member_label)).toEqual(["A", "B"]);
		expect(duty.lastInQueue.map((r) => r.member_label)).toEqual(["C"]);
	});

	it("sorts ties by legacy rank (sort_order)", () => {
		const duty = kegCreditBuyingResponsibility([
			row({ sort_order: 5, member_label: "Later", credits: 0 }),
			row({ sort_order: 1, member_label: "Earlier", credits: 0 })
		]);
		expect(duty.nextToBuy.map((r) => r.member_label)).toEqual(["Earlier", "Later"]);
	});
});
