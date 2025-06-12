#!/usr/bin/env tsx

/**
 * Script to manually connect the remaining users to their UploadThing images
 * by checking if their images exist with different naming patterns.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/lib/server/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';
import { config } from 'dotenv';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error('❌ DATABASE_URL environment variable is required');
	process.exit(1);
}

const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;
if (!UPLOADTHING_TOKEN) {
	console.error('❌ UPLOADTHING_TOKEN environment variable is required');
	process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function findMissingConnections() {
	console.log('🔍 Finding remaining users without UploadThing URLs...\n');
	console.log('🔧 Debug: Starting script...');

	try {
		// Get users still with local image paths
		const localImageUsers = await db
			.select({
				id: users.id,
				mbr: users.mbr,
				name: users.name,
				img: users.img
			})
			.from(users)
			.where(isNotNull(users.img))
			.orderBy(users.mbr);

		const stillLocal = localImageUsers.filter(
			(user) => user.img && !user.img.startsWith('https://utfs.io/')
		);

		console.log(`📁 Found ${stillLocal.length} users still with local images:`);
		stillLocal.forEach((user) => {
			console.log(`  • MBR ${user.mbr}: ${user.name} -> ${user.img}`);
		});

		// Get all UploadThing files
		const utapi = new UTApi({ token: UPLOADTHING_TOKEN });
		const uploadedFiles = await utapi.listFiles();

		if (!uploadedFiles.files) {
			console.log('❌ No files found in UploadThing');
			return;
		}

		console.log(`\n🔍 Searching UploadThing for images matching these users...\n`);

		for (const user of stillLocal) {
			if (!user.mbr) continue;

			console.log(`🔎 Looking for MBR ${user.mbr} (${user.name}):`);

			// Search for files with this member number
			const matchingFiles = uploadedFiles.files.filter((file) => {
				const customId = file.customId || '';
				const name = file.name.toLowerCase();
				const userNameParts = user.name.toLowerCase().split(' ');

				// Check if custom ID contains the member number
				const hasCustomIdMatch = customId.includes(`profile-mbr-${user.mbr}-`);

				// Check if filename contains the member number
				const hasFilenameMatch = name.includes(`_${user.mbr}.`) || name.includes(`_${user.mbr}_`);

				// Check if filename contains user's name parts
				const hasNameMatch = userNameParts.some(
					(part) => part.length > 2 && name.includes(part.toLowerCase())
				);

				return hasCustomIdMatch || hasFilenameMatch || hasNameMatch;
			});

			if (matchingFiles.length > 0) {
				console.log(`  ✅ Found ${matchingFiles.length} potential matches:`);
				matchingFiles.forEach((file) => {
					console.log(`     - ${file.name} (customId: ${file.customId})`);
				});

				// Use the first match
				const bestMatch = matchingFiles[0];
				const uploadUrl = `https://utfs.io/f/${bestMatch.key}`;

				try {
					const result = await db
						.update(users)
						.set({
							img: uploadUrl,
							updated_at: new Date()
						})
						.where(eq(users.mbr, user.mbr))
						.returning({ id: users.id, name: users.name });

					if (result.length > 0) {
						console.log(`     ✅ Connected ${user.name} to ${bestMatch.name}`);
					} else {
						console.log(`     ❌ Failed to update database for ${user.name}`);
					}
				} catch (error) {
					console.error(`     ❌ Database error for ${user.name}:`, error);
				}
			} else {
				console.log(`  ❌ No matching files found for ${user.name}`);

				// Show some examples of available files to help debug
				const sampleFiles = uploadedFiles.files.slice(0, 3).map((f) => f.name);
				console.log(`     Sample available files: ${sampleFiles.join(', ')}`);
			}
			console.log('');
		}
	} catch (error) {
		console.error('💥 Error finding missing connections:', error);
	} finally {
		await sql.end();
	}
}

findMissingConnections();
