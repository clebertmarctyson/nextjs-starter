---
name: domain-normalization-tradeoffs
description: When to normalize a schema vs. deliberately denormalize, and how to index for the queries the domain actually runs. Use when a schema design has redundant/duplicated data, when a query is slow due to excessive joins, or when deciding how many tables a piece of data should be split across.
metadata:
  tags: database, normalization, indexing, performance
---

## When to use

Load this once entities are identified (see [[domain-entity-modeling]]) and you're deciding how to actually split data across tables, or when an existing schema has either obvious duplication or painfully slow multi-join queries.

## The core tradeoff

Normalization (splitting data to eliminate redundancy) optimizes for write consistency and storage efficiency. Denormalization (duplicating/flattening data) optimizes for read speed at the cost of write complexity and potential inconsistency. Neither is universally "correct" — the right call depends on the domain's actual read/write pattern, not a textbook rule.

## Checklist

- [ ] **Default to normalized** (3NF-ish: each fact stored once, foreign keys instead of copy-pasted values) unless there's a measured reason not to — start correct, denormalize deliberately once a real bottleneck shows up, not preemptively.
- [ ] **Denormalize only with a specific, named reason**: a read-heavy path that's measurably slow with joins, a reporting/analytics table that intentionally trades freshness for query speed, or a cache table that's explicitly documented as derived/rebuildable data.
- [ ] **Every denormalized field has an update path.** A duplicated `customer_name` on an `orders` table is a bug waiting to happen unless something keeps it in sync on customer rename — a trigger, an application-layer update, or an explicit "this is a snapshot at order time, intentionally frozen" decision.
- [ ] **Indexes match the domain's actual query patterns**, not guesses. Index the columns that show up in `WHERE`, `JOIN`, and `ORDER BY` clauses of the queries that actually run in production — check the query log/slow query log, don't index speculatively.
- [ ] **Composite indexes ordered by selectivity/usage**, most-selective or most-commonly-filtered column first, matching how the app actually queries (a `(tenant_id, status)` index serves `WHERE tenant_id = ? AND status = ?` well; the same columns reversed may not, depending on the engine).
- [ ] **No redundant indexes** — an index on `(a, b)` already serves queries filtering on `a` alone; a separate index on just `a` is usually dead weight.
- [ ] **Over-normalization is also a smell**: if a "real-world scenario" query needs 6+ joins to answer a question the business asks constantly, that's a sign a denormalized read model or materialized view is warranted, not that the app layer should just eat the join cost forever.

## Pattern: intentional denormalization, documented

```sql
-- orders.customer_name_snapshot: deliberately denormalized.
-- Captures the customer's name AT THE TIME of the order for invoice/legal purposes.
-- NOT kept in sync with customers.name — that's the point (invoices shouldn't
-- retroactively change if the customer later renames their account).
ALTER TABLE orders ADD COLUMN customer_name_snapshot text;
```

Contrast with an *accidental* denormalization (duplicated data with no documented reason and no update path) — that's a bug, not a design decision. The difference is whether it's written down and intentional.

## Quick self-audit

1. For every place the same fact is stored in more than one table, is there a comment/doc explaining why, and how it stays in sync (or why it deliberately doesn't)?
2. Pull the slow-query log (or `EXPLAIN ANALYZE` the domain's core queries). Do the existing indexes actually match what's being filtered/joined/sorted on?
3. If a core "real-world scenario" query needs many joins, is that pain actually felt (slow in practice) or just theoretically inelegant? Don't denormalize for aesthetics.
