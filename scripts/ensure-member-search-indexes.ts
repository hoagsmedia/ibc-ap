/**
 * Idempotent: pg_trgm extension + GIN indexes for member directory ILIKE search.
 * Safe to run on every Vercel build (CREATE INDEX IF NOT EXISTS).
 * Run with: tsx scripts/ensure-member-search-indexes.ts
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
		console.error("DATABASE_URL_PROD is not set. Cannot ensure member search indexes on Neon.");
		process.exit(1);
	}
	process.env.DATABASE_URL = neon;
	console.log("Using DATABASE_URL_PROD (Neon) for member search index ensure.");
}

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping member search index ensure.");
	process.exit(0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const statements = [
	`CREATE EXTENSION IF NOT EXISTS pg_trgm`,
	`CREATE INDEX IF NOT EXISTS users_name_trgm_idx ON public.users USING gin (name gin_trgm_ops)`,
	`CREATE INDEX IF NOT EXISTS users_email_trgm_idx ON public.users USING gin (email gin_trgm_ops)`,
	`CREATE INDEX IF NOT EXISTS users_username_trgm_idx ON public.users USING gin (username gin_trgm_ops)`
];

async function main() {
	for (const statement of statements) {
		try {
			await sql.unsafe(statement);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes("does not exist") && msg.includes("users")) {
				console.log("Users table not found; skipping member search index ensure.");
				await sql.end();
				process.exit(0);
			}
			if (msg.includes("already exists")) {
				continue;
			}
			console.error("Member search index ensure failed:", msg);
			process.exit(1);
		}
	}
	console.log("Member search pg_trgm indexes ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
