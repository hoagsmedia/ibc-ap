import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/server/db';
import { users } from '../src/lib/server/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resourcesDir = path.resolve('public/resources');

async function addMbrToFilenames() {
	if (!fs.existsSync(resourcesDir)) {
		console.error('Resources directory not found at:', resourcesDir);
		return;
	}

	// Get all users with images from database
	const usersWithImages = await db
		.select({
			id: users.id,
			name: users.name,
			img: users.img,
			mbr: users.mbr
		})
		.from(users)
		.where(isNotNull(users.img));

	if (usersWithImages.length === 0) {
		console.log('No users with images found in database');
		return;
	}

	const existingFiles = new Set(fs.readdirSync(resourcesDir));
	let count = 0;

	for (const user of usersWithImages) {
		if (!user.img || !user.name) continue;

		const currentFileName = user.img;
		const fileExtension = path.extname(currentFileName);
		const baseName = path.basename(currentFileName, fileExtension);

		// Skip if filename already has MBR number
		if (baseName.includes(`_${user.mbr}`) || baseName.includes('_no-mbr')) {
			console.log(`Skipping ${currentFileName} - already has MBR info`);
			continue;
		}

		// Generate new filename with MBR number
		const mbrPart = user.mbr ? user.mbr : 'no-mbr';
		const newFileName = `${baseName}_${mbrPart}${fileExtension}`;

		console.log(
			`Processing ${currentFileName} -> ${newFileName} for user ${user.name} (MBR: ${user.mbr || 'none'})`
		);

		// Check if the current file exists
		if (existingFiles.has(currentFileName)) {
			const oldFilePath = path.join(resourcesDir, currentFileName);
			const newFilePath = path.join(resourcesDir, newFileName);

			// Rename the file
			fs.renameSync(oldFilePath, newFilePath);
			console.log(`Renamed ${currentFileName} to ${newFileName}`);

			// Update the database record
			await db
				.update(users)
				.set({ img: newFileName, updated_at: new Date() })
				.where(eq(users.id, user.id));

			count++;
		} else {
			console.warn(
				`File ${currentFileName} does not exist in resources directory for user ${user.name}`
			);
		}
	}

	console.log(`Updated ${count} image filenames with MBR numbers`);
}

addMbrToFilenames()
	.then(() => {
		console.log('MBR numbers added to filenames successfully.');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Error adding MBR numbers to filenames:', error);
		process.exit(1);
	});
