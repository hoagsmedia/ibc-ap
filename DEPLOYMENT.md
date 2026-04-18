# Deployment: Vercel + Neon (ibc-app)

## Neon project

- **Project:** ibc-app (`still-butterfly-70784920`)
- **Branches:**
  - **production** (default) — main DB, seeded with CSV members.
  - **development** — separate branch (optional).

## Using the Neon–Vercel integration (recommended)

If you connected the project via **Neon’s Vercel integration** (Neon Console → Integrations → Vercel, or Vercel Marketplace → Connectable Accounts → Neon):

- **Production** → Uses your Neon **default branch** (production). Same DB you seeded; no new tables per deploy.
- **Preview** → The integration creates a **new Neon branch per preview** (e.g. `preview/feature-username-csv-seed`). That branch is a **clone of your default (production) branch**, so:
  - It does **not** create new tables on every deployment; it reuses the same schema (and our build only runs `ensure-users-schema.ts` to add missing columns if needed).
  - It **is seeded**: the clone gets the same schema and data as production at branch-creation time (your 594 users, etc.). Login with the default password works on previews.

So the integration **does fix** the earlier problem: previews no longer point at the development branch; each preview gets its own branch cloned from production (seeded). When the Git branch is deleted, the integration can automatically delete the corresponding Neon branch.

Ensure the integration is connected to your Neon **default (production) branch** so preview branches are cloned from the seeded DB.

---

## Manual Vercel environment variables (if not using the integration)

Use the **same** Neon database for Production and Preview so preview deployments have the same data and login works.

| Vercel environment | `DATABASE_URL` |
|--------------------|----------------|
| **Production**     | Neon **production** branch connection string |
| **Preview**        | Neon **production** branch connection string (same as Production) |

### How to set in Vercel

1. Open [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Environment Variables**.
2. Add or edit **`DATABASE_URL`**.
3. Set the value to your Neon **production** branch connection string.
4. Enable the variable for **Production** and **Preview** (and optionally Development if you run Vercel dev against Neon).
5. Redeploy so new builds pick up the value.

### Where to get the connection string

1. Open [Neon Console](https://console.neon.tech) → **ibc-app** project.
2. Select the **production** branch (default branch).
3. Copy the **Connection string** (pooled recommended, e.g. `postgresql://...@...-pooler.westus3.azure.neon.tech/ibc-db?sslmode=require`).

Do **not** commit the connection string or put it in repo files. Keep it only in Vercel (and local `.env.local`).

## If Preview was using the development branch

If Preview was previously pointing at the Neon **development** branch (e.g. via Neon’s “Connect to Vercel” integration, which can map preview branches to the Neon development branch), it would use a different database. To fix it:

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

| Command | Purpose |
|--------|---------|
| `pnpm lint:ts` | ESLint on TS/scripts only (`**/*.svelte` ignored) — quick local check |
| `pnpm lint` | Prettier check + full ESLint |
| `pnpm run ci` | What GitHub Actions runs: check + ESLint + tests + build (no Prettier) |

## Cleaning up duplicate Vercel env vars

If you see multiple `DATABASE_URL` or `DATABASE_URL_UNPOOLED` rows (e.g. old git-branch overrides), trim them in **Vercel → Project → Settings → Environment Variables** so each target environment has a single clear source of truth for the Neon branch you want (e.g. production branch `DATABASE_URL` for Production and optionally Preview).
