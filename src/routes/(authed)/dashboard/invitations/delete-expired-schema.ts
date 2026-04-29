import { z } from "zod";

export const deleteExpiredInvitationSchema = z.object({
	token: z.string().trim().min(1, "Missing invite token.")
});
