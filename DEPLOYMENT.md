# Deployment: Vercel + Neon (ibc-app)

## Neon project

Production Postgres lives in a **Neon** project owned by the stakeholder account. **Do not commit connection strings.** Canonical URLs:

- **1Password → Open Claw → Neon IBC** — store **production** pooled connection string only (no stray dev URLs in that item).
- After any Neon project move, update that item and **Vercel** `DATABASE_URL` together.

Historical reference (superseded once migrated): old internal project id appeared in docs as `still-butterfly-70784920`; ignore after cutover.

### Linear

- **[IBC-68 — Migrate Neon production to stakeholder account + sanitize + Vercel cutover](https://linear.app/ibc-app/issue/IBC-68/migrate-neon-production-to-stakeholder-account-sanitize-vercel-cutover)** — migration checklist and acceptance criteria.

### One-time: migrate DB to stakeholder Neon + sanitize

Run **only** when cutting over to a new Neon project. Requires `pg_dump` and `psql` (e.g. `brew install libpq`).

1. **Create** an empty database on the stakeholder Neon **production** branch (same DB name as today, e.g. `ibc-db`, unless you intentionally change it).
2. **Copy data** from current production → new DB (stream; no files with secrets committed):

   ```bash
   export SOURCE_DATABASE_URL="postgresql://...(current prod)..."
   export TARGET_DATABASE_URL="postgresql://...(stakeholder empty prod)..."
   pnpm db:migrate:neon-stakeholder
   ```

3. **Sanitize** the **target** (sessions, tokens, all events, recent test users — see script header):

   ```bash
   DATABASE_URL="$TARGET_DATABASE_URL" pnpm db:sanitize:neon-cutover
   DATABASE_URL="$TARGET_DATABASE_URL" pnpm db:sanitize:neon-cutover --apply
   ```

4. **1Password:** update **Neon IBC** with **only** the new production URL.
5. **Vercel:** set **Production** `DATABASE_URL` to the new URL; align **Preview** (same DB vs separate Neon branch); remove duplicate env rows; reconnect **Neon–Vercel** integration if the Neon project changed.
6. **Redeploy** production and smoke-test (login, dashboard, `/dashboard/members`, `/stats`, admin).

Operator checklist (copy/paste):

- [ ] `pnpm db:migrate:neon-stakeholder` succeeded; spot-check row counts (`users`, `stats_*`).
- [ ] `pnpm db:sanitize:neon-cutover` dry-run reviewed; `--apply` completed.
- [ ] 1Password Neon IBC updated (prod only).
- [ ] Vercel `DATABASE_URL` + integration verified.
- [ ] Production smoke test complete.

## Using the Neon–Vercel integration (recommended)

If you connected the project via **Neon’s Vercel integration** (Neon Console → Integrations → Vercel, or Vercel Marketplace → Connectable Accounts → Neon):

- **Production** → Uses your Neon **default branch** (production). Same DB you seeded; no new tables per deploy.
- **Preview** → The integration can create a **new Neon branch per preview**. Each branch is a **clone of your default (production) branch** at creation time.

After migrating to a **new** Neon project, open **Neon** and **Vercel** integrations and confirm they point at that project’s default branch.

---

## Manual Vercel environment variables (if not using the integration)

Use the **same** Neon database for Production and Preview if you want preview deployments to share production data (common for small teams).

| Vercel environment | `DATABASE_URL`                                      |
| ------------------ | --------------------------------------------------- |
| **Production**     | Neon **production** branch connection string        |
| **Preview**        | Same as Production _or_ a dedicated Neon branch URL |

### How to set in Vercel

1. Open [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Environment Variables**.
2. Add or edit **`DATABASE_URL`**.
3. Set the value to your Neon **production** branch connection string (from 1Password or Neon console).
4. Enable the variable for **Production** and **Preview** (and optionally Development if you run Vercel dev against Neon).
5. Redeploy so new builds pick up the value.

### Where to get the connection string

1. Open [Neon Console](https://console.neon.tech) → stakeholder **ibc-app** (or current project name).
2. Select the **production** branch (default branch).
3. Copy the **Connection string** (pooled recommended, e.g. `postgresql://...@...-pooler...neon.tech/ibc-db?sslmode=require`).

Do **not** commit the connection string or put it in repo files. Keep it only in Vercel (and local `.env.local`).

## If Preview was using the development branch

If Preview was previously pointing at the Neon **development** branch (e.g. via Neon’s “Connect to Vercel” integration), it would use a different database. To fix it:

- In Vercel **Environment Variables**, set **`DATABASE_URL`** for **Preview** to your Neon **production** branch connection string. This overrides any value injected by the Neon integration and makes Preview use the same DB as Production.

## Build

The build runs `scripts/ensure-users-schema.ts` then `vite build`, so the `users` table gets any missing columns (e.g. `username`) without interactive prompts.

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

Runs on pushes and pull requests targeting `main`, `development`, and `preview`:

1. `pnpm install --frozen-lockfile`
2. `pnpm run ci` — `svelte-check`, full ESLint (including Svelte), Vitest, then `vite build`

CI does **not** run `build:vercel` (no database connection). **Vercel** still builds with `pnpm run build:vercel` from `vercel.json`, using project environment variables and `ensure-users-schema.ts` when `DATABASE_URL` is set.

Use **Node 22** locally (see `.nvmrc`) to match the CI and Vercel runtime.

### Lint commands

| Command        | Purpose                                                                |
| -------------- | ---------------------------------------------------------------------- |
| `pnpm lint:ts` | ESLint on TS/scripts only (`**/*.svelte` ignored) — quick local check  |
| `pnpm lint`    | Prettier check + full ESLint                                           |
| `pnpm run ci`  | What GitHub Actions runs: check + ESLint + tests + build (no Prettier) |

## Cleaning up duplicate Vercel env vars

If you see multiple `DATABASE_URL` or `DATABASE_URL_UNPOOLED` rows (e.g. old git-branch overrides), trim them in **Vercel → Project → Settings → Environment Variables** so each target environment has a single clear source of truth for the Neon branch you want (e.g. production branch `DATABASE_URL` for Production and optionally Preview).

## Preview deployment isolation (IBC-54 audit, June 2026)

Vercel **Preview** deployments (PR branches, `preview` git branch) run `build:vercel`, which executes all `ensure-*` schema scripts against whatever `DATABASE_URL` is set for **Preview**. Preview traffic also reads/writes Postgres and Redis at runtime. If Preview points at **production** Neon, PR builds and bot crawls add compute load to the live member database.

### Audit summary

| Project | Vercel team | Role | Neon project |
| ------- | ----------- | ---- | ------------ |
| **ibc-ap** | Rob Crenshaw's projects | Stakeholder prod (`islandbeerclub.com`) | **Island Beer Club** (`dev-ops@islandbeerclub.com`) |
| **ibc-app** | Clumsy Ninja's projects | Hoagsmedia staging (`new.islandbeerclub.com`) | Separate Neon URL in Vercel (see env audit below) |

**Stakeholder Neon branches** (Island Beer Club):

| Branch | Purpose | Compute signal (Jun 2026) |
| ------ | ------- | ------------------------- |
| **`production`** (default) | Live site | Active — all prod traffic |
| **`vercel-dev`** | Intended Preview / non-prod | Idle — ~80 CPU seconds total; snapshot from May 2026 |

Recent stakeholder Vercel deploys are **Production-only** (`target: production`). Preview is still worth configuring before the next PR preview or `preview` branch deploy.

**Hoagsmedia `ibc-app` env audit** (`vercel env ls`, Jun 2026):

| Variable | Environments | Notes |
| -------- | ------------ | ----- |
| `DATABASE_URL` | **Production** only | Prod Neon connection |
| `DATABASE_URL` | **Preview**, **Development** | Separate row — may or may not match Production hostname |
| `UPSTASH_REDIS_REST_*` | **Production**, **Preview** | Shared Redis — use prefix on Preview (below) |

Sensitive values cannot be compared from the CLI. Use the hostname check (below) after pasting each value in Vercel **Edit**, or run `pnpm db:audit:url-host` locally with a pulled env file.

### Recommended configuration

**Stakeholder `ibc-ap` (islandbeerclub.com)**

| Vercel environment | `DATABASE_URL` should point to | `IBC_CACHE_REDIS_PREFIX` |
| ------------------ | ------------------------------ | ------------------------ |
| **Production** | Neon **`production`** branch (pooled `-pooler` host) | *(unset — default `ibc-cache:v1`)* |
| **Preview** | Neon **`vercel-dev`** branch (pooled URL from Neon console) | `ibc-preview` |
| **Development** | Optional: `vercel-dev` or local; avoid prod unless intentional | `ibc-dev` |

**Hoagsmedia `ibc-app` (`new.islandbeerclub.com`)**

| Vercel environment | `DATABASE_URL` | `IBC_CACHE_REDIS_PREFIX` |
| ------------------ | -------------- | ------------------------ |
| **Production** | Your prod/stakeholder-mirror Neon URL | *(unset)* |
| **Preview** | **Either** same as Production (small team, shared data) **or** a dedicated Neon branch | `ibc-preview` if sharing Redis with prod |
| **Development** | Local Postgres or Neon dev branch — not production unless intentional | `ibc-dev` |

Using **the same production DB for Preview** is acceptable for a small club site (documented choice). The cost risk is **extra Neon compute** from preview builds (`ensure-*` on every preview deploy) and accidental writes during testing — not data corruption if you treat Preview as read-only in practice.

**Isolating Preview** (recommended if PR previews are frequent): point Preview `DATABASE_URL` at **`vercel-dev`** (stakeholder) or create a dedicated Neon branch; refresh `vercel-dev` from `production` periodically via Neon **Reset from parent** when you need fresh data.

### Redis note

`UPSTASH_REDIS_REST_*` on both **Production** and **Preview** means session and stats cache keys collide unless Preview sets:

```bash
IBC_CACHE_REDIS_PREFIX="ibc-preview"
```

Add that in Vercel → **Preview** only (not Production).

### Cache timeouts

Every cache read, write and delete (`src/lib/server/redis.ts`, including the session-validation
cache) waits at most `CACHE_OPERATION_TIMEOUT_MS` (1000 ms). On timeout or error the request stops
waiting and skips the cache: reads count as a miss and the page or session is loaded from Postgres;
failed writes and deletes are logged and ignored.

- **Choice of 1 s.** Healthy Upstash calls usually take tens of milliseconds. 1 s keeps an
  unreachable cache (for example a `REDIS_URL` whose host does not resolve) from holding requests
  until the function timeout. A slow but otherwise healthy call can also exceed 1 s; it is then
  treated as a miss or skipped write, never as a request failure.
- **The bound limits waiting, not the operation.** A timed-out call is not cancelled. It may still
  complete afterwards, so a write that timed out can still land in Redis later.
- **Session invalidation.** Logout deletes the cached session, but a failed or timed-out delete — or
  an earlier session-cache write that lands after the delete — can leave the session cached. It then
  stays valid until its 90 s TTL expires, counted from when that write actually landed, which may be
  later than the logout.

### Verify hostnames without exposing secrets

1. Vercel → project → **Environment Variables** → **Edit** `DATABASE_URL` for **Production** — note the hostname segment (`ep-….neon.tech` or `….azure.neon.tech`).
2. Repeat for **Preview**.
3. **Same hostname** → Preview uses production Neon. **Different hostname** → isolated branch.
4. Or locally:

   ```bash
   pnpm db:audit:url-host   # uses DATABASE_URL from .env.local
   ```

   Compare after `vercel env pull` for each environment.

### Operator checklist (copy/paste)

- [ ] Stakeholder **Production** `DATABASE_URL` → Neon **production** branch (pooled).
- [ ] Stakeholder **Preview** `DATABASE_URL` → **`vercel-dev`** pooled URL **or** documented intentional prod share.
- [ ] Hoagsmedia **Preview** `DATABASE_URL` hostname verified against intent (prod share vs dev branch).
- [ ] **Preview** has `IBC_CACHE_REDIS_PREFIX=ibc-preview` on both projects if Redis is shared with prod.
- [ ] No duplicate / git-branch-scoped `DATABASE_URL` rows fighting the integration.
- [ ] After changes: redeploy one Preview deployment and confirm Neon **`vercel-dev`** compute ticks (if isolated) while **`production`** stays flat.
