---
name: feature-flag-rollout
description: Safe patterns for shipping incomplete or risky work behind a feature flag so multiple people can merge to main without blocking each other, and so a bad change can be turned off instantly instead of requiring a revert-and-redeploy. Use when a feature will take multiple PRs to complete, when a change is risky enough to want a kill switch, or when deciding between a long-lived branch and trunk-based development with flags.
metadata:
  tags: feature-flags, deployment, rollout, trunk-based-development
---

## When to use

Load this when a feature spans multiple PRs and can't land in one shot, when a change is risky enough to want an instant off-switch independent of a deploy, or when choosing between a long-lived feature branch and merging incrementally behind a flag.

## Why flags over long-lived branches

A long-lived feature branch accumulates merge conflicts the longer it's separate from `main`, and it means the team isn't actually integrating continuously (see [[git-workflow-conventions]] — `main` should always be deployable). A feature flag lets incomplete work merge to `main` in small, reviewable pieces (matching [[modularity-boundaries]] discipline) while staying invisible/inactive until it's ready — trading branch-merge risk for flag-cleanup discipline, which is a better trade in almost every case.

## Types of flags, matched to purpose

- **Release flags** — hide an in-progress feature until it's done; short-lived, removed once the feature ships fully (days to weeks).
- **Kill switches / ops flags** — an instant off-switch for a risky feature already in production, so an on-call engineer can disable it without a deploy. Longer-lived, sometimes permanent for genuinely risky subsystems.
- **Experiment flags** — A/B testing a specific change against a metric; removed once the experiment concludes and a decision is made either way.
- **Permission/entitlement flags** — gating a feature by plan/tier (see [[multi-tenant-saas-patterns]] billing section) — these are intentionally long-lived, not cleanup candidates.

Release and experiment flags are temporary by design; ops and entitlement flags are meant to stay. Know which kind you're adding — it determines whether it needs a cleanup deadline.

## Checklist

- [ ] The flag has a clear owner and, for release/experiment flags, a removal plan — not left indefinitely once the feature has fully shipped (see [[modularity-dry-judgment]] — an unused `if (flag)` branch is dead code duplication waiting to happen).
- [ ] Flag checks happen in one clear place per decision point, not scattered inconsistently — a feature gated in the UI but not the API (or vice versa) is a real security/consistency gap, not just untidy code (pairs with [[secure-api-defaults]] — never trust a client-side-only flag check for anything security-relevant).
- [ ] Flag state changes (who flipped what, when) are logged/auditable — a production incident traced to "someone flipped a flag" needs the same rigor as a deploy, see [[incident-postmortem]].
- [ ] New code behind a flag still ships with tests for both states (flag on, flag off) per [[testing-strategy]] — untested flagged code is exactly the kind of thing that breaks the moment it's finally turned on.
- [ ] Flags default to the safe/off state — a flag that fails open (defaults to enabling a risky feature if the flag system itself is unreachable) is a design bug.

## Pattern: flag check in one place, not scattered

```ts
// WRONG — the same flag checked inconsistently in three different files,
// with slightly different logic each time
if (flags.isEnabled('new-checkout') && user.betaOptIn) { ... }  // file A
if (flags.isEnabled('new-checkout')) { ... }                     // file B — missing the opt-in check
if (user.betaOptIn) { ... }                                      // file C — missing the flag check entirely

// RIGHT — one function is the single source of truth for the decision
function shouldUseNewCheckout(user: User): boolean {
  return flags.isEnabled('new-checkout', { userId: user.id }) && user.betaOptIn;
}
```

## Flag hygiene: the part everyone skips

The most common failure isn't adding a flag — it's never removing it once the feature is fully rolled out. Stale flags accumulate as dead conditional branches, each one a small tax on readability and a source of confusion ("is this still actually gated, or is it just always true now?"). Treat "remove the flag and the old code path" as part of the feature's definition of done, not a separate, deprioritized cleanup task.

## Quick self-audit

1. List active flags. For each release/experiment flag, is it still needed, or has the feature been fully rolled out with no removal ticket filed?
2. For any flag gating something security/billing-relevant, is it enforced server-side, not just hidden in the client?
3. Does the flag default to the safe state if the flagging system itself is down/unreachable?
