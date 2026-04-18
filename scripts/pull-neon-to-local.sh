#!/usr/bin/env bash
# Pull schema + data from Neon into a local PostgreSQL database.
#
# Prerequisites: PostgreSQL client tools (pg_dump, pg_restore) — e.g. `brew install libpq`
#   and add to PATH: export PATH="$(brew --prefix libpq)/bin:$PATH"
#
# Usage:
#   export NEON_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/ibc-db?sslmode=require"
#   export LOCAL_DATABASE_URL="postgresql://postgres:pass@localhost:5432/ibc"
#   pnpm db:pull:neon
#
# Target database should be empty (or only safe to overwrite). Create first:
#   createdb -h localhost -U postgres ibc

set -euo pipefail

NEON_URL="${NEON_DATABASE_URL:-${NEON_URL:-}}"
LOCAL_URL="${LOCAL_DATABASE_URL:-${LOCAL_DB_URL:-}}"

if [[ -z "$NEON_URL" ]]; then
	echo "error: Set NEON_DATABASE_URL (or NEON_URL) to your Neon connection string." >&2
	exit 1
fi

if [[ -z "$LOCAL_URL" ]]; then
	echo "error: Set LOCAL_DATABASE_URL (or LOCAL_DB_URL) to your local Postgres URL." >&2
	exit 1
fi

for cmd in pg_dump pg_restore; do
	if ! command -v "$cmd" &>/dev/null; then
		echo "error: '$cmd' not found. Install PostgreSQL client tools (e.g. brew install libpq)." >&2
		exit 1
	fi
done

TMPDIR="${TMPDIR:-/tmp}"
DUMP_FILE="${DUMP_FILE:-$TMPDIR/ibc-neon-pull-$(date +%Y%m%d%H%M%S).dump}"

echo "==> Dumping Neon → $DUMP_FILE"
pg_dump "$NEON_URL" --no-owner --no-acl -F c -f "$DUMP_FILE"

echo "==> Restoring into local database"
set +e
pg_restore -d "$LOCAL_URL" --no-owner --no-acl --verbose "$DUMP_FILE"
RESTORE_STATUS=$?
set -e

# pg_restore: 0 = ok, 1 = warnings only, >=2 = error
if [[ "$RESTORE_STATUS" -ge 2 ]]; then
	echo "" >&2
	echo "pg_restore failed (exit $RESTORE_STATUS)." >&2
	echo "If objects already exist locally, drop and recreate the database, then re-run:" >&2
	echo "  dropdb ... ibc && createdb ... ibc && pnpm db:pull:neon" >&2
	exit "$RESTORE_STATUS"
fi
if [[ "$RESTORE_STATUS" -eq 1 ]]; then
	echo "==> pg_restore reported warnings (exit 1); often safe to ignore."
fi

echo "==> Done. Point .env.local DATABASE_URL at your local URL and restart dev."
echo "    rm -f \"$DUMP_FILE\"   # optional: remove dump file"
