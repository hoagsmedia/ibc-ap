import { randomUUID } from 'crypto';
import { createUploadthing, UTFiles } from 'uploadthing/server';
import type { FileRouter } from 'uploadthing/server';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { sessionCookieName, validateSessionToken } from './auth';

const f = createUploadthing({
	errorFormatter: (err) => {
		console.error('UploadThing error:', err.message, err.cause);
		return { message: err.message };
	}
});

// Helper function to get user from session using our custom auth
const getUserFromRequest = async (
	req: Request
): Promise<{ id: string; mbr: number | null } | null> => {
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

		return { id: user.id, mbr: user.mbr };
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
			// create a const that creates a custom id as profile-member-{mbr or id}
			const customId = `profile-member-${user.mbr || user.id}`;
			console.log('Custom ID for profile image:', customId);

			// Label files with custom identifier for better organization
			const filesWithCustomIds = files.map((file) => ({
				...file,
				customId: customId
			}));

			return {
				userId: user.id,
				uploadType: 'profile' as const,
				[UTFiles]: filesWithCustomIds
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// Update user's profile image in database
			try {
				await db
					.update(users)
					.set({
						img: file.ufsUrl,
						updated_at: new Date()
					})
					.where(eq(users.id, metadata.userId))
					.returning({ id: users.id, img: users.img });
			} catch (error) {
				console.error('Failed to update user profile image:', error);
				throw error; // Re-throw to ensure UploadThing knows the callback failed
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
			// TODO: Store gallery image metadata in database if needed
			// You might want to create a separate gallery_images table

			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
