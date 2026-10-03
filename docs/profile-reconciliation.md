# Profile reconciliation dry run (offline)

A standalone, read-only CLI that counts how many member profile values (`bio`, `hobbies`, `likes`)
a **source** export could contribute to a **target** export.

It is preparation for a possible migration, **not** a migration. It only ever prints aggregate
counts.

## Safety properties

- **No apply mode.** There is no flag that writes anything; `--apply` is rejected like any other
  unknown option, including when it is passed alongside `--help`.
- **No writes, no database, no network, no env.** The script imports `node:fs` (read only),
  `csv-parse/sync`, and the two pure modules below. It never loads `dotenv` or any `src/lib/server/db`
  module.
- **No member content in the output.** Only counts are printed. Errors are sanitized: they never
  contain input data, identifiers, file paths, or upstream parser messages — only this tool's own
  fixed field names (`id`, `mbr`, `bio`, `hobbies`, `likes`) and the side that failed.
- **Not part of the app.** No runtime code imports these modules.

> Do **not** run `pnpm db:seed`, `pnpm db:seed:dev`, or `pnpm db:seed:csv` as part of this work.
> `scripts/seed-users.ts` deletes users and `scripts/seed-from-csv.ts` modifies account data.

## Usage

```sh
pnpm profile:reconcile:dry-run --source ./source.json --target ./target.csv
tsx scripts/profile-reconcile-dry-run.ts --source=./source.csv --target=./target.json
tsx scripts/profile-reconcile-dry-run.ts --help
```

Both paths are required, must be local (a value containing `://` is rejected), and the format comes
from the extension: `.json` or `.csv` (case-insensitive). Unknown options, repeated options,
positional arguments, and missing values are all rejected.

`--help` / `-h` prints the usage text and exits `0`, but **only when every other argument is valid**:
the whole argument list is checked first, so `--help --apply` is a usage error rather than a help
screen. Help does skip the "both paths are required" check, so `--help` on its own works.

Exit codes: `0` success, `2` usage error (usage text is printed to stderr), `1` input error.

## Input formats

Either side may be JSON or CSV. Only `id`, `mbr`, `bio`, `hobbies` and `likes` are read; every other
column or property is ignored. Field names are matched exactly (lower case). A
`bio`/`hobbies`/`likes` value that is not a string is a validation error rather than a coercion.

### JSON

An array of objects. Values may be strings, `null`, or absent.

Identifiers must be **strings**, because `JSON.parse` rounds a number before this tool can see it:
`408.10` arrives as `408.1`, and `9007199254740993` as `9007199254740992`. So:

- `id` must be a JSON string. A numeric `id` is rejected.
- `mbr` should be a string too. A numeric `mbr` is accepted only when it round-trips exactly — a
  non-negative safe integer (`408`). Decimals (`408.1`), negatives, values past
  `Number.MAX_SAFE_INTEGER`, and exponent/non-finite values (`1e21`, `1e400`) are rejected with a
  request for the quoted string form.
- Decimal _strings_ are always valid and stay distinct: `"408.1"` is neither `"408"` nor `"408.10"`.

The number of `mbr` values that arrived as numbers is reported as `numeric-keys` so a reviewer can
insist on string keys throughout.

### CSV

A header row, optionally preceded by a single `Table 1` title line (optionally padded with the empty
trailing commas spreadsheets add). Quoted multiline fields are parsed by `csv-parse`, never by
splitting on newlines.

Records are read as arrays rather than with `columns: true`, because `columns: true` lets the _last_
duplicate header silently win — a file with two `bio` columns would quietly report one of them. The
header is validated instead:

- a repeated relevant column (`id`, `mbr`, `bio`, `hobbies`, `likes`) is an error;
- a header with neither `id` nor `mbr` is an error, since no row could ever be matched;
- any other column is ignored, and ignored columns may repeat freely.

Header _names_ are trimmed before matching (padding in a header is formatting, not data) but stay
case-sensitive, so a `Bio` column is ignored rather than guessed at.

Record width policy:

- fewer fields than the header → error;
- extra fields carrying any text (including a single space) → error, rather than silently dropping
  the text, which could hide a shifted or mis-quoted row;
- extra fields that are **entirely empty** → accepted and discarded; this is the padding
  spreadsheets add and it carries no information.

A record whose cells are all empty (`,,`) is a valid row with no keys, and is counted as `keyless`
rather than discarded.

## Keys and matching

Identifiers are opaque strings. Only exterior whitespace is trimmed; they are never parsed as
numbers, so `408.1`, `408` and `408.10` are three different member numbers.

**Both keys are always checked, even when the id alone would match.** An id match is not a licence
to ignore a member number that is duplicated, ambiguous, or points somewhere else. A source row is
paired with a target row only when all of these hold:

1. Neither of the source row's keys repeats within the source.
2. Neither key matches more than one target row.
3. The keys that do match point at the **same** target row.
4. The two rows agree on every key they both carry.
5. No other source row reaches that target row through the key this row happens to lack.

Rule 5 is what stops two source rows from filling one target row through a mixed id/member pairing;
together these rules mean no target row is ever claimed by more than one source row. A match is
reported as `by-id` when the id matched and `by-mbr` when only the member number did — so a row with
no member number on either side still matches cleanly by id.

Anything else is a **review count**, never an arbitrary pick:

- `keyless` — the source row has neither key.
- `duplicate-source-key` — the row's id or member number repeats within the source.
- `ambiguous-target-key` — one of the row's keys matches more than one target row.
- `contradictory-mapping` — the keys disagree: they point at different target rows (a _crossed_
  mapping, e.g. the id matches a target row with no member number while the member number belongs to
  a different target row); or the matched rows carry different values for a key they both have; or
  another source row already reaches that target row through the other key.
- `unmatched` — neither key appears in the target.

Every source row lands in exactly one bucket (matched or one review count).

## Field statuses

Per matched row, for each of `bio`, `hobbies`, `likes`:

- `fill` — source has content, target is empty. The only actionable status.
- `identical` — both sides carry byte-identical content.
- `conflict` — both sides have content and it differs; a human decides.
- `source-empty` — source is blank or the field is absent.

A whitespace-only value counts as empty, so a target holding only spaces can be filled. Otherwise
comparison is **exact**: two non-empty values are `identical` only when they are byte-identical, so
a value that differs only by exterior whitespace is a `conflict` for a human to look at, not a
match. Content is never modified, truncated, or normalized. **A non-empty target is never proposed
for overwrite**, and the source is treated as partial: a value missing from the source never implies
a deletion.

## Output

```
IBC profile reconciliation - dry run (read-only; nothing is written)

source  rows=… with-id=… with-mbr=… keyless=… dup-id-rows=… dup-mbr-rows=… numeric-keys=…
target  rows=… …

matched by-id=… by-mbr=… total=…
review  keyless=… duplicate-source-key=… ambiguous-target-key=… unmatched=… contradictory-mapping=…

bio     fill=… identical=… conflict=… source-empty=…
hobbies …
likes   …

proposed fills=… (empty targets only; nothing applied)
```

## Files

- `src/lib/server/profile-reconciliation.ts` — parsing, matching, counting, error type.
- `src/lib/server/profile-reconciliation-cli.ts` — argument parsing, format inference, rendering.
- `src/lib/server/profile-reconciliation.test.ts`,
  `src/lib/server/profile-reconciliation-cli.test.ts` — synthetic fixtures only (server Vitest
  project).
- `scripts/profile-reconcile-dry-run.ts` — thin CLI: reads the two files, prints the counts.

## Limitations

- Column names must match exactly; a `Bio` header is ignored rather than guessed.
- Conservatism costs recall: a duplicated or crossed key sends a row to review even when a human
  would find the intended pairing obvious. Review counts are expected to be non-zero.
- JSON numeric identifiers cannot preserve trailing zeros (`408.10` would arrive as `408.1`), so
  they are rejected rather than reported; quote identifiers, and check `numeric-keys` in the output.
- Counts describe what a fill-only reconciliation _would_ do. They are not a migration plan, and
  nothing here has been validated against real exports.
