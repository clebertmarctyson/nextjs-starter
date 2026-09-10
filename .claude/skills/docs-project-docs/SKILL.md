---
name: docs-project-docs
description: What a project-level README/docs set should contain, and how to keep it from going stale as the code evolves. Use when starting a new repo, when a README is missing/outdated, or when onboarding would require asking a teammate questions the docs should already answer.
metadata:
  tags: documentation, readme, project-docs
---

## When to use

Load this when starting a new repo, when a README doesn't exist or is clearly stale, or when someone had to ask a question in chat that a doc should have already answered.

## What a project README needs (roughly this order)

1. **One-paragraph description** — what this project is and does, in plain language, for someone who's never seen it.
2. **Quickstart** — the minimum commands to get it running locally (install, configure, run). Tested by actually following it on a clean checkout, not written from memory.
3. **Architecture overview** — a short description (and diagram if the system has more than a couple of moving parts) of the major components and how they relate — see [[client-handoff-docs]] for the fuller version of this when a client/external team needs to take over.
4. **How to run tests** — the actual command, not "see CI config."
5. **How to deploy** — or a pointer to [[deployment-pipeline-setup]] if that's fully automated and documented there instead.
6. **Where things live** — a short map of the folder structure if it's not obvious from [[modularity-boundaries]]-style organization alone.
7. **Links, not duplication** — link to `CONTRIBUTING.md`, architecture decision records (see below), or other docs rather than copy-pasting their content into the README, so there's one source of truth per topic.

## Keeping docs from rotting

- [ ] A README claim ("run `npm start` to launch the dev server") is verified against the actual current command whenever that command changes — treat a broken quickstart command as a bug, not a doc nitpick.
- [ ] Docs live in the repo (versioned alongside the code), not in a separate wiki that drifts out of sync with what actually shipped — unless the team has explicit discipline to keep an external wiki current.
- [ ] A PR that changes how the project is run/configured/deployed updates the relevant doc in the same PR, not as a "docs follow-up" that may never happen.
- [ ] Screenshots/examples are dated or regenerated periodically — a UI screenshot from 8 versions ago actively misleads.
- [ ] Dead links and references to removed features are treated as bugs, found via periodic doc review, not left indefinitely.

## Architecture Decision Records (ADRs) — for the "why did we do it this way" that a README can't hold

For any non-obvious architectural choice (why this database over that one, why this auth approach, why a service boundary is drawn where it is), a short ADR captures: the decision, the context/constraints that drove it, and the alternatives considered. Keep them as small dated files (`docs/adr/0001-use-postgres-over-mongo.md`) rather than folding the reasoning into the README, which should stay focused on "how to use this," not "why every decision was made."

## Quick self-audit

1. Clone the repo fresh (or ask someone who's never touched it) and follow only the README's quickstart. Does it actually work end to end?
2. Pick 3 recent PRs that changed how something is run/configured. Did any of them update docs? If none did, docs are already drifting.
3. Are there decisions in the codebase a new engineer would ask "wait, why is it like this?" about, with no ADR or comment (see [[docs-code-comments]]) answering that question?
