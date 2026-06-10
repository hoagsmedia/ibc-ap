/**
 * Prints only the hostname from DATABASE_URL (no credentials).
 * Use when comparing Production vs Preview Vercel values during IBC-54 audits.
 *
 *   DATABASE_URL="postgresql://..." tsx scripts/print-database-url-host.ts
 *   vercel env pull .env.vercel.preview --environment=preview
 *   DATABASE_URL=$(grep DATABASE_URL .env.vercel.preview | cut -d= -f2-) tsx scripts/print-database-url-host.ts
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

function hostnameFromDatabaseUrl(url: string): string | null {
	try {
		return new URL(url).hostname || null;
	} catch {
		return null;
	}
}

const url = process.env.DATABASE_URL?.trim();
if (!url) {
	console.error("DATABASE_URL is not set.");
	process.exit(1);
}

const host = hostnameFromDatabaseUrl(url);
if (!host) {
	console.error("Could not parse DATABASE_URL hostname.");
	process.exit(1);
}

console.log(host);
