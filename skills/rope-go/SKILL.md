---
name: rope-go
description: Executes a .rope issue package with acceptance-driven TDD, Constraint Bundle handoffs, leaf implement/review, and classified E2E. Use after rope-shape when running slices / rope-go on an issue.
---

# Rope Go

Parent Orchestrator for one `.rope/issues/<slug>/` package. Dispatch every
ready slice within host limits; record reasons for reduced concurrency.
Review is one gate at the end. Leaves never spawn leaves.

Details, setup, test scope, briefs, and failure handling:
[execution rules](references/execution-rules.md).
Architecture constraints:
[architecture continuity](../rope-shape/references/architecture-continuity.md).
Code TDD: [red→green playbook](references/tdd.md).

## Startup

1. Before baseline or dispatch, read **Startup** in the installed
   [dynamic workflow reference](references/dynamic-workflow.md). Reuse the
   session's execution form or resolve config + host capability on direct
   entry. Under `dynamic`, also read the
   [execution template contract](references/execution-template.md) — the plan
   schema, the run record, and the host limits the plan must live inside.
2. Load Behavior Contract, Testing Decisions, Architecture Impact, Constraint
   Bundle index, slice statuses, and E2E. Deep-read details on dispatch.
3. Check git status; resolve unrelated dirty work before proceeding. Select
   baseline evidence using execution-rules' impact-based ladder. Commit the
   issue package before worktree dispatch: fresh worktrees start from HEAD.
4. Consume shape's `Execution mode:` (worktree/shared); recheck isolation
   capability. A mismatch degrades with a recorded reason. For legacy
   packages, derive isolation mode per execution-rules.
5. Report initial ready count, maximum graph width, planned parallelism,
   and reasons for constrained concurrency.

## Execute by resolved form

**Dynamic:** compile task data from the approved `tasks.md` and invoke the
shipped kernel — `skills/rope-go/workflows/go-execute.js`, by **absolute
`scriptPath` resolved from this skill's installed directory**. You write
briefs, checks and the evidence table; the kernel writes the delivery
contract, dispatches, merges, gates, reviews and fixes. Ask for
`explain: true` first when the graph is new. After the structured return,
update the issue records from it and hand off to verify only on `delivered`.

**Agent dispatch:** use the following slice loop and final review.

## Slice loop — Agent dispatch

- Worktree readiness: `seam-required` blockers must be merged. Dispatch
  immediately from the latest merged HEAD; file-overlap and methodology
  preferences order merges, not dispatch. No wave barrier.
- Shared readiness: waves with disjoint owned files; file-overlap also
  blocks dispatch. Collect commits serially to avoid index contention.
- Give each implementer a self-contained minimal brief (≤60 lines, per
  execution-rules): contract, constraint IDs, map path, focused TDD commands,
  required evidence, and unconditional worktree setup step 0.
- Reconcile each Required-evidence item to returned output or an artifact
  path. Missing evidence bounces to the leaf; this is not a review or a
  parent test rerun. Missing tests require an explicit brief correction,
  not silent substitution. A changed acceptance requirement returns to shape.
- Fix rounds: re-brief a fresh leaf, at most two per problem; independent
  ready slices continue. A design/contract defect goes to the human.
- Merge landed branches serially. Conflicts get one re-dispatch on the
  unmerged branch, using both branches' intent; unresolved merges remain
  blocked. After each merge update map evidence and refill the ready set.

## Investigation map

`<issue>/map.md`: one current fact per line, path + date, seeded at shape.
Shared mode: leaves update falsified lines in their disjoint scope.
Worktree mode: leaves return corrections; the parent writes after merging.

## Final review — Agent dispatch only

1. After every slice is integrated, freeze a clean tree with no active leaf.
   Spawn two fresh read-only leaves concurrently against that HEAD:
   **Standards scanner** (explore preset, affected lint/typecheck/build and
   diff conventions) and **Behavior reviewer** (`rope-reviewer`, starts the
   product and walks Matrix/E2E at the real entrypoint). Only the reviewer
   runs the product. Test scope follows execution-rules, not blanket suites.
2. Aggregate the worst axis verdict mechanically, retaining both identities
   and evidence. Transcribe blocking findings (`path:line`, issue, fix) into
   one implementer brief; notes stay notes. No new acceptance requirements.
3. At most two fix rounds, delta-only re-review; unresolved findings become
   a Human Escalation Stop. Record verdict and fix history.
4. Hand off to `rope-verify` for paperwork after a passing review; finish
   follows verify PASS. Dynamic execution already performed this review
   inside its kernel and does not run it again here.

## Stop / report

Missing evidence, failed gates, missing environment, unresolved contracts,
and human gates remain explicit blockers. Report slices/commits, parallelism,
red/green evidence or waiver, test-scope reasons, review/fix history, E2E
statuses, and held versus continuing work. Never infer success from silence.
