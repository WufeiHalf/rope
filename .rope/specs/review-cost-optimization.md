# Review-Cost Optimization — Spec

Contract for the opt-in `review: per-slice | batch` issue flow and lean leaf
briefs. Source of truth: `.rope/adr/0004-risk-tiered-review-mode-and-lean-briefs.md`.

## `review` field

- Location: `prd.md` frontmatter.
- Values: `per-slice` (default) | `batch`.
- Absent or `per-slice` ⇒ current per-slice behavior unchanged. `batch` ⇒ the
  execution below.
- Chosen at shape time by asking the user — a **manual opt-in**, same pattern
  as `mode: dynamic`. Never auto-detected from issue content, never a go-time
  flag.

## Slice review marking

Three-valued in batch mode; binary `required | self-check` in per-slice mode:

- `required` — slice hits the **Review Risk Gate** (public interface,
  external/adapter, auth/secret, persistence/schema, routing/runtime wiring,
  multi-layer, E2E-critical path). Gets its own per-slice reviewer leaf.
- `batch` — other code slices; **valid only when the package is
  `review: batch`**. Deferred to the end-of-issue batch review.
- `self-check` — docs/fixture only.

`batch` is never silent self-check and never implementer self-review.

## Batch review execution (go, after all slices)

- If ≥1 slice is marked `batch`, the parent spawns **one** `rope-reviewer`
  leaf over the **cumulative diff** of all batch slices (many batch slices ⇒
  still one leaf).
- Brief carries the **Behavior Contract + constraint IDs by reference**
  (path + IDs + short global invariant list) — fresh, clean context (diff +
  criteria only).
- Verdict is recorded **per covered slice** in `tasks.md`, with run/agent
  identity.
- Findings route to fix rounds like any review finding: ≤2 fix rounds, then
  **Human Escalation Stop**.
- Zero `batch` slices ⇒ no batch leaf (nothing deferred).

## go handoff checklist (replaces parent overall review)

No parent overall-review pass after slices (ADR 0001: `rope-verify` stays the
sole parent-level assembled judgment). go ends with a light handoff checklist:

- per-slice commits present
- review verdicts recorded (incl. batch)
- E2E statuses recorded
- no unrelated dirty files

## Briefs by reference

- Implementer/reviewer briefs carry: bundle **path + slice Constraint IDs +
  the short global invariant list** inline.
- The leaf reads bundle detail itself and returns **per-ID confirmation +
  conflicts**.
- No full inline bundle copy; no bare "follow the ADR".
- Full minimal-brief allowlist + line cap: see
  `plan-artifact-reader-layering.md` (ADR 0005).

## Lean parent load

go startup reads: prd frontmatter, Behavior Contract, Testing Decisions,
Architecture Impact, bundle index (IDs + paths), slice statuses. Bundle
entries and references are deep-read on demand when dispatching the slice
that needs them.

## Forbidden shortcuts

- `batch` treated as silent self-check.
- Implementer self-review of `batch` slices.
- Nested spawn from any leaf.
- Removing the go overall review without moving its judgment items to the
  batch brief + verify.
- Verify becoming a second full TDD pass.
- Bare "follow the ADR" briefs.
- Auto-detecting review mode.
