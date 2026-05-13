#!/usr/bin/env bash
# Stream pg_dump from current Neon production into an empty stakeholder Neon database.
# Prerequisites: empty target database (create in Neon console first), pg_dump + psql (brew install libpq).
#
# Usage:
#   export SOURCE_DATABASE_URL="postgresql://...@old-neon.../ibc-db?sslmode=require"
#   export TARGET_DATABASE_URL="postgresql://...@new-neon.../ibc-db?sslmode=require"
#   pnpm db:migrate:neon-stakeholder
#
# Do not commit URLs. Source may also be DATABASE_URL_PROD if set (see below).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SOURCE_URL="${SOURCE_DATABASE_URL:-${DATABASE_URL_PROD:-}}"
TARGET_URL="${TARGET_DATABASE_URL:-}"

if [[ -z "$SOURCE_URL" ]]; then
	echo "error: Set SOURCE_DATABASE_URL or DATABASE_URL_PROD to the **current** production Neon URL." >&2
	exit 1
fi

if [[ -z "$TARGET_URL" ]]; then
	echo "error: Set TARGET_DATABASE_URL to the **empty** stakeholder Neon production URL." >&2
	exit 1
fi

for cmd in pg_dump psql; do
	if ! command -v "$cmd" &>/dev/null; then
		echo "error: '$cmd' not found. Install PostgreSQL client tools (e.g. brew install libpq)." >&2
		exit 1
	fi
done

echo "==> Migrating (streaming SOURCE → TARGET). Target DB must be empty or you accept overwrite conflicts."
echo "==> Stripping PG17 transaction_timeout line if present (local restores compatibility)"

set +e
pg_dump "$SOURCE_URL" --no-owner --no-acl -F p | sed -E '/transaction_timeout/d' | psql "$TARGET_URL" -v ON_ERROR_STOP=1
PSQL_STATUS=$?
set -e

if [[ "$PSQL_STATUS" -ne 0 ]]; then
	echo "" >&2
	echo "Restore failed (exit $PSQL_STATUS). Typical fixes:" >&2
	echo "  • Drop and recreate empty database on target Neon branch, then retry." >&2
	echo "  • Match Postgres major versions if extension errors appear." >&2
	exit "$PSQL_STATUS"
fi

echo "==> Done. Verify row counts on TARGET (e.g. users), then run sanitize script — see DEPLOYMENT.md."
