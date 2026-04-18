/**
 * Writes `src/lib/data/club-stats.json` from the database (for anonymous /stats visitors).
 *
 *   pnpm db:export:stats           → DATABASE_URL
 *   pnpm db:export:stats:prod      → DATABASE_URL_PROD (Neon)
 */
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/server/db/schema.js";
import type { ClubStatsSnapshotFile } from "../src/lib/stats-snapshot.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });

const prod = process.argv.includes("--prod");
if (prod) {
	const neon = process.env.DATABASE_URL_PROD?.trim();
	if (!neon) {
		console.error("DATABASE_URL_PROD is not set.");
		process.exit(1);
	}
	process.env.DATABASE_URL = neon;
	console.log("Using DATABASE_URL_PROD for export.");
}

const url = process.env.DATABASE_URL?.trim();
if (!url) {
	console.error("DATABASE_URL is not set.");
	process.exit(1);
}

function iso(d: Date) {
	return d.toISOString();
}

function dateOnly(d: Date | null) {
	if (!d) return null;
	return d.toISOString().slice(0, 10);
}

async function main() {
	const client = postgres(url, { max: 2 });
	const db = drizzle(client, { schema });

	const kegRows = await db
		.select()
		.from(schema.statsKegCredits)
		.orderBy(asc(schema.statsKegCredits.sort_order));

	const beerRows = await db
		.select()
		.from(schema.statsBeerConsumed)
		.orderBy(asc(schema.statsBeerConsumed.keg_number));

	const out: ClubStatsSnapshotFile = {
		exportedAt: new Date().toISOString(),
		kegCredits: kegRows.map((r) => ({
			...r,
			created_at: iso(r.created_at),
			updated_at: iso(r.updated_at)
		})),
		beerConsumed: beerRows.map((r) => ({
			...r,
			purchased_on: dateOnly(r.purchased_on),
			delivered_on: dateOnly(r.delivered_on),
			finished_on: dateOnly(r.finished_on),
			created_at: iso(r.created_at),
			updated_at: iso(r.updated_at)
		}))
	};

	const target = path.join(repoRoot, "src/lib/data/club-stats.json");
	writeFileSync(target, JSON.stringify(out, null, "\t") + "\n", "utf-8");
	console.log(`Wrote ${kegRows.length} keg credit rows and ${beerRows.length} beer rows to ${target}`);

	await client.end({ timeout: 5 });
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
