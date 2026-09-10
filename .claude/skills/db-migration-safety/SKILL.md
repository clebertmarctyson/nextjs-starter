---
name: db-migration-safety
description: Zero-downtime database migration patterns and a safety checklist — avoiding table locks, breaking deploys mid-rollout, or irreversible data loss. Use whenever writing a schema migration (adding/removing/renaming columns, changing types, adding constraints or indexes) on a table that's live in production.
metadata:
  tags: database, migrations, devops, sql
---

## When to use

Load this whenever writing a migration that touches a table with production data and traffic — especially column renames/drops, type changes, new `NOT NULL`/unique constraints, or new indexes on large tables.

## The failure mode this prevents

A migration that's correct in isolation can still take the site down: an `ALTER TABLE ... ADD COLUMN ... NOT NULL` without a default locks the table while it rewrites every row; a column rename breaks the currently-deployed app code mid-rollout because old code still expects the old name; a dropped column with no backup is unrecoverable the moment it's applied.

## Checklist

- [ ] **Migration is backward-compatible with the currently-running app version.** During a rolling deploy, old and new code run simultaneously against the same schema for some window — the migration must not break the old code before it's fully replaced.
- [ ] **Adding a column**: nullable or has a default that doesn't require a full-table rewrite (Postgres 11+/most modern engines handle constant defaults cheaply; verify for your engine/version).
- [ ] **Adding `NOT NULL` to an existing column**: done in two steps — backfill the column first, add the constraint after, not as one migration that locks while rewriting.
- [ ] **Renaming a column**: done as expand-contract (see pattern below), never a single in-place rename deployed atomically with the code change.
- [ ] **Dropping a column/table**: only after confirming nothing reads it (search codebase + check query logs), and only after a backup/export exists — treat as irreversible.
- [ ] **Adding an index on a large table**: created concurrently/online (`CREATE INDEX CONCURRENTLY` in Postgres, `ALGORITHM=INPLACE` in MySQL) — never a blocking index build on a live table.
- [ ] **Adding a unique/foreign-key constraint**: validate existing data satisfies it *before* adding the constraint, or the migration fails mid-deploy against real data.
- [ ] **Migration is reversible** or an explicit decision was made that it isn't (and that's called out in the PR) — a `down` migration that's a no-op silently is worse than no `down` migration.
- [ ] **Long-running migrations run outside the request path** — via a background job/maintenance window, not blocking app startup or a deploy step with a tight timeout.

## Pattern: expand-contract for a column rename (zero downtime)

Never do this in one step:
```sql
ALTER TABLE users RENAME COLUMN email TO email_address; -- breaks any code still reading `email`
```

Instead, across multiple deploys:

1. **Expand**: add the new column, dual-write both in application code, backfill old→new.
   ```sql
   ALTER TABLE users ADD COLUMN email_address text;
   -- backfill in batches, not one giant UPDATE locking the table
   ```
2. Deploy app code that writes to both columns, reads from the old one.
3. Once backfilled, deploy app code that reads/writes only the new column.
4. **Contract**: once no code references the old column, drop it in a separate migration.
   ```sql
   ALTER TABLE users DROP COLUMN email;
   ```

## Pattern: safe `NOT NULL` addition

```sql
-- Step 1: add nullable, backfill in batches
ALTER TABLE orders ADD COLUMN status text;
UPDATE orders SET status = 'completed' WHERE status IS NULL AND ...; -- batched, not one statement over millions of rows

-- Step 2 (separate migration, after backfill confirmed complete): enforce
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
```

## Quick self-audit before merging a migration touching a live table

1. Would this migration hold a lock on the table for longer than a few seconds at current table size? If unsure, check the engine's docs for that specific operation, or test against a prod-sized copy.
2. Does the migration assume the new code is already deployed? If yes, it'll break during the rollout window — split it.
3. Is anything being dropped/renamed in a way that can't be undone? Confirm a backup/export exists and it's called out explicitly, not assumed.
4. Does adding a constraint require existing data to already be valid? Validate that first, separately.
