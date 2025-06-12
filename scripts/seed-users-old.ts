import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hash } from '@node-rs/argon2';
import { db } from '../src/lib/server/db';
import { users } from '../src/lib/server/db/schema';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Load and parse the JSON file
const profilesPath = path.resolve('static/parsedProfiles.json');
const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));

async function seed() {
	const emailTracker = new Set<string>();
	let insertedCount = 0;

	// Hash the default password once for all users
	console.log('Generating password hash for default password...');
	const defaultpassword_hash = await hash('CHANGE_ME_DEV_ONLY', {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	for (const profile of profiles) {
		if (!profile.name) continue;

		// Convert mbr to integer, handle non-numeric values
		let mbrNumber: number | null = null;
		if (profile.mbr && profile.mbr !== 'False' && !isNaN(Number(profile.mbr))) {
			mbrNumber = Number(profile.mbr);
		}

		// Generate unique email
		const baseEmail = `${profile.name.replace(/\s+/g, '').toLowerCase()}@example.com`;
		let email = baseEmail;
		let counter = 1;

		while (emailTracker.has(email)) {
			email = `${profile.name.replace(/\s+/g, '').toLowerCase()}${counter}@example.com`;
			counter++;
		}
		emailTracker.add(email);

		await db.insert(users).values({
			id: randomUUID(),
			name: profile.name,
			email: email,
			password_hash: defaultpassword_hash, // Set a dummy hash for dev
			bio: profile.bio ?? null,
			hobbies: profile.hobbies ?? null,
			img: profile.img ?? null,
			role: 'member',
			likes: profile.likes ?? null,
			mbr: mbrNumber,
			msd: profile.msd ? new Date(profile.msd).toISOString().split('T')[0] : null,
			sponsor: profile.sponsor ?? null
		});

		insertedCount++;
	}
	console.log(`Seeded ${insertedCount} users from parsedProfiles.json`);
}

seed().then(() => process.exit(0));
