---
name: incident-postmortem
description: A blameless postmortem template and process for after something breaks in production — timeline, root cause, and concrete follow-up actions, so the team actually learns from the incident instead of just patching and moving on. Use after any production incident significant enough that someone asks "how do we make sure this doesn't happen again."
metadata:
  tags: incident-response, postmortem, reliability, team-process
---

## When to use

Load this after a production incident (an outage, a data issue, a security near-miss, a bad deploy) once the immediate fire is out — not during the incident itself, when the priority is mitigation, not documentation.

## Blameless, not toothless

"Blameless" means the postmortem asks "what in our systems/process allowed this to happen" instead of "who made the mistake" — a person making an error is almost always a symptom of a gap (missing test, missing alert, unclear runbook, a deploy that shouldn't have been possible without review), not the root cause itself. This isn't about avoiding accountability — it's about actually preventing recurrence, since blaming an individual fixes nothing structural and makes the next person less likely to report an issue honestly.

## Format

```markdown
# Postmortem: [short incident title]

Date of incident: 2026-03-12
Author(s):
Severity: [e.g. SEV-2 — partial outage, 40 min, no data loss]

## Summary

One paragraph: what broke, for how long, who/what was affected.

## Timeline (UTC)

- 14:02 — deploy of PR #482 to production
- 14:07 — error rate alert fires
- 14:15 — on-call identifies the deploy as the likely cause
- 14:19 — rollback initiated
- 14:24 — error rate back to baseline

## Root cause

What actually caused it, traced to the real underlying gap — not just "a bug in the code" but why that bug reached production undetected (missing test? no staging parity? alert threshold too loose?).

## Impact

Concretely: how many users/requests affected, any data implications, any SLA/contractual exposure.

## What went well

Don't skip this — genuinely useful for reinforcing what worked (fast alert, clean rollback path) so it doesn't get accidentally removed later.

## Action items

| Action | Owner | Due |
|---|---|---|
| Add integration test for X | | |
| Lower alert threshold on Y | | |
| Add staging parity check for Z | | |

Each item should be genuinely actionable and owned — "be more careful" is not an action item.
```

## Checklist

- [ ] Timeline is built from actual logs/timestamps, not memory — reconstruct from monitoring/deploy history, don't guess.
- [ ] Root cause traces to a systemic gap (missing test, missing alert, process gap), not just "human error" as the final answer — see [[testing-strategy]] if the gap is test coverage, [[deployment-pipeline-setup]] if it's a pipeline gap.
- [ ] Every action item has a named owner and is specific enough to verify done/not-done later — vague action items don't get done.
- [ ] The postmortem is shared with the whole team, not just the people directly involved — the value is in everyone learning from it, not filing it away.
- [ ] Follow-up: action items actually get tracked to completion (a ticket, not just a line in a doc that never gets revisited).

## Anti-patterns

- A postmortem that names an individual as "the cause" instead of the systemic gap that let their action reach production.
- Action items with no owner, or "monitor the situation" as the only follow-up.
- Skipping the postmortem for a "minor" incident that's actually the third occurrence of the same root cause — recurring minor incidents deserve exactly the same rigor as a major one, since the pattern itself is the real signal.
- Writing it days later from memory instead of while details (and logs) are still fresh.

## Quick self-audit

1. Read the root cause section — does it stop at "someone made a mistake," or does it identify what let that mistake reach production?
2. Are the action items things that, if done, would have actually prevented this specific incident?
3. Check back in a month: were the action items actually completed, or did they quietly get dropped?
