import { z } from "zod";

export const createMemberSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters"),
	email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
	mbr: z.coerce.number().positive("Member number is required").min(1, "Member number is required"),
	phone: z.string().trim()
});

export type CreateMemberSchema = typeof createMemberSchema;
