#!/usr/bin/env tsx

/**
 * Script to connect uploaded UploadThing images to users in the database.
 * This fetches all uploaded files from UploadThing and matches them to users
 * based on the custom IDs that contain member numbers.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

interface ConnectionResult {
	success: boolean;
	mbrNumber: string;
	userName?: string;
	uploadUrl?: string;
	error?: string;
}

/**
 * Extract member number from UploadThing custom ID
 * Example: "profile-member-343" -> "343"
 */
function extractMbrFromCustomId(customId: string): string | null {
	const match = customId.match(/profile-member-(\d+)/);
	return match ? match[1] : null;
}

/**
 * Update user record with UploadThing URL
 */
async function updateUserImage(
	mbrNumber: string,
	uploadUrl: string
): Promise<{ success: boolean; userName?: string }> {
	try {
		const result = await db
			.update(users)
			.set({
				img: uploadUrl,
				updated_at: new Date()
			})
			.where(eq(users.mbr, parseInt(mbrNumber)))
			.returning({ id: users.id, name: users.name });

		return {
			success: result.length > 0,
			userName: result[0]?.name
		};
	} catch (error) {
		console.error(`Failed to update user with MBR ${mbrNumber}:`, error);
		return { success: false };
	}
}

async function connectUploadedImages() {
	console.log('🔗 Connecting uploaded UploadThing images to users...\n');
	console.log('🔧 Debug: Token present:', !!UPLOADTHING_TOKEN);
	console.log('🔧 Debug: Database connected:', !!db);

	try {
		const utapi = new UTApi({ token: UPLOADTHING_TOKEN });

		// Get all uploaded files
		console.log('📡 Fetching uploaded files from UploadThing...');
		const uploadedFiles = await utapi.listFiles();
		console.log('🔧 Debug: API response:', uploadedFiles);

		if (!uploadedFiles.files || uploadedFiles.files.length === 0) {
			console.log('❌ No files found in UploadThing');
			return;
		}

		console.log(`📁 Found ${uploadedFiles.files.length} files in UploadThing`);

		// Filter profile images (those with profile-mbr custom IDs)
		const profileImages = uploadedFiles.files.filter(
			(file) => file.customId && file.customId.startsWith('profile-mbr-')
		);

		console.log(`👤 Found ${profileImages.length} profile images to connect\n`);

		if (profileImages.length === 0) {
			console.log('❌ No profile images with member numbers found');
			return;
		}

		const results: ConnectionResult[] = [];
		let successCount = 0;
		let errorCount = 0;

		for (const file of profileImages) {
			const mbrNumber = extractMbrFromCustomId(file.customId!);

			if (!mbrNumber) {
				console.log(
					`⚠️  Skipping ${file.name} - no member number found in custom ID: ${file.customId}`
				);
				results.push({
					success: false,
					mbrNumber: 'unknown',
					error: 'No member number in custom ID'
				});
				errorCount++;
				continue;
			}

			try {
				console.log(`🔗 Connecting MBR ${mbrNumber} -> ${file.name}`);

				// Construct the UploadThing URL from the file key
				const uploadUrl = `https://utfs.io/f/${file.key}`;

				const updateResult = await updateUserImage(mbrNumber, uploadUrl);

				if (updateResult.success) {
					console.log(`✅ Updated ${updateResult.userName} (MBR ${mbrNumber})`);
					results.push({
						success: true,
						mbrNumber,
						userName: updateResult.userName,
						uploadUrl: uploadUrl
					});
					successCount++;
				} else {
					console.log(`❌ Failed to update user with MBR ${mbrNumber} - user not found`);
					results.push({
						success: false,
						mbrNumber,
						error: 'User not found in database'
					});
					errorCount++;
				}
			} catch (error) {
				console.error(`❌ Error processing MBR ${mbrNumber}:`, error);
				results.push({
					success: false,
					mbrNumber,
					error: error instanceof Error ? error.message : 'Unknown error'
				});
				errorCount++;
			}
		}

		// Summary
		console.log('\n🎉 Connection Summary');
		console.log('=====================');
		console.log(`✅ Successfully connected: ${successCount}`);
		console.log(`❌ Failed connections: ${errorCount}`);
		console.log(`📊 Total processed: ${successCount + errorCount}\n`);

		// Show errors if any
		const errors = results.filter((r) => !r.success);
		if (errors.length > 0) {
			console.log('❌ Failed connections:');
			errors.forEach((error) => {
				console.log(`   • MBR ${error.mbrNumber}: ${error.error}`);
			});
			console.log('');
		}

		// Show successful connections
		const successes = results.filter((r) => r.success);
		if (successes.length > 0) {
			console.log('✅ Successful connections:');
			successes.slice(0, 10).forEach((success) => {
				console.log(`   • MBR ${success.mbrNumber}: ${success.userName}`);
			});
			if (successes.length > 10) {
				console.log(`   • ... and ${successes.length - 10} more`);
			}
		}
	} catch (error) {
		console.error('💥 Failed to connect images:', error);
	} finally {
		await sql.end();
	}
}

connectUploadedImages();
