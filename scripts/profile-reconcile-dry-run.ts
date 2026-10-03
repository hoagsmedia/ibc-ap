/**
 * Offline, read-only dry run that counts how many member profile values (`bio`, `hobbies`,
 * `likes`) a source export could fill into a target export.
 *
 *   pnpm profile:reconcile:dry-run --source ./source.json --target ./target.csv
 *   tsx scripts/profile-reconcile-dry-run.ts --source ./source.csv --target ./target.json
 *
 * It prints aggregate counts only. There is deliberately no apply mode: this script never writes a
 * file, never loads env/secrets, and never opens a database or network connection. See
 * `docs/profile-reconciliation.md`.
 */
import { readFileSync } from "node:fs";
import {
	ProfileReconciliationError,
	parseProfileRows,
	reconcileProfiles,
	type InputRole
} from "../src/lib/server/profile-reconciliation.js";
import {
	DRY_RUN_USAGE,
	inferInputFormat,
	parseDryRunArgs,
	renderDryRunReport
} from "../src/lib/server/profile-reconciliation-cli.js";

/** Filesystem errors carry the path, so they are replaced with a generic message. */
function readLocalText(path: string, role: InputRole): string {
	try {
		return readFileSync(path, "utf8");
	} catch {
		throw new ProfileReconciliationError("unreadable-input", `${role}: file could not be read`);
	}
}

function loadSide(path: string, role: InputRole) {
	return parseProfileRows(readLocalText(path, role), inferInputFormat(path, role), role);
}

function main(): void {
	const args = parseDryRunArgs(process.argv.slice(2));
	if (args.kind === "help") {
		console.log(DRY_RUN_USAGE);
		return;
	}

	const source = loadSide(args.sourcePath, "source");
	const target = loadSide(args.targetPath, "target");
	console.log(renderDryRunReport(reconcileProfiles(source, target)));
}

try {
	main();
} catch (error) {
	// Only our own sanitized messages are printed; anything else is reported without detail.
	if (error instanceof ProfileReconciliationError) {
		console.error(error.message);
		if (error.code === "usage") {
			console.error("");
			console.error(DRY_RUN_USAGE);
			process.exit(2);
		}
		process.exit(1);
	}
	console.error("profile reconciliation failed.");
	process.exit(1);
}
