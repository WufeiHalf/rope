# Frontend TDD: decoupling tests from styling (DOM binding pain)

Date: 2026-02-27
Trigger: agent-workbench applied rope's TDD to frontend work; tests bound to
specific DOM, so a pure style change still walked the red→green loop.

## Sources

- Matt Pocock `skills` repo, `docs/engineering/tdd.md` (pinned upstream):
  - Pre-agreed seam is absolute; "renaming an internal function breaks
    nothing in the suite" is the working-if signal.
  - Open issue #746: the skill decides *where* seams go, nothing decides
    *whether a change is worth the loop at all* (config/wiring/glue row).
    Rope had the same hole for style-only changes.
  - Browser/E2E tests should NOT be written first; declared in CLAUDE.md as
    "written after the behaviour works" — slow loops stop paying for
    themselves. (Rope's issue-level E2E already matches this.)
- Paul Hammond, "TDD works beautifully on the front end": test the DOM's
  **behaviour decoupled from aesthetics** — design changes must not update
  tests. Comment thread (M. Küsters): styling has no independent truth
  ("you don't know what you get until you see it"), so TDD'ing it produces
  brittle or tautological suites.
- Kent C. Dodds "Testing Implementation Details" + Testing Library: query by
  role / label (user perspective), not CSS selectors or DOM structure.
- Playwright best practices: locate by role/text/label, `data-testid`
  fallback; never CSS/XPath bound to structure.

## Conclusion adopted into Rope

Two-layer split, now encoded in `skills/rope-go/references/tdd.md` and
`skills/rope-quick/SKILL.md`:

| Layer | Process | Source of truth |
| --- | --- | --- |
| Behavior (Matrix row, interaction, data, state) | red→green at pre-agreed seam | spec / known literals |
| Style-only (colors, spacing, layout, polish) | `TDD: waived (style-only)` + screenshot artifact or human look | visual review |

- UI seams bind the **accessibility contract** (role / accessible name /
  label, `data-testid` fallback), never CSS selector / class / DOM structure.
- New anti-pattern row: **Aesthetic-coupled** (asserts computed styles /
  pixel values; breaks on design change though behavior holds).
- Tie-breaker for classification: if the slice's Public behavior sentence
  held before the change, the change is style-only.

Not adopted: per-commit visual-regression baselines (Chromatic-style) —
verification weight exceeds the quick/go payoff for Rope's target repos;
revisit if a Rope-hosted repo needs pixel guarantees.
