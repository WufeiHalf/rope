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

1. Confirm issue dir; read CONTEXT, routes, refs, the Architecture Impact and
   full Constraint Bundle in `prd.md`, tasks, and e2e.
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
3. Review: required → reviewer leaf (tdd anti-patterns + acceptance + architecture
   continuity); self-check
   only when low-risk; upgrade on high-risk boundaries.
4. Fail → course correction (≤2 implement rounds / problem; design defect →
   Human Escalation Stop).
5. **Slice done when** verification + review pass.

## After all slices

Prefer **assembled behavior acceptance** over replaying every unit suite:

1. Matrix still covered for the integrated change.
2. Run e2e.md classifications (primary net for “green slices, broken product”). An E2E item whose validation is already covered by slice-level runs is recorded as `covered_by_slice` with the cited slice + evidence instead of being re-run.
3. Overall review vs Behavior Contract and the Constraint Bundle: inherited
   invariants have evidence, exceptions are bounded, and public behavior keeps
   the recorded dependency direction. Fix via implementer leaf if needed.
4. Hand off same-session **rope-verify** (not finish). Finish only after verify PASS.

## Stop / report

Stop on missing gates, human gates, escalation, dirty unrelated tree, missing
env. Report: slices, commits, red/green evidence, reviews, E2E statuses, stops.
