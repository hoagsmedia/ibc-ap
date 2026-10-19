import z from "zod";

const optionalText = (max: number, label: string) =>
	z
		.string()
		.trim()
		.max(max, `${label} must be at most ${max} characters`)
		.transform((v) => (v === "" ? null : v));

export const checkinSchema = z.object({
	beer_name: z
		.string()
		.trim()
		.min(1, "What are you drinking?")
		.max(80, "Beer name must be at most 80 characters"),
	brewery: optionalText(80, "Brewery"),
	rating: z.coerce
		.number()
		.int("Pick a rating from 1 to 5")
		.min(1, "Pick a rating from 1 to 5")
		.max(5, "Pick a rating from 1 to 5"),
	note: optionalText(200, "Note")
});

export type CheckinInput = z.infer<typeof checkinSchema>;

/** Most check-ins one member can post in 24 hours (keeps the feed social, not spammy). */
export const MAX_CHECKINS_PER_DAY = 20;
/** Check-ins shown in the feed. */
export const FEED_LIMIT = 50;
