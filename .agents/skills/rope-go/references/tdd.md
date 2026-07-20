# Acceptance-driven TDD (go implementer)

Rope couples **acceptance behavior** (what must be true for users/callers) with
the red → green loop. This is the playbook for implementer leaves and for
parent/reviewer checks. Not a standalone product skill.

## Acceptance chain (do not skip layers)

```text
Public behavior / Matrix row  (acceptance — human language)
        ↓
Failing automated spec at an agreed seam  (red)
        ↓
Minimal implementation  (green)
        ↓
Next acceptance in this slice  (repeat)
        ↓
Issue-level E2E + verify  (assembled behavior — not re-TDD of every unit)
```

- **Acceptance behavior**: the slice `Public behavior` sentence and the Behavior
  Matrix rows this slice owns. Prefer domain words from `.rope/CONTEXT.md`.
- **Spec test**: name and assert like a specification (“caller can …”, “user
  sees …”), not like an implementation step.
- **Minimal green**: only enough code to pass the current red; do not implement
  the next acceptance “while you’re here.”

Assembled-system failures (each slice green, whole issue broken) are why
issue-level **behavior acceptance** (E2E / verify) exists. Slice TDD does not
replace that.

## Seams (locked at shape)

- Test **only** at seams listed in the issue `prd.md` **Testing Decisions**
  (and slice brief). Prefer existing public boundaries; fewer is better.
- **No new seam** during go without plan adjustment + human/shape confirmation.
- Tests observe through the seam’s public interface — not private methods or
  internal collaborators.

## Rules of the loop

1. **Red before green.** Write or extend the failing test first. Run it; record
   the failure. Then write only enough production code to pass.
2. **One acceptance at a time** inside a slice. One seam focus, one logical
   behavior, one minimal implementation per cycle. Then the next acceptance.
   Do **not** write all tests for the slice then all implementation
   (horizontal slicing).
3. **Independent expected values.** Expected results come from the acceptance
   / known literals / worked examples — not by re-running the production
   algorithm in the test.
4. **Refactoring is not the red→green job.** Tiny tidy after green is OK.
   Behavior-preserving structural moves belong in review feedback or a separate
   slice — not smuggled into “make green.”
5. **Domain language.** Test names and assertions use glossary terms when
   present; avoid naming tests after internal functions.

## Anti-patterns (reject in review)

| Anti-pattern | Tell |
| --- | --- |
| **Implementation-coupled** | Mocks internal modules, private APIs, call-order asserts; breaks on refactor with same behavior |
| **Tautological** | Expected value computed the same way as production (`expect(f(x)).toBe(sameAlgorithm(x))`) |
| **Horizontal bulk tests** | All tests written before any green for this slice’s behaviors |
| **Wrong seam** | Tests internals or a seam not on the shape-confirmed list |
| **Green without red** | No evidence the new/changed test failed before implementation |
| **Mocking own domain** | Mocks classes/modules you own instead of system boundaries |

## Mocking

Mock **system boundaries** only:

- external HTTP/APIs, email, payment, etc.
- time / randomness when behavior depends on them
- filesystem or DB only when a real test double or scratch DB is impractical

Do **not** mock internal collaborators you control. Prefer exercising the real
seam; at boundaries prefer narrow SDK-style ports that are easy to fake.

## Docs-only / no production code

If the slice is documentation-only (skill text, `.rope` docs, no runtime
behavior), the brief sets `TDD: waived (docs-only)`. No red required; still
state how the slice is verified (read-through, structural checklist).

## Parent / reviewer evidence

Implementer summary should include:

- acceptance text exercised
- seam(s) used
- red: command + failure signal
- green: command + pass
- paths of tests and production code

Missing red evidence on a code-bearing slice → treat as implementation miss
(re-brief), not as optional style.
