---
name: rope-go
description: Executes a .rope issue package with acceptance-driven TDD, Constraint Bundle handoffs, leaf implement/review, and classified E2E. Use after rope-shape when running slices / rope-go on an issue.
---

# Rope Go

Parent Orchestrator for one `.rope/issues/<slug>/` package. Maximum
concurrency by default: every ready slice gets a background implementer
leaf; serializing anything needs a recorded reason. Review is one gate at
the end. Never nested spawn.

Details, degrade paths, brief budgets: [references/execution-rules.md](references/execution-rules.md).
Architecture continuity: [../rope-shape/references/architecture-continuity.md](../rope-shape/references/architecture-continuity.md).
Red→green playbook: [references/tdd.md](references/tdd.md).

## Startup

1. Load lean: Behavior Contract, Testing Decisions, Architecture Impact,
   Constraint Bundle index, slice statuses, e2e. Deep-read on dispatch.
2. Clean git; baseline check (tests green at start — cheap, catches a
   broken starting point early). Issue package committed first if worktree
   mode (a worktree is cut from HEAD).
3. Decide mode from host capability + the repo's `worktree-setup:` line in
   `routes.md` (tiers and manual-setup check: execution-rules).
4. **Declare parallelism in the report**: max X (widest wave / antichain)
   vs planned Y; reasons when Y < X. Concurrency is the default intent —
   small gain only weighs against setup cost, never alone justifies
   serializing.

## Slice loop — dispatch on readiness

- **Worktree mode** (host can isolate a spawn): a slice is ready the moment
  its blockers are **merged**; dispatch immediately into its own worktree
  from the latest merged HEAD. No wave barrier — the graph is the
  scheduler.
- **Shared mode** (any host): waves; same-wave parallelism needs disjoint
  owned files; the parent collects commits serially in landing order.

Dispatch → background implementer leaf per slice with a **minimal brief**
(allowlist + ≤60 lines; execution-rules): TDD hard fields, map path,
constraint IDs, worktree-setup condition step. Collect results as they
land: acceptance, red evidence, green, seam legal, commit, constraint
evidence. Fix rounds (≤2) on one slice never pause dispatch of other
ready slices. Design defect → Human Escalation Stop.

Worktree mode: merge landed branches serially, one at a time
("Merge queue"); after each merge, update `map.md` from leaf summaries and
re-check the ready set. Conflict → one re-dispatch with both branch names.
Shared mode: next wave.

## Investigation map

`<issue>/map.md` — one fact per line, path + date, seeded at shape.
Shared mode: implementers update falsified lines before committing.
Worktree mode: leaves report them in summaries; the parent writes after
each merge.

## After all slices: one review, two parallel leaves (BDD acceptance)

1. Matrix rows are the **issue's behavior spec** (Given/When/Then); tickets
   already proved their units by TDD — the reviewer does not replay them.
2. Spawn **two read-only leaves in one message**, both new eyes — they
   never watched the build (ADR 0010):
   - **Scanner leaf** (explore preset) — run lint/typecheck first, skip
     what tooling enforces; then scan the diff: repo conventions, TDD
     anti-patterns, smell baseline, inline global invariants. Judgement
     calls; never runs the product.
   - **Reviewer leaf** (`rope-reviewer`) — start the product first, read
     the diff while it boots; walk the Matrix behaviors against the
     **real entrypoint** (real config, real artifacts; browser/CLI/API)
     as a user would; run e2e items; high-risk boundaries get the deepest
     look. Fixture-green is not product-true.
3. Aggregate mechanically: verdict = worst of axis verdicts; no rerank,
   no merge. Only the reviewer leaf may run the product.
4. Findings → one fix brief (**blocking only**; each finding `path:line` +
   one-sentence fix — a transcription, not an exploration) → implementer
   leaf; ≤2 rounds then Human Escalation Stop; re-review the **delta
   only** (fix diff + affected probe paths). Zero findings → record
   verdict with evidence.
5. Hand off same-session **rope-verify** (thin paperwork). Finish only
   after verify PASS.

## Stop / report

Stop on missing gates, human gates, escalation, dirty unrelated tree,
missing env. Report: mode + parallelism declaration (X vs Y + reasons),
slices, commits, red/green evidence, review verdict + fix rounds, E2E
statuses, stops.
