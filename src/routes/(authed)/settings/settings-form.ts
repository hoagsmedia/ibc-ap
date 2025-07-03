import { z } from 'zod';

export const settingsSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	phone: z
		.string()
		.optional()
		.transform((val) => (val?.trim() === '' ? null : val?.trim())),
	address: z
		.string()
		.optional()
		.transform((val) => (val?.trim() === '' ? null : val?.trim())),
	bio: z
		.string()
		.optional()
		.transform((val) => (val?.trim() === '' ? null : val?.trim())),
	hobbies: z
		.string()
		.optional()
		.transform((val) => (val?.trim() === '' ? null : val?.trim())),
	likes: z
		.string()
		.optional()
		.transform((val) => (val?.trim() === '' ? null : val?.trim()))
});

export type SettingsSchema = typeof settingsSchema;
