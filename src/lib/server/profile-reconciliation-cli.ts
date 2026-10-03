/**
 * Argument parsing and report rendering for `scripts/profile-reconcile-dry-run.ts`.
 *
 * Kept here (pure, no `fs`) so the CLI surface is covered by the server Vitest project. Nothing in
 * the running app imports this module.
 */
import {
	PROFILE_FIELDS,
	ProfileReconciliationError,
	type InputFormat,
	type InputRole,
	type ReconciliationReport,
	type SideSummary
} from "./profile-reconciliation.js";

export const DRY_RUN_USAGE = `IBC profile reconciliation - offline dry run (read-only).

Usage:
  pnpm profile:reconcile:dry-run --source <path> --target <path>
  tsx scripts/profile-reconcile-dry-run.ts --source <path> --target <path>

Options:
  --source <path>  Local .json or .csv export to read profile values FROM
  --target <path>  Local .json or .csv export to compare against
  -h, --help       Show this help (only when every other argument is valid)

Only id, mbr, bio, hobbies and likes are read; other columns are ignored.
Prints aggregate counts only. There is no apply mode: nothing is written, and no
database or network is contacted. Unknown options are rejected, including
alongside --help.`;

export type DryRunArgs = { kind: "help" } | { kind: "run"; sourcePath: string; targetPath: string };

type OptionName = "source" | "target";

const usageError = (detail: string): ProfileReconciliationError =>
	new ProfileReconciliationError("usage", detail);

function matchOption(token: string): { name: OptionName; inlineValue?: string } | null {
	for (const name of ["source", "target"] as const) {
		if (token === `--${name}`) return { name };
		if (token.startsWith(`--${name}=`)) {
			return { name, inlineValue: token.slice(name.length + 3) };
		}
	}
	return null;
}

/**
 * Values are never echoed back: an unknown option may itself be a path, so the message stays
 * generic. `--apply` (and every other unlisted option) lands here.
 */
function assertLocalPath(name: OptionName, value: string | undefined): string {
	if (value === undefined || value.trim() === "") {
		throw usageError(`--${name} requires a local file path`);
	}
	if (value.includes("://")) {
		throw usageError(`--${name} must be a local file path`);
	}
	return value;
}

/**
 * Every argument is validated before `--help` is honoured, so `--help --apply` is a usage error
 * rather than a help screen: an unrecognized option must never be silently swallowed, even on a
 * read-only path. Once the whole argv is well-formed, `--help` wins over the missing-path checks.
 */
export function parseDryRunArgs(argv: readonly string[]): DryRunArgs {
	const paths: Partial<Record<OptionName, string>> = {};
	let helpRequested = false;

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === "--help" || token === "-h") {
			helpRequested = true;
			continue;
		}

		const option = matchOption(token);
		if (!option) throw usageError("unrecognized argument (see --help)");
		if (paths[option.name] !== undefined) {
			throw usageError(`--${option.name} was given more than once`);
		}

		let value = option.inlineValue;
		if (value === undefined) {
			const next = argv[index + 1];
			// A following option is a missing value, not a path.
			if (next === undefined || next.startsWith("-")) {
				throw usageError(`--${option.name} requires a local file path`);
			}
			value = next;
			index += 1;
		}
		paths[option.name] = assertLocalPath(option.name, value);
	}

	if (helpRequested) return { kind: "help" };

	const sourcePath = paths.source;
	const targetPath = paths.target;
	if (sourcePath === undefined) throw usageError("--source is required");
	if (targetPath === undefined) throw usageError("--target is required");
	return { kind: "run", sourcePath, targetPath };
}

/** Format comes from the file extension; the path is never included in the error. */
export function inferInputFormat(path: string, role: InputRole): InputFormat {
	const dotIndex = path.lastIndexOf(".");
	const extension = dotIndex === -1 ? "" : path.slice(dotIndex + 1).toLowerCase();
	if (extension === "json") return "json";
	if (extension === "csv") return "csv";
	throw new ProfileReconciliationError(
		"unsupported-format",
		`${role}: file must end in .json or .csv`
	);
}

const renderSide = (side: SideSummary): string =>
	[
		`rows=${side.rows}`,
		`with-id=${side.withId}`,
		`with-mbr=${side.withMbr}`,
		`keyless=${side.keyless}`,
		`dup-id-rows=${side.duplicateIdRows}`,
		`dup-mbr-rows=${side.duplicateMbrRows}`,
		`numeric-keys=${side.numericKeyValues}`
	].join(" ");

/** Counts only: no identifiers, no profile text, no paths. */
export function renderDryRunReport(report: ReconciliationReport): string {
	const { matched, review } = report;
	const lines = [
		"IBC profile reconciliation - dry run (read-only; nothing is written)",
		"",
		`source  ${renderSide(report.source)}`,
		`target  ${renderSide(report.target)}`,
		"",
		`matched by-id=${matched.byId} by-mbr=${matched.byMbr} total=${matched.byId + matched.byMbr}`,
		[
			"review ",
			`keyless=${review.keyless}`,
			`duplicate-source-key=${review.duplicateSourceKey}`,
			`ambiguous-target-key=${review.ambiguousTargetKey}`,
			`unmatched=${review.unmatched}`,
			`contradictory-mapping=${review.contradictoryMapping}`
		].join(" "),
		""
	];

	for (const field of PROFILE_FIELDS) {
		const counts = report.fields[field];
		lines.push(
			`${field.padEnd(8)}fill=${counts.fill} identical=${counts.identical} ` +
				`conflict=${counts.conflict} source-empty=${counts["source-empty"]}`
		);
	}

	lines.push("", `proposed fills=${report.proposedFills} (empty targets only; nothing applied)`);
	return lines.join("\n");
}
