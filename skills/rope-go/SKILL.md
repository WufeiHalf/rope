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

1. Confirm issue dir; load lean: Behavior Contract, Testing Decisions,
   Architecture Impact, and the Constraint Bundle index (IDs + paths) in
   `prd.md`, tasks slice statuses, plus CONTEXT, routes, refs, and e2e.
   Deep-read bundle entries and references only when dispatching
   the slice that needs them.
2. Clean git; every slice has status/matrix/constraint IDs/verification/review;
   gates decided.
3. Soft-load harness presets; `preset_missing` is soft-degrade only.

## Acceptance-driven TDD (code slices)

Acceptance (Public behavior / matrix) → **red** at shape-confirmed seam →
minimal **green** → next acceptance. Docs-only: `TDD: waived (docs-only)`.
Details: tdd.md.

## Slice loop

The slice graph drives execution — shape already read it (waves, rivers,
sizes). Run **wave by wave**:

1. Collect the frontier: slices whose blockers are all done.
2. Spawn each frontier slice whose owned files don't overlap as a
   **background implementer leaf** — one leaf per slice, self-contained
   minimal brief (ADR 0005 allowlist + ≤60-line cap; execution-rules)
   including **TDD hard fields** and the map path. Overlapping frontier
   slices serialize: pick them off one at a time.
3. Collect results as they land — summaries + diffs, not full traces. Check
   each: acceptance alignment, **red evidence** (or waiver), green, seam
   legal, commit present, constraint evidence. A leaf-reported disposition
   conflict returns to the parent for re-brief; it is not silently absorbed.
4. Next wave. Repeat until the graph is done.

No per-slice review fires here — review is one gate at the end (below).
Course correction unchanged: ≤2 implement rounds per problem; design defect
→ Human Escalation Stop.

## Investigation map

`<issue>/map.md` — one fact per line, each with a file path and a date.
Seeded at shape; every implementer updates the lines its work falsifies
before committing, and adds lines for facts the next leaf will need.
Readers orient by the map, then verify against code. An entry that no longer
earns its line is deleted, not commented.

## After all slices: one review, new eyes

1. Matrix coverage bookkeeping: every applicable row has recorded slice/e2e
   evidence.
2. Run the agent-class E2E items; record results (`covered_by_slice` where
   slice runs already proved it).
3. Spawn **one reviewer leaf with new eyes** — it never watched the build:
   - **Standards axis** — repo conventions, `tdd.md` anti-patterns,
     architecture continuity: bundle invariants, dependency direction, no
     second owner of state / persistence / permission / error.
   - **Contract axis** — Contract Note bullets against the assembled diff:
     promised-but-missing, built-but-not-promised, built-but-wrong.
   - **Real entrypoint** — start the product the way a user would (real
     config, real artifacts — browser, CLI, or API, whatever this project
     ships) and walk the primary paths. Fixture-green is not product-true.
   - High-risk boundaries get the deepest look (auth, persistence, schema,
     entrypoints, adapters, concurrency).
4. Findings → one fix brief → implementer leaf; ≤2 rounds per problem, then
   Human Escalation Stop. Zero findings → record the verdict with evidence.
5. Hand off same-session **rope-verify** (thin paperwork gate). Finish only
   after verify PASS.

## Stop / report

Stop on missing gates, human gates, escalation, dirty unrelated tree, missing
env. Report: slices, commits, red/green evidence, the end-of-issue review
verdict + fix rounds, E2E statuses, stops.
