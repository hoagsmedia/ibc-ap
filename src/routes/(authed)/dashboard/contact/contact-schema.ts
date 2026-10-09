import z from 'zod';

export const contactSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters long')
		.max(30, 'Name must be at most 30 characters long'),
	email: z
		.string()
		.email('Invalid email address')
		.max(50, 'Email must be at most 50 characters long'),
	message: z
		.string()
		.min(10, 'Message must be at least 10 characters long')
		.max(400, 'Message must be at most 400 characters long')
});
export type ContactForm = z.infer<typeof contactSchema>;
