---
name: rope-go
description: Executes a .rope issue package with acceptance-driven TDD, Constraint Bundle handoffs, leaf implement/review, and classified E2E. Use after rope-shape when running slices / rope-go on an issue.
---

# Rope Go

Parent Orchestrator for one `.rope/issues/<slug>/` package. Spawns implementer
and reviewer leaves; never nested spawn.

Rules/briefs/E2E statuses: [references/execution-rules.md](references/execution-rules.md).
Architecture continuity: [../rope-shape/references/architecture-continuity.md](../rope-shape/references/architecture-continuity.md).
Red→green playbook: [references/tdd.md](references/tdd.md).

## Startup

1. Confirm issue dir; load lean: prd frontmatter (mode + review), Behavior
   Contract, Testing Decisions, Architecture Impact, and the Constraint Bundle
   index (IDs + paths) in `prd.md`, tasks slice statuses, plus CONTEXT, routes,
   refs, and e2e. Deep-read bundle entries and references only when dispatching
   the slice that needs them.
2. Clean git; every slice has status/matrix/constraint IDs/verification/review;
   gates decided.
3. Soft-load harness presets; `preset_missing` is soft-degrade only.

## Acceptance-driven TDD (code slices)

Acceptance (Public behavior / matrix) → **red** at shape-confirmed seam →
minimal **green** → next acceptance. Docs-only: `TDD: waived (docs-only)`.
Details: tdd.md.

## Slice loop

Read `mode` from `prd.md` frontmatter (`serial` default | `dynamic`).

- **Serial** (absent or `serial`): schedule by **Blocked by**, one slice at a
  time — unchanged.
- **Dynamic** (`mode: dynamic`): the frontier is slices with **no unresolved
  blockers**. DISJOINT-scope frontier slices are spawned to **concurrent
  implementer leaves** (parent spawns one leaf per slice); overlapping slices
  serialize; contract and integration slices stay serial. Per-slice **review
  gates** and **commit rules** still apply — do not weaken them. Parent owns
  all dispatch; a parallel implementer leaf must not spawn another leaf.

For each ready slice:

1. `in_progress`; spawn implementer with **TDD hard fields** (execution-rules; commands focused/incremental, may cite prior full-suite evidence).
2. Check summary: acceptance alignment, **red evidence** (or waiver), green,
   seam legal, commit present, and the leaf's constraint evidence. A leaf-reported
   disposition conflict returns to the parent for re-brief; it is not silently
   absorbed.
3. Review: dispatch by the slice's review value — `required` → reviewer leaf
   (tdd anti-patterns + acceptance + architecture continuity; unchanged rules);
   `batch` → deferred to the end-of-issue batch review (record nothing yet
   beyond slice status); `self-check` → unchanged (only when low-risk; upgrade
   on high-risk boundaries). `batch` appears only in `review: batch` packages;
   absent or `per-slice` ⇒ today's binary `required | self-check` behavior.
4. Fail → course correction (≤2 implement rounds / problem; design defect →
   Human Escalation Stop).
5. **Slice done when** verification + review pass.

## After all slices

Prefer **assembled behavior acceptance** over replaying every unit suite:

1. Matrix coverage bookkeeping: every applicable row has recorded slice/e2e evidence (assembled matrix judgment is verify-owned).
2. Run e2e.md classifications (primary net for “green slices, broken product”). An E2E item whose validation is already covered by slice-level runs is recorded as `covered_by_slice` with the cited slice + evidence instead of being re-run.
3. If ≥1 slice is marked `batch`: spawn **one** batch reviewer leaf per ADR
   0004 (see execution-rules "Batch Review Execution") **before** verify;
   findings route to fix rounds like any review finding.
4. Light handoff checklist: per-slice commits present; review verdict lines
   recorded for every `required` AND `batch` slice (a batch verdict covers its
   slice list); E2E statuses recorded; no unrelated dirty files. Judgment over
   the assembled diff belongs to the batch reviewer brief (Behavior Contract +
   constraint IDs) and to rope-verify — not to a go parent pass.
5. Hand off same-session **rope-verify** (not finish). Finish only after verify PASS.

## Stop / report

Stop on missing gates, human gates, escalation, dirty unrelated tree, missing
env. Report: slices, commits, red/green evidence, reviews (incl. batch review
verdicts), E2E statuses, stops.
