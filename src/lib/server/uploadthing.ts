import { randomUUID } from 'crypto';
import { createUploadthing, UTFiles } from 'uploadthing/server';
import type { FileRouter } from 'uploadthing/server';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { sessionCookieName, validateSessionToken } from './auth';

const f = createUploadthing({
	/**
	 * Log out more information about the error, but don't return it to the client
	 * @see https://docs.uploadthing.com/errors#error-formatting
	 */
	errorFormatter: (err) => {
		console.log('Error uploading file', err.message);
		console.log('  - Above error caused by:', err.cause);

		return { message: err.message };
	}
});

// // Helper function to get user from session using our custom auth
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
			maxFileCount: 1,
			acl: 'public-read'
		}
	})
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error('Unauthorized');
			console.log('User authenticated for profile image upload:', user.id);
			//console log headers
			console.log(
				'Request headers:',
				JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2)
			);

			// Label files with custom identifier for better organization
			const filesWithCustomIds = files.map((file) => ({
				...file,
				customId: `profile-${user.id}-${randomUUID()}`
			}));

			return {
				userId: user.id,
				uploadType: 'profile' as const,
				[UTFiles]: filesWithCustomIds
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('🎯 UploadComplete callback triggered!');
			console.log('📊 Metadata:', JSON.stringify(metadata, null, 2));
			console.log(
				'📁 File info:',
				JSON.stringify(
					{
						key: file.key,
						name: file.name,
						size: file.size,
						type: file.type,
						ufsUrl: file.ufsUrl,
						customId: file.customId
					},
					null,
					2
				)
			);

			// Update user's profile image in database
			try {
				console.log('💾 Attempting database update for user:', metadata.userId);
				const updateResult = await db
					.update(users)
					.set({
						img: file.ufsUrl,
						updated_at: new Date()
					})
					.where(eq(users.id, metadata.userId))
					.returning({ id: users.id, img: users.img });

				console.log('✅ Database update successful:', updateResult);
				console.log('✅ Updated user profile image in database');
			} catch (error) {
				console.error('❌ Failed to update user profile image:', error);
				throw error; // Re-throw to ensure UploadThing knows the callback failed
			}

			const response = { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
			console.log('📤 Returning callback response:', response);
			return response;
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
			maxFileCount: 10,
			acl: 'public-read'
		}
	})
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error('Unauthorized');

			// Label files with custom identifier for better organization
			const filesWithCustomIds = files.map((file, idx) => ({
				...file,
				customId: `gallery-${user.id}-${idx}-${randomUUID()}`
			}));

			return {
				userId: user.id,
				uploadType: 'gallery' as const,
				[UTFiles]: filesWithCustomIds
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Gallery image upload complete for userId:', metadata.userId);
			console.log('Gallery image URL:', file.ufsUrl);
			console.log('Gallery image customId:', file.customId);

			// TODO: Store gallery image metadata in database if needed
			// You might want to create a separate gallery_images table

			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
