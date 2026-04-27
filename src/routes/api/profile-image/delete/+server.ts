import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { sessionCookieName, validateSessionToken } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { fileKeyFromUploadThingUrl } from "$lib/server/uploadthing-files";

const utapi = new UTApi();

export async function POST({ request, cookies }) {
	const sessionToken = cookies.get(sessionCookieName);
	if (!sessionToken) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const { user } = await validateSessionToken(sessionToken);
	if (!user) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const { memberId } = (await request.json().catch(() => ({}))) as { memberId?: string };
	const targetUserId = memberId && memberId !== user.id ? memberId : user.id;

	if (targetUserId !== user.id && user.role !== "admin") {
		return json({ message: "Forbidden" }, { status: 403 });
	}

	const targetUser = await db.query.users.findFirst({
		where: eq(users.id, targetUserId),
		columns: { id: true, img: true }
	});

	if (!targetUser) {
		return json({ message: "User not found" }, { status: 404 });
	}

	const fileKey = fileKeyFromUploadThingUrl(targetUser.img);

	await db
		.update(users)
		.set({
			img: null,
			updated_at: new Date()
		})
		.where(eq(users.id, targetUser.id));

	if (fileKey) {
		try {
			await utapi.deleteFiles(fileKey);
		} catch (error) {
			console.error("Failed to delete profile image from UploadThing:", error);
		}
	}

	return json({ success: true });
}
