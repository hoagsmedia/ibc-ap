/**
 * Creates `password_reset_tokens` if missing. Safe to run on every Vercel build.
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
		console.error("DATABASE_URL_PROD is not set. Cannot ensure password_reset_tokens on Neon.");
		process.exit(1);
	}
	process.env.DATABASE_URL = neon;
	console.log("Using DATABASE_URL_PROD (Neon) for password_reset_tokens schema ensure.");
}

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping password_reset_tokens schema ensure.");
	process.exit(prod ? 1 : 0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const createTable = `
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	token text NOT NULL UNIQUE,
	expires_at timestamptz NOT NULL,
	used_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT now(),
	source text NOT NULL,
	created_by_admin_id text REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT password_reset_tokens_source_check CHECK (source IN ('user', 'admin'))
)`;

const indexSql = `CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON public.password_reset_tokens(user_id)`;

async function main() {
	try {
		await sql.unsafe(createTable);
		await sql.unsafe(indexSql);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("does not exist") && msg.includes("users")) {
			console.log("users table not found; skipping password_reset_tokens ensure.");
			await sql.end();
			process.exit(0);
		}
		console.error("password_reset_tokens schema ensure failed:", msg);
		process.exit(1);
	}
	console.log("password_reset_tokens table schema ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
