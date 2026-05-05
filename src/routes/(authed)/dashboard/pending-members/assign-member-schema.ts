import { z } from "zod";

export const assignMemberSchema = z.object({
	userId: z.string().trim().uuid("Missing or invalid user id."),
	mbr: z.coerce.number().positive("Member number is required").min(1)
});
