import { z } from "zod";

export const memberSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	email: z.string(),
	phone: z.string().optional(),
	address: z.string().optional(),
	dops: z.boolean(),
	dops_date: z.string().optional(), // Date of Permanent Sobriety
	rung_in_date: z.string(),
	bio: z.string().optional(),
	hobbies: z.string().max(300).optional(),
	img: z.string().optional(),
	role: z.string(),
	likes: z.string().max(300).optional(),
	mbr: z.number(),
	msd: z.string(),
	sponsor: z.string(),
	test_passed: z.string(),
	created_at: z.string().optional(),
	updated_at: z.string().optional()
});

// Create the superforms schema directly from the base schema
export type MemberSchema = typeof memberSchema;
