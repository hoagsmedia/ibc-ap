import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	return {
		user: event.locals.user
	};
};

export const actions: Actions = {
	uploadImage: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const image = formData.get('image') as File;

		if (!image || !image.size) {
			return fail(400, { message: 'Please select an image to upload' });
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
		if (!allowedTypes.includes(image.type)) {
			return fail(400, { message: 'Please upload a valid image file (JPG, PNG, or GIF)' });
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (image.size > maxSize) {
			return fail(400, { message: 'Image must be smaller than 5MB' });
		}

		try {
			// Create uploads directory if it doesn't exist
			const uploadsDir = path.join(process.cwd(), 'static/uploads');
			if (!existsSync(uploadsDir)) {
				await mkdir(uploadsDir, { recursive: true });
			}

			// Generate unique filename
			const extension = path.extname(image.name);
			const filename = `${event.locals.user.id}-${Date.now()}${extension}`;
			const filepath = path.join(uploadsDir, filename);

			// Save file
			const buffer = Buffer.from(await image.arrayBuffer());
			await writeFile(filepath, buffer);

			// Update user record in database
			const imagePath = `/uploads/${filename}`;
			await db
				.update(table.users)
				.set({ img: imagePath })
				.where(eq(table.users.id, event.locals.user.id));

			return {
				success: true,
				message: 'Profile image updated successfully!'
			};
		} catch (error) {
			console.error('Error uploading image:', error);
			return fail(500, { message: 'Failed to upload image. Please try again.' });
		}
	},

	updateProfile: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, { message: 'Name is required' });
		}

		if (name.length < 2 || name.length > 100) {
			return fail(400, { message: 'Name must be between 2 and 100 characters' });
		}

		try {
			await db.update(table.users).set({ name }).where(eq(table.users.id, event.locals.user.id));

			return {
				success: true,
				message: 'Profile updated successfully!'
			};
		} catch (error) {
			console.error('Error updating profile:', error);
			return fail(500, { message: 'Failed to update profile. Please try again.' });
		}
	}
};
