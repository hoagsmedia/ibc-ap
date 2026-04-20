/**
 * Idempotent: adds invitation_tokens.invite_name / inviter_name if missing.
 * Safe to run on every Vercel build.
 */
import dotenv from "dotenv";
import path from "path";
import postgres from "postgres";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const prod = process.argv.includes("--prod");
if (prod) {
	const neon = process.env.DATABASE_URL_PROD?.trim();
	if (!neon) {
		console.error("DATABASE_URL_PROD is not set. Cannot ensure invitation_tokens schema on Neon.");
		process.exit(1);
	}
	process.env.DATABASE_URL = neon;
	console.log("Using DATABASE_URL_PROD (Neon) for invitation_tokens schema ensure.");
}

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping invitation_tokens schema ensure.");
	process.exit(prod ? 1 : 0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const statements = [
	`ALTER TABLE public.invitation_tokens ADD COLUMN IF NOT EXISTS invite_name text`,
	`ALTER TABLE public.invitation_tokens ADD COLUMN IF NOT EXISTS inviter_name text`
];

async function main() {
	for (const statement of statements) {
		try {
			await sql.unsafe(statement);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes("does not exist") && msg.includes("invitation_tokens")) {
				console.log("invitation_tokens table not found; skipping schema ensure.");
				await sql.end();
				process.exit(0);
			}
			console.error("invitation_tokens schema ensure failed:", msg);
			process.exit(1);
		}
	}
	console.log("invitation_tokens table schema ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
