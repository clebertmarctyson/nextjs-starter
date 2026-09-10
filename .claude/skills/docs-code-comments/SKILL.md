---
name: docs-code-comments
description: When a code comment or docstring earns its place versus when it just restates what well-named code already says, and how to keep comments from rotting out of sync with the code. Use when writing a comment/docstring, when reviewing whether existing comments still add value, or when code changes and old comments might now be wrong.
metadata:
  tags: documentation, comments, code-quality
---

## When to use

Load this whenever you're about to write a comment or docstring, or when reviewing/editing code that has existing comments nearby that might now be stale.

## The rule: comment the why, never the what

Well-named functions/variables already say *what* the code does. A comment that restates that adds noise and a second thing that can go stale. A comment earns its place only when it captures something the code itself can't express:

- **A non-obvious constraint** ("must run before the cache warms, see incident #142")
- **A workaround for a specific bug** in a dependency/API ("Safari drops this event without the timeout — see WebKit bug 12345")
- **A subtle invariant** that isn't visible from the code's shape ("this list is assumed sorted by the caller — do not resort here")
- **Why NOT the obvious alternative** ("intentionally not using a transaction here — see [[db-migration-safety]] for why this needs to commit incrementally")

## Checklist

- [ ] Before writing a comment, ask: "would renaming the function/variable make this comment unnecessary?" If yes, rename instead of commenting.
- [ ] Never write a comment that just translates the line below it into English (`// increment counter` above `counter++`).
- [ ] Never write a comment referencing the current task/ticket/PR number as if it explains the code forever ("added for the checkout redesign") — that context rots the moment the PR merges and the reader six months later has no idea what "the checkout redesign" was.
- [ ] Docstrings on public functions/APIs describe the contract (inputs, outputs, side effects, error conditions) — not a restatement of the function name.
- [ ] When editing code that has a nearby comment, check whether the comment is still accurate — a comment describing behavior that no longer exists is worse than no comment, because it actively misleads.
- [ ] Comments aren't a substitute for tests — a comment saying "this handles the edge case where X" without a test proving it is a claim, not a guarantee.

## Pattern: comment the why, not the what

```ts
// WRONG — restates the code, adds nothing
// loop through users and check if active
for (const user of users) {
  if (user.isActive) { ... }
}

// RIGHT — explains a non-obvious constraint the code alone doesn't convey
// Filtering client-side (not in the query) because the "active" definition
// here includes a 30-day grace period the DB view doesn't account for.
for (const user of users) {
  if (user.isActive) { ... }
}
```

## Docstring pattern (only where the contract isn't obvious from the signature)

```ts
/**
 * Reserves inventory for the given items. Throws OutOfStockError if any
 * item is unavailable — callers must catch this and roll back the order,
 * this function does not roll back partial reservations itself.
 */
function reserveInventory(items: OrderItem[]): Promise<void> { ... }
```

Worth writing because the *error/rollback behavior* isn't visible from the signature. A simple pure function (`add(a: number, b: number): number`) needs no docstring — the signature says everything.

## Quick self-audit

1. Grep for comments that start with a verb matching the line right below them (`// get`, `// set`, `// loop`, `// check`) — likely restating, not explaining.
2. For any comment mentioning a specific bug, workaround, or edge case: is there a linked reference (issue number, doc) or is it a bare unverifiable claim?
3. When touching a function with an existing comment/docstring, did the behavior it describes actually change? If yes, update or remove the comment in the same edit — don't leave it for later.
