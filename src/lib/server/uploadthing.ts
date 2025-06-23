import { createUploadthing, UTApi, UTFiles } from 'uploadthing/server';
import type { FileRouter } from 'uploadthing/server';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { sessionCookieName, validateSessionToken } from './auth';
import { formatDateTime } from '$lib/utils';

const utapi = new UTApi();

const f = createUploadthing({
	errorFormatter: (err) => {
		console.error('UploadThing error:', err.message, err.cause);
		return { message: err.message };
	}
});

// Helper function to get user from session using our custom auth
const getUserFromRequest = async (
	req: Request
): Promise<{ id: string; mbr: number | null; img: string | null; role: string } | null> => {
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

		return { id: user.id, img: user.img, mbr: user.mbr, role: user.role };
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

			const currentImageKey = user.img?.split('/f/')[1];
			console.log('Current user', user);

			// Label files with custom identifier for better organization
			const filesWithCustomIds = files.map((file) => ({
				...file,
				currentImageKey,
				customId: `profile-${user.id}-${user.mbr}-${formatDateTime(new Date())}`
			}));

			return {
				userId: user.id,
				uploadType: 'profile' as const,
				currentImageKey: currentImageKey,
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
				//Delete the old image if it exists
				if (metadata.currentImageKey) {
					await utapi.deleteFiles(metadata.currentImageKey);
				}
			} catch (error) {
				console.error('Failed to update user profile image:', error);
				throw error;
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
		.middleware(async ({ req }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error('Unauthorized');

			return {
				userId: user.id,
				uploadType: 'gallery' as const
				// Don't set customId here for multiple files
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		}),

	// Update Member Image - single image for member profiles
	updateMemberImage: f({
		image: {
			maxFileSize: '4MB',
			maxFileCount: 1,
			acl: 'public-read'
		}
	})
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error('Unauthorized');

			// Check if user is admin
			if (user.role !== 'admin') throw new Error('Admin access required');

			if (files.length !== 1) {
				throw new Error('Exactly one file must be uploaded');
			}

			// Extract the member ID from the referer URL - updated regex for UUID format
			const referer = req.headers.get('referer');
			// Extract member ID from referer URL with flexible matching
			const memberIdMatch = referer?.match(/\/members\/([a-zA-Z0-9_-]+)/);

			if (!memberIdMatch || !memberIdMatch[1] || memberIdMatch[1].length < 8) {
				throw new Error('Member ID not found in referer URL');
			}

			const memberId = memberIdMatch[1];

			// Get the member being edited to check their current image
			const memberToUpdate = await db.query.users.findFirst({
				where: eq(users.id, memberId),
				columns: { id: true, img: true, mbr: true }
			});

			if (!memberToUpdate) {
				throw new Error('Member not found');
			}

			const currentImageKey = memberToUpdate.img?.split('/f/')[1];
			const file = files[0];

			// Label file with custom identifier for better organization
			const customId = `member-${memberToUpdate.id}-${memberToUpdate.mbr}-${formatDateTime(new Date())}`;

			return {
				userId: user.id, // Admin user performing the action
				memberId: memberToUpdate.id, // Member being updated
				uploadType: 'member-image' as const,
				currentImageKey: currentImageKey,
				[UTFiles]: [{ ...file, customId }]
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			try {
				await db
					.update(users)
					.set({
						img: file.ufsUrl,
						updated_at: new Date()
					})
					.where(eq(users.id, metadata.memberId)) // Use memberId instead of userId
					.returning({ id: users.id, img: users.img });

				// Delete the old image if it exists
				if (metadata.currentImageKey) {
					await utapi.deleteFiles(metadata.currentImageKey);
				}
			} catch (error) {
				console.error('Failed to update member image:', error);
				throw error;
			}

			return { uploadedBy: metadata.userId, memberId: metadata.memberId, imageUrl: file.ufsUrl };
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
