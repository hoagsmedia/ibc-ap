import { describe, expect, it } from "vitest";
import {
	ProfileReconciliationError,
	classifyField,
	parseProfileRows,
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

const expectError = (run: () => unknown, code: string): ProfileReconciliationError => {
	let caught: unknown;
	try {
		run();
	} catch (error) {
		caught = error;
	}
	expect(caught).toBeInstanceOf(ProfileReconciliationError);
	const error = caught as ProfileReconciliationError;
	expect(error.code).toBe(code);
	return error;
};

describe("parseProfileRows (JSON)", () => {
	it("reads an array of objects and ignores unlisted fields", () => {
		const text = JSON.stringify([
			{ id: "A1", mbr: "10", bio: "Bio one", hobbies: "Chess", likes: "Tea", email: SECRET }
		]);
		// Only the five known fields survive; `email` is dropped.
		expect(parseProfileRows(text, "json", "source")).toEqual({
			rows: [{ id: "A1", mbr: "10", bio: "Bio one", hobbies: "Chess", likes: "Tea" }],
			numericKeyValues: 0
		});
	});

	it("treats absent and null fields as empty", () => {
		const text = JSON.stringify([{ id: "A1", bio: null }]);
		expect(parseProfileRows(text, "json", "source").rows[0]).toEqual({
			id: "A1",
			mbr: "",
			bio: "",
			hobbies: "",
			likes: ""
		});
	});

	it("keeps decimal identifier strings exactly and distinctly", () => {
		const text = JSON.stringify([
			{ id: "408.10", mbr: "408.1" },
			{ id: "408.1", mbr: "408.10" }
		]);
		const { rows, numericKeyValues } = parseProfileRows(text, "json", "source");
		expect(rows.map((row) => [row.id, row.mbr])).toEqual([
			["408.10", "408.1"],
			["408.1", "408.10"]
		]);
		expect(numericKeyValues).toBe(0);
	});

	it("requires a string id, because JSON.parse has already rounded any number", () => {
		const error = expectError(
			() => parseProfileRows('[{"id": 408, "mbr": "10"}]', "json", "source"),
			"invalid-field-type"
		);
		expect(error.message).toBe('source: field "id" must be a JSON string');
	});

	it("accepts a non-negative safe-integer mbr and counts it", () => {
		expect(parseProfileRows('[{"id": "A1", "mbr": 408}]', "json", "source")).toEqual({
			rows: [{ id: "A1", mbr: "408", bio: "", hobbies: "", likes: "" }],
			numericKeyValues: 1
		});
	});

	it("rejects a decimal numeric mbr instead of accepting a rounded value", () => {
		// `408.10` cannot survive JSON.parse, so the string form is required.
		const error = expectError(
			() => parseProfileRows('[{"mbr": 408.1}]', "json", "source"),
			"invalid-field-type"
		);
		expect(error.message).toContain('field "mbr" must be a JSON string');
		expect(error.message).toContain("quote it to stay exact");
		expect(error.message).not.toContain("408");
	});

	it("rejects numeric mbr values that cannot round-trip exactly", () => {
		for (const literal of [
			"9007199254740993", // past Number.MAX_SAFE_INTEGER
			"9007199254740992",
			"1e21",
			"1e400", // parses to Infinity
			"-1",
			"-408.1"
		]) {
			expectError(
				() => parseProfileRows(`[{"mbr": ${literal}}]`, "json", "source"),
				"invalid-field-type"
			);
		}
	});

	it("rejects malformed JSON without echoing the input", () => {
		const error = expectError(
			() => parseProfileRows(`[{"id":"A1","bio":"${SECRET}"`, "json", "source"),
			"invalid-json"
		);
		expect(error.message).toBe("source: could not be parsed as JSON");
	});

	it("rejects a non-array document", () => {
		expectError(() => parseProfileRows('{"id":"A1"}', "json", "target"), "invalid-json-shape");
	});

	it("rejects non-object entries", () => {
		expectError(() => parseProfileRows('["A1"]', "json", "source"), "invalid-json-shape");
	});

	it("rejects non-string profile text without echoing it", () => {
		const text = JSON.stringify([{ id: "A1", bio: { note: SECRET } }]);
		const run = () => parseProfileRows(text, "json", "source");
		const error = expectError(run, "invalid-field-type");
		expect(error.message).toBe('source: field "bio" must be a string');
		expect(error.message).not.toContain(SECRET);
	});

	it("rejects boolean identifiers", () => {
		expectError(() => parseProfileRows('[{"id": true}]', "json", "source"), "invalid-field-type");
		expectError(() => parseProfileRows('[{"mbr": true}]', "json", "source"), "invalid-field-type");
	});

	it("rejects an empty document", () => {
		expectError(() => parseProfileRows("   ", "json", "source"), "empty-input");
	});

	it("accepts an empty array as zero rows", () => {
		expect(parseProfileRows("[]", "json", "source").rows).toEqual([]);
	});
});

describe("parseProfileRows (CSV)", () => {
	it("reads a standard header and ignores unlisted columns", () => {
		const header = "id,mbr,bio,hobbies,likes,email";
		const text = [header, `A1,10,Bio one,Chess,Tea,${SECRET}`].join("\n");
		expect(parseProfileRows(text, "csv", "target").rows).toEqual([
			{ id: "A1", mbr: "10", bio: "Bio one", hobbies: "Chess", likes: "Tea" }
		]);
	});

	it("ignores unlisted columns even when they repeat", () => {
		const text = ["id,notes,notes,mbr", `A1,${SECRET},${SECRET},10`].join("\n");
		expect(parseProfileRows(text, "csv", "source").rows).toEqual([
			{ id: "A1", mbr: "10", bio: "", hobbies: "", likes: "" }
		]);
	});

	it("matches header names exactly, so a differently cased column is ignored", () => {
		const text = ["id,Bio", `A1,${SECRET}`].join("\n");
		expect(parseProfileRows(text, "csv", "source").rows[0]).toEqual({
			id: "A1",
			mbr: "",
			bio: "",
			hobbies: "",
			likes: ""
		});
	});

	it("tolerates padding around header names", () => {
		const text = [" id , mbr , bio ", "A1,10,Bio one"].join("\n");
		expect(parseProfileRows(text, "csv", "source").rows[0]).toEqual({
			id: "A1",
			mbr: "10",
			bio: "Bio one",
			hobbies: "",
			likes: ""
		});
	});

	it("rejects a duplicated relevant column instead of letting the last one win", () => {
		const cases: Array<[string, string]> = [
			["id,bio,bio", 'source: header has more than one "bio" column'],
			["id,id,mbr", 'source: header has more than one "id" column'],
			["mbr,mbr", 'source: header has more than one "mbr" column'],
			["id,hobbies,hobbies", 'source: header has more than one "hobbies" column'],
			["id,likes,likes", 'source: header has more than one "likes" column'],
			// Padding does not make a second column a different column.
			["id, id ", 'source: header has more than one "id" column']
		];
		for (const [header, message] of cases) {
			// Same field count as the header, with content that must never reach the error message.
			const row = header.replace(/[^,]+/g, SECRET);
			const error = expectError(
				() => parseProfileRows([header, row].join("\n"), "csv", "source"),
				"invalid-csv-header"
			);
			expect(error.message).toBe(message);
			expect(error.message).not.toContain(SECRET);
		}
	});

	it("rejects a header with neither id nor mbr", () => {
		const error = expectError(
			() => parseProfileRows(["bio,hobbies,likes", `${SECRET},x,y`].join("\n"), "csv", "target"),
			"invalid-csv-header"
		);
		expect(error.message).toBe('target: header must contain an "id" or "mbr" column');
		expect(error.message).not.toContain(SECRET);
	});

	it("accepts a header with only one of the two keys", () => {
		expect(parseProfileRows("id,bio\nA1,Bio one", "csv", "source").rows[0].id).toBe("A1");
		expect(parseProfileRows("mbr,bio\n10,Bio one", "csv", "source").rows[0].mbr).toBe("10");
	});

	it("drops an exact `Table 1` preamble line", () => {
		const text = ["Table 1", "id,mbr,bio", "A1,10,Bio one"].join("\n");
		expect(parseProfileRows(text, "csv", "source").rows).toEqual([
			{ id: "A1", mbr: "10", bio: "Bio one", hobbies: "", likes: "" }
		]);
	});

	it("drops a `Table 1` preamble padded with empty columns and CRLF", () => {
		const text = ["Table 1,,,", "id,mbr,bio", "A1,10,Bio one"].join("\r\n");
		expect(parseProfileRows(text, "csv", "source").rows[0].id).toBe("A1");
	});

	it("rejects a title row that only resembles the preamble", () => {
		const text = ["Table 2", "id,mbr", "A1,10"].join("\n");
		// Not an exact match, so the title row becomes the header — which has no id or mbr column.
		expectError(() => parseProfileRows(text, "csv", "source"), "invalid-csv-header");
	});

	it("parses quoted multiline values as single records", () => {
		const text = [
			"id,mbr,bio",
			'A1,10,"first line',
			'second line, with a comma and ""quotes"""',
			"B2,11,plain"
		].join("\n");
		const { rows } = parseProfileRows(text, "csv", "source");
		expect(rows).toHaveLength(2);
		expect(rows[0].bio).toBe('first line\nsecond line, with a comma and "quotes"');
		expect(rows[1].bio).toBe("plain");
	});

	it("trims only exterior whitespace on identifiers and preserves text exactly", () => {
		const text = ["id,mbr,bio", '  A1  ,  10  ,"  padded bio  "'].join("\n");
		expect(parseProfileRows(text, "csv", "source").rows[0]).toEqual({
			id: "A1",
			mbr: "10",
			bio: "  padded bio  ",
			hobbies: "",
			likes: ""
		});
	});

	it("preserves Unicode, newlines, and long values byte-for-byte", () => {
		const bio = `Café ☕ — naïve, 日本語\nsecond line${"x".repeat(301)}`;
		const text = ["id,bio", `A1,"${bio}"`].join("\n");
		const value = parseProfileRows(text, "csv", "source").rows[0].bio;
		expect(value).toBe(bio);
		expect(value.length).toBeGreaterThan(300);
	});

	it("rejects an unterminated quote without echoing the input", () => {
		const error = expectError(
			() => parseProfileRows(`id,bio\nA1,"${SECRET}`, "csv", "target"),
			"invalid-csv"
		);
		expect(error.message).toBe("target: could not be parsed as CSV");
		expect(error.message).not.toContain(SECRET);
	});

	it("rejects a record with fewer fields than the header", () => {
		const error = expectError(
			() => parseProfileRows("id,mbr,bio\nA1,10", "csv", "source"),
			"invalid-csv"
		);
		expect(error.message).toBe("source: a record has fewer fields than the header");
	});

	it("rejects an over-wide record rather than dropping the extra text", () => {
		const error = expectError(
			() => parseProfileRows(`id,mbr,bio\nA1,10,Bio one,${SECRET}`, "csv", "target"),
			"invalid-csv"
		);
		expect(error.message).toBe("target: a record has more fields than the header");
		expect(error.message).not.toContain(SECRET);
	});

	it("accepts entirely empty trailing cells, which are spreadsheet padding", () => {
		const text = ["id,mbr,bio", "A1,10,Bio one,,", "B2,11,Bio two"].join("\n");
		expect(parseProfileRows(text, "csv", "source").rows).toEqual([
			{ id: "A1", mbr: "10", bio: "Bio one", hobbies: "", likes: "" },
			{ id: "B2", mbr: "11", bio: "Bio two", hobbies: "", likes: "" }
		]);
	});

	it("rejects an over-wide record whose extra text is only whitespace padding", () => {
		// A space is still text: it could be a shifted column rather than padding.
		expectError(() => parseProfileRows("id,mbr\nA1,10, ", "csv", "source"), "invalid-csv");
	});

	it("reads an all-empty record as a keyless row rather than discarding it", () => {
		const text = ["id,mbr,bio", ",,", "A1,10,Bio one"].join("\n");
		const { rows } = parseProfileRows(text, "csv", "source");
		expect(rows).toHaveLength(2);
		expect(rows[0]).toEqual({ id: "", mbr: "", bio: "", hobbies: "", likes: "" });
	});

	it("never reports numeric keys for CSV, where every cell is text", () => {
		const text = ["id,mbr", "408,408.10"].join("\n");
		expect(parseProfileRows(text, "csv", "source")).toEqual({
			rows: [{ id: "408", mbr: "408.10", bio: "", hobbies: "", likes: "" }],
			numericKeyValues: 0
		});
	});

	it("accepts a header-only file as zero rows", () => {
		expect(parseProfileRows("id,mbr,bio", "csv", "source").rows).toEqual([]);
	});

	it("rejects a file that is only the preamble", () => {
		expectError(() => parseProfileRows("Table 1\n", "csv", "source"), "empty-input");
	});
});

describe("classifyField", () => {
	it("fills only when the target is empty", () => {
		expect(classifyField("new", "")).toBe("fill");
		expect(classifyField("new", "   \n ")).toBe("fill");
	});

	it("reports identical only for byte-identical content", () => {
		expect(classifyField("same", "same")).toBe("identical");
		expect(classifyField("two\nlines", "two\nlines")).toBe("identical");
		expect(classifyField("Café ☕", "Café ☕")).toBe("identical");
	});

	it("treats an exterior-whitespace difference as a conflict, not a match", () => {
		// Values are preserved exactly, so this tool cannot call two different strings the same.
		expect(classifyField("  same  ", "same")).toBe("conflict");
		expect(classifyField("same", "same ")).toBe("conflict");
		expect(classifyField("same", "\nsame")).toBe("conflict");
	});

	it("reports a conflict when both sides have differing content", () => {
		expect(classifyField("new", "old")).toBe("conflict");
		expect(classifyField("two\nlines", "two lines")).toBe("conflict");
	});

	it("reports source-empty when the source has nothing to contribute", () => {
		expect(classifyField("", "old")).toBe("source-empty");
		expect(classifyField("  ", "")).toBe("source-empty");
		expect(classifyField("\n\t ", "old")).toBe("source-empty");
	});
});

describe("reconcileProfiles", () => {
	it("matches on the stable id when both keys agree", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "99", bio: "from source" }]),
			parsed([
				{ id: "A1", mbr: "99", bio: "" },
				{ id: "B2", mbr: "12" }
			])
		);
		expect(report.matched).toEqual({ byId: 1, byMbr: 0 });
		expect(report.fields.bio.fill).toBe(1);
		expect(report.proposedFills).toBe(1);
	});

	it("matches a unique id when neither side has a member number", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", bio: "from source" }]),
			parsed([{ id: "A1" }])
		);
		expect(report.matched).toEqual({ byId: 1, byMbr: 0 });
		expect(report.proposedFills).toBe(1);
	});

	it("matches a unique id when only the target lacks the member number", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10", bio: "from source" }]),
			parsed([{ id: "A1", mbr: "" }])
		);
		expect(report.matched).toEqual({ byId: 1, byMbr: 0 });
		expect(report.proposedFills).toBe(1);
	});

	it("falls back to a unique member number when the id is absent", () => {
		const report = reconcileProfiles(
			parsed([{ mbr: "408.1", bio: "from source" }]),
			parsed([{ mbr: "408" }, { mbr: "408.1" }])
		);
		expect(report.matched).toEqual({ byId: 0, byMbr: 1 });
		expect(report.fields.bio.fill).toBe(1);
	});

	it("falls back to the member number when the id is unknown to the target", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10", bio: "from source" }]),
			parsed([{ id: "", mbr: "10" }])
		);
		expect(report.matched).toEqual({ byId: 0, byMbr: 1 });
	});

	it("keeps decimal member numbers distinct and never rounds them", () => {
		const report = reconcileProfiles(
			parsed([{ mbr: "408.10", bio: "from source" }]),
			parsed([{ mbr: "408.1" }, { mbr: "408" }])
		);
		expect(report.matched).toEqual({ byId: 0, byMbr: 0 });
		expect(report.review.unmatched).toBe(1);
	});

	it("never proposes overwriting a non-empty target", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", bio: "from source", hobbies: "Chess", likes: "" }]),
			parsed([{ id: "A1", bio: "kept", hobbies: "Chess", likes: "Tea" }])
		);
		expect(report.fields.bio).toEqual({
			fill: 0,
			identical: 0,
			conflict: 1,
			"source-empty": 0
		});
		expect(report.fields.hobbies.identical).toBe(1);
		expect(report.fields.likes["source-empty"]).toBe(1);
		expect(report.proposedFills).toBe(0);
	});

	it("handles long multiline Unicode values without altering them", () => {
		const long = `Café ☕ — 日本語\n${"ü".repeat(301)}`;
		const report = reconcileProfiles(
			parsed([
				{ id: "A1", bio: long },
				{ id: "A2", bio: long },
				{ id: "A3", bio: long }
			]),
			// A2 is byte-identical; A3 differs only by trailing whitespace, which is a conflict.
			parsed([{ id: "A1" }, { id: "A2", bio: long }, { id: "A3", bio: `${long} ` }])
		);
		expect(report.fields.bio.fill).toBe(1);
		expect(report.fields.bio.identical).toBe(1);
		expect(report.fields.bio.conflict).toBe(1);
		expect(report.proposedFills).toBe(1);
	});

	it("counts duplicate source ids for review instead of picking one", () => {
		const report = reconcileProfiles(
			parsed([
				{ id: "A1", bio: "first" },
				{ id: "A1", bio: "second" }
			]),
			parsed([{ id: "A1" }])
		);
		expect(report.review.duplicateSourceKey).toBe(2);
		expect(report.matched).toEqual({ byId: 0, byMbr: 0 });
		expect(report.source.duplicateIdRows).toBe(2);
	});

	it("counts duplicate source member numbers for review", () => {
		const report = reconcileProfiles(
			parsed([
				{ mbr: "10", bio: "first" },
				{ mbr: "10", bio: "second" }
			]),
			parsed([{ mbr: "10" }])
		);
		expect(report.review.duplicateSourceKey).toBe(2);
	});

	it("does not let a unique id excuse a member number duplicated in the source", () => {
		// Both ids are unique, but two source rows claim member number 10: which one is right?
		const report = reconcileProfiles(
			parsed([
				{ id: "A1", mbr: "10", bio: "first" },
				{ id: "B2", mbr: "10", bio: "second" }
			]),
			parsed([
				{ id: "A1", mbr: "10" },
				{ id: "B2", mbr: "10" }
			])
		);
		expect(report.review.duplicateSourceKey).toBe(2);
		expect(report.matched).toEqual({ byId: 0, byMbr: 0 });
		expect(report.proposedFills).toBe(0);
	});

	it("counts an ambiguous target key instead of picking one", () => {
		const report = reconcileProfiles(
			parsed([
				{ id: "A1", bio: "from source" },
				{ mbr: "10", bio: "from source" }
			]),
			parsed([{ id: "A1" }, { id: "A1" }, { mbr: "10" }, { mbr: "10" }])
		);
		expect(report.review.ambiguousTargetKey).toBe(2);
		expect(report.target.duplicateIdRows).toBe(2);
		expect(report.target.duplicateMbrRows).toBe(2);
	});

	it("does not let an id match excuse a member number duplicated in the target", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10", bio: "from source" }]),
			parsed([
				{ id: "A1", mbr: "10" },
				{ id: "B2", mbr: "10" }
			])
		);
		expect(report.review.ambiguousTargetKey).toBe(1);
		expect(report.matched).toEqual({ byId: 0, byMbr: 0 });
		expect(report.proposedFills).toBe(0);
	});

	it("counts unmatched and keyless source rows", () => {
		const report = reconcileProfiles(
			parsed([{ id: "missing", bio: "x" }, { bio: "x" }]),
			parsed([{ id: "A1" }])
		);
		expect(report.review.unmatched).toBe(1);
		expect(report.review.keyless).toBe(1);
		expect(report.source.keyless).toBe(1);
	});

	it("flags an id match whose member numbers contradict each other", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10", bio: "from source" }]),
			parsed([{ id: "A1", mbr: "11" }])
		);
		expect(report.review.contradictoryMapping).toBe(1);
		expect(report.proposedFills).toBe(0);
	});

	it("flags a crossed mapping where the keys point at different target rows", () => {
		// Target row A1 has no member number, but member number 10 belongs to target row B2.
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10", bio: "from source" }]),
			parsed([
				{ id: "A1", mbr: "" },
				{ id: "B2", mbr: "10" }
			])
		);
		expect(report.review.contradictoryMapping).toBe(1);
		expect(report.matched).toEqual({ byId: 0, byMbr: 0 });
		expect(report.proposedFills).toBe(0);
	});

	it("flags a crossed mapping even when the id match would fill nothing new", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10", bio: "from source" }]),
			parsed([{ id: "A1" }, { mbr: "10" }])
		);
		expect(report.review.contradictoryMapping).toBe(1);
		expect(report.proposedFills).toBe(0);
	});

	it("refuses to let two source rows fill one target row through mixed keys", () => {
		const report = reconcileProfiles(
			parsed([
				{ id: "A1", bio: "from source" },
				{ mbr: "10", bio: "from source" }
			]),
			parsed([{ id: "A1", mbr: "10" }])
		);
		expect(report.matched).toEqual({ byId: 0, byMbr: 0 });
		expect(report.review.contradictoryMapping).toBe(2);
		expect(report.proposedFills).toBe(0);
	});

	it("refuses a member fallback when the target row carries a different id", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10", bio: "from source" }]),
			parsed([{ id: "B2", mbr: "10" }])
		);
		expect(report.review.contradictoryMapping).toBe(1);
	});

	it("allows a member fallback when nothing contradicts it", () => {
		const report = reconcileProfiles(
			parsed([{ mbr: "10", bio: "from source" }]),
			parsed([{ id: "B2", mbr: "10" }])
		);
		expect(report.matched).toEqual({ byId: 0, byMbr: 1 });
	});

	it("allows an id match when another source row shares only the target's empty keys", () => {
		const report = reconcileProfiles(
			parsed([
				{ id: "A1", bio: "from source" },
				{ mbr: "10", bio: "from source" }
			]),
			parsed([{ id: "A1", mbr: "" }, { mbr: "10" }])
		);
		expect(report.matched).toEqual({ byId: 1, byMbr: 1 });
		expect(report.review.contradictoryMapping).toBe(0);
		expect(report.proposedFills).toBe(2);
	});

	it("places every source row in exactly one bucket", () => {
		const source = parsed([
			{ id: "A1", bio: "fill me" },
			{ id: "A1", bio: "duplicate" },
			{ id: "unknown" },
			{ mbr: "10", bio: "by member" },
			{ bio: "keyless" },
			{ id: "C3", mbr: "11", bio: "contradiction" },
			{ id: "D4", mbr: "12", bio: "crossed" }
		]);
		const report = reconcileProfiles(
			source,
			parsed([{ id: "A1" }, { mbr: "10" }, { id: "C3", mbr: "13" }, { id: "D4" }, { mbr: "12" }])
		);

		const reviewed = Object.values(report.review).reduce((total, count) => total + count, 0);
		const matchedTotal = report.matched.byId + report.matched.byMbr;
		expect(reviewed + matchedTotal).toBe(source.rows.length);

		for (const counts of Object.values(report.fields)) {
			const statusTotal = Object.values(counts).reduce((total, count) => total + count, 0);
			expect(statusTotal).toBe(matchedTotal);
		}
	});

	it("summarizes both sides without inspecting profile text", () => {
		const report = reconcileProfiles(
			parsed([{ id: "A1", mbr: "10" }, { mbr: "11" }, {}]),
			parsed([{ id: "A1", mbr: "10" }])
		);
		expect(report.source).toEqual({
			rows: 3,
			withId: 1,
			withMbr: 2,
			keyless: 1,
			duplicateIdRows: 0,
			duplicateMbrRows: 0,
			numericKeyValues: 0
		});
		expect(report.target.rows).toBe(1);
	});
});
