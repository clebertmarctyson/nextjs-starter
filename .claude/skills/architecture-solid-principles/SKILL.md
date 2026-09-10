---
name: architecture-solid-principles
description: Practical application of SOLID principles (single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion) — what each one actually buys you and how to spot violations in real code. Use when a class/module is growing unwieldy, when reviewing code structure, or when deciding how to shape a new abstraction.
metadata:
  tags: architecture, design-principles, oop
---

## When to use

Load this when a file/class/module is getting hard to change without breaking unrelated things, when reviewing structural code changes, or when designing a new abstraction and unsure how to shape its boundaries.

## The principles, practically (not academically)

**Single Responsibility** — a module/class should have one reason to change. Not "one method" (that's not what SRP means) — one *axis of change*. A `UserService` that handles both authentication logic and email formatting has two reasons to change (auth requirements shift; email templates shift) and should be two things.

**Open/Closed** — code should be extendable without modifying existing, tested code. In practice: prefer adding a new implementation of an interface/strategy over adding another `if/else` branch to an existing function every time a new case shows up. Don't over-apply this preemptively — see [[architecture-pattern-selection]] for when abstraction is worth it vs. premature.

**Liskov Substitution** — a subtype must be usable anywhere its parent type is expected, without surprising behavior. If a subclass throws on a method the parent guarantees works, or silently no-ops something the caller expects to happen, that's a Liskov violation — the type hierarchy is lying about what it supports.

**Interface Segregation** — don't force a consumer to depend on methods it doesn't use. A fat interface with 15 methods where most implementations only need 3 should be split into smaller, focused interfaces.

**Dependency Inversion** — depend on abstractions (interfaces/protocols), not concrete implementations, for anything that might vary (a database, an external API, a notification channel). This is what makes code testable (swap in a fake) and swappable (change providers without rewriting callers).

## Checklist

- [ ] Can you describe what a class/module does in one sentence without using "and"? If not, it likely has more than one responsibility.
- [ ] Adding a new case (a new payment method, a new notification channel, a new report type) — does it require editing a long-lived `switch`/`if-else` chain, or does it mean adding a new small unit that plugs into an existing extension point?
- [ ] Does every subtype/implementation of an interface actually honor the full contract, or does at least one throw "not supported" / silently do nothing for part of it?
- [ ] Are consumers forced to import/depend on methods they never call, just because they're on the same interface as the ones they do use?
- [ ] Can this code be unit-tested without spinning up a real database/network call? If not, check whether a concrete dependency should be behind an interface instead.

## Pattern: dependency inversion for testability

```ts
// WRONG — hard-coded to a concrete implementation, untestable without a real DB
class OrderService {
  async createOrder(data: OrderInput) {
    return await PostgresDB.insert('orders', data); // can't swap or fake this
  }
}

// RIGHT — depends on an abstraction, injected
interface OrderRepository {
  create(data: OrderInput): Promise<Order>;
}

class OrderService {
  constructor(private repo: OrderRepository) {}
  async createOrder(data: OrderInput) {
    return await this.repo.create(data);
  }
}
```

## Important caveat: don't cargo-cult

SOLID is a set of heuristics for managing change, not a checklist to satisfy for its own sake. A tiny script or a genuinely stable piece of code doesn't need an interface layer "just in case." Applying dependency inversion to something that will only ever have one implementation, forever, is needless indirection — see [[modularity-dry-judgment]] for the matching caution against premature abstraction.
