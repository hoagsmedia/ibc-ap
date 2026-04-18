#!/usr/bin/env bash
# Copy Neon **production** (or the URL in DATABASE_URL_PROD) into a local Postgres DB, then use
# DATABASE_URL=local for `pnpm dev`.
#
# Prerequisites: pg_dump + pg_restore (e.g. brew install libpq)
#   export PATH="$(brew --prefix libpq)/bin:$PATH"
#
# .env.local (minimal):
#   DATABASE_URL="postgresql://YOU@localhost:5432/ibc"
#   DATABASE_URL_PROD="postgresql://...@...neon.tech/ibc-db?sslmode=require"
#
# Fresh local DB (recommended before pull):
#   dropdb ibc 2>/dev/null; createdb ibc
#
# Run:
#   pnpm db:pull:prod

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

_PULL_OUT="$(pnpm exec tsx scripts/resolve-pull-env.ts)"
_NEON_LINE="$(printf '%s\n' "$_PULL_OUT" | sed -n '1p')"
_LOCAL_LINE="$(printf '%s\n' "$_PULL_OUT" | sed -n '2p')"
NEON_URL="${DATABASE_URL_PROD:-${NEON_DATABASE_URL:-${NEON_URL:-$_NEON_LINE}}}"
LOCAL_URL="${LOCAL_DATABASE_URL:-${LOCAL_DB_URL:-$_LOCAL_LINE}}"

if [[ -z "$NEON_URL" ]]; then
	echo "error: Set DATABASE_URL_PROD in .env.local to your Neon production connection string." >&2
	echo "       (Aliases: NEON_DATABASE_URL or NEON_URL.)" >&2
	exit 1
fi

if [[ -z "$LOCAL_URL" ]]; then
	echo "error: Set DATABASE_URL to your local Postgres URL (e.g. postgresql://you@localhost:5432/ibc)," >&2
	echo "       or set LOCAL_DATABASE_URL." >&2
	exit 1
fi

for cmd in pg_dump pg_restore; do
	if ! command -v "$cmd" &>/dev/null; then
		echo "error: '$cmd' not found. Install PostgreSQL client tools (e.g. brew install libpq)." >&2
		exit 1
	fi
done

TMPDIR="${TMPDIR:-/tmp}"
DUMP_FILE="$TMPDIR/ibc-prod-pull-$(date +%Y%m%d%H%M%S).dump"

echo "==> Dumping remote DB → $DUMP_FILE"
pg_dump "$NEON_URL" --no-owner --no-acl -F c -f "$DUMP_FILE"

echo "==> Restoring into local database"
set +e
pg_restore -d "$LOCAL_URL" --no-owner --no-acl --verbose "$DUMP_FILE"
RESTORE_STATUS=$?
set -e

if [[ "$RESTORE_STATUS" -ge 2 ]]; then
	echo "" >&2
	echo "pg_restore failed (exit $RESTORE_STATUS)." >&2
	echo "Try a clean local DB: dropdb ibc && createdb ibc && pnpm db:pull:prod" >&2
	exit "$RESTORE_STATUS"
fi
if [[ "$RESTORE_STATUS" -eq 1 ]]; then
	echo "==> pg_restore reported warnings (exit 1); often safe to ignore."
fi

echo "==> Done. Ensure .env.local has DATABASE_URL pointing at local (same as restore target), then: pnpm dev"
echo "    rm -f \"$DUMP_FILE\"   # optional: remove dump file"
