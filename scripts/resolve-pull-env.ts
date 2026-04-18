/**
 * Used by pull-prod-to-local.sh: load .env + .env.local, print two lines:
 *   line 1: Neon **production** source URL (pg_dump)
 *   line 2: local Postgres target URL (pg_restore)
 *
 * No magic: we do not use DATABASE_URL as the dump source (avoids wrong branch).
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

function looksLocalDb(u: string | undefined): boolean {
	if (!u) return false;
	return /localhost|127\.0\.0\.1/.test(u);
}

/** Production Neon (or any remote you intend to dump). Prefer DATABASE_URL_PROD. */
const neonSource =
	process.env.DATABASE_URL_PROD ||
	process.env.NEON_DATABASE_URL ||
	process.env.NEON_URL ||
	process.env.DATABASE_URL_DEV ||
	"";

const explicitLocal = process.env.LOCAL_DATABASE_URL || process.env.LOCAL_DB_URL || "";

const localTarget =
	explicitLocal || (looksLocalDb(process.env.DATABASE_URL) ? process.env.DATABASE_URL! : "");

process.stdout.write(`${neonSource}\n${localTarget}\n`);
