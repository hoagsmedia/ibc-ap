/**
 * One-time / repeat import: fetch islandbeerclub.com/stats.htm (or read a local file)
 * and replace stats_keg_credits + stats_beer_consumed with parsed legacy HTML tables.
 *
 * Usage:
 *   pnpm db:import:stats              → DATABASE_URL (usually local Postgres)
 *   pnpm db:import:stats:prod         → DATABASE_URL_PROD (Neon)
 *   pnpm exec tsx scripts/import-legacy-stats-html.ts --dry-run
 *   pnpm exec tsx scripts/import-legacy-stats-html.ts --file ./stats.htm
 *
 * Requires DATABASE_URL (or DATABASE_URL_PROD with --prod) unless --dry-run.
 */
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/server/db/schema.js";
import { parseLegacyMemberLabel } from "../src/lib/server/parse-member-label.js";
import { statsRowId } from "../src/lib/server/stats-id.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });

const DEFAULT_URL = "https://islandbeerclub.com/stats.htm";

const MONTHS: Record<string, number> = {
	Jan: 0,
	Feb: 1,
	Mar: 2,
	Apr: 3,
	May: 4,
	Jun: 5,
	Jul: 6,
	Aug: 7,
	Sep: 8,
	Oct: 9,
	Nov: 10,
	Dec: 11
};

function parseArgs() {
	const argv = process.argv.slice(2);
	return {
		dryRun: argv.includes("--dry-run"),
		/** Use DATABASE_URL_PROD (Neon) instead of DATABASE_URL. */
		prod: argv.includes("--prod"),
		file: (() => {
			const i = argv.indexOf("--file");
			return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
		})(),
		url: (() => {
			const i = argv.indexOf("--url");
			return i >= 0 && argv[i + 1] ? argv[i + 1] : DEFAULT_URL;
		})()
	};
}

function parseCreditsCell(raw: string): { credits: number; is_cik: boolean } {
	const t = raw.trim();
	const is_cik = /\bCIK\b/i.test(t);
	const m = t.match(/(\d+(?:\.\d+)?)/);
	const credits = m ? parseFloat(m[1]) : 0;
	return { credits, is_cik };
}

function parseLegacyDate(raw: string): Date | null {
	const t = raw.trim();
	if (!t) return null;
	if (/^never$/i.test(t)) return null;
	const m = t.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
	if (!m) return null;
	const day = parseInt(m[1], 10);
	const monKey = m[2].charAt(0).toUpperCase() + m[2].slice(1, 3).toLowerCase();
	const mon = MONTHS[monKey];
	if (mon === undefined) return null;
	let year = parseInt(m[3], 10);
	if (m[3].length <= 2) {
		year += year >= 70 ? 1900 : 2000;
	}
	// Local calendar date (matches legacy HTML intent) for Postgres `date` columns.
	return new Date(year, mon, day);
}

function parseGallons(raw: string): number {
	const t = raw.replace(/,/g, "").trim();
	const n = parseFloat(t);
	return Number.isFinite(n) ? n : 0;
}

function extractKegCredits(doc: Document) {
	const table = doc.querySelector('table[width="589"]');
	if (!table) {
		throw new Error('Could not find keg credits table (expected <table width="589">).');
	}
	const out: {
		sort_order: number;
		member_label: string;
		member_number: number | null;
		credits: number;
		is_cik: boolean;
	}[] = [];

	for (const tr of table.querySelectorAll("tr")) {
		const tds = tr.querySelectorAll("td");
		if (tds.length !== 3) continue;
		const sort_order = parseInt(tds[0].textContent?.trim() ?? "", 10);
		if (!Number.isFinite(sort_order) || sort_order < 1) continue;
		const rawMember = (tds[1].textContent ?? "").replace(/\s+/g, " ").trim();
		const { displayName, memberNumber } = parseLegacyMemberLabel(rawMember);
		const creditsRaw = (tds[2].textContent ?? "").replace(/\s+/g, " ").trim();
		const { credits, is_cik } = parseCreditsCell(creditsRaw);
		if (!displayName) continue;
		out.push({
			sort_order,
			member_label: displayName,
			member_number: memberNumber,
			credits,
			is_cik
		});
	}

	if (out.length === 0) {
		throw new Error("No keg credit rows parsed.");
	}
	return out;
}

function findBeerConsumedTable(doc: Document): HTMLTableElement {
	for (const td of doc.querySelectorAll("td")) {
		if ((td.textContent ?? "").includes("No. Kegs")) {
			const table = td.closest("table");
			if (table) return table;
		}
	}
	throw new Error('Could not find beer consumed table (header cell "No. Kegs").');
}

function extractBeerConsumed(doc: Document) {
	const table = findBeerConsumedTable(doc);
	const out: {
		keg_number: number;
		beer_name: string | null;
		purchased_on: Date | null;
		delivered_on: Date | null;
		finished_on: Date | null;
		gallons: number;
	}[] = [];

	const rows = table.querySelectorAll("tr");
	let seenHeader = false;
	for (const tr of rows) {
		const tds = tr.querySelectorAll("td");
		if (tds.length !== 6) continue;

		const headText = (tr.textContent ?? "").replace(/\s+/g, " ");
		if (headText.includes("No. Kegs") && headText.includes("Beer Name")) {
			seenHeader = true;
			continue;
		}
		if (!seenHeader) continue;

		const kegStr = tds[0].textContent?.trim() ?? "";
		const keg_number = parseInt(kegStr, 10);
		if (!Number.isFinite(keg_number) || keg_number < 1) {
			break;
		}

		const purchased_on = parseLegacyDate(tds[1].textContent ?? "");
		const delivered_on = parseLegacyDate(tds[2].textContent ?? "");
		const finished_on = parseLegacyDate(tds[3].textContent ?? "");
		const beer_name = (tds[4].textContent ?? "").replace(/\s+/g, " ").trim() || null;
		const gallons = parseGallons(tds[5].textContent ?? "");

		out.push({ keg_number, beer_name, purchased_on, delivered_on, finished_on, gallons });
	}

	if (out.length === 0) {
		throw new Error("No beer consumed rows parsed.");
	}
	return out;
}

async function main() {
	const { dryRun, file, url, prod } = parseArgs();

	if (prod) {
		const neon = process.env.DATABASE_URL_PROD?.trim();
		if (!neon) {
			console.error("DATABASE_URL_PROD is not set. Add your Neon URL to .env or .env.local.");
			process.exit(1);
		}
		process.env.DATABASE_URL = neon;
		console.log("Using DATABASE_URL_PROD (Neon) for this import.");
	}

	let html: string;
	if (file) {
		html = readFileSync(file, "utf-8");
		console.log(`Read HTML from ${file} (${html.length} bytes).`);
	} else {
		console.log(`Fetching ${url} ...`);
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`HTTP ${res.status} ${res.statusText}`);
		}
		html = await res.text();
		console.log(`Fetched ${html.length} bytes.`);
	}

	const doc = new JSDOM(html).window.document;
	const kegRows = extractKegCredits(doc);
	const beerRows = extractBeerConsumed(doc);

	console.log(`Parsed keg credits: ${kegRows.length} rows (sort_order ${kegRows[0]?.sort_order}–${kegRows.at(-1)?.sort_order}).`);
	console.log(`Parsed beer consumed: ${beerRows.length} rows (keg #${beerRows[0]?.keg_number}–#${beerRows.at(-1)?.keg_number}).`);

	if (dryRun) {
		console.log("[dry-run] Skipping database writes.");
		return;
	}

	const databaseUrl = process.env.DATABASE_URL?.trim();
	if (!databaseUrl) {
		console.error(
			prod
				? "DATABASE_URL_PROD is not set in .env / .env.local. Use --dry-run to parse only."
				: "DATABASE_URL is not set. Use --dry-run to parse only."
		);
		process.exit(1);
	}

	const client = postgres(databaseUrl, { max: 4 });
	const db = drizzle(client, { schema });

	const now = new Date();
	await db.delete(schema.statsBeerConsumed);
	await db.delete(schema.statsKegCredits);

	const kegValues = kegRows.map((r) => ({
		id: statsRowId(),
		sort_order: r.sort_order,
		member_label: r.member_label,
		member_number: r.member_number,
		credits: r.credits,
		is_cik: r.is_cik,
		created_at: now,
		updated_at: now
	}));
	const beerValues = beerRows.map((r) => ({
		id: statsRowId(),
		keg_number: r.keg_number,
		beer_name: r.beer_name,
		purchased_on: r.purchased_on,
		delivered_on: r.delivered_on,
		finished_on: r.finished_on,
		gallons: r.gallons,
		created_at: now,
		updated_at: now
	}));

	const chunk = 250;
	for (let i = 0; i < kegValues.length; i += chunk) {
		await db.insert(schema.statsKegCredits).values(kegValues.slice(i, i + chunk));
	}
	for (let i = 0; i < beerValues.length; i += chunk) {
		await db.insert(schema.statsBeerConsumed).values(beerValues.slice(i, i + chunk));
	}

	console.log(`Imported ${kegRows.length} keg credit rows and ${beerRows.length} beer rows.`);
	await client.end({ timeout: 5 });
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
