#!/usr/bin/env tsx

/**
 * Migration script to upload existing profile images from /static/resources/ to UploadThing
 * and update the user records in the database.
 *
 * Usage: npm run migrate:images
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { db } from '../src/lib/server/db';
import { users } from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { UTApi, UTFile } from 'uploadthing/server';
import 'dotenv/config';

/**
 * Safe console logging that handles EPIPE errors
 */
function safeLog(message: string): void {
	try {
		console.log(message);
	} catch (error) {
		// Handle EPIPE errors gracefully
		if (error && typeof error === 'object' && 'code' in error && error.code === 'EPIPE') {
			process.exit(0);
		}
		throw error;
	}
}

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
 * Upload a single file to UploadThing using UTApi with UTFile and customId
 */
async function uploadFileToUploadThing(filePath: string, filename: string): Promise<string> {
	const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;
	if (!UPLOADTHING_TOKEN) {
		throw new Error('UPLOADTHING_TOKEN not found in environment variables');
	}

	try {
		const fileBuffer = await readFile(filePath);
		const utapi = new UTApi({ token: UPLOADTHING_TOKEN });

		// Extract member number for customId with timestamp to avoid duplicates
		const mbrNumber = extractMbrFromFilename(filename);
		const timestamp = Date.now();
		const customId = mbrNumber ? `profile-mbr-${mbrNumber}-${timestamp}` : `profile-${timestamp}`;

		// Create UTFile with unique customId for better organization
		const file = new UTFile([fileBuffer], `profile-images-${filename}`, {
			type: getContentType(filename),
			customId: customId
		});

		const response = await utapi.uploadFiles([file]);

		// Handle response - UTApi returns an array of results
		const result = response[0];
		if (!result) {
			throw new Error('No upload result returned');
		}

		if (result.error) {
			// Check if it's a duplicate entry error
			if (
				result.error.message.includes('Duplicate entry') ||
				result.error.message.includes('AlreadyExists')
			) {
				console.warn(`⚠️  File ${filename} already exists in UploadThing, skipping...`);
				// Return a placeholder URL - we'll handle this in the calling function
				throw new Error('DUPLICATE_FILE');
			}
			throw new Error(`Upload failed: ${result.error.message}`);
		}

		// Use only ufsUrl for UploadThing v9 compatibility
		if (!result.data?.ufsUrl) {
			throw new Error('Upload succeeded but no URL returned');
		}

		return result.data.ufsUrl;
	} catch (error) {
		if (error instanceof Error && error.message === 'DUPLICATE_FILE') {
			throw error; // Re-throw duplicate errors to handle them specially
		}
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
async function runMigration(): Promise<void> {
	const resourcesPath = join(process.cwd(), 'static', 'resources');
	const results: MigrationResult[] = [];

	safeLog('🚀 Island Beer Club Profile Image Migration');
	safeLog('==========================================\n');

	// Validate environment
	if (!process.env.UPLOADTHING_TOKEN) {
		console.error('❌ UPLOADTHING_TOKEN not found in environment variables');
		process.exit(1);
	}

	try {
		safeLog(`📁 Reading files from: ${resourcesPath}`);

		const files = await readdir(resourcesPath);
		const imageFiles = files.filter(
			(file) => file.match(/\.(jpg|jpeg|png|gif)$/i) && !file.includes('no-mbr')
		);

		safeLog(`📸 Found ${imageFiles.length} profile images to migrate`);
		safeLog(
			`🚫 Skipping ${files.filter((f) => f.includes('no-mbr')).length} files with 'no-mbr'\n`
		);

		if (imageFiles.length === 0) {
			safeLog('No images to migrate. Exiting.');
			return;
		}

		let successCount = 0;
		let errorCount = 0;

		for (const filename of imageFiles) {
			const mbrNumber = extractMbrFromFilename(filename);

			if (!mbrNumber) {
				safeLog(`⚠️  Skipping ${filename} - no member number found`);
				results.push({
					success: false,
					filename,
					error: 'No member number found in filename'
				});
				errorCount++;
				continue;
			}

			try {
				// Reduced verbosity - only show progress every 10 files or for important events
				if (successCount % 10 === 0 || imageFiles.length < 20) {
					safeLog(`📤 Uploading ${filename} for MBR ${mbrNumber}...`);
				}

				const filePath = join(resourcesPath, filename);
				const uploadUrl = await uploadFileToUploadThing(filePath, filename);

				const updateSuccess = await updateUserImage(mbrNumber, uploadUrl);

				if (updateSuccess) {
					if (successCount % 10 === 0 || imageFiles.length < 20) {
						safeLog(`✅ MBR ${mbrNumber} completed`);
					}
					results.push({
						success: true,
						filename,
						mbrNumber,
						uploadUrl
					});
					successCount++;
				} else {
					safeLog(`⚠️  Upload succeeded but database update failed for MBR ${mbrNumber}`);
					results.push({
						success: false,
						filename,
						mbrNumber,
						uploadUrl,
						error: 'Database update failed'
					});
					errorCount++;
				}

				// Rate limiting delay
				await new Promise((resolve) => setTimeout(resolve, 1500));
			} catch (error) {
				// Handle duplicate file errors specially
				if (error instanceof Error && error.message === 'DUPLICATE_FILE') {
					safeLog(`⏭️  Skipping ${filename} - already exists in UploadThing`);
					results.push({
						success: false,
						filename,
						mbrNumber,
						error: 'File already exists in UploadThing'
					});
					errorCount++;
					continue; // Skip the delay for duplicates
				}

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

		// Summary
		safeLog('\n🎉 Migration Summary');
		safeLog('===================');
		safeLog(`✅ Successful: ${successCount}`);
		safeLog(`❌ Failed: ${errorCount}`);
		safeLog(`📊 Total processed: ${successCount + errorCount}\n`);

		// Show errors if any
		const errors = results.filter((r) => !r.success);
		if (errors.length > 0) {
			safeLog('❌ Failed migrations:');
			errors.forEach((error) => {
				safeLog(`   • ${error.filename}: ${error.error}`);
			});
			safeLog('');
		}

		// Show successful uploads (limited to prevent output overflow)
		const successes = results.filter((r) => r.success);
		if (successes.length > 0) {
			safeLog('✅ Successful migrations:');
			successes.slice(0, 5).forEach((success) => {
				safeLog(`   • MBR ${success.mbrNumber}: ${success.filename}`);
			});
			if (successes.length > 5) {
				safeLog(`   • ... and ${successes.length - 5} more`);
			}
		}

		if (errorCount > 0) {
			process.exit(1);
		}
	} catch (error) {
		console.error('💥 Migration failed:', error);
		process.exit(1);
	}
}

// Auto-run the migration (this file is meant to be executed directly)
runMigration()
	.then(() => {
		try {
			safeLog('\n✨ Migration completed successfully!');
		} catch {
			// If we can't log the success message due to EPIPE, just exit cleanly
		}
		process.exit(0);
	})
	.catch((error) => {
		try {
			console.error('\n💥 Migration failed:', error);
		} catch {
			// If we can't log the error due to EPIPE, just exit with error code
		}
		process.exit(1);
	});

export { runMigration };
