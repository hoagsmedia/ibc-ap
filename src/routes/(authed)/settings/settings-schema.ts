import { z } from 'zod';

export const profileSchema = z.object({
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

//update password schema
export const updatePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(6, 'Current password must be at least 6 characters')
			.max(24, 'Current password must be less than 24 characters')
			.trim(),
		confirmPassword: z
			.string()
			.min(6, 'Confirm password must be at least 6 characters')
			.max(24, 'Confirm password must be less than 24 characters')
			.trim(),
		newPassword: z
			.string()
			.min(6, 'New password must be at least 6 characters')
			.max(24, 'New password must be less than 24 characters')
			.trim()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'New password and confirm password must match',
		path: ['confirmPassword']
	});

export type UpdatePasswordSchema = typeof updatePasswordSchema;
export type ProfileSchema = typeof profileSchema;
