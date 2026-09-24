---
name: modularity-boundaries
description: Where to cut a codebase into modules/packages/files so a change in one area doesn't ripple into unrelated ones, and each piece stays small enough to reason about independently. Use when a file/module is growing large, when starting a new project's folder structure, or when a small change keeps requiring edits across many unrelated files.
metadata:
  tags: modularity, architecture, code-organization
---

## When to use

Load this when scaffolding a new project's structure, when a file/module has grown large enough to be hard to navigate, or when you notice a small feature change keeps touching many unrelated files (a sign the boundaries are drawn wrong).

## The core heuristic: cut along business capabilities, not technical layers alone

Two common ways to organize code — both valid, but one usually ages better as a project grows:

- **Organize by technical type** (`controllers/`, `services/`, `models/` at the top level, with every feature's files scattered across all three) — easy to start with, but as the app grows, working on one feature means jumping between far-apart directories, and it's hard to tell what's safe to change without touching unrelated features.
- **Organize by domain/feature** (`orders/`, `inventory/`, `billing/`, each containing its own controller, service, and model) — a change to "orders" mostly stays inside `orders/`. Scales better for anything beyond a small app. Combine with [[architecture-layering]] *inside* each feature folder, not instead of it.

Default to feature-based organization once a project has more than a handful of distinct business capabilities; technical-layer-only organization is fine for small/simple projects but tends to need restructuring once it grows.

## Checklist

- [ ] **A module has a clear, statable purpose** — if you can't describe what belongs in it in one sentence, it's probably become a dumping ground (a `utils/` folder that's grown to contain unrelated business logic is a classic version of this).
- [ ] **Changing one feature rarely requires touching files in unrelated feature folders.** If adding a field to `orders` regularly means also editing files under `billing/` or `inventory/` that aren't obviously related, the boundary between those modules is probably wrong, or they're more coupled than the folder structure admits.
- [ ] **Public surface is intentional.** A module exposes only what other modules actually need to call (a small set of exported functions/classes) — internal helpers stay unexported/private, so other modules can't quietly start depending on implementation details that were never meant to be stable.
- [ ] **Circular dependencies between modules don't exist.** If module A imports from B and B imports from A, that's a sign they're really one module artificially split, or a boundary needs to move.
- [ ] **A module's size stays reasonable relative to its single responsibility** — there's no universal line-count rule, but if a single file requires scrolling through several unrelated concerns to find the one you need, it's a candidate to split along the seams of those concerns.

## Pattern: feature-based structure

```
src/
  orders/
    orders.controller.ts
    orders.service.ts
    orders.repository.ts
    orders.types.ts
  inventory/
    inventory.controller.ts
    inventory.service.ts
    inventory.repository.ts
  billing/
    billing.controller.ts
    billing.service.ts
    billing.repository.ts
  shared/           # genuinely cross-cutting, used by 3+ features
    auth/
    logging/
```

`shared/` is for things multiple features genuinely need — not a place to dump anything that feels reusable after appearing in just two places (see [[modularity-dry-judgment]] rule of three).

## Quick self-audit

1. Pick a recent feature change. List every file it touched. Are they clustered in one module, or scattered across many unrelated ones?
2. Look inside any `utils/`, `common/`, or `helpers/` catch-all directory — does everything in it actually get used by 3+ other modules, or did some of it just get dumped there for lack of a better place?
3. Check for import cycles between top-level modules (most bundlers/linters can flag these) — any cycle is a boundary worth reconsidering.
