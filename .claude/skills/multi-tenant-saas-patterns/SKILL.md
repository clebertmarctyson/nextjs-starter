---
name: multi-tenant-saas-patterns
description: Tenant isolation checklist and patterns (data, auth, billing) for B2B SaaS builds. Use whenever designing or extending a multi-tenant system — new tenant-scoped feature, onboarding flow, billing/plan logic, or when choosing between shared-schema, schema-per-tenant, or database-per-tenant isolation models.
metadata:
  tags: saas, multi-tenant, architecture
---

## When to use

Load this when designing a new B2B SaaS product/feature, adding a tenant-scoped resource, building onboarding/invite flows, or wiring up plan-based billing logic.

## Choosing an isolation model (decide early — expensive to change later)

| Model | Isolation strength | Ops overhead | When to pick it |
|---|---|---|---|
| **Shared schema** (single DB, `tenant_id` column everywhere + RLS) | Lower, enforced in software | Lowest — one DB to operate/migrate/backup | Default choice for most B2B SaaS; cost-efficient at scale, works well when tenants are small-to-mid size |
| **Schema-per-tenant** (one DB, one schema per tenant) | Medium | Moderate — migrations must run per-schema | Mid-size tenants needing stronger isolation without full DB-per-tenant cost |
| **Database-per-tenant** | Highest, enforced at the infra layer | Highest — N databases to provision/migrate/monitor | Enterprise/regulated clients requiring physical data isolation, or contractual/compliance requirements demanding it |

Default to **shared schema + row-level security** unless a specific client requirement (regulatory, contractual, or a whale customer demanding physical isolation) justifies the extra ops cost. See [[db-schema-security-review]] for the RLS implementation pattern.

## Checklist

**Data isolation**
- [ ] Every tenant-scoped table has `tenant_id`, enforced `NOT NULL`, with RLS or an equivalent app-layer guard — see [[db-schema-security-review]].
- [ ] Background jobs/cron/queue workers also scope by tenant — a batch job that iterates "all rows" instead of "all rows for tenant X" is a common place tenant isolation quietly breaks.
- [ ] Caching layer keys include `tenant_id` — a shared cache key across tenants (e.g. `settings:global` instead of `settings:{tenant_id}`) leaks data cross-tenant.
- [ ] File/object storage paths are tenant-scoped (`/uploads/{tenant_id}/...`), and signed URLs don't leak access across tenants.

**Auth & access**
- [ ] A user's session/token carries which tenant(s) they belong to, and every request resolves tenant context from that — never from a client-supplied, unverified `tenant_id` in the request body.
- [ ] Users belonging to multiple tenants (common in B2B — a consultant working with several client orgs) have an explicit "current tenant" switch, and every action is scoped to the currently-selected tenant, not ambiguous.
- [ ] Role/permission checks are tenant-scoped — "admin" in tenant A must not imply any access in tenant B.
- [ ] Invite flows verify the invited email against the intended tenant, and invite tokens expire and are single-use.

**Billing & plans**
- [ ] Plan/entitlement checks (seat limits, feature flags, usage caps) are enforced server-side on every relevant action, not just hidden in the UI.
- [ ] Usage metering (API calls, storage, seats) is tracked per-tenant with enough granularity to support the actual billing model (flat, per-seat, usage-based).
- [ ] Downgrade/cancellation handling is defined: what happens to data/access when a tenant drops below a plan's limits or cancels — graceful degradation vs. hard lockout, decided deliberately.
- [ ] Trial-to-paid and dunning (failed payment) flows don't silently lose tenant data — a failed charge should restrict access, not trigger deletion.

**Tenant lifecycle**
- [ ] Tenant provisioning (on signup) and deprovisioning (on offboarding/deletion) are both defined — signup often gets built first and offboarding forgotten until a client actually leaves.
- [ ] Tenant data export exists (for the client's own portability needs and for compliance/right-to-access requests) — don't let this be "write a one-off script when someone finally asks."
- [ ] Tenant deletion cascades correctly and is auditable — see the deletion/retention section in [[db-schema-security-review]].

## Pattern: resolving tenant context from a verified source, not client input

```ts
// WRONG — trusts the client to say which tenant they mean
const tenantId = req.body.tenantId;

// RIGHT — derived from the authenticated session/token, which was itself
// validated against the user's actual tenant memberships at login/switch time
const tenantId = req.session.currentTenantId;
```

Combine with the RLS pattern from [[db-schema-security-review]] so tenant scoping is enforced at both the application layer (defense) and the database layer (backstop).

## Quick self-audit for a new multi-tenant feature

1. Trace a request end to end: where does `tenant_id` first get established, and is that source trustworthy (session-derived) or spoofable (client-supplied)?
2. Do background jobs/schedulers operating on this feature iterate per-tenant, or could they leak cross-tenant?
3. If this feature is behind a plan/entitlement, is the check enforced server-side, and what happens on downgrade?
4. Does this feature's data get included in tenant export and deletion flows?
