/**
 * Offline profile reconciliation counts for member profile text (`bio`, `hobbies`, `likes`).
 *
 * Pure, read-only logic: it compares a *source* export against a *target* export and reports how
 * many values **could** be filled in. It never applies anything, never opens a database, never
 * touches the network, and never returns member content — only counts.
 *
 * Nothing in the running app imports this module. It exists for
 * `scripts/profile-reconcile-dry-run.ts` and its tests; see `docs/profile-reconciliation.md`.
 */
import { parse } from "csv-parse/sync";

/** The only profile text fields this tool reads. Every other column/property is ignored. */
export const PROFILE_FIELDS = ["bio", "hobbies", "likes"] as const;
export type ProfileField = (typeof PROFILE_FIELDS)[number];

/** Columns/properties that carry meaning here. Anything else is ignored. */
export const RELEVANT_COLUMNS = ["id", "mbr", ...PROFILE_FIELDS] as const;
export type RelevantColumn = (typeof RELEVANT_COLUMNS)[number];

export type InputFormat = "json" | "csv";
export type InputRole = "source" | "target";

/**
 * - `fill` — source has content, target is empty (the only actionable status).
 * - `identical` — both sides carry byte-identical content.
 * - `conflict` — both sides have content and it differs; a human decides, never this tool.
 * - `source-empty` — nothing to contribute (source blank or field absent).
 */
export type FieldStatus = "fill" | "identical" | "conflict" | "source-empty";

export type ReconciliationErrorCode =
	| "usage"
	| "unsupported-format"
	| "unreadable-input"
	| "empty-input"
	| "invalid-json"
	| "invalid-json-shape"
	| "invalid-csv"
	| "invalid-csv-header"
	| "invalid-field-type";

/**
 * Failure with a stable `code` and a message that is safe to print: it never contains input data,
 * member identifiers, file paths, or an upstream parser message. Only this module's own fixed
 * column names ever appear.
 */
export class ProfileReconciliationError extends Error {
	readonly code: ReconciliationErrorCode;

	constructor(code: ReconciliationErrorCode, message: string) {
		super(message);
		this.name = "ProfileReconciliationError";
		this.code = code;
	}
}

function inputError(
	code: ReconciliationErrorCode,
	role: InputRole,
	detail: string
): ProfileReconciliationError {
	return new ProfileReconciliationError(code, `${role}: ${detail}`);
}

/** Identifiers stay opaque strings; profile text is kept byte-for-byte. */
export type ProfileRow = {
	/** Stable id, exterior whitespace trimmed. `""` when absent or blank. */
	id: string;
	/** Member number, exterior whitespace trimmed, never numerically parsed. `""` when absent. */
	mbr: string;
	bio: string;
	hobbies: string;
	likes: string;
};

export type ParsedRows = {
	rows: ProfileRow[];
	/** `mbr` values that arrived as JSON numbers rather than strings (see `coerceKey`). */
	numericKeyValues: number;
};

export type SideSummary = {
	rows: number;
	withId: number;
	withMbr: number;
	keyless: number;
	/** Rows whose id/mbr is shared with at least one other row on the same side. */
	duplicateIdRows: number;
	duplicateMbrRows: number;
	numericKeyValues: number;
};

/** Source rows that need a human before anything could be proposed for them. */
export type ReviewCounts = {
	keyless: number;
	duplicateSourceKey: number;
	ambiguousTargetKey: number;
	unmatched: number;
	contradictoryMapping: number;
};

export type FieldStatusCounts = Record<FieldStatus, number>;

export type ReconciliationReport = {
	source: SideSummary;
	target: SideSummary;
	matched: { byId: number; byMbr: number };
	review: ReviewCounts;
	fields: Record<ProfileField, FieldStatusCounts>;
	/** Total `fill` statuses across all fields. Never includes a non-empty target. */
	proposedFills: number;
};

function stripBom(text: string): string {
	return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Spreadsheet exports sometimes prefix the CSV with a bare `Table 1` title row (optionally padded
 * with the empty trailing commas Excel adds). Only that exact line is dropped, and because it can
 * never start with a quote this cannot cut into a quoted multiline record.
 */
const TABLE_PREAMBLE_PATTERN = /^Table 1[,\s]*$/;

function stripTablePreamble(text: string): string {
	const breakAt = text.indexOf("\n");
	const firstLine = (breakAt === -1 ? text : text.slice(0, breakAt)).replace(/\r$/, "");
	if (!TABLE_PREAMBLE_PATTERN.test(firstLine)) return text;
	return breakAt === -1 ? "" : text.slice(breakAt + 1);
}

/**
 * Messages for a rejected identifier. They name only the fixed field name and how to make the
 * value acceptable — never the value itself.
 */
const ID_KEY_DETAIL = 'field "id" must be a JSON string';
const MBR_KEY_DETAIL =
	'field "mbr" must be a JSON string, or a non-negative safe integer; quote it to stay exact';

function keyTypeDetail(field: "id" | "mbr"): string {
	return field === "id" ? ID_KEY_DETAIL : MBR_KEY_DETAIL;
}

/**
 * Identifiers are opaque: only exterior whitespace is trimmed. `"408.1"` stays `"408.1"` and is
 * never the same key as `"408"` or `"408.10"`.
 *
 * Strings are the only exact representation, because `JSON.parse` has already rounded any number
 * by the time this sees it: `408.10` arrives as `408.1`, and `9007199254740993` as
 * `...992`. So `id` must be a string, and a numeric `mbr` is accepted only when it round-trips
 * exactly — a non-negative safe integer. Decimals, negatives, unsafe integers, and non-finite
 * numbers are rejected with a request for the string form; the count of numeric `mbr` values that
 * were accepted is still reported so a reviewer can insist on string keys throughout.
 */
function coerceKey(
	value: unknown,
	field: "id" | "mbr",
	role: InputRole
): { value: string; numeric: boolean } {
	if (value === undefined || value === null) return { value: "", numeric: false };
	if (typeof value === "string") return { value: value.trim(), numeric: false };
	if (field === "mbr" && typeof value === "number") {
		// `Number.isSafeInteger` excludes NaN, ±Infinity, decimals, and anything past 2^53 - 1.
		if (!Number.isSafeInteger(value) || value < 0) {
			throw inputError("invalid-field-type", role, keyTypeDetail(field));
		}
		return { value: String(value), numeric: true };
	}
	throw inputError("invalid-field-type", role, keyTypeDetail(field));
}

/** Profile text must already be text; absent/null becomes `""`. Content is never altered. */
function coerceText(value: unknown, field: ProfileField, role: InputRole): string {
	if (value === undefined || value === null) return "";
	if (typeof value === "string") return value;
	throw inputError("invalid-field-type", role, `field "${field}" must be a string`);
}

function toRow(
	record: Record<string, unknown>,
	role: InputRole
): { row: ProfileRow; numericKeys: number } {
	const id = coerceKey(record.id, "id", role);
	const mbr = coerceKey(record.mbr, "mbr", role);
	return {
		row: {
			id: id.value,
			mbr: mbr.value,
			bio: coerceText(record.bio, "bio", role),
			hobbies: coerceText(record.hobbies, "hobbies", role),
			likes: coerceText(record.likes, "likes", role)
		},
		numericKeys: (id.numeric ? 1 : 0) + (mbr.numeric ? 1 : 0)
	};
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectRows(
	entries: readonly unknown[],
	role: InputRole,
	shapeError: () => ProfileReconciliationError
): ParsedRows {
	const rows: ProfileRow[] = [];
	let numericKeyValues = 0;
	for (const entry of entries) {
		if (!isPlainRecord(entry)) throw shapeError();
		const { row, numericKeys } = toRow(entry, role);
		rows.push(row);
		numericKeyValues += numericKeys;
	}
	return { rows, numericKeyValues };
}

function parseJsonRows(text: string, role: InputRole): ParsedRows {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		// The upstream message can quote input, so it is discarded.
		throw inputError("invalid-json", role, "could not be parsed as JSON");
	}
	if (!Array.isArray(data)) {
		throw inputError("invalid-json-shape", role, "must be a JSON array of objects");
	}
	return collectRows(data, role, () =>
		inputError("invalid-json-shape", role, "must contain only JSON objects")
	);
}

function isRelevantColumn(name: string): name is RelevantColumn {
	return (RELEVANT_COLUMNS as readonly string[]).includes(name);
}

/** Where each relevant column sits in the CSV header row. */
type CsvColumnPositions = Map<RelevantColumn, number>;

/**
 * Locates the relevant columns in a CSV header.
 *
 * `columns: true` would let the *last* duplicate header silently win, so a file with two `bio`
 * columns would quietly report one of them. Instead the header is validated here:
 *
 * - a repeated relevant column name (`id`, `mbr`, `bio`, `hobbies`, `likes`) is an error;
 * - a header with neither `id` nor `mbr` is an error, because no row could ever be matched;
 * - every other column is ignored, and ignored columns may repeat freely.
 *
 * Header *names* are compared after trimming (padding in a header is formatting, not data) but
 * remain case-sensitive, so a `Bio` column is ignored rather than guessed at.
 */
function locateCsvColumns(header: readonly string[], role: InputRole): CsvColumnPositions {
	const positions: CsvColumnPositions = new Map();
	header.forEach((rawName, index) => {
		const name = rawName.trim();
		if (!isRelevantColumn(name)) return;
		if (positions.has(name)) {
			throw inputError("invalid-csv-header", role, `header has more than one "${name}" column`);
		}
		positions.set(name, index);
	});
	if (!positions.has("id") && !positions.has("mbr")) {
		throw inputError("invalid-csv-header", role, 'header must contain an "id" or "mbr" column');
	}
	return positions;
}

/**
 * Turns one CSV record into a relevant-columns-only object.
 *
 * Width policy: a record with fewer fields than the header is an error, and so is a record with
 * extra fields that carry *any* text — dropping that text could hide a shifted or mis-quoted row.
 * The one tolerated case is extra cells that are entirely empty, which is the padding spreadsheets
 * add; those carry no information and are discarded.
 */
function csvRecord(
	cells: readonly string[],
	positions: CsvColumnPositions,
	headerWidth: number,
	role: InputRole
): Record<string, unknown> {
	if (cells.length < headerWidth) {
		throw inputError("invalid-csv", role, "a record has fewer fields than the header");
	}
	if (cells.length > headerWidth && cells.slice(headerWidth).some((cell) => cell !== "")) {
		throw inputError("invalid-csv", role, "a record has more fields than the header");
	}
	const record: Record<string, unknown> = {};
	for (const [name, index] of positions) {
		record[name] = cells[index];
	}
	return record;
}

const isStringRow = (row: unknown): row is string[] =>
	Array.isArray(row) && row.every((cell: unknown) => typeof cell === "string");

const isStringTable = (value: unknown): value is string[][] =>
	Array.isArray(value) && value.every(isStringRow);

/**
 * Records are read as arrays so this module — not the parser — decides what a duplicate header or
 * an over-wide record means. Quoted multiline fields are still handled by `csv-parse`.
 */
function parseCsvRows(text: string, role: InputRole): ParsedRows {
	let table: unknown;
	try {
		table = parse(text, {
			bom: true,
			skip_empty_lines: true,
			// Width is this module's decision (see `csvRecord`), so the parser never throws on it.
			relax_column_count: true,
			// Load-bearing: no type coercion of keys, no mutation of profile text.
			cast: false,
			trim: false
		});
	} catch {
		// The upstream message can quote input, so it is discarded.
		throw inputError("invalid-csv", role, "could not be parsed as CSV");
	}
	// A file with no header row at all cannot be interpreted; empty input is caught earlier.
	if (!isStringTable(table) || table.length === 0) {
		throw inputError("invalid-csv", role, "could not be parsed as CSV");
	}

	const header = table[0];
	const positions = locateCsvColumns(header, role);

	return collectRows(
		table.slice(1).map((cells) => csvRecord(cells, positions, header.length, role)),
		role,
		() => inputError("invalid-csv", role, "could not be parsed as CSV")
	);
}

/**
 * Parses one side of the comparison. A `Table 1` preamble line is accepted for CSV; quoted
 * multiline CSV fields are handled by the CSV parser, never by line splitting.
 */
export function parseProfileRows(text: string, format: InputFormat, role: InputRole): ParsedRows {
	const normalized = format === "csv" ? stripTablePreamble(stripBom(text)) : stripBom(text);
	if (normalized.trim() === "") {
		throw inputError("empty-input", role, "file is empty");
	}
	return format === "json" ? parseJsonRows(normalized, role) : parseCsvRows(normalized, role);
}

/** Whitespace-only is nothing to copy, so it counts as empty on either side. */
const hasContent = (value: string): boolean => value.trim() !== "";

/**
 * Two values are the same only when they are byte-identical. Exterior whitespace is *not* smoothed
 * over: this tool preserves values exactly, so it cannot claim two differing strings are the same
 * value. A padding-only difference is a `conflict` for a human to look at, never a silent pick.
 */
export function classifyField(sourceValue: string, targetValue: string): FieldStatus {
	if (!hasContent(sourceValue)) return "source-empty";
	if (!hasContent(targetValue)) return "fill";
	return sourceValue === targetValue ? "identical" : "conflict";
}

type KeyField = "id" | "mbr";

function indexByKey(rows: readonly ProfileRow[], key: KeyField): Map<string, number[]> {
	const index = new Map<string, number[]>();
	rows.forEach((row, position) => {
		const value = row[key];
		if (value === "") return;
		const bucket = index.get(value);
		if (bucket) bucket.push(position);
		else index.set(value, [position]);
	});
	return index;
}

function countIndexed(index: Map<string, number[]>): number {
	let total = 0;
	for (const bucket of index.values()) {
		total += bucket.length;
	}
	return total;
}

/** Rows whose key is shared with at least one other row on the same side. */
function countDuplicated(index: Map<string, number[]>): number {
	let total = 0;
	for (const bucket of index.values()) {
		if (bucket.length > 1) total += bucket.length;
	}
	return total;
}

function summarize(
	parsed: ParsedRows,
	byId: Map<string, number[]>,
	byMbr: Map<string, number[]>
): SideSummary {
	return {
		rows: parsed.rows.length,
		withId: countIndexed(byId),
		withMbr: countIndexed(byMbr),
		keyless: parsed.rows.filter((row) => row.id === "" && row.mbr === "").length,
		duplicateIdRows: countDuplicated(byId),
		duplicateMbrRows: countDuplicated(byMbr),
		numericKeyValues: parsed.numericKeyValues
	};
}

type Resolution =
	| { kind: "matched"; via: KeyField; target: ProfileRow }
	| { kind: keyof ReviewCounts };

type MatchContext = {
	sourceById: Map<string, number[]>;
	sourceByMbr: Map<string, number[]>;
	targetById: Map<string, number[]>;
	targetByMbr: Map<string, number[]>;
	targetRows: readonly ProfileRow[];
};

function multiplicity(index: Map<string, number[]>, key: string): number {
	return index.get(key)?.length ?? 0;
}

function lookup(index: Map<string, number[]>, key: string): number[] {
	if (key === "") return [];
	return index.get(key) ?? [];
}

/**
 * Resolves the single target row a source row could fill, or the reason a human has to look.
 *
 * Both keys are always considered, including when the id alone would match: an id match is not a
 * licence to ignore a member number that is duplicated, ambiguous, or points somewhere else. A
 * pairing is only proposed when
 *
 * - neither of the row's keys repeats within the source;
 * - neither key matches more than one target row;
 * - the keys that do match point at the *same* target row (otherwise the mapping is crossed);
 * - the two rows agree on every key they both carry; and
 * - no other source row claims that target row through the key this row happens to lack.
 *
 * The last rule is what stops two source rows from filling one target row through a mixed
 * id/member pairing. Anything else is a review count — never a guess.
 */
function resolveTargetRow(row: ProfileRow, ctx: MatchContext): Resolution {
	if (row.id === "" && row.mbr === "") return { kind: "keyless" };

	// A key that repeats in the source cannot identify which row to copy from, even if the other
	// key would match cleanly.
	if (row.id !== "" && multiplicity(ctx.sourceById, row.id) > 1) {
		return { kind: "duplicateSourceKey" };
	}
	if (row.mbr !== "" && multiplicity(ctx.sourceByMbr, row.mbr) > 1) {
		return { kind: "duplicateSourceKey" };
	}

	const idHits = lookup(ctx.targetById, row.id);
	const mbrHits = lookup(ctx.targetByMbr, row.mbr);
	if (idHits.length > 1 || mbrHits.length > 1) return { kind: "ambiguousTargetKey" };
	// Crossed mapping: the id points at one target row and the member number at another.
	if (idHits.length === 1 && mbrHits.length === 1 && idHits[0] !== mbrHits[0]) {
		return { kind: "contradictoryMapping" };
	}
	if (idHits.length === 0 && mbrHits.length === 0) return { kind: "unmatched" };

	const via: KeyField = idHits.length === 1 ? "id" : "mbr";
	const target = ctx.targetRows[via === "id" ? idHits[0] : mbrHits[0]];

	// The pair must agree on every key both rows carry...
	if (row.id !== "" && target.id !== "" && row.id !== target.id) {
		return { kind: "contradictoryMapping" };
	}
	if (row.mbr !== "" && target.mbr !== "" && row.mbr !== target.mbr) {
		return { kind: "contradictoryMapping" };
	}
	// ...and no other source row may reach the same target row through the key this row lacks.
	if (row.id === "" && target.id !== "" && ctx.sourceById.has(target.id)) {
		return { kind: "contradictoryMapping" };
	}
	if (row.mbr === "" && target.mbr !== "" && ctx.sourceByMbr.has(target.mbr)) {
		return { kind: "contradictoryMapping" };
	}

	return { kind: "matched", via, target };
}

const emptyStatusCounts = (): FieldStatusCounts => ({
	fill: 0,
	identical: 0,
	conflict: 0,
	"source-empty": 0
});

/**
 * Counts what a fill-only reconciliation would do. Every source row lands in exactly one bucket:
 * `matched.byId`, `matched.byMbr`, or one `review` count.
 */
export function reconcileProfiles(source: ParsedRows, target: ParsedRows): ReconciliationReport {
	const ctx: MatchContext = {
		sourceById: indexByKey(source.rows, "id"),
		sourceByMbr: indexByKey(source.rows, "mbr"),
		targetById: indexByKey(target.rows, "id"),
		targetByMbr: indexByKey(target.rows, "mbr"),
		targetRows: target.rows
	};

	const matched = { byId: 0, byMbr: 0 };
	const review: ReviewCounts = {
		keyless: 0,
		duplicateSourceKey: 0,
		ambiguousTargetKey: 0,
		unmatched: 0,
		contradictoryMapping: 0
	};
	const fields: Record<ProfileField, FieldStatusCounts> = {
		bio: emptyStatusCounts(),
		hobbies: emptyStatusCounts(),
		likes: emptyStatusCounts()
	};
	let proposedFills = 0;

	for (const row of source.rows) {
		const resolution = resolveTargetRow(row, ctx);
		if (resolution.kind !== "matched") {
			review[resolution.kind] += 1;
			continue;
		}
		matched[resolution.via === "id" ? "byId" : "byMbr"] += 1;
		for (const field of PROFILE_FIELDS) {
			const status = classifyField(row[field], resolution.target[field]);
			fields[field][status] += 1;
			if (status === "fill") proposedFills += 1;
		}
	}

	return {
		source: summarize(source, ctx.sourceById, ctx.sourceByMbr),
		target: summarize(target, ctx.targetById, ctx.targetByMbr),
		matched,
		review,
		fields,
		proposedFills
	};
}
