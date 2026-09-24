---
name: testing-strategy
description: What deserves a unit vs. integration vs. end-to-end test, and how to tell real coverage from coverage theater. Use when writing tests for new code, when deciding what kind of test a change needs, or when reviewing whether a PR's tests actually verify the behavior that matters.
metadata:
  tags: testing, quality, code-quality
---

## When to use

Load this when writing tests for new/changed code, when a PR's test coverage looks thin or performative, or when deciding what layer of test a given piece of logic deserves.

## The test pyramid, applied practically

- **Unit tests** — fast, isolated, test one function/class's logic without a real database/network. Bulk of the suite. Best for business logic (see [[architecture-layering]] service layer), pure functions, edge-case handling.
- **Integration tests** — verify that components work together correctly (a service + a real/test database, an API route + middleware stack). Fewer than unit tests, but essential for anything where the interaction between layers is where bugs actually hide (a repository query, an auth flow).
- **End-to-end tests** — verify a full user-facing flow through the real (or near-real) system. Fewest of all — slow, brittle, expensive to maintain — reserved for the handful of critical paths that must never break (checkout, login, payment).

Get the ratio backwards (mostly E2E, few unit tests) and the suite becomes slow and flaky, discouraging people from running it. Get it right and most bugs are caught fast, locally, before a slow E2E suite even runs.

## What deserves a test

- [ ] **Business logic with more than one path through it** — anything with a conditional, a calculation, a status transition. A pure function with no branches barely needs a dedicated test; a pricing/discount calculator with five rules absolutely does.
- [ ] **Every bug fix gets a regression test** that fails before the fix and passes after — otherwise there's no proof the fix actually works, and no protection against the same bug coming back.
- [ ] **Edge cases the domain actually has**: empty input, boundary values, the "impossible" state that turned out to be possible — informed by [[domain-entity-modeling]], not generic fuzzing for its own sake.
- [ ] **Error paths, not just the happy path** — what happens when the dependency fails, the input is malformed, the auth check fails (see [[secure-api-defaults]]).

## What doesn't need (much) testing

- Trivial getters/setters or pure pass-through code with no logic.
- Third-party library internals — trust the dependency's own test suite; test *your* usage of it, not its implementation.
- Generated code (migrations, scaffolded boilerplate) — unless it contains hand-written logic mixed in.

## Spotting coverage theater

- [ ] A test that calls a function and asserts only that it "didn't throw" — verifies almost nothing about correctness.
- [ ] A test that mocks so much of the system under test that it's really just testing the mocks agree with themselves.
- [ ] High line-coverage percentage with weak assertions (`expect(result).toBeDefined()` instead of checking the actual value) — coverage tools measure whether a line *ran*, not whether its behavior was *verified*.
- [ ] Tests that duplicate the implementation's logic to compute the expected value, instead of asserting a concrete, independently-known-correct expected result — such a test breaks in lockstep with bugs instead of catching them.

## Pattern: a test that actually verifies behavior

```ts
// WEAK — coverage theater, doesn't verify correctness
test('calculates discount', () => {
  const result = calculateDiscount(order);
  expect(result).toBeDefined();
});

// STRONG — concrete input, concrete expected output, verifies the actual rule
test('applies 10% discount for orders over $100', () => {
  const order = { total: 150, items: [...] };
  expect(calculateDiscount(order)).toBe(15);
});

test('applies no discount for orders at or under $100', () => {
  const order = { total: 100, items: [...] };
  expect(calculateDiscount(order)).toBe(0);
});
```

## Quick self-audit for a PR's test coverage

1. Does every new conditional branch have at least one test exercising it?
2. If this PR fixes a bug, is there a test that would have failed on the old code?
3. Pick a test at random — comment out the logic it's supposed to verify. Does the test actually fail? If not, it isn't really testing anything.
