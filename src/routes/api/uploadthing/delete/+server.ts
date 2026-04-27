import { json } from "@sveltejs/kit";
import { UTApi } from "uploadthing/server";
import { sessionCookieName, validateSessionToken } from "$lib/server/auth";
import { resolveUploadThingFileKey } from "$lib/server/uploadthing-files";

const utapi = new UTApi();

export async function POST({ request, cookies }) {
	const sessionToken = cookies.get(sessionCookieName);
	if (!sessionToken) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const { user } = await validateSessionToken(sessionToken);
	if (!user || user.role !== "admin") {
		return json({ message: "Forbidden" }, { status: 403 });
	}

	const { url, key } = (await request.json()) as { url?: string; key?: string };
	const fileKey = resolveUploadThingFileKey({ url, key });
	if (!fileKey) {
		return json({ message: "Missing or invalid UploadThing file reference" }, { status: 400 });
	}

	await utapi.deleteFiles(fileKey);
	return json({ success: true });
}
