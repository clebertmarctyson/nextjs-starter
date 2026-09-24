---
name: code-style-enforcement
description: Setting up linter/formatter/editorconfig so style is enforced automatically by tooling in CI, not debated in PR comments or left to individual habit. Use when a new project has no linting/formatting configured, when style debates keep recurring in code review, or when contributors' code visibly differs in formatting.
metadata:
  tags: linting, formatting, tooling, code-quality
---

## When to use

Load this when scaffolding a new project's tooling, when [[code-review-standards]] keeps surfacing style nits that should be automated instead, or when a codebase visibly has inconsistent formatting across files/contributors.

## The core principle

Style is a solved problem — it should never be a human decision made repeatedly in code review. A linter/formatter enforced in CI (see [[deployment-pipeline-setup]]) turns "the reviewer has an opinion about tabs vs. spaces" into "the tool auto-fixes it or fails the build," removing the debate entirely. If the same style comment shows up more than once across PRs, that's a signal to add or fix a lint rule, not to keep repeating the comment.

## What to set up

**Formatter** (Prettier, `gofmt`, `black`, `rustfmt`) — opinionated, minimal configuration, auto-fixes on save/commit. Formatting should never be a matter of personal preference in a shared codebase; pick the ecosystem-standard formatter and stop customizing it beyond the essentials (line width, quote style) — endless formatter config bikeshedding defeats the purpose.

**Linter** (ESLint, Ruff, Clippy) — catches real issues (unused variables, unreachable code, likely bugs) as well as enforceable style conventions (import ordering, naming conventions) beyond what a formatter alone handles. Configure it to fail CI on errors, not just warn.

**Editor config** (`.editorconfig`) — baseline settings (indent size, line endings, charset) that every editor respects regardless of which formatter/linter is used — catches the cases before a formatter even runs.

**Pre-commit/pre-push hook** (optional but effective) — runs the formatter/linter locally before a commit lands, so style issues never even reach a PR. Complements, doesn't replace, the CI check (a hook can be skipped locally; CI can't).

## Pattern: layered enforcement

```
.editorconfig          — baseline, every editor respects it
prettier.config.js      — formatting, auto-fixable, runs on save + pre-commit
eslint.config.js        — linting, catches real issues + remaining style
.husky/pre-commit        — runs format+lint before a commit is even created
.github/workflows/ci.yml — final gate; nothing merges without passing
```

Each layer catches what the previous one missed, but CI is the actual enforcement point — everything before it is a convenience that speeds up the feedback loop, not a substitute for the CI gate itself.

## Checklist

- [ ] Formatter config exists and is applied to the whole codebase at once when first introduced (a single "format the codebase" commit, not gradual drift toward consistency).
- [ ] Linter fails the build on error-level rules — not just prints warnings that get ignored.
- [ ] CI runs both, on every PR, as a required check (see [[deployment-pipeline-setup]]) — not just available to run locally and easy to skip.
- [ ] New contributors get this automatically (editor config + a documented `pnpm run lint`/`format` command in the README per [[docs-project-docs]]) rather than having to discover the convention by getting corrected in review.
- [ ] Rule changes go through the same review process as code — a linter config change is a real decision, not something one person quietly adjusts.
- [ ] When the same style nit recurs across multiple PRs in [[code-review-standards]], that's the trigger to fix the lint config instead of repeating the comment a third time.

## Quick self-audit

1. Grep recent PR review comments for style-only feedback (formatting, naming, import order) — anything that recurs more than once should already be an automated lint rule, not a comment.
2. Confirm CI actually fails when lint/format checks fail — a check that's configured but not required to pass before merge isn't real enforcement.
3. Pick two files touched by different contributors — do they look like they were written by the same formatting convention, or does the difference in style reveal who wrote which?
