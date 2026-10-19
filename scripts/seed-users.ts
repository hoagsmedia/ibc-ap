import { db } from "../src/lib/server/db";
import { users } from "../src/lib/server/db/schema";
import fs from "fs";
import path from "path";
const profilesPath = path.resolve("data/seed/ibc-users.json");
const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"));
import readline from "readline";

const maxUsers = 30;

function msdUtcDate(msd: string | null | undefined): Date | null {
	if (!msd) return null;
	const d = new Date(msd);
	if (!Number.isFinite(d.getTime())) return null;
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function confirmPrompt(prompt: string): Promise<boolean> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve) => {
		rl.question(`${prompt} (y/n): `, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "y");
		});
	});
}

async function seedUsers() {
	console.log("🧹 Clearing users table...");
	await db.delete(users); // ← this clears all rows
	console.log("✅ Users table cleared.");
	console.log(`📥 Seeding users from ${profilesPath}...`);

	let count = 0;
	for (const profile of profiles.slice(0, maxUsers)) {
		if (!profile.name) continue;
		await db
			.insert(users)
			.values({
				id: profile.id,
				name: profile.name,
				email: profile.email,
				password_hash: profile.password_hash, // Use the provided password hash
				role: profile.role || "member", // Default to 'member' if no role is provided
				bio: profile.bio || null,
				hobbies: profile.hobbies || null,
				img: profile.img || null,
				likes: profile.likes || null,
				mbr: profile.mbr || null,
				msd: msdUtcDate(profile.msd),
				sponsor: profile.sponsor || null,
				test_passed: profile.msd ? new Date(profile.msd) : null,
				account_active: true,
				website_first_login_at: new Date()
			})
			.onConflictDoUpdate({
				target: users.id,
				set: {
					name: profile.name,
					email: profile.email,
					password_hash: profile.password_hash,
					role: profile.role || "member",
					bio: profile.bio || null,
					hobbies: profile.hobbies || null,
					img: profile.img || null,
					likes: profile.likes || null,
					mbr: profile.mbr || null,
					msd: msdUtcDate(profile.msd),
					sponsor: profile.sponsor || null,
					test_passed: profile.msd ? new Date(profile.msd) : null,
					account_active: true,
					website_first_login_at: new Date(),
					updated_at: new Date()
				}
			});
		count++;
	}
	console.log(`Seeded ${count} users from ${profilesPath}`);
}

const environment = process.env.NODE_ENV || "development";

console.log(`⚠️  You are about to seed ${maxUsers} users into the "${environment}" environment.`);

confirmPrompt("Do you want to continue?").then((confirmed) => {
	if (!confirmed) {
		console.log("❌ Operation cancelled.");
		process.exit(0);
	}

	seedUsers()
		.then(() => {
			console.log("✅ Users seeded successfully!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Error seeding users:", error);
			process.exit(1);
		});
});
