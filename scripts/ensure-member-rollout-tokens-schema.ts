/**
 * Creates `member_rollout_tokens` for existing-member website rollout (not prospect invites).
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
		console.error("DATABASE_URL_PROD is not set. Cannot ensure member_rollout_tokens on Neon.");
		process.exit(1);
	}
	process.env.DATABASE_URL = neon;
	console.log("Using DATABASE_URL_PROD (Neon) for member_rollout_tokens schema ensure.");
}

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping member_rollout_tokens schema ensure.");
	process.exit(prod ? 1 : 0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const createTable = `
CREATE TABLE IF NOT EXISTS public.member_rollout_tokens (
	id text PRIMARY KEY NOT NULL,
	token text NOT NULL UNIQUE,
	created_by_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	target_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	recipient_email_snapshot text,
	created_at timestamptz NOT NULL DEFAULT now(),
	expires_at timestamptz NOT NULL,
	used_at timestamptz
)`;

const indexCreatedBy = `CREATE INDEX IF NOT EXISTS member_rollout_tokens_created_by_idx ON public.member_rollout_tokens(created_by_id)`;
const indexCreatedAt = `CREATE INDEX IF NOT EXISTS member_rollout_tokens_created_at_idx ON public.member_rollout_tokens(created_at)`;

async function main() {
	try {
		await sql.unsafe(createTable);
		await sql.unsafe(indexCreatedBy);
		await sql.unsafe(indexCreatedAt);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("does not exist") && msg.includes("users")) {
			console.log("users table not found; skipping member_rollout_tokens ensure.");
			await sql.end();
			process.exit(0);
		}
		console.error("member_rollout_tokens schema ensure failed:", msg);
		process.exit(1);
	}
	console.log("member_rollout_tokens table schema ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
