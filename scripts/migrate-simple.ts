#!/usr/bin/env tsx

/**
 * Simple migration script to upload existing profile images from /static/resources/ to UploadThing
 * and update the user records in the database using direct UploadThing API
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { db } from '../src/lib/server/db';
import { users } from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

interface MigrationResult {
	success: boolean;
	filename: string;
	mbrNumber?: string;
	uploadUrl?: string;
	error?: string;
}

/**
 * Extract member number from filename
 * Examples: "josh_hoagland_343.jpg" -> "343", "aubrie_hill_no-mbr.jpg" -> null
 */
function extractMbrFromFilename(filename: string): string | null {
	const match = filename.match(/_(\d+)\./);
	return match ? match[1] : null;
}

/**
 * Get content type based on file extension
 */
function getContentType(filename: string): string {
	const ext = filename.toLowerCase().split('.').pop();
	switch (ext) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		case 'gif':
			return 'image/gif';
		default:
			return 'image/jpeg';
	}
}

/**
 * Upload a single file to UploadThing using direct API
 */
async function uploadFileToUploadThing(filePath: string, filename: string): Promise<string> {
	const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;
	if (!UPLOADTHING_TOKEN) {
		throw new Error('UPLOADTHING_TOKEN not found in environment variables');
	}

	try {
		const fileBuffer = await readFile(filePath);

		// Step 1: Request upload URL from UploadThing
		const uploadRequest = await fetch('https://uploadthing.com/api/uploadFiles', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${UPLOADTHING_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				files: [
					{
						name: filename,
						size: fileBuffer.length,
						type: getContentType(filename)
					}
				],
				routeSlug: 'profileImageUploader'
			})
		});

		if (!uploadRequest.ok) {
			throw new Error(`Failed to request upload URL: ${uploadRequest.status}`);
		}

		const uploadData = await uploadRequest.json();
		const uploadUrl = uploadData.data[0]?.ufsUrl || uploadData.data[0]?.url; // Support both new and legacy
		const presignedUrl = uploadData.data[0]?.presignedUrl;

		if (!presignedUrl || !uploadUrl) {
			throw new Error('No upload URL received from UploadThing');
		}

		// Step 2: Upload file to the presigned URL
		const uploadResponse = await fetch(presignedUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': getContentType(filename)
			},
			body: fileBuffer
		});

		if (!uploadResponse.ok) {
			throw new Error(`Failed to upload file: ${uploadResponse.status}`);
		}

		return uploadUrl;
	} catch (error) {
		console.error(`Failed to upload ${filename}:`, error);
		throw error;
	}
}

/**
 * Update user record with new UploadThing URL
 */
async function updateUserImage(mbrNumber: string, uploadUrl: string): Promise<boolean> {
	try {
		const result = await db
			.update(users)
			.set({
				img: uploadUrl,
				updated_at: new Date()
			})
			.where(eq(users.mbr, parseInt(mbrNumber)))
			.returning({ id: users.id });

		return result.length > 0;
	} catch (error) {
		console.error(`Failed to update user with MBR ${mbrNumber}:`, error);
		return false;
	}
}

/**
 * Main migration function
 */
async function migrateProfileImages(): Promise<void> {
	const resourcesPath = join(process.cwd(), 'static', 'resources');
	const results: MigrationResult[] = [];

	try {
		console.log('🚀 Starting profile image migration to UploadThing...');
		console.log(`📁 Reading files from: ${resourcesPath}`);

		const files = await readdir(resourcesPath);
		const imageFiles = files.filter(
			(file) => file.match(/\.(jpg|jpeg|png|gif)$/i) && !file.includes('no-mbr')
		);

		console.log(`📸 Found ${imageFiles.length} profile images to migrate`);
		console.log(
			`🚫 Skipping ${files.filter((f) => f.includes('no-mbr')).length} files with 'no-mbr'`
		);

		let successCount = 0;
		let errorCount = 0;

		for (const filename of imageFiles) {
			const mbrNumber = extractMbrFromFilename(filename);

			if (!mbrNumber) {
				console.log(`⚠️  Skipping ${filename} - no member number found`);
				results.push({
					success: false,
					filename,
					error: 'No member number found in filename'
				});
				errorCount++;
				continue;
			}

			try {
				console.log(`📤 Uploading ${filename} for MBR ${mbrNumber}...`);

				const filePath = join(resourcesPath, filename);
				const uploadUrl = await uploadFileToUploadThing(filePath, filename);

				console.log(`✅ Uploaded successfully: ${uploadUrl}`);

				const updateSuccess = await updateUserImage(mbrNumber, uploadUrl);

				if (updateSuccess) {
					console.log(`💾 Updated database for MBR ${mbrNumber}`);
					results.push({
						success: true,
						filename,
						mbrNumber,
						uploadUrl
					});
					successCount++;
				} else {
					console.log(`⚠️  Upload succeeded but database update failed for MBR ${mbrNumber}`);
					results.push({
						success: false,
						filename,
						mbrNumber,
						uploadUrl,
						error: 'Database update failed'
					});
					errorCount++;
				}

				// Add a small delay to avoid rate limiting
				await new Promise((resolve) => setTimeout(resolve, 2000));
			} catch (error) {
				console.error(`❌ Failed to process ${filename}:`, error);
				results.push({
					success: false,
					filename,
					mbrNumber,
					error: error instanceof Error ? error.message : 'Unknown error'
				});
				errorCount++;
			}
		}

		console.log('\n🎉 Migration completed!');
		console.log(`✅ Success: ${successCount}`);
		console.log(`❌ Errors: ${errorCount}`);
		console.log(`📊 Total: ${successCount + errorCount}`);

		// Show detailed results for errors
		const errors = results.filter((r) => !r.success);
		if (errors.length > 0) {
			console.log('\n❌ Failed migrations:');
			errors.forEach((error) => {
				console.log(`  - ${error.filename}: ${error.error}`);
			});
		}

		// Show successful uploads
		const successes = results.filter((r) => r.success);
		if (successes.length > 0) {
			console.log('\n✅ Successful migrations:');
			successes.forEach((success) => {
				console.log(`  - MBR ${success.mbrNumber}: ${success.filename} -> ${success.uploadUrl}`);
			});
		}
	} catch (error) {
		console.error('💥 Migration failed:', error);
		process.exit(1);
	}
}

// Run the migration
if (require.main === module) {
	migrateProfileImages()
		.then(() => {
			console.log('✨ Migration script completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('💥 Migration script failed:', error);
			process.exit(1);
		});
}

export { migrateProfileImages };
