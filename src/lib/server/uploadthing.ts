import { createUploadthing, UTApi, UTFiles } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";
import { db } from "./db";
import { users, events } from "./db/schema";
import { eq } from "drizzle-orm";
import { sessionCookieName, validateSessionToken } from "./auth";
import { fileKeyFromUploadThingUrl } from "./uploadthing-files";
import { formatDateTime } from "$lib/utils";

const utapi = new UTApi();

const f = createUploadthing({
	errorFormatter: (err) => {
		console.error("UploadThing error:", err.message, err.cause);
		return { message: err.message };
	}
});

// Helper function to get user from session using our custom auth
const getUserFromRequest = async (
	req: Request
): Promise<{ id: string; mbr: number | null; img: string | null; role: string } | null> => {
	try {
		const cookies = req.headers.get("cookie");
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
		console.error("Failed to get user from request:", error);
		return null;
	}
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// Profile image uploader - single image for user avatars
	profileImageUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
			acl: "public-read"
		}
	})
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error("Unauthorized");

			const currentImageKey = fileKeyFromUploadThingUrl(user.img);

			// Label files with custom identifier for better organization
			const filesWithCustomIds = files.map((file) => ({
				...file,
				currentImageKey,
				customId: `profile-${user.id}-${user.mbr}-${formatDateTime(new Date())}`
			}));

			return {
				userId: user.id,
				uploadType: "profile" as const,
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
				console.error("Failed to update user profile image:", error);
				throw error;
			}

			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		}),

	// Gallery image uploader - multiple images for events, galleries, etc.
	galleryImageUploader: f({
		image: {
			maxFileSize: "8MB",
			maxFileCount: 10,
			acl: "public-read"
		}
	})
		.middleware(async ({ req }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error("Unauthorized");

			return {
				userId: user.id,
				uploadType: "gallery" as const
				// Don't set customId here for multiple files
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		}),

	// Update Member Image - single image for member profiles
	updateMemberImage: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
			acl: "public-read"
		}
	})
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error("Unauthorized");

			// Check if user is admin
			if (user.role !== "admin") throw new Error("Admin access required");

			if (files.length !== 1) {
				throw new Error("Exactly one file must be uploaded");
			}

			const referer = req.headers.get("referer");
			const { getMemberById, parseMemberRecordIdFromMembersUrl } = await import(
				"$lib/server/member-lookup"
			);
			const memberId = parseMemberRecordIdFromMembersUrl(referer);
			if (!memberId) {
				throw new Error("Member id not found in referer URL");
			}

			const memberToUpdate = await getMemberById(memberId);

			if (!memberToUpdate) {
				throw new Error("Member not found");
			}

			const currentImageKey = fileKeyFromUploadThingUrl(memberToUpdate.img);
			const file = files[0];

			// Label file with custom identifier for better organization
			const customId = `member-${memberToUpdate.id}-${memberToUpdate.mbr}-${formatDateTime(new Date())}`;

			return {
				userId: user.id, // Admin user performing the action
				memberId: memberToUpdate.id, // Member being updated
				uploadType: "member-image" as const,
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
				console.error("Failed to update member image:", error);
				throw error;
			}

			return { uploadedBy: metadata.userId, memberId: metadata.memberId, imageUrl: file.ufsUrl };
		}),
	// Event image uploader - single image for event banners
	eventImageUploader: f({
		image: {
			maxFileSize: "8MB",
			maxFileCount: 1,
			acl: "public-read"
		}
	})
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error("Unauthorized");
			// Check if user is admin
			if (user.role !== "admin") throw new Error("Admin access required");
			if (files.length !== 1) {
				throw new Error("Exactly one file must be uploaded");
			}
			// Extract the event ID from the referer URL
			const referer = req.headers.get("referer");
			const eventIdMatch = referer?.match(/\/events\/([a-zA-Z0-9_-]+)/);
			if (!eventIdMatch || !eventIdMatch[1]) {
				throw new Error("Event ID not found in referer URL");
			}
			const eventId = eventIdMatch[1];

			// Get the event being edited to check its current image (if it exists)
			// For new events, this will be null and that's okay
			const eventToUpdate = await db.query.events.findFirst({
				where: eq(events.id, eventId),
				columns: { id: true, img: true }
			});

			const currentImageKey = fileKeyFromUploadThingUrl(eventToUpdate?.img);

			// Label file with custom identifier for better organization
			const customId = `event-${eventId}-${formatDateTime(new Date())}`;
			return {
				userId: user.id,
				uploadType: "event-image" as const,
				eventId: eventId,
				currentImageKey: currentImageKey,
				[UTFiles]: files.map((file) => ({ ...file, customId }))
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			try {
				// Update event image in database
				await db
					.update(events)
					.set({
						img: file.ufsUrl,
						updated_at: new Date()
					})
					.where(eq(events.id, metadata.eventId))
					.returning({ id: events.id, img: events.img });
				if (metadata.currentImageKey) {
					// Delete the old image if it exists
					await utapi.deleteFiles(metadata.currentImageKey);
				}
			} catch (error) {
				console.error("Failed to update event image:", error);
				throw error;
			}
			return { uploadedBy: metadata.userId, eventId: metadata.eventId, imageUrl: file.ufsUrl };
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
