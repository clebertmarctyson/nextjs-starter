---
name: architecture-pattern-selection
description: When a classic design pattern (strategy, factory, observer, decorator, repository, etc.) actually earns its complexity — and when it's over-engineering. Use when tempted to reach for a named design pattern, when reviewing code that introduces one, or when code has grown enough branching logic that a pattern might simplify it.
metadata:
  tags: architecture, design-patterns
---

## When to use

Load this when considering introducing a classic design pattern, when reviewing a PR that adds one, or when a function/class has accumulated enough conditional branching that restructuring might help.

## The core rule

A design pattern is justified by a **specific, present problem it solves** — not by "this is how experienced engineers structure code" or "we might need this flexibility later." Every pattern adds a layer of indirection; that indirection has to be paid for by a real reduction in complexity or a real, near-term need for the flexibility it buys.

## Quick reference: when each common pattern earns its place

- **Strategy** — you have 3+ interchangeable algorithms/behaviors selected at runtime (e.g. pricing rules, shipping cost calculators) and the selection logic is more than a trivial `if/else`. Not justified for two cases that'll likely never grow to three.
- **Factory** — object construction is genuinely complex (multiple steps, conditional logic, external config) or you need to decouple callers from concrete classes for testability. Not justified for a plain `new Foo()` wrapped in a function that does nothing else.
- **Observer/pub-sub** — multiple, decoupled parts of the system need to react to an event without the event source knowing who's listening (e.g. "order placed" triggering email, inventory update, analytics independently). Not justified for one sender calling one known receiver — just call the function.
- **Decorator** — you need to layer optional behavior (logging, caching, retry) onto an object without modifying its core class, and combinations of that behavior vary. Not justified for a single fixed wrapper — just inline the logic.
- **Repository** — you want to isolate data-access logic behind an interface so business logic doesn't know/care if it's Postgres, an API, or a cache (see [[architecture-solid-principles]] dependency inversion). Justified in most apps beyond a trivial script; skip it only in something that will never swap its storage layer.
- **Singleton** — genuinely one instance must exist system-wide (a connection pool, a config object) — and even then, prefer dependency injection of a single shared instance over a global-access singleton, which makes testing harder.

## Checklist before introducing a pattern

- [ ] Name the concrete problem this solves *today* — not a hypothetical future requirement.
- [ ] Could the same problem be solved with a plain function and a conditional, at less cost, for now?
- [ ] Does the pattern reduce the number of places a future change has to touch, or does it just move the same complexity somewhere else with extra ceremony?
- [ ] Will a teammate unfamiliar with this specific pattern be able to follow the code, or does it require pattern-recognition knowledge that adds friction to onboarding?

## Anti-pattern: pattern for pattern's sake

```ts
// OVER-ENGINEERED — a factory, a strategy, and an interface for one call site
interface GreetingStrategy { greet(name: string): string; }
class FormalGreeting implements GreetingStrategy {
  greet(name: string) { return `Good day, ${name}.`; }
}
class GreetingFactory {
  static create(): GreetingStrategy { return new FormalGreeting(); }
}
const greeting = GreetingFactory.create().greet(user.name);

// RIGHT — there's only one case, so there's no pattern to apply yet
const greeting = `Good day, ${user.name}.`;
```

If a second, genuinely different greeting style shows up later, that's when the strategy pattern earns its keep — not before. See [[modularity-dry-judgment]] for the same "wait for the real second case" discipline applied to duplication.
