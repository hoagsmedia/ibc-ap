#!/usr/bin/env tsx

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { fileKeyFromUploadThingUrl } from "../src/lib/server/uploadthing-files";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });

const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN?.trim();
const LOCAL_DATABASE_URL = process.env.DATABASE_URL?.trim();
const PROD_DATABASE_URL = process.env.DATABASE_URL_PROD?.trim();

if (!UPLOADTHING_TOKEN) {
	console.error("❌ UPLOADTHING_TOKEN is required");
	process.exit(1);
}

if (!LOCAL_DATABASE_URL && !PROD_DATABASE_URL) {
	console.error("❌ At least one database URL is required");
	process.exit(1);
}

async function collectReferencedKeys(
	connectionString: string,
	label: string
): Promise<Set<string>> {
	const client = postgres(connectionString, { prepare: false });
	const db = drizzle(client);

	try {
		const userRows = await db.execute(
			sql`select img from users where img is not null and img <> ''`
		);
		const eventRows = await db.execute(
			sql`select img from events where img is not null and img <> ''`
		);

		const keys = new Set<string>();
		for (const row of [...userRows, ...eventRows] as Array<{ img: string | null }>) {
			const key = fileKeyFromUploadThingUrl(row.img);
			if (key) keys.add(key);
		}

		console.log(`🔎 ${label}: found ${keys.size} referenced UploadThing keys`);
		return keys;
	} finally {
		await client.end();
	}
}

async function listAllUploadThingFiles(utapi: UTApi) {
	const files: Array<{
		name: string;
		size: number;
		customId: string | null;
		key: string;
		id: string;
		status: "Deletion Pending" | "Failed" | "Uploaded" | "Uploading";
		uploadedAt: number;
	}> = [];

	let offset = 0;
	const limit = 500;

	while (true) {
		const page = await utapi.listFiles({ limit, offset });
		files.push(...page.files);
		if (!page.hasMore) break;
		offset += page.files.length;
	}

	return files;
}

function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
	return chunks;
}

export async function cleanupUploadThingOrphans() {
	const referencedKeys = new Set<string>();

	if (LOCAL_DATABASE_URL) {
		for (const key of await collectReferencedKeys(LOCAL_DATABASE_URL, "local DB"))
			referencedKeys.add(key);
	}

	if (PROD_DATABASE_URL) {
		for (const key of await collectReferencedKeys(PROD_DATABASE_URL, "prod DB"))
			referencedKeys.add(key);
	}

	const utapi = new UTApi({ token: UPLOADTHING_TOKEN });
	console.log("📡 Listing UploadThing files...");
	const allFiles = await listAllUploadThingFiles(utapi);
	console.log(`📁 UploadThing has ${allFiles.length} total files`);

	const orphaned = allFiles.filter(
		(file) => file.status === "Uploaded" && !referencedKeys.has(file.key)
	);
	console.log(`🧹 Deleting ${orphaned.length} unreferenced uploaded files...`);

	let deletedCount = 0;
	for (const batch of chunk(orphaned, 100)) {
		const res = await utapi.deleteFiles(batch.map((f) => f.key));
		deletedCount += res.deletedCount;
		console.log(`   Deleted ${res.deletedCount}/${batch.length} in current batch`);
	}

	const keptCount = allFiles.filter((file) => referencedKeys.has(file.key)).length;
	const skippedNonUploaded = allFiles.length - orphaned.length - keptCount;

	console.log("\n✅ UploadThing cleanup complete");
	console.log(`   Referenced keys kept: ${referencedKeys.size}`);
	console.log(`   Files kept in bucket: ${keptCount}`);
	console.log(`   Files deleted: ${deletedCount}`);
	console.log(`   Non-uploaded/skipped files: ${skippedNonUploaded}`);
}

const isMain =
	typeof process.argv[1] === "string" && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
	cleanupUploadThingOrphans()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error("❌ UploadThing cleanup failed");
			console.error(error);
			process.exit(1);
		});
}
