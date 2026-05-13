import { z } from "zod";

export const assignMemberSchema = z.object({
	userId: z.string().trim().uuid("Missing or invalid user id."),
	mbr: z.coerce.number().positive("Member number is required").min(1),
	rungInDate: z
		.string()
		.trim()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Rung-in date is required")
});
