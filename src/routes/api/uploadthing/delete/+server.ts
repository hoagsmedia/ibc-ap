import { json } from "@sveltejs/kit";
import { UTApi } from "uploadthing/server";
import { resolveUploadThingFileKey } from "$lib/server/uploadthing-files";

const utapi = new UTApi();

export async function POST({ request, locals }) {
	const user = locals.user;
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
