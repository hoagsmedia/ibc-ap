/**
 * Idempotent: stats_keg_credits + stats_beer_consumed (IBC-42).
 * Safe to run on every Vercel build.
 */
import dotenv from "dotenv";
import path from "path";
import postgres from "postgres";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping stats schema ensure.");
	process.exit(0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const statements = [
	`CREATE TABLE IF NOT EXISTS public.stats_keg_credits (
		id text PRIMARY KEY,
		sort_order integer NOT NULL UNIQUE,
		member_label text NOT NULL,
		credits double precision NOT NULL,
		is_cik boolean NOT NULL DEFAULT false,
		created_at timestamptz NOT NULL DEFAULT now(),
		updated_at timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS public.stats_beer_consumed (
		id text PRIMARY KEY,
		keg_number integer NOT NULL UNIQUE,
		beer_name text,
		purchased_on date,
		delivered_on date,
		finished_on date,
		gallons double precision NOT NULL,
		created_at timestamptz NOT NULL DEFAULT now(),
		updated_at timestamptz NOT NULL DEFAULT now()
	)`
];

async function main() {
	for (const statement of statements) {
		try {
			await sql.unsafe(statement);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error("Stats schema ensure failed:", msg);
			process.exit(1);
		}
	}
	console.log("Stats tables ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
