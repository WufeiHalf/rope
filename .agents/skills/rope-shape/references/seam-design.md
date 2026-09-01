# Seam design (shared vocabulary)

Compact vocabulary for **where a seam belongs** — consulted when agreeing
Testing Decisions at shape, and by implementer leaves when a seam's shape
feels wrong mid-go. A reference to consult, not a workflow to run.

## When to consult

- **Shape**: filling `Seams under test` in Testing Decisions and the placement
  is contested (several plausible boundaries, reviewers disagree).
- **Go**: a leaf notices tests keep breaking across callers, or the test mocks
  modules you own — suspect the *shape of the seam*, not the tests.

## Vocabulary

- **Seam**: the public boundary behavior is observed at without reaching
  inside (full loop rules live in go's tdd reference).
- **Deep vs shallow**: a **deep** seam exposes few operations over a whole
  capability; a **shallow** seam spreads one capability across many
  per-caller surfaces. Prefer deep.
- **Convergence criterion**: when several callers (UI entries, CLI commands,
  API routes) trigger the same capability, one deep entry beats testing each
  caller surface — tests land once, callers stay thin adapters.
- **Existing boundary first**: an existing public boundary (service function,
  CLI, API route, store action) usually already is the seam; adding a new
  shallower one beside it duplicates the source of truth.
- **Ports at system edges**: external dependencies (HTTP APIs, clock, payment)
  get narrow SDK-style ports; tests fake the port, never the world behind it.
- **Depth probes**: would a second consumer change which seam the tests want?
  Which seam would the tests rather live at? Is the test mocking something
  you own? A "yes" to the last one usually means the seam is too shallow.

## Placement rule

- Seam placement is decided at **shape** and recorded in Testing Decisions;
  shape explains the chosen seam to the user in those terms when contested.
- Mid-go doubt about the *shape* of a seam (not which existing seam to use)
  is a design question, not a test question: it goes back to the parent as a
  plan adjustment (no new seam in go without confirmation) — never a silently
  improvised second seam beside the agreed one.
