---
name: onboarding-new-dev
description: A "clone to first PR merged" checklist so ramping up a new contributor is a documented, repeatable path instead of an ad-hoc set of Slack questions. Use when a new teammate/contributor is joining a project, or when reviewing whether a project is actually ready to onboard someone beyond its original author.
metadata:
  tags: onboarding, documentation, team-process
---

## When to use

Load this when a new contributor is about to join a project, or when auditing whether a project could actually onboard someone new without them needing to ask the original author a dozen questions.

## The target: clone to first merged PR, unassisted

The test of good onboarding isn't a document existing — it's whether a new contributor can go from a fresh clone to a merged first PR by following written steps, without pinging anyone. Every point where they'd have to ask a question is a gap in the docs, not a personal failing on their part.

## What the path needs, in order

**1. Access** — a written list of what needs requesting before day one: repo access, cloud/infra access scoped per [[cloud-iam-least-privilege]] (least privilege, not "give them what I have"), any third-party service accounts (Sentry, Stripe test mode, etc.), VPN/SSO if applicable.

**2. Environment setup** — the actual working quickstart from [[docs-project-docs]] (clone, install, configure `.env`, run) — verified recently, not written once and left to rot. If it doesn't work on a truly fresh machine, it's not done.

**3. Orientation** — where to find: the architecture overview, the [[architecture-decision-records]] if the project has them, the domain glossary/vocabulary (see [[domain-entity-modeling]]) so business terms make sense, the [[git-workflow-conventions]] and [[code-review-standards]] so their first PR doesn't get bounced on process grounds nobody told them about.

**4. A real first task** — not a toy "add your name to a list" exercise (teaches nothing about the actual codebase) and not a genuinely hard bug (discouraging and slow). A small, real, well-scoped issue that touches one feature area, ideally something already identified and tagged (`good-first-issue` or equivalent).

**5. Review loop** — their first PR gets reviewed per [[code-review-standards]] with slightly more explanatory context than usual (why a convention exists, not just that it was violated) — onboarding is exactly when unwritten conventions surface; capture them into docs instead of letting them stay unwritten for the next person too.

## Checklist for a project's onboarding readiness

- [ ] A documented quickstart exists and has been verified on a machine that isn't the original author's, recently.
- [ ] Access requirements are written down, not tribal knowledge in one person's head.
- [ ] Domain vocabulary/architecture overview exists somewhere discoverable (see [[claude-md-router-pattern]] if it's routed through `CLAUDE.md`) rather than requiring a live walkthrough every time.
- [ ] There's at least one well-scoped "first task" identified/tagged at any given time, not invented ad hoc when someone joins.
- [ ] Git/review conventions are written, not just known by whoever's been there longest.

## Anti-pattern: onboarding by osmosis

A project where a new contributor's real onboarding process is "sit with someone experienced and ask questions as they come up" isn't actually onboarded — it's dependent on that person's availability, doesn't scale past one new hire at a time, and the knowledge never gets captured for the *next* new contributor. Every question asked in a live onboarding session is a candidate to become a line in a doc.

## Quick self-audit

1. Could someone unfamiliar with this project go from `git clone` to a running dev environment using only what's written down?
2. Look at the last few new-contributor Slack/chat questions (if any) — were the answers added to docs afterward, or will the next person ask the same thing again?
3. Is there a currently-tagged "first task" ready to hand someone, or would one have to be invented on the spot?
