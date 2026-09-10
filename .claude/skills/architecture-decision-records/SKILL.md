---
name: architecture-decision-records
description: Capture the "why" behind a non-obvious architectural choice as a short, dated ADR file — so a future engineer (or agent) doesn't have to guess or re-litigate a decision that was already made deliberately. Use when making a choice between real alternatives (database, auth approach, service boundary, major library), or when someone would reasonably ask "wait, why is it like this?"
metadata:
  tags: documentation, architecture, decision-making
---

## When to use

Load this whenever a non-obvious, hard-to-reverse technical decision gets made — choosing between real alternatives, not a decision with only one reasonable answer.

## What counts as ADR-worthy (and what doesn't)

**Worth an ADR**: choosing Postgres over Mongo for a specific reason, picking a particular auth strategy over the obvious alternative, deciding to denormalize a specific table (pairs with [[domain-normalization-tradeoffs]]), drawing a service boundary in a non-obvious place, adopting or rejecting a major library/framework, a deliberate tradeoff that a reviewer would likely question.

**Not worth an ADR**: routine implementation details, anything with only one sane choice, decisions already fully explained by a code comment (see [[docs-code-comments]]) because they're local and small. An ADR is for decisions that affect the shape of the system, not a single function.

## Format — small, dated, focused

```markdown
# 0007: Use Postgres row-level security for tenant isolation

Date: 2026-03-12
Status: Accepted

## Context

We need to guarantee tenant data isolation in a shared-schema multi-tenant
database (see [[multi-tenant-saas-patterns]]). App-layer WHERE-clause
scoping alone has failed at other companies when a single query is missed.

## Decision

Enable Postgres RLS on every tenant-scoped table, enforced at the database
layer, in addition to app-layer scoping — belt and suspenders, not a
replacement for careful query-writing.

## Alternatives considered

- Schema-per-tenant: rejected, too much migration/ops overhead for our tenant count and growth rate.
- App-layer scoping only: rejected, single point of failure — one missed WHERE clause leaks data.

## Consequences

- Every new table needs an RLS policy added at creation time, not as an afterthought.
- Slight query-planning overhead, measured as negligible at our current scale.
```

Keep each ADR to roughly this length — a paragraph or two per section, not an essay. If it's ballooning past a page, the decision it's documenting is probably actually several decisions that should be split.

## Where they live and how they're numbered

`docs/adr/0001-short-title.md`, `docs/adr/0002-short-title.md`, sequential, never renumbered or reused even if a later decision supersedes an earlier one — supersession is recorded by adding `Status: Superseded by 0012` to the old file, not deleting it. The history of *why* something changed is as valuable as the current state.

## Checklist

- [ ] The decision involved real alternatives that were seriously considered, not a single obvious path being rubber-stamped after the fact.
- [ ] Context section explains the actual constraint/problem that drove the decision, not just restates the decision.
- [ ] Consequences section is honest about tradeoffs accepted, not just upsides.
- [ ] Referenced from wherever a future reader would naturally look — a `CLAUDE.md` router entry (see [[claude-md-router-pattern]]) or the project README (see [[docs-project-docs]]), not buried with no pointer to it.
- [ ] Written at the time the decision is made, not reconstructed months later from memory — the reasoning is freshest right when the decision happens.

## Quick self-audit

1. Pick a surprising thing in the codebase's architecture. Is there an ADR explaining it? If not, and someone would reasonably ask why, that's a gap.
2. Do existing ADRs read as honest tradeoff records, or as after-the-fact justification with no real alternatives listed?
3. Is the ADR directory discoverable from the project's main entry points (README/CLAUDE.md), or would a new engineer have to stumble onto it?
