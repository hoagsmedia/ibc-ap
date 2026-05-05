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
		.max(120, "Invite name must be 120 characters or fewer."),
	recipientEmail: z
		.string()
		.trim()
		.min(1, "Enter the prospect’s email address.")
		.email("Enter a valid email address.")
});

export const emailInvitationSchema = z.object({
	token: z.string().trim().min(1, "Missing invitation."),
	recipientEmail: z.string().trim().email("Enter a valid email address.")
});

/** Existing-member website rollout only — separate from prospect `invitation_tokens`. */
export const sendMemberRolloutActivationSchema = z.object({
	targetUserId: z.string().uuid("Invalid member selection.")
});
