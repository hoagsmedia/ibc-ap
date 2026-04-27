import { createUploadthing, UTApi, UTFiles } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";
import { db } from "./db";
import { users, events } from "./db/schema";
import { eq } from "drizzle-orm";
import { sessionCookieName, validateSessionToken } from "./auth";
import { fileKeyFromUploadThingUrl } from "./uploadthing-files";

const utapi = new UTApi();
const PROFILE_IMAGE_MAX_FILE_SIZE = "8MB";

function sanitizeForKey(value: string | null | undefined, separator: "-" | "_" = "_"): string {
	const normalized = (value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, separator)
		.replace(new RegExp(`\\${separator}+`, "g"), separator)
		.replace(new RegExp(`^\\${separator}|\\${separator}$`, "g"), "");

	return normalized || "untitled";
}

function formatMmddyyyy(date: Date | null | undefined): string {
	const value = date && Number.isFinite(date.getTime()) ? date : new Date();
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const day = String(value.getDate()).padStart(2, "0");
	const year = String(value.getFullYear());
	return `${month}${day}${year}`;
}

function profileImageFileBase(name: string | null | undefined, mbr: number | null | undefined): string {
	return `profile-images-${sanitizeForKey(name, "_")}_${mbr ?? "unknown"}`;
}

function eventImageFileBase(title: string | null | undefined, eventDate: Date | null | undefined): string {
	return `event__${sanitizeForKey(title, "_")}_${formatMmddyyyy(eventDate)}`;
}

function fileExtension(name: string | null | undefined): string {
	const trimmed = name?.trim() ?? "";
	const dot = trimmed.lastIndexOf(".");
	if (dot <= 0 || dot === trimmed.length - 1) return "";
	return trimmed.slice(dot).toLowerCase();
}

function uniqueUploadSuffix(): string {
	const now = new Date();
	const yyyy = String(now.getFullYear());
	const mm = String(now.getMonth() + 1).padStart(2, "0");
	const dd = String(now.getDate()).padStart(2, "0");
	const hh = String(now.getHours()).padStart(2, "0");
	const mi = String(now.getMinutes()).padStart(2, "0");
	const ss = String(now.getSeconds()).padStart(2, "0");
	const shortId = crypto.randomUUID().slice(0, 8);
	return `${yyyy}${mm}${dd}-${hh}${mi}${ss}-${shortId}`;
}

function uniqueUploadBaseName(baseName: string): string {
	return `${baseName}_${uniqueUploadSuffix()}`;
}

function withUploadThingName<T extends { name?: string }>(file: T, baseName: string): T & { name: string } {
	const uniqueBaseName = uniqueUploadBaseName(baseName);
	return {
		...file,
		name: `${uniqueBaseName}${fileExtension(file.name)}`
	};
}

const f = createUploadthing({
	errorFormatter: (err) => {
		console.error("UploadThing error:", err.message, err.cause);
		return { message: err.message };
	}
});

// Helper function to get user from session using our custom auth
const getUserFromRequest = async (
	req: Request
): Promise<{ id: string; name: string; mbr: number | null; img: string | null; role: string } | null> => {
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

		return { id: user.id, name: user.name, img: user.img, mbr: user.mbr, role: user.role };
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
			maxFileSize: PROFILE_IMAGE_MAX_FILE_SIZE,
			maxFileCount: 1,
			acl: "public-read"
		}
	})
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error("Unauthorized");

			const currentImageKey = fileKeyFromUploadThingUrl(user.img);

			// Label files with custom identifier for better organization
			const filesWithCustomIds = files.map((file) => {
				const fileBase = profileImageFileBase(user.name, user.mbr);
				const uniqueBaseName = uniqueUploadBaseName(fileBase);
				return {
					...file,
					name: `${uniqueBaseName}${fileExtension(file.name)}`,
					currentImageKey,
					customId: `profile-${user.id}-${user.mbr ?? "unknown"}-${uniqueUploadSuffix()}`
				};
			});

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
		.middleware(async ({ req, files }) => {
			const user = await getUserFromRequest(req);
			if (!user) throw new Error("Unauthorized");

			const referer = req.headers.get("referer") ?? "";
			const eventIdMatch = referer.match(/\/events\/([a-zA-Z0-9_-]+)/);
			const eventId = eventIdMatch?.[1] ?? null;
			const eventRecord = eventId
				? await db.query.events.findFirst({
					where: eq(events.id, eventId),
					columns: { title: true, event_date: true }
				})
				: null;
			const fileBase = eventImageFileBase(eventRecord?.title ?? "draft", eventRecord?.event_date ?? null);

			return {
				userId: user.id,
				uploadType: "gallery" as const,
				[UTFiles]: files.map((file) => {
					const uniqueBaseName = uniqueUploadBaseName(fileBase);
					return {
						...file,
						name: `${uniqueBaseName}${fileExtension(file.name)}`
					};
				})
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			return { uploadedBy: metadata.userId, imageUrl: file.ufsUrl };
		}),

	// Update Member Image - single image for member profiles
	updateMemberImage: f({
		image: {
			maxFileSize: PROFILE_IMAGE_MAX_FILE_SIZE,
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
			const fileBase = profileImageFileBase(memberToUpdate.name, memberToUpdate.mbr);
			const uniqueBaseName = uniqueUploadBaseName(fileBase);

			return {
				userId: user.id, // Admin user performing the action
				memberId: memberToUpdate.id, // Member being updated
				uploadType: "member-image" as const,
				currentImageKey: currentImageKey,
				[UTFiles]: [{
					...file,
					name: `${uniqueBaseName}${fileExtension(file.name)}`,
					customId: `member-${memberToUpdate.id}-${memberToUpdate.mbr ?? "unknown"}-${uniqueUploadSuffix()}`
				}]
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
				columns: { id: true, img: true, title: true, event_date: true }
			});

			const currentImageKey = fileKeyFromUploadThingUrl(eventToUpdate?.img);

			// Label file with custom identifier for better organization
			const fileBase = eventImageFileBase(eventToUpdate?.title ?? eventId, eventToUpdate?.event_date ?? null);
			return {
				userId: user.id,
				uploadType: "event-image" as const,
				eventId: eventId,
				currentImageKey: currentImageKey,
				[UTFiles]: files.map((file) => {
					const uniqueBaseName = uniqueUploadBaseName(fileBase);
					return {
						...file,
						name: `${uniqueBaseName}${fileExtension(file.name)}`,
						customId: `event-${eventId}-${uniqueUploadSuffix()}`
					};
				})
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
