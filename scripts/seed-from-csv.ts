import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';

// Ensure .env.local is loaded from project root (script may run from different cwd)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { hash } from 'argon2';
import { db } from '../src/lib/server/db';
import { users } from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { runSyncUploadthingImages } from './sync-uploadthing-images';

const CSV_PATH = path.resolve('data/seed/member_data_19feb26.csv');
const DB_QUERY_TIMEOUT_MS = 30_000; // 30 seconds - fail fast if DB is unreachable

const VALID_ROLES = ['guest', 'member', 'admin'] as const;

function confirmPrompt(prompt: string): Promise<boolean> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise((resolve) => {
		rl.question(`${prompt} (y/n): `, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === 'y');
		});
	});
}

function trim(s: unknown): string {
	if (s == null || typeof s !== 'string') return '';
	return s.trim();
}

function lastnamembr(lastName: string, mbr: string): string {
	const last = lastName.toLowerCase().replace(/\W/g, '');
	const m = String(mbr).trim().replace(/\./g, '_').replace(/\W/g, '');
	return last + m;
}

function ensureUniqueUsernameSync(
	base: string,
	usedThisRun: Set<string>,
	existingUsernameToId: Map<string, string>,
	excludeUserId: string
): string {
	let candidate = base;
	let suffix = 0;
	const isTaken = (c: string) =>
		usedThisRun.has(c) || (existingUsernameToId.get(c) != null && existingUsernameToId.get(c) !== excludeUserId);
	while (isTaken(candidate)) {
		suffix++;
		candidate = base.length > 60 ? base.slice(0, 60) + '_' + suffix : base + '_' + suffix;
	}
	usedThisRun.add(candidate);
	return candidate;
}

function parseMsd(msd: string): Date | null {
	if (!trim(msd)) return null;
	try {
		const d = new Date(msd);
		if (isNaN(d.getTime())) return null;
		return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
	} catch {
		return null;
	}
}

async function seedFromCsv() {
	const raw = fs.readFileSync(CSV_PATH, 'utf-8');
	const lines = raw.split(/\r?\n/);
	if (lines.length < 2) {
		console.error('CSV has no header or data.');
		process.exit(1);
	}
	// Skip first line ("Table 1"), use second as header
	const headerLine = lines[1];
	const dataLines = lines.slice(2).filter((l) => l.trim());
	const allLines = [headerLine, ...dataLines];
	const records = parse(allLines.join('\n'), {
		columns: true,
		skip_empty_lines: true,
		relax_column_count: true,
		bom: true
	});

	const dbHost = process.env.DATABASE_URL?.replace(/^[^@]+@/, '***@') ?? 'unknown';
	console.log(`Target DB: ${dbHost}`);
	console.log(`📥 Parsed ${records.length} rows from ${CSV_PATH}`);

	// Load all existing users once (id, name, username) to avoid N+1 queries
	console.log('   Loading existing users from DB...');
	const selectPromise = db.select({ id: users.id, name: users.name, username: users.username, email: users.email }).from(users);
	const timeoutPromise = new Promise<never>((_, reject) =>
		setTimeout(
			() => reject(new Error(`DB query timed out after ${DB_QUERY_TIMEOUT_MS / 1000}s. Check that Postgres is running and DATABASE_URL in .env.local is correct.`)),
			DB_QUERY_TIMEOUT_MS
		)
	);
	const allUsers = await Promise.race([selectPromise, timeoutPromise]);
	const existingUserById = new Map(allUsers.map((u) => [u.id, u]));
	const existingEmails = new Set<string>();
	const existingUsernameToId = new Map<string, string>();
	for (const u of allUsers) {
		if (u.email) existingEmails.add(u.email);
		if (u.username) existingUsernameToId.set(u.username, u.id);
	}
	console.log(`   Loaded ${allUsers.length} existing users from DB.`);

	const defaultPasswordHash = await hash("CHANGE_ME_DEV_ONLY");

	let skippedNoId = 0;
	const usedUsernames = new Set<string>();
	const insertedEmails = new Set<string>();
	const emailsAssignedInUpdates = new Set<string>();
	const updates: { id: string; set: Record<string, unknown> }[] = [];
	const inserts: Record<string, unknown>[] = [];

	for (const row of records) {
		const id = trim(row.id);
		if (!id) {
			skippedNoId++;
			continue;
		}

		const firstName = trim(row.first_name);
		const lastName = trim(row.last_name);
		const emailRaw = trim(row.email);
		const mbrRaw = trim(row.mbr);
		const msdRaw = trim(row.msd);
		const sponsor = trim(row.sponsor);
		const dopsRaw = trim(row.dops);
		const roleRaw = trim(row.role);
		const bio = trim(row.bio);
		const hobbies = trim(row.hobbies);
		const img = trim(row.img);
		const likes = trim(row.likes);

		const name = [firstName, lastName].filter(Boolean).join(" ").trim() || "Unknown";
		const mbrNum = mbrRaw !== "" && !Number.isNaN(parseFloat(mbrRaw)) ? Math.round(parseFloat(mbrRaw)) : null;
		const msd = parseMsd(msdRaw);
		const role = roleRaw && VALID_ROLES.includes(roleRaw as (typeof VALID_ROLES)[number]) ? roleRaw : "member";
		const dops = !!dopsRaw;

		const existing = existingUserById.get(id);
		if (existing) {
			// Update existing user
			const set: Record<string, unknown> = { updated_at: new Date() };
			if (firstName || lastName) set.name = name;
			// Only set email if not already taken by another user (inserted, existing, or assigned in another update this run)
			if (emailRaw && emailRaw.includes("@")) {
				const takenByOther =
					insertedEmails.has(emailRaw) ||
					emailsAssignedInUpdates.has(emailRaw) ||
					(existingEmails.has(emailRaw) && existing.email !== emailRaw);
				if (!takenByOther) {
					set.email = emailRaw;
					emailsAssignedInUpdates.add(emailRaw);
				}
			}
			if (mbrNum != null) set.mbr = mbrNum;
			if (msd) set.msd = msd;
			if (sponsor) set.sponsor = sponsor;
			if (dopsRaw) set.dops = true;
			if (roleRaw && VALID_ROLES.includes(roleRaw as (typeof VALID_ROLES)[number])) set.role = roleRaw;
			if (bio) set.bio = bio;
			if (hobbies) set.hobbies = hobbies;
			if (img) {
				if (img.startsWith("http://") || img.startsWith("https://")) set.img = img;
				else set.img = null;
			}
			if (likes) set.likes = likes;

			if (!emailRaw || !emailRaw.includes("@")) {
				set.email = null;
				if (lastName && mbrRaw !== "") {
					const base = lastnamembr(lastName, mbrRaw);
					if (base.length <= 64) set.username = ensureUniqueUsernameSync(base, usedUsernames, existingUsernameToId, id);
				}
			} else if (lastName && mbrRaw !== "") {
				const base = lastnamembr(lastName, mbrRaw);
				if (base.length <= 64) set.username = ensureUniqueUsernameSync(base, usedUsernames, existingUsernameToId, id);
			}
			// Reseed password so everyone has valid Argon2 hash for CHANGE_ME_DEV_ONLY (fixes manual/legacy plain text)
			set.password_hash = defaultPasswordHash;

			const keys = Object.keys(set).filter((k) => k !== "updated_at");
			if (keys.length > 0) updates.push({ id, set });
		} else {
			// Insert new user (from CSV, not yet in DB)
			let email: string | null = emailRaw && emailRaw.includes("@") ? emailRaw : null;
			if (email && (existingEmails.has(email) || insertedEmails.has(email))) {
				email = null;
			}
			if (email) insertedEmails.add(email);
			let username: string | null = null;
			if (lastName && mbrRaw !== "") {
				const base = lastnamembr(lastName, mbrRaw);
				if (base.length <= 64) username = ensureUniqueUsernameSync(base, usedUsernames, existingUsernameToId, id);
			}
			inserts.push({
				id,
				name,
				email,
				username,
				password_hash: defaultPasswordHash,
				role,
				mbr: mbrNum,
				msd,
				sponsor: sponsor || null,
				dops,
				dops_date: null,
				bio: bio || null,
				hobbies: hobbies || null,
				img: null,
				likes: likes || null,
				test_passed: null,
				created_at: new Date(),
				updated_at: new Date()
			});
			if (username) existingUsernameToId.set(username, id);
		}
	}

	const BATCH_SIZE = 50;

	if (inserts.length > 0) {
		const numBatches = Math.ceil(inserts.length / BATCH_SIZE);
		console.log(`   Inserting ${inserts.length} new users in ${numBatches} batch(es)...`);
		for (let i = 0; i < inserts.length; i += BATCH_SIZE) {
			const batch = inserts.slice(i, i + BATCH_SIZE);
			await Promise.all(batch.map((row) => db.insert(users).values(row as Record<string, unknown>)));
			if (numBatches > 1) console.log(`   Insert batch ${Math.floor(i / BATCH_SIZE) + 1}/${numBatches} done.`);
		}
		console.log(`✅ Inserted ${inserts.length} users.`);
	}

	if (updates.length > 0) {
		const numBatches = Math.ceil(updates.length / BATCH_SIZE);
		console.log(`   Applying ${updates.length} updates in ${numBatches} batch(es)...`);
		for (let i = 0; i < updates.length; i += BATCH_SIZE) {
			const batch = updates.slice(i, i + BATCH_SIZE);
			await Promise.all(
				batch.map(({ id, set }) => db.update(users).set(set as Record<string, unknown>).where(eq(users.id, id)))
			);
			if (numBatches > 1) console.log(`   Update batch ${Math.floor(i / BATCH_SIZE) + 1}/${numBatches} done.`);
		}
		console.log(`✅ Updated ${updates.length} users.`);
	}

	console.log(`   Skipped (no id): ${skippedNoId}`);

	// Sync img from UploadThing bucket (profile-images-firstname_lastname_mbr.jpg or customId profile-mbr-*)
	if (process.env.UPLOADTHING_TOKEN) {
		console.log("\n📷 Syncing profile images from UploadThing bucket...");
		await runSyncUploadthingImages();
	} else {
		console.log("\n⚠️  UPLOADTHING_TOKEN not set; skipping image sync. Run pnpm db:sync:images later.");
	}
}

const dbHost = process.env.DATABASE_URL?.replace(/^[^@]+@/, '***@') ?? 'unknown';
console.log(`⚠️  You are about to update users from CSV into ${dbHost}.`);

confirmPrompt('Continue?')
	.then((ok) => {
		if (!ok) {
			console.log('Cancelled.');
			process.exit(0);
		}
		return seedFromCsv();
	})
	.then(() => {
		console.log('Done.');
		process.exit(0);
	})
	.catch((err) => {
		console.error('Error:', err);
		process.exit(1);
	});
