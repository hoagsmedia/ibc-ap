#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/lib/server/db/schema';
import { isNotNull } from 'drizzle-orm';
import { config } from 'dotenv';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error('❌ DATABASE_URL environment variable is required');
	process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function checkImageStatus() {
	console.log('🔍 Checking current image status for all users...\n');

	try {
		// Get all users with images
		const allUsers = await db
			.select({
				id: users.id,
				mbr: users.mbr,
				name: users.name,
				img: users.img
			})
			.from(users)
			.where(isNotNull(users.img))
			.orderBy(users.mbr);

		const uploadthingUsers = allUsers.filter((user) => user.img?.startsWith('https://utfs.io/'));

		const localImageUsers = allUsers.filter(
			(user) => user.img && !user.img.startsWith('https://utfs.io/')
		);

		console.log(`📊 Image Status Summary:`);
		console.log(`Total users with images: ${allUsers.length}`);
		console.log(`✅ UploadThing URLs: ${uploadthingUsers.length}`);
		console.log(`📁 Local image paths: ${localImageUsers.length}\n`);

		if (uploadthingUsers.length > 0) {
			console.log('✅ Users with UploadThing URLs (sample):');
			uploadthingUsers.slice(0, 5).forEach((user) => {
				console.log(`  • MBR ${user.mbr}: ${user.name} -> ${user.img}`);
			});
			if (uploadthingUsers.length > 5) {
				console.log(`  ... and ${uploadthingUsers.length - 5} more\n`);
			} else {
				console.log('');
			}
		}

		if (localImageUsers.length > 0) {
			console.log('📁 Users still with local image paths (sample):');
			localImageUsers.slice(0, 10).forEach((user) => {
				console.log(`  • MBR ${user.mbr}: ${user.name} -> ${user.img}`);
			});
			if (localImageUsers.length > 10) {
				console.log(`  ... and ${localImageUsers.length - 10} more\n`);
			} else {
				console.log('');
			}
		}

		// Check for specific mbr patterns
		const mbrPattern = localImageUsers.map((user) => ({
			mbr: user.mbr,
			expectedFilename: `${user.mbr}.jpg`,
			currentPath: user.img
		}));

		console.log('🔗 Sample mbr-to-filename mappings:');
		mbrPattern.slice(0, 5).forEach((mapping) => {
			console.log(
				`  • MBR ${mapping.mbr} -> Expected: ${mapping.expectedFilename} | Current: ${mapping.currentPath}`
			);
		});
	} catch (error) {
		console.error('❌ Error checking image status:', error);
	} finally {
		await sql.end();
	}
}

checkImageStatus();
