#!/usr/bin/env bash
# Copy Neon **production** (DATABASE_URL_PROD) into local Postgres. Then use DATABASE_URL=local for `pnpm dev`.
#
# Needs: pg_dump + psql (e.g. brew install libpq)
#   export PATH="$(brew --prefix libpq)/bin:$PATH"
#
# .env.local:
#   DATABASE_URL="postgresql://YOU@localhost:5432/ibc"
#   DATABASE_URL_PROD="postgresql://...@...neon.tech/ibc-db?sslmode=require"
#
# **Best results:** empty local DB first (avoids “already exists” / stale schema):
#   dropdb ibc 2>/dev/null; createdb ibc
#
# Run: pnpm db:pull:prod

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

for cmd in pg_dump psql; do
	if ! command -v "$cmd" &>/dev/null; then
		echo "error: '$cmd' not found. Install PostgreSQL client tools (e.g. brew install libpq)." >&2
		exit 1
	fi
done

echo "==> Dumping Neon → piping into local psql (stripping PG17-only transaction_timeout for older local Postgres)"

set +e
pg_dump "$NEON_URL" --no-owner --no-acl -F p | sed -E '/transaction_timeout/d' | psql "$LOCAL_URL" -v ON_ERROR_STOP=1
PSQL_STATUS=$?
set -e

if [[ "$PSQL_STATUS" -ne 0 ]]; then
	echo "" >&2
	echo "psql restore failed (exit $PSQL_STATUS). Common fixes:" >&2
	echo "  1) Empty local DB, then retry:  dropdb ibc && createdb ibc && pnpm db:pull:prod" >&2
	echo "  2) Match Postgres major version to Neon (e.g. brew install postgresql@17) if errors persist." >&2
	exit "$PSQL_STATUS"
fi

echo "==> Done. DATABASE_URL should point at the same DB you restored into; then: pnpm dev"
