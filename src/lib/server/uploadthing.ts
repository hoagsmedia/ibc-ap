import { createUploadthing } from 'uploadthing/server';
import type { FileRouter } from 'uploadthing/server';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { sessionCookieName, validateSessionToken } from './auth';

const f = createUploadthing();

// Helper function to get user from session using our custom auth
const getUserFromRequest = async (req: Request): Promise<{ id: string } | null> => {
	try {
		const cookies = req.headers.get('cookie');
		if (!cookies) return null;

		// Extract session token from cookies
		const cookieMatch = cookies.match(new RegExp(`${sessionCookieName}=([^;]+)`));
		if (!cookieMatch) return null;

		const sessionToken = cookieMatch[1];
		if (!sessionToken) return null;

		// Validate session using our auth system
		const { session, user } = await validateSessionToken(sessionToken);
		if (!session || !user) return null;

		return { id: user.id };
	} catch (error) {
		console.error('Failed to get user from request:', error);
		return null;
	}
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// Profile image uploader - single image for user avatars
	profileImageUploader: f({
		image: {
			maxFileSize: '4MB',
			maxFileCount: 1
		}
	})
		.middleware(async ({ req }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error('Unauthorized');

			return {
				userId: user.id,
				uploadType: 'profile' as const
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Profile image upload complete for userId:', metadata.userId);
			console.log('Profile image URL:', file.ufsUrl);

			// Update user's profile image in database
			try {
				await db
					.update(users)
					.set({
						img: file.ufsUrl,
						updated_at: new Date()
					})
					.where(eq(users.id, metadata.userId));

				console.log('Updated user profile image in database');
			} catch (error) {
				console.error('Failed to update user profile image:', error);
			}

			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		}),

	// Profile image migration route - server-only uploads for migrating existing profile images
	'profile-images': f({
		image: {
			maxFileSize: '4MB',
			maxFileCount: 1
		}
	})
		.middleware(async ({ req }) => {
			// Check for migration token or allow server-side requests
			const userAgent = req.headers.get('user-agent');
			if (userAgent?.includes('Node.js') || userAgent?.includes('tsx')) {
				return {
					uploadType: 'profile-migration' as const,
					source: 'server-migration'
				};
			}
			throw new Error('Migration route only accessible from server');
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Profile migration upload complete:', file.name);
			console.log('Profile migration URL:', file.ufsUrl);
			return { source: metadata.source, imageUrl: file.ufsUrl };
		}),

	// Gallery image uploader - multiple images for events, galleries, etc.
	galleryImageUploader: f({
		image: {
			maxFileSize: '8MB',
			maxFileCount: 10
		}
	})
		.middleware(async ({ req }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error('Unauthorized');

			return {
				userId: user.id,
				uploadType: 'gallery' as const
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Gallery image upload complete for userId:', metadata.userId);
			console.log('Gallery image URL:', file.ufsUrl);

			// TODO: Store gallery image metadata in database if needed
			// You might want to create a separate gallery_images table

			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
