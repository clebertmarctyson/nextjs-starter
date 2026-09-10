---
name: legacy-project-adoption
description: Absorb a teammate's existing personal/AI-generated project into Vunep's standards — audits it against our skill set, produces a gap list, and either restructures in one pass or step-by-step depending on risk, without assuming the code should be discarded. Use when a project built outside our process (a personal side project, something scaffolded by another AI tool, an early prototype) is being brought under Vunep's engineering standards.
metadata:
  tags: onboarding, migration, code-quality, team-process
---

## When to use

Load this when a project that wasn't built through our normal process — a teammate's personal project, something bootstrapped with a different AI tool, an early solo prototype — needs to become a real, maintainable Vunep project going forward.

## The core stance: reshape, don't discard

The code already works, or mostly works — that has real value. The goal is bringing it under the same standards every other Vunep project runs on ([[git-workflow-conventions]], [[package-json-standards]], [[github-repo-config]], [[testing-strategy]], the architecture skills), not rewriting it from scratch because it wasn't built "our way." Discard only what's actually broken or actively harmful (see [[real-world-fit-audit]] for finding that) — everything else gets reshaped in place.

## Phase 1 — Audit first, always

Before changing anything, produce a written gap list, mirroring the audit done on `nextjs-starter` itself:
- **`package.json` completeness** — [[package-json-standards]]: is `description`/`license`/`author`/`repository`/`engines` filled in, or scaffold defaults left in place?
- **`.github/` hygiene** — [[github-repo-config]]: CI, issue/PR templates, `dependabot.yml` present or missing entirely?
- **README quality** — [[docs-project-docs]]: does the quickstart actually work on a fresh clone?
- **Test coverage** — [[testing-strategy]]: real tests, coverage theater, or none at all?
- **Structure** — [[architecture-layering]], [[modularity-boundaries]], [[domain-entity-modeling]]: does the code separate concerns sensibly, or is everything in one file/route handler? Does the schema/entity naming match the actual business domain or generic scaffold defaults?
- **Security** — [[secure-api-defaults]], [[db-schema-security-review]]: any secrets committed, any missing auth checks, any PII stored in plaintext?

This phase produces a list, not a diff. Nothing gets changed yet.

## Phase 2 — Decide mode per project, not globally

Not every gap deserves the same treatment:

- **Mechanical, low-risk gaps** — missing `package.json` fields, no `.gitignore` entry, no CI, no issue templates — fix in one pass. These don't touch behavior, so there's nothing to review incrementally.
- **Structural gaps** — wrong module boundaries, missing layering, DRY violations spanning many files, a schema that needs real remodeling — go step-by-step, each step its own reviewable commit/PR per [[git-workflow-conventions]]. A single giant restructuring commit touching business logic is unreviewable and risky; nobody can meaningfully approve a 3,000-line diff.
- Mixed cases are common — do the mechanical fixes in one pass immediately, queue the structural ones as separate follow-up work with the audit's gap list as the tracking reference.

## Phase 3 — Preserve, don't erase, unless asked

- Default to keeping the original author's git history — restructure on top of it, don't squash away authorship. The history is real information (who built what, why, in what order).
- Keep working functionality working — verify before and after each structural change (build, tests, manual smoke-check), same discipline as any dependency upgrade (see the verification pattern used when `nextjs-starter` was upgraded: build, lint, typecheck, and an actual functional check, not just "it compiles").
- Never force-push, rewrite history, or delete the original repo without explicitly asking first — these are irreversible and the original author may have branches/local work that would be lost.

## Phase 4 — Bring it into the team system

- Install the shared skill set: `npx skills add vunep/skills --skill '*' -a claude-code -y`, committed to git — see [[using-vunep-skills]].
- Bring `.github/` up to the standard (`github-repo-config`) if it wasn't already there.
- Wire CI per [[deployment-pipeline-setup]] if it doesn't already run lint/test/build on every PR.

## Checklist

- [ ] A written gap list exists before any code changes — audit, not assumption.
- [ ] Mechanical fixes and structural changes are explicitly separated, not bundled into one commit.
- [ ] Original git history is preserved unless the user explicitly asked otherwise.
- [ ] Every structural change is verified (build/test/manual check) before moving to the next one — no batch of unverified changes.
- [ ] The project ends up with `.claude/skills/` installed from `vunep/skills`, not left as a one-off exception to the team's system.

## Quick self-audit

1. Is there a clear, written record of what was wrong before any fix was applied — or is the "before" state only reconstructable from git history?
2. For any structural change: was it verified working before moving to the next one, or did several changes stack up unverified?
3. Did anything irreversible (force-push, history rewrite, deletion) happen without an explicit ask first?
