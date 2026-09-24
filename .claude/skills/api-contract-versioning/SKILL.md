---
name: api-contract-versioning
description: How to make breaking changes to a shared API/schema without breaking consumers mid-flight — versioning strategy, deprecation windows, and additive-vs-breaking change classification. Use when changing an API's request/response shape, changing a shared database schema consumed by multiple services, or when multiple teams/clients depend on a contract you're about to modify.
metadata:
  tags: api-design, versioning, contracts, backward-compatibility
---

## When to use

Load this whenever modifying an API contract (REST/GraphQL/RPC shape) or a shared schema that other services/clients depend on — especially when you don't control every consumer's deploy timing.

## Classify the change first

**Additive (safe, no version bump needed)**:
- Adding a new optional field to a response.
- Adding a new endpoint.
- Adding a new optional request parameter with a sensible default.
- Adding a new enum value, *if* consumers are already required to handle unknown values gracefully (document that requirement up front).

**Breaking (needs a versioning/migration strategy)**:
- Removing or renaming a field.
- Changing a field's type or meaning.
- Making a previously-optional field required.
- Changing an endpoint's URL, HTTP method, or status code semantics.
- Changing pagination/sorting/default-filter behavior a consumer might silently rely on.

Most "is this breaking?" mistakes come from underestimating this list — a field type change that "should be fine" because a specific consumer happens not to care still breaks every consumer that does.

## Versioning strategies (pick one per project, don't mix)

- **URL versioning** (`/v1/orders`, `/v2/orders`) — simplest to reason about, easy to route/monitor per version, but means maintaining parallel implementations during the overlap window.
- **Header versioning** (`Accept: application/vnd.api+json;version=2`) — keeps URLs stable, less discoverable, easy to get wrong on the client side.
- **Field-level deprecation without a version bump** — mark a field deprecated (docs + a deprecation header/response metadata), add the replacement alongside it, remove the old one only after the deprecation window closes. Works well for additive-then-cleanup changes that don't need a whole new version.

## The deprecation window

A breaking change to a contract other teams/clients depend on needs three phases, not one atomic swap:
1. **Add the new shape alongside the old one** — both work simultaneously.
2. **Announce deprecation** with a concrete removal date, communicated to known consumers (not just a changelog entry nobody reads) — pairs with [[client-handoff-docs]] if external clients are affected.
3. **Remove the old shape** only after the deprecation window passes and usage of the old path has actually dropped to zero (verify via logs/metrics, don't just assume).

Skipping straight to step 3 is what breaks consumers mid-flight — the exact failure this skill exists to prevent.

## Pattern: additive-first schema evolution (mirrors expand-contract)

```ts
// Step 1 (safe, ship immediately): add the new field, keep the old one
interface OrderResponse {
  total: number;        // deprecated — use totalCents instead, removal planned 2026-06-01
  totalCents: number;   // new, unambiguous unit
}

// Step 2: consumers migrate to totalCents at their own pace within the window

// Step 3 (after the deprecation window, confirmed zero usage of `total`):
interface OrderResponse {
  totalCents: number;
}
```

This is the API-contract equivalent of [[db-migration-safety]]'s expand-contract pattern for column renames — same underlying principle, applied one layer up.

## Checklist

- [ ] The change is classified as additive or breaking *before* writing code, not discovered after a consumer complains.
- [ ] Breaking changes go through a deprecation window, not an atomic swap, unless every consumer is under the same team's control and deploys in lockstep (rare, verify before assuming it).
- [ ] Deprecated fields/endpoints are actually documented as deprecated (in the API docs/OpenAPI spec, response headers, or equivalent) — not just known informally by the team that made the change.
- [ ] A removal is verified against actual usage data before it happens, not just "the deprecation window passed so it should be safe now."
- [ ] Internal service-to-service contracts get the same discipline as external/public APIs — "it's just between our own services" is how internal breaking changes cause surprise outages just as often as external ones.

## Quick self-audit

1. For a proposed API/schema change: does removing or renaming anything, or does it only add? If it removes/renames, the deprecation window applies.
2. Is there a way to know, from logs/metrics, when the last consumer stopped using a deprecated field/endpoint — or would removal be a guess?
3. Are external consumers of this API actually informed of upcoming breaking changes, or does "documented in the changelog" substitute for real communication?
