# Island Beer Club (ibc-app)

Member website for the Island Beer Club: public pages (history, events, gallery, stats) plus an
authenticated member area (directory, invitations, profiles).

## Stack

Svelte 5 · SvelteKit 2 · TypeScript · shadcn-svelte · Drizzle ORM / Postgres (Neon) · Redis cache
(Upstash in deployment) · Node 22 · pnpm.

## Getting started

```sh
pnpm install
cp .env.example .env.local   # fill in local values; never commit real secrets
pnpm dev
```

Node `22.x` is required (`.nvmrc`, `engines` in `package.json`).

## Checks

```sh
pnpm check     # svelte-check
pnpm lint      # prettier + eslint
pnpm test      # vitest (src/lib/server/redis.local.test.ts needs a local Redis; it skips otherwise)
pnpm run ci    # check + eslint + vitest + vite build
```

## Database and deploy scripts

`pnpm build:vercel` and the `db:*` scripts connect to whatever `DATABASE_URL` is set and can
change schema or data. Read a script before running it, and never point one at production by
accident. See [DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel / Neon setup, environment variables,
and cache configuration.

## More

- [AGENTS.md](AGENTS.md) — notes for AI assistants, including the Svelte MCP setup.
- [docs/profile-reconciliation.md](docs/profile-reconciliation.md) — offline, read-only profile
  reconciliation dry run.
