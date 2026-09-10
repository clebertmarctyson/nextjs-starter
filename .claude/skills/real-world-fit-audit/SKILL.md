---
name: real-world-fit-audit
description: Full-codebase audit for actual defects AND for code that's bug-free but doesn't match how the real business/domain actually operates — with a mandatory anti-hallucination discipline (exact file:line, concrete failure scenarios, a CONFIRMED/PLAUSIBLE verify pass) so findings are trustworthy, not invented. Use when asked to audit a codebase, find bad patterns, check for broken/nonsensical logic, or verify a project actually fits its real-world use case — not for a single diff review, which /code-review already covers.
metadata:
  tags: code-review, audit, quality, domain-modeling
---

## When to use

Load this when asked to audit an existing codebase (not just a diff) for correctness, code smells, or whether it actually models the real-world process it's supposed to support. For reviewing a single PR/diff, prefer the built-in `/code-review` command instead — this skill is for a broader, whole-codebase pass.

## Two distinct categories of finding

**Category A — actual defects.** Broken logic, dead code, correctness bugs, race conditions, patterns that will fail under real inputs. This is what most code review already looks for.

**Category B — real-world/domain mismatch.** Code that is bug-free, reasonably designed, passes its tests — and still doesn't match how the actual business process works. This is the category generic linters and most reviews miss entirely, because nothing is *technically* wrong. Cross-reference [[domain-entity-modeling]]: the standard here isn't "does this code have a bug," it's "does this code's model of the world match the real world it's supposed to represent."

To find Category B issues: pick a real business scenario (not a synthetic test case) and trace it end-to-end through the code. Does the flow match how the business actually operates, or does it silently assume something the business doesn't guarantee? Examples of the shape of these findings: an `Order` model with no way to represent a partial refund when the business does partial refunds routinely; a `status` enum missing a state the business actually needs; a workflow assuming one approver when the real process requires two.

## The anti-hallucination discipline — mandatory, not optional

This is the part that makes the audit trustworthy instead of noise:

- **Every finding cites an exact file and line**, and a concrete failure scenario: specific inputs or state that lead to a specific wrong output or consequence. "This seems risky" or "this could be a problem" is not a finding — it's a hunch. Either trace it to something concrete or don't report it.
- **A second, separate verification pass before finalizing.** After drafting a finding, re-read the actual current code at that location and confirm the failure scenario really happens given what the code actually does — not what it looks like it might do at a glance. This catches the single most common self-inflicted error: pattern-matching on code that *resembles* a known bad pattern without checking whether the surrounding logic actually triggers it.
- **Two verdict levels, used honestly:** **CONFIRMED** — re-verified against the actual current code, the failure scenario is real and reproducible from what's on disk. **PLAUSIBLE** — reasoned through, appears likely, but not fully traced (e.g. depends on runtime data/config not visible in the code, or depends on a code path not fully read). Report both, but never present a PLAUSIBLE finding with CONFIRMED-level confidence.
- **Never flag something as wrong purely because it's unfamiliar or differs from how this skill set would have written it.** The bar is "does this cause a real, demonstrable problem" — not "is this how we'd have done it." A different-but-equally-valid approach is not a finding.
- **When genuinely uncertain, say so and show the reasoning** — don't omit the concern entirely, and don't quietly upgrade it to certain. An honest "I traced this far and couldn't confirm further because X" is more useful than either silence or overclaiming.
- **Category B findings still need the same grounding as Category A.** "This doesn't match the real world" is not itself a finding — the finding is the specific scenario the code can't handle, traced to the specific place that assumption lives.

## What to actually look for (beyond the two categories above)

- Dead code and unreachable branches — confirm unreachability by tracing callers, don't assume from naming alone.
- Copy-pasted logic that should be one function per [[modularity-dry-judgment]] — but only where it's genuinely the same *decision*, not coincidentally similar code (see that skill's own caution against false positives here).
- Missing error handling on paths that can actually fail (network calls, parsing, external input) — verify the failure mode is real, not theoretical.
- Security gaps per [[secure-api-defaults]] and [[db-schema-security-review]] — these get the same file:line + concrete-scenario treatment as everything else.

## Checklist

- [ ] Every finding has a file:line and a concrete failure scenario, not a vague concern.
- [ ] Every finding was re-verified against the actual current code in a second pass before being reported.
- [ ] Findings are labeled CONFIRMED or PLAUSIBLE, matched honestly to actual confidence.
- [ ] At least one real business scenario was traced end-to-end specifically looking for Category B (domain mismatch) issues, not just Category A (bugs).
- [ ] Nothing is flagged solely for being stylistically different from how this skill set would write it.

## Quick self-audit (run this on the audit itself before delivering it)

1. For each finding: could someone else, reading only the file:line and the failure scenario, reproduce the problem without re-deriving it themselves? If not, it's not grounded enough yet.
2. Did every CONFIRMED finding actually get re-read against the current code, or is any of them resting on an earlier skim?
3. Is there at least one Category B finding, or does the audit only contain conventional bug-hunting? If the codebase genuinely has no domain-fit issues, that's a legitimate outcome — but check that the scenario-tracing step was actually done, not skipped.
