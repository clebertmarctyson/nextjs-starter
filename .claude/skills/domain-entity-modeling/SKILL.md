---
name: domain-entity-modeling
description: Model database schemas and code entities around the real business domain — actual entities, relationships, and vocabulary from the problem being solved — instead of generic/anemic structures. Use when designing a new schema, adding a table/model, or naming entities and their relationships for the first time.
metadata:
  tags: database, domain-modeling, schema, architecture
---

## When to use

Load this before designing a new schema or data model, or when naming a new entity/table/model for the first time.

## The failure mode this prevents

Schemas built around generic, technical-sounding structures (`items`, `data`, `records`, `type` columns that fork behavior) instead of the actual business domain end up needing constant workarounds because they don't match how the business actually thinks and talks about its own data. A support ticketing system with a table called `objects` and a `kind` column faking polymorphism is harder to reason about — and harder for a new teammate or the client to understand — than one with `tickets`, `comments`, and `escalations` as real tables.

## Checklist

- [ ] **Entity names come from the domain's own vocabulary**, not generic technical terms. Ask the person who owns this business process what *they* call the thing — use their word, not `entity`/`item`/`record`.
- [ ] **Relationships mirror real-world cardinality.** A customer having many orders is 1:many; model it that way, don't force everything through a generic polymorphic join table "in case it's needed later."
- [ ] **No mystery `type`/`kind` columns silently forking behavior** across otherwise-unrelated concerts unless the entities genuinely share almost all fields and behavior — otherwise, separate tables/models are clearer than one table wearing a costume.
- [ ] **Enums/status fields reflect real states the business recognizes**, in the business's own terms (`pending_review`, `shipped`, `refunded`) — not generic (`status = 1`, `status = 2`).
- [ ] **Aggregate boundaries match real transactional/consistency boundaries.** Things that must always be consistent together (an order and its line items) belong in the same transactional aggregate; things that don't (an order and the customer's marketing preferences) don't need to be locked together just because they're related.
- [ ] **A domain expert (not just an engineer) can read the schema/entity names and roughly understand the business process it models.** If they can't, the model has drifted toward implementation convenience over domain accuracy.

## Pattern: name things the way the business does

```
// WRONG — generic, technical, forces the reader to infer meaning
items (id, type, parent_id, data JSONB)

// RIGHT — matches how a real estate business actually talks about its data
properties (id, address, listing_status)
property_showings (id, property_id, agent_id, scheduled_at)
offers (id, property_id, buyer_id, amount, status)
```

The second version is self-documenting to anyone who understands the business, engineer or not — see [[docs-project-docs]] for how this pays off in onboarding and handoff docs.

## Quick self-audit before finalizing a new schema/model

1. Read the table/entity names out loud to someone who knows the business domain but not the code. Do they recognize what each one represents?
2. Look for any `type`/`kind`/`category` column that changes what other columns mean — is that really one entity, or two-plus entities pretending to be one?
3. Trace one real-world scenario end to end (a customer places an order, a patient books an appointment, whatever the domain's core flow is) through the schema. Does it read naturally, or does it require mental translation at each step?
4. Check relationships against real cardinality — a "many-to-many" modeled as "one-to-many" (or vice versa) usually surfaces as an awkward workaround later, not immediately.
