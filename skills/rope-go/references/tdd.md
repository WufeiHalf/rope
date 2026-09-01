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
- Tests observe through the seam's public interface — not private methods or
  internal collaborators.
- When the *shape* of the seam's interface is itself in question — how deep
  the module is, where the boundary belongs, what it exposes — that is a
  design question, not a test question: consult the shared vocabulary in
  [../../rope-shape/references/seam-design.md](../../rope-shape/references/seam-design.md),
  and take it back to the parent as a plan adjustment rather than improvising
  a second seam.
- **UI seams bind the accessibility contract, not the DOM.** Locate elements
  by role / accessible name / label, `data-testid` as fallback — never by CSS
  selector, class name, or DOM structure. A style or markup refactor with
  unchanged behavior must break zero tests.

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
| **Implementation-coupled** | Mocks internal modules, private APIs, call-order asserts; locates UI by CSS selector / class / DOM structure; breaks on refactor with same behavior |
| **Aesthetic-coupled** | Asserts computed styles or pixel values; breaks on a design change though every behavior holds |
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

## Waived slices (no red required)

Red→green needs an independent source of truth to assert against. Two
change families lack one and are waived instead — the brief sets
`TDD: waived (<kind>)` plus how the slice is verified:

- **docs-only** (skill text, `.rope` docs, no runtime behavior): verified by
  read-through / structural checklist.
- **style-only UI change** (colors, spacing, layout, visual polish — no
  Behavior Matrix row, interaction, data, or state claim changes): verified
  by a screenshot artifact (before/after) or human look. Style has no
  expected value a test can hold without becoming tautological or
  aesthetic-coupled.

A change that touches any Matrix row, interaction, data, or state is
behavior-bearing however small — it goes through red→green. When in doubt,
the slice's Public behavior sentence decides: if it still held before the
change, the change is style-only.

## Parent / reviewer evidence

Implementer summary should include:

- acceptance text exercised
- seam(s) used
- red: command + failure signal
- green: command + pass
- paths of tests and production code

Missing red evidence on a code-bearing slice → treat as implementation miss
(re-brief), not as optional polish.
