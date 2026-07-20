---
name: rope-go
description: Executes a .rope issue package with acceptance-driven TDD, leaf implement/review, and classified E2E. Use after rope-shape when running slices / rope-go on an issue.
---

# Rope Go

Parent Orchestrator for one `.rope/issues/<slug>/` package. Spawns implementer
and reviewer leaves; never nested spawn.

Rules/briefs/E2E statuses: [references/execution-rules.md](references/execution-rules.md).  
Red→green playbook: [references/tdd.md](references/tdd.md).

## Startup

1. Confirm issue dir; read CONTEXT, routes, refs, prd (seams), tasks, e2e.
2. Clean git; every slice has status/matrix/verification/review; gates decided.
3. Soft-load harness presets; `preset_missing` is soft-degrade only.

## Acceptance-driven TDD (code slices)

Acceptance (Public behavior / matrix) → **red** at shape-confirmed seam →
minimal **green** → next acceptance. Docs-only: `TDD: waived (docs-only)`.
Details: tdd.md.

## Slice loop

Schedule by **Blocked by** (default serial; optional parallel frontier if Scope
non-overlapping — execution-rules). For each ready slice:

1. `in_progress`; spawn implementer with **TDD hard fields** (execution-rules).
2. Check summary: acceptance alignment, **red evidence** (or waiver), green,
   seam legal, commit present.
3. Review: required → reviewer leaf (tdd anti-patterns + acceptance); self-check
   only when low-risk; upgrade on high-risk boundaries.
4. Fail → course correction (≤2 implement rounds / problem; design defect →
   Human Escalation Stop).
5. **Slice done when** verification + review pass.

## After all slices

Prefer **assembled behavior acceptance** over replaying every unit suite:

1. Matrix still covered for the integrated change.
2. Run e2e.md classifications (primary net for “green slices, broken product”).
3. Overall review vs Behavior Contract; fix via implementer leaf if needed.
4. Hand off same-session **rope-verify** (not finish). Finish only after verify PASS.

## Stop / report

Stop on missing gates, human gates, escalation, dirty unrelated tree, missing
env. Report: slices, commits, red/green evidence, reviews, E2E statuses, stops.
