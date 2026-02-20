#!/usr/bin/env tsx

/**
 * Sync UploadThing bucket image URLs to user img fields.
 * Lists files from UploadThing; matches by filename "profile-images-firstname_lastname_mbr.jpg"
 * or by customId "profile-mbr-{mbr}-{timestamp}"; updates users by mbr.
 *
 * Usage: pnpm run db:sync:images  (or: tsx scripts/sync-uploadthing-images.ts)
 * Also called automatically at the end of db:seed:csv.
 */

import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { UTApi } from "uploadthing/server";
import { db } from "../src/lib/server/db";
import { users } from "../src/lib/server/db/schema";
import { eq } from "drizzle-orm";

const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!UPLOADTHING_TOKEN) {
	console.error("❌ UPLOADTHING_TOKEN is required (set in .env or .env.local)");
	process.exit(1);
}
if (!DATABASE_URL) {
	console.error("❌ DATABASE_URL is required (set in .env.local or .env)");
	process.exit(1);
}

/** Extract mbr from customId: "profile-mbr-343-1234567890" -> "343" */
function mbrFromCustomId(customId: string | null): string | null {
	if (!customId) return null;
	const m = customId.match(/profile-mbr-(\d+)-\d+/);
	return m ? m[1] : null;
}

/**
 * Extract mbr from filename: "profile-images-firstname_lastname_mbr.jpg" -> "mbr"
 * Matches migrate-images.ts naming: profile-images-${filename} where filename is firstname_lastname_mbr.ext
 */
function mbrFromFileName(name: string): string | null {
	const m = name.match(/^profile-images-.+_(\d+)\.(jpg|jpeg|png|gif)$/i);
	return m ? m[1] : null;
}

/** Sync UploadThing bucket image URLs to user img fields. Call from seed script or run script directly. */
export async function runSyncUploadthingImages(): Promise<void> {
	if (!UPLOADTHING_TOKEN || !DATABASE_URL) return;

	const utapi = new UTApi({ token: UPLOADTHING_TOKEN });

	console.log("📡 Fetching files from UploadThing...");
	const { files } = await utapi.listFiles({ limit: 500 });
	if (!files?.length) {
		console.log("No files found in bucket.");
		return;
	}
	console.log(`📁 Found ${files.length} files`);

	const profileImages = files.filter(
		(f) =>
			(f.customId && f.customId.startsWith("profile-mbr-")) ||
			(f.name && /^profile-images-.+_\d+\.(jpg|jpeg|png|gif)$/i.test(f.name))
	);
	console.log(`👤 ${profileImages.length} profile images to sync\n`);

	let updated = 0;
	let skipped = 0;
	for (const file of profileImages) {
		const mbr = mbrFromCustomId(file.customId ?? null) ?? mbrFromFileName(file.name ?? "");
		if (!mbr) {
			skipped++;
			continue;
		}

		const url = `https://utfs.io/f/${file.key}`;
		const result = await db
			.update(users)
			.set({ img: url, updated_at: new Date() })
			.where(eq(users.mbr, parseInt(mbr, 10)))
			.returning({ id: users.id, name: users.name });

		if (result.length > 0) {
			updated++;
			if (updated <= 10) console.log(`✅ MBR ${mbr}: ${result[0].name}`);
		} else {
			skipped++;
		}
	}

	console.log("\n🎉 Image sync done");
	console.log(`   Updated: ${updated}, No user match: ${skipped}`);
}

const isMain =
	typeof process.argv[1] === "string" &&
	pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
	runSyncUploadthingImages()
		.then(() => process.exit(0))
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
}
