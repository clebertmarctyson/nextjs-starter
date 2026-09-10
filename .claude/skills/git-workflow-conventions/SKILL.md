---
name: git-workflow-conventions
description: Branch naming, commit message format, PR size/description expectations, and merge policy for a team working in the same repos. Use whenever creating a branch, writing a commit message, opening a PR, or deciding how to merge one.
metadata:
  tags: git, workflow, team, collaboration
---

## When to use

Load this whenever creating a branch, writing a commit, opening a PR, or resolving how a branch should be merged/deployed.

## Branch naming

`type/short-description`, lowercase, hyphen-separated:
- `feature/invoice-export`
- `fix/login-redirect-loop`
- `chore/upgrade-node-20`
- Include a ticket/issue ID if the team tracks one: `feature/PROJ-142-invoice-export`

## Commit messages

- Imperative mood, present tense: "Add invoice export" not "Added" or "Adds".
- First line ≤ 72 chars, a summary — not a changelog of every file touched.
- Body (if needed) explains *why*, not *what* — the diff already shows what changed.
- One logical change per commit. A commit that mixes an unrelated formatting pass with a real fix makes `git blame`/`git bisect` useless later.
- **No tool-attribution trailers.** Commit messages describe the change, not what was used to write it — no "Co-Authored-By" lines for AI tools, no "Generated with X" footers. The team's commit history should read the same regardless of what tooling any individual contributor used.

## PR size & description

- Prefer PRs reviewable in one sitting (rough guideline: under ~400 changed lines, excluding generated/lockfile diffs). A PR that's naturally bigger (a big rename, a generated migration) should say so up front, not hide it.
- PR description answers: what changed, why, and how to verify it — not just "see commits."
- Link the ticket/issue if one exists.
- Screenshots/recordings for anything UI-visible — a reviewer shouldn't have to pull the branch to see what changed.

## Merge policy

- Pick one and stick to it per repo: squash-merge (clean linear history, most common default) vs. merge commit (preserves individual commits, useful for large collaborative branches) vs. rebase-merge. Document the choice in the repo's contributing notes so it's not a per-PR debate.
- `main`/`develop` is always deployable — a branch merges only after CI passes and review is approved, never "I'll fix it in a follow-up" for something already broken.
- Delete branches after merge to keep the branch list meaningful.

## What NOT to put in commit/PR history

- No secrets, even temporarily (a key committed then removed in a later commit is still in history — see [[secure-api-defaults]] for the broader secrets checklist).
- No internal tooling/vendor names that aren't relevant to understanding the change, if the repo is ever shared externally (client handoff, open source, acquisition due diligence) — keep history focused on the product, not the process used to build it.
