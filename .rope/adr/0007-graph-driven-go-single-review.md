# 0007 Graph-Driven Go and Single End-of-Issue Review

**Status:** active, execution loop refined by [0008](0008-slice-ready-worktree-execution.md)
— waves remain the shared-mode fallback; worktree mode schedules
slice-ready. Supersedes the opt-in gate of ADR 0003 and the review modes
of ADR 0004; extends ADR 0005's minimal brief with a map pointer.

Date: 2026-08-22

## Decision

1. Execution mode is **read from the slice graph**, not chosen before
   slicing. `rope-shape` derives waves and rivers from `Blocked by` edges,
   enforces a fresh-context size iron rule (re-cut until every slice fits; a
   re-cut that would bend the requirement goes back to grill), and asks the
   user exactly one execution question with numbers — river split or
   parallel waves.
2. `rope-go` runs wave by wave: frontier slices with disjoint owned files
   spawn **background** implementer leaves; results are collected as they
   land; overlapping slices serialize. No `mode:` frontmatter exists anymore.
3. Review is **one end-of-issue gate**: a single reviewer leaf with new eyes
   over the assembled diff — Standards axis, Contract axis (Contract Note
   bullets), and a real-entrypoint probe of the primary paths (universal:
   browser, CLI, or API, whatever the project ships). High-risk boundaries
   get the deepest look. Findings → one fix brief, ≤2 rounds, then Human
   Escalation Stop.
4. `rope-verify` degenerates to a thin paperwork gate: review recorded, E2E
   terminal, drift hunted, tree clean, architecture documentation outcomes
   routed. It no longer judges code or product truth.
5. Investigation map: `<issue>/map.md`, one fact per line (path + date),
   seeded at shape, updated by implementers before commit.

## Context

Session `01a01ece` (agent-workbench `webui-staff-desk`): 7.5 h serial go on a
graph whose two rivers admitted ~3 h; 16 per-slice reviews + 7 fix rounds
(≈2.6 h) caught zero cross-slice defects, while both fatal gaps (no real
profiles in the real registry; admin 403 from an unreconciled cross-module
decision) were only visible from the assembled diff and the real entrypoint —
found by the user 19 minutes after verify PASS. Implementer leaves spent
56–71% of tool calls re-finding the same code. Full accounting:
`.rope/research/session-01a01ece-postmortem.md`.

External corroboration: mattpocock/skills `implement-spec` (background
implementers, maximum concurrency, one end-of-issue code review, shared
research notes; first-party run: 6 tickets / 1 h 20 m / 120 K orchestrator
context); Anthropic harness write-ups (the evaluator clicks through the
running application; generation and evaluation are separate agents because
self-evaluation skews positive).

## Why this shape

- Parallelism safety stays load-bearing: disjoint owned files per wave, no
  nested spawn, parent owns dispatch (invariants carried over from ADR 0003).
- Review economics: per-slice reviews pay per slice and see per slice; the
  failure classes that kill issues (cross-slice conflict, spec-observable
  gap, environment parity) are only visible at the assembled level — so the
  budget concentrates there.
- Real-entrypoint probing closes the fixture-versus-product gap that every
  green test in session 01a01ece shared.
- The back-to-grill escape keeps the size iron rule from bending
  requirements: misalignment surfaces at shape, where it is cheapest.

## Consequences

- `prd.md` loses `mode:` / `review:` frontmatter; legacy packages ignore
  gracefully (no consumer reads them).
- Slice `Review:` markings disappear; one issue-level verdict line replaces
  per-slice verdict bookkeeping.
- Verify's architecture-continuity judgment moves into the reviewer's
  Standards axis; verify keeps documentation-outcome routing only.
- Known cost, accepted: an ordinary slice's defect now surfaces at the end
  with cold context, making its fix pricier — traded for catching the
  issue-killing classes at all. Owner decision 2026-08-22: no risk-tiered
  per-slice carve-out; risk focus lives inside the end-of-issue reviewer.

## Alternatives considered

- Keep per-slice review as the default (ADR 0004 status quo): rejected on
  the session evidence above.
- Risk-tiered hybrid (per-slice review for gate slices only): rejected by
  owner decision 2026-08-22 — align with the single-gate model instead.
- Deterministic code orchestrator replacing the LLM parent (the community
  `/workflows` direction): deferred — worth revisiting once worktree-isolated
  spawns land in the host.
