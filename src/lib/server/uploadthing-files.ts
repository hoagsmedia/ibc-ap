export function fileKeyFromUploadThingUrl(url: string | null | undefined): string | null {
	if (!url) return null;

	try {
		const parsed = new URL(url);
		const parts = parsed.pathname.split("/").filter(Boolean);

		const fIndex = parts.indexOf("f");
		if (fIndex !== -1) {
			return parts[fIndex + 1] ?? null;
		}

		const aIndex = parts.indexOf("a");
		if (aIndex !== -1) {
			return parts[aIndex + 2] ?? null;
		}

		return null;
	} catch {
		return null;
	}
}

export function resolveUploadThingFileKey(fileRef: {
	url?: string | null;
	key?: string | null;
}): string | null {
	return fileRef.key ?? fileKeyFromUploadThingUrl(fileRef.url);
}
