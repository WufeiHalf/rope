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
2. Clean git; baseline ladder (ADR 0013): same-HEAD green evidence →
   declared quick tier → full suite once; rungs, budget, and the
   write-to-file parsing rule live in execution-rules (Test tiers).
   Issue package committed first if worktree mode (a worktree is cut
   from HEAD).
3. Consume the `Execution mode:` recorded at shape in `tasks.md` (ADR
   0012); re-verify host capability — a mismatch degrades to shared with a
   recorded reason. No record (legacy package): decide per execution-rules.
4. **Declare parallelism in the report**: max X (widest wave / antichain)
   vs planned Y; reasons when Y < X.

## Slice loop — dispatch on readiness

- **Edge-aware ready set (ADR 0011/0012):** `seam-required` blockers gate
  dispatch in both modes. `file-overlap` gates only in shared mode; under
  recorded worktree mode it is a merge-order preference — the two slices
  dispatch concurrently and the merge queue orders landing. A
  `methodology-order` edge never blocks dispatch — it is a merge-order
  preference recorded in tasks.md; serialize merges by it when convenient,
  never serialize dispatch.
- **Worktree mode** (host can isolate a spawn): a slice is ready the moment
  its **seam-required** blockers are **merged**; dispatch immediately into
  its own worktree from the latest merged HEAD. No wave barrier — the graph
  is the scheduler.
- **Shared mode** (any host): waves; same-wave parallelism needs disjoint
  owned files; the parent collects commits serially in landing order.

Dispatch → background implementer leaf per slice with a **minimal brief**
(allowlist + ≤60 lines; execution-rules): TDD hard fields, map path,
constraint IDs, worktree-setup condition step. Collect results as they
land: acceptance, red evidence, green, seam legal, commit, constraint
evidence. **Mechanical Return Gate (ADR 0011):** reconcile each return
against the slice's Required evidence — every item maps to pasted command
output or an artifact path; missing items bounce the leaf to exactly those
items. The gate is evidence reconciliation: no implementation re-read, no
test reruns, no verdict (ADR 0007 — the end-of-issue review stays the only
review gate). Fix rounds (≤2) on one slice never pause dispatch of other
ready slices; a fix round may not add acceptance requirements absent from
the Behavior Matrix (**Defense Budget**): a genuine gap goes back to shape
as a re-cut, or is demoted to a recorded non-blocking note. Design defect
→ Human Escalation Stop.

Worktree mode: merge landed branches serially, one at a time
("Merge queue"); after each merge, update `map.md` from leaf summaries and
re-check the ready set. Conflict → one re-dispatch with both branch names,
resolving **on the unmerged branch** (its brief + commits are the primary
intent sources — ADR 0012).
Shared mode: next wave.

## Workflow execution (config-decided — ADR 0014)

Before dispatching, resolve the execution form. Nothing in the issue
package influences it:

1. Read `~/.rope/config.toml` `[execution] default`. Absent or `agent` ⇒
   parent dispatch as above (this file's default behavior, unchanged).
2. `dynamic` + host provides a deterministic workflow runner (pi:
   SubagentWorkflow tool) ⇒ **script-driven execution** per
   the `dynamic-workflow-mode.md` spec in the rope repo's `.rope/specs/`:
   - Compile the dependency graph into a workflow script
     (`.pi/workflows/<issue>.js`); the script owns dispatch, merges, gates,
     fix rounds. Dispatch is per-slice readiness — frontier refill after
     each merge; fixed wave barriers are shared-mode only. The model
     lives only in leaves and review agents — never as the orchestrator.
   - Leaves: same harness presets as Agent dispatch (`rope-implementer`…),
     worktree isolation, self-contained briefs (leaf reads its slice entry
     itself), each opening with **step 0 = the `routes.md` worktree-setup
     command** (unconditional, check-first; setup line in the return).
     Briefs stay within the ≤60-line budget.
   - **Gates, scripts in repo files** (never inline shell in JS — quoting
     layers corrupt it; every gate asserts on an output file, never a
     piped exit code): **L1** leaf-focused tests — the only suite a leaf
     runs; **L2** integration dual assertion — *all input branches
     merged* AND focused suite green (tests-green alone ships partial
     integrations); **L3** composition-root smoke from the `tasks.md`
     composition-roots block (real assembly, fake outer boundary, event
     in → observable out). The full suite appears exactly twice — go
     baseline and end-of-issue review (ADR 0013).
   - Merge/integration is a dedicated mechanical agent per wave; its brief
     says "resolve mechanical conflicts (append sections) or report and
     continue" — never "stop on conflict". Shared ledgers: leaves return
     evidence rows, the integrator appends once (never concurrent writes).
   - Fix rounds: fresh agent with failure output (≤2, fail-fast).
     **Never combine `resume` with `gate`.**
   - Run under an **interactive host** (headless crashes today); monitor via
     `/agents → Workflows`. Resume a crashed/edited run via prefix cache —
     finished agents replay at zero token cost.
   - After the run: parent does bookkeeping **from returned results only** —
   tasks.md statuses, map.md rows, review records; then the end-of-issue
     review gate runs **in-script at the freeze point** (two leaves +
     fix loop ≤2 with delta re-review — spec's End-of-issue review
     section); ADR 0007/0010 semantics unchanged.
3. `dynamic` + no workflow runner on this host ⇒ soft-degrade to parent
   dispatch, narrower fan, record the degrade reason in `map.md`.

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
