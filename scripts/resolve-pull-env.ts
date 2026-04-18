/**
 * Used by pull-neon-to-local.sh: load .env + .env.local (same order as app) and print
 * two lines: Neon URL, then local URL (may be empty).
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });

function looksLocalDb(u: string | undefined): boolean {
	if (!u) return false;
	return /localhost|127\.0\.0\.1/.test(u);
}

/** When DATABASE_URL points at Neon (or any non-local host), use it as pg_dump source if NEON_* unset. */
function neonSourceFromDatabaseUrl(): string {
	const u = process.env.DATABASE_URL;
	if (!u || looksLocalDb(u)) return "";
	return u;
}

const neon =
	process.env.NEON_DATABASE_URL ||
	process.env.NEON_URL ||
	process.env.DATABASE_URL_DEV ||
	neonSourceFromDatabaseUrl() ||
	"";

const explicitLocal = process.env.LOCAL_DATABASE_URL || process.env.LOCAL_DB_URL || "";

const localUrl =
	explicitLocal || (looksLocalDb(process.env.DATABASE_URL) ? process.env.DATABASE_URL! : "");

process.stdout.write(`${neon}\n${localUrl}\n`);
