/**
 * Idempotent schema sync for `users` table: adds username, dops, dops_date,
 * prospect meeting dates, migrates `msd` from `date` to `timestamptz` (UTC midnight per calendar day),
 * makes email nullable, and adds users_username_unique if missing.
 * Safe to run on every Vercel build (no prompts, no truncation).
 * Run with: tsx scripts/ensure-users-schema.ts
 */
import dotenv from "dotenv";
import path from "path";
import postgres from "postgres";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("DATABASE_URL is not set. Skipping schema ensure.");
	process.exit(0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

const statements = [
	// MBR: allow decimal values (e.g. 1.1) for sub-member numbering.
	`DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'mbr'
      AND udt_name = 'int4'
  ) THEN
    ALTER TABLE public.users
      ALTER COLUMN mbr TYPE double precision
      USING (mbr::double precision);
  END IF;
END $$`,
	// MSD: legacy `date` → `timestamptz` at UTC midnight for that calendar day
	`DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'msd'
      AND udt_name = 'date'
  ) THEN
    ALTER TABLE public.users
      ALTER COLUMN msd TYPE timestamptz
      USING ((msd::text || ' 00:00:00')::timestamp AT TIME ZONE 'UTC');
  END IF;
END $$`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dops boolean NOT NULL DEFAULT false`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dops_date date`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rung_in_date date`,
	`ALTER TABLE public.users DROP COLUMN IF EXISTS has_rung_in`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS meeting_1_date date`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS meeting_2_date date`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS meeting_3_date date`,
	// Add unique constraint on username only if none exists (avoids truncate prompt)
	`DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) AND a.attname = 'username' AND NOT a.attisdropped
    WHERE c.conrelid = 'public.users'::regclass AND c.contype = 'u'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$`,
	// Make email nullable (no-op if already nullable)
	`ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL`,
	// Member rollout / website access (see src/lib/server/member-rollout.ts)
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_active boolean NOT NULL DEFAULT false`,
	`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website_first_login_at timestamptz`,
	`UPDATE public.users SET account_active = true WHERE role = 'admin'`
];

async function main() {
	for (const statement of statements) {
		try {
			await sql.unsafe(statement);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			// Skip if users table does not exist (e.g. fresh DB)
			if (msg.includes("does not exist") && msg.includes("users")) {
				console.log("Users table not found; skipping schema ensure.");
				await sql.end();
				process.exit(0);
			}
			// Ignore "column already exists" / "constraint already exists" / "column is already nullable"
			if (
				msg.includes("already exists") ||
				msg.includes("duplicate key value") ||
				msg.includes("already nullable")
			) {
				// no-op
			} else {
				console.error("Schema ensure failed:", msg);
				process.exit(1);
			}
		}
	}
	console.log("Users table schema ensured.");
}

main()
	.then(() => sql.end())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
