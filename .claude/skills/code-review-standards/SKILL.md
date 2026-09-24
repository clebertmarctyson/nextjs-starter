---
name: code-review-standards
description: What reviewers should check for, response-time expectations, and how to handle disagreement in code review. Use whenever reviewing a PR, requesting review on one, or when review turnaround/quality is inconsistent across a team.
metadata:
  tags: code-review, team, collaboration
---

## When to use

Load this when reviewing a PR, preparing one for review, or when a team's review process needs a shared baseline (inconsistent turnaround, reviewers checking different things, disagreements dragging on).

## What a reviewer checks, roughly in this order

1. **Correctness** — does it do what the PR claims, including edge cases the description doesn't mention?
2. **Tests** — new behavior has coverage; a bug fix has a regression test that would've caught it.
3. **Security/data-safety** — anything touching auth, user input, or data handled per [[secure-api-defaults]] / [[db-schema-security-review]] as applicable.
4. **Design fit** — does this fit how the rest of the codebase does things, or silently introduce a second way to do the same thing?
5. **Readability** — would a teammate unfamiliar with this change understand it in six months? Naming, structure, comments only where the *why* isn't obvious.
6. **Style/formatting** — last, and ideally not a human's job at all — enforced by linters/formatters in CI, not debated in review comments.

## Response-time expectations

- Set an explicit SLA the team agrees on (e.g. "first review pass within 1 business day") — an unspoken expectation just becomes "whenever," and PRs rot.
- A reviewer who can't get to it in time says so and tags someone else, rather than silently sitting on it.
- Small PRs (typo fixes, config bumps) get fast-tracked — don't make trivial changes wait behind the same queue as a large feature.

## Giving feedback

- Distinguish blocking ("this is wrong/unsafe, must fix") from non-blocking (nit, suggestion, question) — prefix comments accordingly (`nit:`, `question:`, `blocking:`) so the author knows what's actually gating merge.
- Comment on the code, not the author. "This function doesn't handle X" not "you forgot X."
- If a comment applies to more than this one line, say so once — don't repeat the same nit on every occurrence, link back to the first instance instead.
- Approve with comments when the issues are all non-blocking — don't hold a PR hostage over style preferences.

## Handling disagreement

- Two rounds of back-and-forth in comments with no resolution → move to a synchronous conversation (call, chat), then summarize the outcome back on the PR so the resolution is recorded.
- If it's a genuine judgment call with no clear right answer, the PR author's approach wins by default (they're the one who has to live with it) unless the reviewer has a concrete correctness/safety concern, not just a preference.
- Repeated disagreements on the same topic across PRs is a signal the team needs a written convention (add it to this skill or the project's own docs), not another one-off argument.

## Anti-patterns to avoid

- Rubber-stamp approvals with no actual read-through — defeats the purpose and lets bugs through.
- Review comments that only exist in chat/Slack instead of on the PR — the review trail should be self-contained and visible to anyone reading history later.
- Blocking on style nits a linter should catch — fix the linter config instead of relitigating it per PR.
- Author merging their own PR without approval "because it was urgent" — if that happens often enough to be a pattern, fix the review SLA, don't erode the process.
