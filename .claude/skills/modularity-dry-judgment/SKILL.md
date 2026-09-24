---
name: modularity-dry-judgment
description: Telling real duplication worth extracting apart from coincidental similarity that shouldn't be abstracted yet. Use when you notice similar-looking code in two or more places, when considering extracting a shared helper/base class, or when reviewing a PR that either adds duplication or adds a new abstraction.
metadata:
  tags: dry, duplication, refactoring, code-quality
---

## When to use

Load this whenever you spot code that looks similar to code elsewhere, before extracting a shared abstraction, or when reviewing whether a PR's new duplication (or new abstraction) is justified.

## The actual rule (not "never repeat code")

DRY means "every piece of *knowledge* should have one authoritative representation" — it's about not duplicating a *decision* or a *fact*, not about textual similarity. Two pieces of code that happen to look alike right now but represent unrelated decisions that could reasonably diverge are **not** a DRY violation — extracting a shared abstraction for them creates false coupling: a change to one's requirements now has to thread through a shared helper it doesn't actually belong to.

## The rule of three

Don't extract an abstraction on the second occurrence — wait for the third. Two instances often aren't enough to tell you the *right* shape for the shared abstraction; a premature extraction based on two data points frequently has to be reshaped (or worse, forced awkwardly) once a third, differently-shaped case shows up. On the third genuinely-identical occurrence, extract — and let the third case's shape inform what the abstraction's actual parameters should be.

## Checklist: is this really duplication?

- [ ] **Same reason to change?** If fixing a bug or changing a rule in one copy would always mean fixing/changing it in the other copy too, it's real duplication — extract it. If they could diverge for legitimate, independent reasons, it's coincidental similarity — leave them separate.
- [ ] **Same abstraction level?** Don't merge two functions into one shared helper just because both loop over an array and call an API — if the actual business meaning of what they're doing is different, a shared low-level helper (not a shared business-logic function) is the right extraction, if any.
- [ ] **Three or more occurrences**, not two — see rule of three above.
- [ ] **The extracted version is simpler to read at each call site**, not more complex. If using the new shared function requires passing 5 flags to reconfigure it back into looking like each original variant, that's a sign the abstraction is wrong, not that duplication was eliminated.

## Anti-pattern: false DRY (premature/wrong abstraction)

```ts
// WRONG — forcing two unrelated validation rules into one "shared" function
// because they both check a string's length, even though they represent
// completely different business rules that will diverge
function validateField(value: string, type: 'username' | 'productSku') {
  if (type === 'username') return value.length >= 3 && value.length <= 20;
  if (type === 'productSku') return value.length === 8 && /^[A-Z]/.test(value);
}

// RIGHT — two small, independent, clearly-named checks; each free to change
// for its own reason without touching the other
function isValidUsername(value: string) {
  return value.length >= 3 && value.length <= 20;
}
function isValidProductSku(value: string) {
  return value.length === 8 && /^[A-Z]/.test(value);
}
```

## Anti-pattern: real duplication left unfixed

Contrast with actual duplication: the same tax-calculation formula copy-pasted into three different checkout flows. If tax law changes, someone has to remember to update all three — and eventually won't. That's exactly what DRY is for: extract `calculateTax()` once, call it from all three.

## Quick self-audit

1. For the duplicated code in question: if a bug were found in one copy, would fixing it always mean the other copy needs the same fix? If yes → extract. If "it depends" → probably not real duplication.
2. Count the occurrences. Fewer than three, similar-looking, but for different reasons? Leave them separate for now — see [[architecture-pattern-selection]] for the matching principle applied to design patterns.
3. After extracting, would a new reader understand the shared function's purpose from its name and signature alone, or does using it require knowing which of several original call sites it was "really" written for?
