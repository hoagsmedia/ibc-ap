/**
 * Writes `src/lib/data/events-public.json` from the database (anonymous /events visitors).
 *
 *   pnpm db:export:events           → DATABASE_URL
 *   pnpm db:export:events:prod      → DATABASE_URL_PROD (Neon)
 */
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/server/db/schema.js";
import type { EventsPublicSnapshotFile } from "../src/lib/events-public-snapshot.js";

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

async function main() {
	const client = postgres(url, { max: 2 });
	const db = drizzle(client, { schema });

	const rows = await db
		.select()
		.from(schema.events)
		.where(
			and(
				eq(schema.events.is_published, 1),
				isNotNull(schema.events.event_date),
				eq(schema.events.members_only, false)
			)
		)
		.orderBy(desc(schema.events.event_date));

	const out: EventsPublicSnapshotFile = {
		exportedAt: new Date().toISOString(),
		events: rows.map((r) => ({
			...r,
			event_date: iso(r.event_date!),
			created_at: iso(r.created_at),
			updated_at: iso(r.updated_at)
		}))
	};

	const target = path.join(repoRoot, "src/lib/data/events-public.json");
	writeFileSync(target, JSON.stringify(out, null, "\t") + "\n", "utf-8");
	console.log(`Wrote ${rows.length} public event rows to ${target}`);

	await client.end({ timeout: 5 });
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
