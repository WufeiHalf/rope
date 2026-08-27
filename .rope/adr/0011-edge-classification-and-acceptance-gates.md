# 0011 Edge Classification & Acceptance Gates

**Status:** active — extends [0008](0008-slice-ready-worktree-execution.md)
scheduling semantics; bounded by [0007](0007-graph-driven-go-single-review.md)
(the Mechanical Return Gate is evidence reconciliation, never a second review
gate).

Date: 2026-08-27

## Decision

1. **Edge Classification.** At shape, every `Blocked by` edge is labeled
   `file-overlap`, `seam-required`, or `methodology-order`. Only the first
   two block dispatch; a methodology-order edge is a merge-order preference.
   ADR 0008's ready set is therefore: no unresolved file-overlap or
   seam-required blockers.
2. **Two-stage Contract Slice.** A `Kind: contract` slice carrying deep
   durability / concurrency / protocol semantics is cut in two: a
   **thin-interface** slice (public seam + minimal working ops) that consumers
   may block on, and a **hardening** slice (crash recovery, concurrency
   protocols, sanitization depth) that consumers must not block on. Migration
   and schema files have exactly one owning slice.
3. **Evidence Projection.** Every slice's Required evidence entries cite the
   Behavior Matrix rows they prove; shape runs a coverage check — a matrix row
   with no slice evidence is a shape defect, not a go-time discovery.
4. **Mechanical Return Gate.** At join, the parent reconciles the return
   summary against Required evidence: each item maps to pasted command output
   or an artifact path; missing items bounce the leaf to exactly those items.
   It is evidence reconciliation — no implementation re-read, no test reruns,
   no verdict (ADR 0007 unchanged).
5. **Defense Budget.** Correction briefs introduce zero acceptance
   requirements absent from the Behavior Matrix. Gaps found mid-execution go
   back to shape (re-cut) or are demoted to recorded non-blocking notes.
6. **Granularity hard rules.** Every slice declares a demo path (a demoable
   behavior, never a layer). A change that fits one fresh context window does
   not become a multi-slice issue — route `rope-quick` (ADR 0006). The
   fresh-window upper bound (existing) stays a re-cut trigger. The granularity
   quiz (too coarse / too fine / edges real / merge or split) folds into
   shape's graph-confirmation step. The anti-pattern catalog (horizontal
   slicing with quantified field evidence, over-decomposition, invalid
   acceptance criteria) lives in `rope-shape` references.
7. **Human Gate Panel.** Multiple pending gates render as one batched panel
   (affected slices / authorization / blast radius) with explicit
   continue-or-hold status of other lanes.
8. **Declared dispatch deviation.** Spawning with a type/model differing from
   the preset requires a one-line reason in the dispatch record; a
   `research` preset variant (web + write scoped to `.rope/research/`) is the
   legal carrier for external research with disk output.
9. **Bounce-rate replay protocol.** `rope-harness-presets` carries an offline
   replay evaluation (issue package + leaf-return summaries in, per-planner
   bounce judgments out) for planner-window model selection.

## Context

Session 01a03d5d (optimize-turn-tool-token-usage; 9 slices, 31 leaves) gave
measured evidence (`.rope/research/session-01a03d5d-dispatch-metrics.md`):
startup width was 1 of a possible 3 because two no-overlap edges blocked
dispatch; storage contract slices packed thin interfaces with 900–1200 lines
of hardening whose rework sat on the consumer critical path (fix diffs ≥ base
implementations; defensive keywords only in fix commits; S8 deleted in fix2
what fix1 built); the parent absorbed verification by re-reading
implementations; acceptance scope inflated across correction rounds.

Upstream alignment (mattpocock/skills, pin 6654f6b6;
`.rope/research/mattpocock-skills-slicing-and-parallelism.md`) supplies the
dual size anchors (demo path + fresh-context window, both directions), the
post-cut granularity quiz, and quantified anti-pattern evidence: horizontal
slicing produced 26 tickets × ~20 agent runs each, 3/4 rework.

## Why this shape

- The concurrency loss and the fix-round churn have one common root: decisions
  that belong to the graph (edges, ticket depth, acceptance scope) were made
  implicitly at execution time by judgment alone. Making them explicit and
  mechanical moves them to shape where they are cheap.
- The return gate removes the parent's verification vacuum without violating
  ADR 0007's single-review-gate design: reconciliation is not judgment.
- A single ADR keeps the four mechanisms coherent — they all trade a small
  amount of shape-time formality for measured execution-time savings.

## Consequences

- Shape artifacts gain fields (demo path, edge labels, two-stage contract
  splits, evidence row citations) and the graph-confirmation step gains the
  granularity quiz — no new serial Q&A round.
- go's join becomes a table check; correction briefs are budgeted; gates batch.
- Over-formalization is the main risk; the quiz-in-step-9 fold and the
  docs-only waiver path keep the fixed cost bounded.
- `rope-quick` becomes the designated lower-bound route; shape must name it
  when a change fits one window.

## Alternatives considered

- Separate ADRs per mechanism: fragments shared rationale and creates
  cross-reference loops; rejected.
- Fix by planner-model selection alone: does not change structural incentives;
  the bounce-rate protocol (item 9) keeps model selection as a measured
  follow-up instead; rejected as the primary fix.
- Keep judgment-primary acceptance with guidelines only: the measured failure
  mode of this exact approach is the motivating evidence; rejected.
