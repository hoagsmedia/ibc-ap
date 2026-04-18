import { z } from "zod";

/** Optional member # (legacy stats parsed from `#123` / `#123-1Nov17`). */
const memberNumberField = z
	.union([z.string(), z.number(), z.null(), z.undefined()])
	.transform((v) => {
		if (v === "" || v === undefined || v === null) return null;
		const n = typeof v === "number" ? v : parseInt(String(v), 10);
		return Number.isFinite(n) && n > 0 ? n : null;
	});

export const kegCreditsFormSchema = z.object({
	sort_order: z.coerce.number().int(),
	member_label: z.string().min(1, "Required"),
	member_number: memberNumberField,
	credits: z.coerce.number().nonnegative(),
	is_cik: z.boolean().default(false)
});
