import { describe, expect, it } from "vitest";
import {
	DRY_RUN_USAGE,
	inferInputFormat,
	parseDryRunArgs,
	renderDryRunReport
} from "./profile-reconciliation-cli.js";
import {
	ProfileReconciliationError,
	reconcileProfiles,
	type ParsedRows,
	type ProfileRow
} from "./profile-reconciliation.js";

/** All fixtures are invented; no real member data appears in this file. */
const SECRET = "CONFIDENTIAL-FIXTURE-TEXT";

const parsed = (rows: Array<Partial<ProfileRow>>): ParsedRows => ({
	rows: rows.map((row) => ({ id: "", mbr: "", bio: "", hobbies: "", likes: "", ...row })),
	numericKeyValues: 0
});

const expectUsageError = (argv: string[]): ProfileReconciliationError => {
	let caught: unknown;
	try {
		parseDryRunArgs(argv);
	} catch (error) {
		caught = error;
	}
	expect(caught).toBeInstanceOf(ProfileReconciliationError);
	const error = caught as ProfileReconciliationError;
	expect(error.code).toBe("usage");
	return error;
};

describe("parseDryRunArgs", () => {
	it("accepts separated values", () => {
		expect(parseDryRunArgs(["--source", "./a.json", "--target", "./b.csv"])).toEqual({
			kind: "run",
			sourcePath: "./a.json",
			targetPath: "./b.csv"
		});
	});

	it("accepts inline values in any order", () => {
		expect(parseDryRunArgs(["--target=./b.csv", "--source=./a.json"])).toEqual({
			kind: "run",
			sourcePath: "./a.json",
			targetPath: "./b.csv"
		});
	});

	it("returns help for --help and -h, with or without paths", () => {
		expect(parseDryRunArgs(["--help"])).toEqual({ kind: "help" });
		expect(parseDryRunArgs(["-h"])).toEqual({ kind: "help" });
		expect(parseDryRunArgs(["--source", "./a.json", "--help"])).toEqual({ kind: "help" });
		expect(parseDryRunArgs(["--help", "--source=./a.json", "--target=./b.csv"])).toEqual({
			kind: "help"
		});
	});

	it("rejects --apply without echoing it", () => {
		const error = expectUsageError(["--source=./a.json", "--target=./b.csv", "--apply"]);
		expect(error.message).toBe("unrecognized argument (see --help)");
		expect(error.message).not.toContain("apply");
	});

	it("rejects an unknown argument even when --help is also present", () => {
		// --help must not become a way to smuggle an unrecognized option past validation.
		for (const argv of [
			["--help", "--apply"],
			["--apply", "--help"],
			["-h", "--apply"],
			["--help", "-x"],
			["--source=./a.json", "--help", `./${SECRET}.json`]
		]) {
			const error = expectUsageError(argv);
			expect(error.message).toBe("unrecognized argument (see --help)");
			expect(error.message).not.toContain("apply");
			expect(error.message).not.toContain(SECRET);
		}
	});

	it("rejects a malformed recognized option even when --help is also present", () => {
		expect(expectUsageError(["--help", "--source"]).message).toBe(
			"--source requires a local file path"
		);
		expect(expectUsageError(["--help", "--source=./a.json", "--source=./c.json"]).message).toBe(
			"--source was given more than once"
		);
		const remote = expectUsageError(["--help", `--target=https://example.test/${SECRET}.json`]);
		expect(remote.message).toBe("--target must be a local file path");
		expect(remote.message).not.toContain(SECRET);
	});

	it("rejects unknown options and positional arguments without echoing them", () => {
		for (const argv of [["--dry-run"], ["-x"], [`./${SECRET}.json`]]) {
			const error = expectUsageError(argv);
			expect(error.message).toBe("unrecognized argument (see --help)");
			expect(error.message).not.toContain(SECRET);
		}
	});

	it("rejects a missing value", () => {
		expect(expectUsageError(["--source"]).message).toBe("--source requires a local file path");
		expect(expectUsageError(["--source", "--target", "./b.csv"]).message).toBe(
			"--source requires a local file path"
		);
		expect(expectUsageError(["--target=", "--source=./a.json"]).message).toBe(
			"--target requires a local file path"
		);
	});

	it("rejects a repeated option", () => {
		expect(expectUsageError(["--source=./a.json", "--source=./c.json"]).message).toBe(
			"--source was given more than once"
		);
	});

	it("rejects remote locations without echoing them", () => {
		const error = expectUsageError([`--source=https://example.test/${SECRET}.json`]);
		expect(error.message).toBe("--source must be a local file path");
		expect(error.message).not.toContain(SECRET);
	});

	it("requires both paths", () => {
		expect(expectUsageError(["--source=./a.json"]).message).toBe("--target is required");
		expect(expectUsageError(["--target=./b.csv"]).message).toBe("--source is required");
		expect(expectUsageError([]).message).toBe("--source is required");
	});
});

describe("inferInputFormat", () => {
	it("maps the supported extensions, case-insensitively", () => {
		expect(inferInputFormat("./export.json", "source")).toBe("json");
		expect(inferInputFormat("/tmp/EXPORT.CSV", "target")).toBe("csv");
	});

	it("rejects other extensions without echoing the path", () => {
		for (const path of [`./${SECRET}.txt`, `./${SECRET}`, `./${SECRET}.csv.gz`]) {
			let caught: unknown;
			try {
				inferInputFormat(path, "source");
			} catch (error) {
				caught = error;
			}
			expect(caught).toBeInstanceOf(ProfileReconciliationError);
			const error = caught as ProfileReconciliationError;
			expect(error.code).toBe("unsupported-format");
			expect(error.message).toBe("source: file must end in .json or .csv");
			expect(error.message).not.toContain(SECRET);
		}
	});
});

describe("renderDryRunReport", () => {
	const report = reconcileProfiles(
		parsed([
			{ id: "A1", bio: SECRET },
			{ id: "A2", bio: SECRET, hobbies: SECRET },
			{ mbr: `99-${SECRET}` }
		]),
		parsed([{ id: "A1" }, { id: "A2", bio: "kept" }])
	);

	it("prints aggregate counts only", () => {
		const output = renderDryRunReport(report);
		expect(output).toMatch(/^source\s+rows=3 with-id=2 with-mbr=1 keyless=0 /m);
		expect(output).toMatch(/^target\s+rows=2 with-id=2 with-mbr=0 keyless=0 /m);
		expect(output).toContain("matched by-id=2 by-mbr=0 total=2");
		expect(output).toContain("unmatched=1");
		expect(output).toMatch(/^bio\s+fill=1 identical=0 conflict=1 source-empty=0$/m);
		expect(output).toMatch(/^hobbies\s+fill=1 identical=0 conflict=0 source-empty=1$/m);
		expect(output).toMatch(/^likes\s+fill=0 identical=0 conflict=0 source-empty=2$/m);
		expect(output).toContain("proposed fills=2");
	});

	it("never includes member content or identifiers", () => {
		const output = renderDryRunReport(report);
		expect(output).not.toContain(SECRET);
		expect(output).not.toContain("A1");
		expect(output).not.toContain("kept");
	});

	it("documents that the run is read-only", () => {
		expect(renderDryRunReport(report)).toContain("read-only");
		expect(DRY_RUN_USAGE).toContain("There is no apply mode");
	});

	it("documents that unknown options are rejected alongside --help", () => {
		expect(DRY_RUN_USAGE).toContain("Unknown options are rejected");
		expect(DRY_RUN_USAGE).toContain("alongside --help");
		expect(DRY_RUN_USAGE).toContain("only when every other argument is valid");
	});
});
