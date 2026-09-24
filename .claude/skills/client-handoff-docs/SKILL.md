---
name: client-handoff-docs
description: Generates the architecture diagram, runbook, and handoff documentation a B2B client needs to maintain a delivered project themselves. Use when a client engagement is wrapping up, before a scheduled handoff/transition meeting, or when a project reaches a stable milestone worth documenting.
metadata:
  tags: documentation, client-delivery
---

## When to use

Load this when a client engagement is nearing completion, at a major milestone worth snapshotting, or whenever the client's own team will need to operate/extend the system without the delivering team directly involved going forward.

## Why this matters

On a small, tight delivery team, institutional knowledge lives in engineers' heads unless it's captured. A client that can't operate what was built without calling the delivery team back for every question isn't actually set up for success, and it undermines trust in "direct access, no intermediaries" style engagements.

## What to produce

**1. Architecture overview**
- A single diagram (component/service level, not line-by-line code) showing: services/apps, datastores, external integrations (payment processors, auth providers, third-party APIs), and how traffic flows between them.
- One paragraph per major component: what it does, what it depends on, what depends on it.

**2. Runbook**
- How to deploy (link to the actual pipeline — see [[deployment-pipeline-setup]] — not a hand-written alternative process).
- How to roll back a bad deploy.
- Where logs/metrics/alerts live and how to access them.
- Common operational tasks specific to this system (e.g., "how to reprocess a failed webhook," "how to manually trigger a report") — the things that would otherwise require calling the delivery team back.
- Who to contact and how, for issues genuinely beyond the client team's scope, and what the expected response process looks like.

**3. Environment & access inventory**
- List of every environment (dev/staging/prod), where it's hosted, and who currently has access.
- List of every third-party service/API key in use, which environment it belongs to, and where its credentials live (secret manager reference, not the actual value).
- Domain/DNS ownership and where it's registered.
- Explicit ownership transfer checklist: cloud account ownership, domain registrar access, any delivery-team-created admin accounts that need to be transferred or removed.

**4. Known limitations & follow-ups**
- Anything shipped as a deliberate shortcut (technical debt taken on knowingly) with the reason and what a proper fix would involve.
- Anything flagged during development but deferred — don't let "we knew about this but didn't get to it" turn into a surprise for the client six months later.

## Format

Keep it as a single living document (README or wiki page in the client's own repo/space, not an internal doc they don't have access to) plus one architecture diagram image. Prefer something the client's team can update themselves after handoff over a polished one-time PDF that goes stale.

## Checklist before calling a handoff complete

- [ ] Architecture diagram matches what's actually deployed (not the original design if it drifted during build).
- [ ] Someone outside the delivery team (ideally on the client side) can follow the runbook to do a routine task without assistance.
- [ ] All environment/access inventory items have a named current owner.
- [ ] Any delivery-team-owned accounts/keys with standing access to client infrastructure are identified, with an explicit decision made — transferred, revoked, or knowingly retained (e.g. an ongoing support contract) — not left ambiguous.
- [ ] Known limitations are written down before they're forgotten, not reconstructed from memory later.
