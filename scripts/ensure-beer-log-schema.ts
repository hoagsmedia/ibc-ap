/**
 * Creates `beer_checkins` and `beer_cheers` (Beer Log) if missing. Safe to run on every Vercel build.
 */
import dotenv from "dotenv";
import path from "path";
import postgres from "postgres";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping beer log schema ensure.");
	process.exit(0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const statements = [
	`CREATE TABLE IF NOT EXISTS public.beer_checkins (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	beer_name text NOT NULL,
	brewery text,
	rating smallint NOT NULL,
	note text,
	created_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT beer_checkins_rating_check CHECK (rating BETWEEN 1 AND 5)
)`,
	`CREATE INDEX IF NOT EXISTS beer_checkins_created_at_idx ON public.beer_checkins(created_at)`,
	`CREATE INDEX IF NOT EXISTS beer_checkins_user_id_idx ON public.beer_checkins(user_id)`,
	`CREATE TABLE IF NOT EXISTS public.beer_cheers (
	checkin_id text NOT NULL REFERENCES public.beer_checkins(id) ON DELETE CASCADE,
	user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (checkin_id, user_id)
)`
];

async function main() {
	try {
		for (const statement of statements) {
			await sql.unsafe(statement);
		}
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("does not exist") && msg.includes("users")) {
			console.log("users table not found; skipping beer log ensure.");
			await sql.end();
			process.exit(0);
		}
		console.error("beer log schema ensure failed:", msg);
		process.exit(1);
	}
	console.log("beer_checkins and beer_cheers table schema ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
