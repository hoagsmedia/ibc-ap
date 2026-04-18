/**
 * Idempotent: adds events.members_only if missing (IBC-32).
 * Safe to run on every Vercel build.
 */
import dotenv from "dotenv";
import path from "path";
import postgres from "postgres";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping events schema ensure.");
	process.exit(0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const statements = [
	`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS members_only boolean NOT NULL DEFAULT false`
];

async function main() {
	for (const statement of statements) {
		try {
			await sql.unsafe(statement);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes("does not exist") && msg.includes("events")) {
				console.log("Events table not found; skipping events schema ensure.");
				await sql.end();
				process.exit(0);
			}
			if (msg.includes("already exists")) {
				// no-op
			} else {
				console.error("Events schema ensure failed:", msg);
				process.exit(1);
			}
		}
	}
	console.log("Events table schema ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
