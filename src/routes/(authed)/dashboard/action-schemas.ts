import { z } from "zod";

export const meetingSlotSchema = z.coerce.number().int().min(1).max(3);

export const saveProspectMeetingDateSchema = z.object({
	slot: meetingSlotSchema,
	meetingDate: z.string().trim().min(1, "Pick a meeting date before saving.")
});

export const clearProspectMeetingDateSchema = z.object({
	slot: meetingSlotSchema
});

export const createInvitationSchema = z.object({
	inviteName: z
		.string()
		.trim()
		.min(1, "Add a name for this invite so you remember who it’s for.")
		.max(120, "Invite name must be 120 characters or fewer.")
});
