# 0013 Test-Cost Tiering — Full Suite Is an Issue-Level Gate

**Status:** active — completes [0009](0009-ticket-tdd-issue-bdd-layering.md)
downward into test *cost*; refines [0011](0011-edge-classification-and-acceptance-gates.md)
gate bounce discipline. Bounded by [0007](0007-graph-driven-go-single-review.md)
(no new review gates) and [0008](0008-slice-ready-worktree-execution.md)
(no per-merge rituals).

Date: 2026-09-02

## Context

Measured failure (agent-workbench MR 57, architecture-deepening-round2): a
shape-time `Verification:` field with no granularity contract collected 18
per-slice "全量测试绿" entries; go's startup baseline check asserted
"cheap" with no operational semantics and ran the full discover twice
(277.5s + 89.3s — the second run only to re-parse a verdict line lost to a
pipe); parallel worktree leaves each ran full suites, whose CPU contention
produced flaky failures that then justified full "clean reruns"; the parent
back-filled missing full-suite evidence itself. Net: 10+ full-suite runs
(4000+ cases each) where ≤2 carry information.

ADR 0009 already layers *proof*: ticket units by leaf TDD, issue behaviors
at the end-of-issue review. The same layering was never applied to *cost*.

## Decision

1. **The full suite is an issue-level gate** — go baseline fallback and
   end-of-issue assembly — never slice-level evidence. Slice
   `Verification:` defaults to **focused** seam tests + guards. A
   behavior-preservation refactor that needs the full net records the
   reason in Testing Decisions and the net runs at issue level.
2. **Baseline ladder** (go startup), cheapest rung first: ① same-HEAD
   green evidence (CI or a recorded run ≤24h) — reuse, don't run; ② the
   repo's declared quick tier; ③ the full suite, once. Any baseline run
   writes output to a file and parses the file; rerunning to re-parse is
   forbidden.
3. **`Test tiers:` repo contract** in routes.md (the worktree-setup
   pattern): `quick:` (high-signal subset, measured ≤60s) and `full:`.
   Undeclared is legal — the ladder skips the rung. When shape finds it
   missing, shape derives it automatically: guards + entrypoint smoke
   mandatory, pure unit tests optional, fixture-heavy integration /
   benchmark / network tests excluded; the candidate is timed and only
   written back if ≤60s, with date, criteria, and measured time.
   Derivation criteria live in one place (go execution-rules); shape
   references, never duplicates. Zero human involvement.
4. **Quick's failure mode is late discovery, not wrong conclusions.**
   It answers "is the repo broken at the start?" — correctness gates
   stay at issue level. This is the same trade ADR 0008's merge queue
   makes (no per-merge ritual; assembled truth at the end).
5. **Flake discipline:** a failure under parallel load → rerun only the
   failing tests to classify the flake; a full clean rerun needs a
   recorded reason.
6. **Return Gate bounce:** a missing evidence item returns to the leaf;
   the parent never runs tests to back-fill a leaf's evidence.

## Consequences

- Full-suite runs per issue drop from O(slices) to ≤2 regardless of
  parallel width; the flake-rerun amplifier (more parallel runs → more
  contention → more reruns) loses its fuel.
- Shape gains a conditional Test-tiers check (auto-derive when missing)
  and a `Verification:` granularity contract; go gains a three-rung
  startup ladder with write-to-file parsing.
- A weak auto-derived quick tier costs discovery timing, never
  correctness — bounded by the fixed inclusion criteria and the timed
  budget.
- Rope stays cross-repo generic: the contract is vocabulary + degrade
  path; every repo's tier content is its own (derived or human-tuned
  later).

## Alternatives considered

- Human-declared tiers only (no auto-derivation): breaks the
  zero-human workflow requirement; rejected.
- Let go (not shape) derive the tier mid-flight: per-run invention,
  unstable subsets; rejected.
- Cache/parallel-test infrastructure: out of scope for a skill-text
  harness; rejected.
