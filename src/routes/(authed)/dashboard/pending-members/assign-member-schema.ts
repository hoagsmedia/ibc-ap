import { z } from "zod";

export const assignMemberSchema = z.object({
	userId: z.string().trim().uuid("Missing or invalid user id."),
	mbr: z.coerce.number().int("Member number must be a whole number").min(1)
});
