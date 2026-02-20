# Database recovery

## If the `users` table is empty

The **CSV seed script** (`seed-from-csv.ts`) only runs UPDATEs and never deletes rows. If your `users` table was cleared, it was by something else (e.g. `seed-users.ts`, or a migration/push that truncated).

### Restore from JSON seed (30 users)

To repopulate with 30 users (with known passwords) from the bundled JSON:

```bash
pnpm run db:seed
```

Answer `y` when prompted. This will **clear** the `users` table and insert up to 30 users from `static/ibc-users.json`. Use this when the table is already empty and you need a working dev dataset.

### Restore from backup

If you have a Postgres backup (e.g. `pg_dump` or Neon point-in-time backup), restore that to get your full data back.
