# 0014 Workflow Execution Mode — Script-Driven Orchestration, Config-Decided

**Status:** active — supersedes the mechanism half of [0003](0003-dynamic-workflow-mode.md)
(its `mode: dynamic` field convention is retired and removed from the spec);
complements [0007](0007-graph-driven-go-single-review.md) (the graph in
`tasks.md` stays the truth source — a workflow script is only an executor),
[0008](0008-slice-ready-worktree-execution.md) (worktree isolation is the
leaf primitive), and [0011](0011-edge-classification-and-acceptance-gates.md)
(gates stay structural).

Date: 2026-09-08

## Context

ADR 0003's dynamic mode was **model-driven parallel dispatch**: the parent
LLM read the graph, spawned leaves one by one, and personally absorbed every
summary. The infrastructure (no script runner, no mechanical gates, no
resume) could not bear fan-out width, so shape stayed conservative and the
parallel semantics never truly landed. The lesson is not that the idea was
wrong but that **the executor form was wrong**: shape boldness is a function
of infrastructure.

The 2026-09-08 replay experiment (legal-finance-ai-employees waves 2-3,
`.rope/research/dynamic-workflow-replay-legal-finance.md`) proved the
script-driven form end to end on pi's native SubagentWorkflow: parent context
<6% for the whole go (vs 385 turns / 4 compactions in the original run),
Wave2's five leaves at 334k tokens in ~5 min parallel wall-clock, prefix-cached
resume replaying finished agents at zero token cost, and a fresh-eyes EOI
review catching a real read-side ACL bypass that the original run's full
review chain had missed.

The same experiment, plus two production defect classes (agent-workbench
legal E4 composition defects; dingtalk v1.6.2 `reply_queue` seam-migration
residue — `dingtalk_stream_assembly.py` / `workbench_intake_facade.py` were
in no slice's owned files, and E1's "real bootstrap" gate checked lifecycle,
not behavior), established the gate requirements: integration gates must
assert real invariants, and composition roots must be exercised by real
assembly with events in and observable behavior out.

## Decision

1. **Execution form is decided by user config + host probe, nothing else.**
   `~/.rope/config.toml`:

   ```toml
   [execution]
   default = "dynamic"   # dynamic | agent (absent ⇒ agent)

   [execution.fans]      # optional budget ceilings, executor-side
   research = 20
   panel = 3
   fix_storm = 3
   ```

   - Config says `dynamic` and the host provides a deterministic workflow
     runner (pi: SubagentWorkflow) ⇒ workflow execution.
   - Config says `dynamic` but the host lacks one (codex, agy) ⇒ soft-degrade
     to Agent dispatch, narrower fan, reason recorded in `map.md`. The ticket
     is unchanged.
   - Config absent or `agent` ⇒ current parent dispatch (ADR 0007 behavior).
   - **No issue-level declaration.** `mode:` in `prd.md` frontmatter (ADR
     0003 convention) is retired and removed from the spec. Small work routes
     to rope-quick and never reaches go; switching to manual mid-run is
     one-off steering, not a persistent field.

2. **dynamic means script-driven.** A deterministic script (JS) owns waves,
   dispatch, merges, gates, and fix rounds. The model exists only inside
   leaves and review agents. Non-negotiables learned from the experiment:
   gate scripts live in repo files (quoting layers silently corrupt inline
   commands); fix rounds are fresh agents (resume cannot carry a gate);
   fix/merge agents' briefs must say "resolve or report and continue", not
   "stop on conflict" (literal obedience aborted a 3/5 integration that a
   single-assertion gate then passed).

3. **Gate menu** (per wave, cheap and mechanical):
   - **L1 slice-focused tests** — inside each leaf's own run.
   - **L2 integration invariant** — dual assertion: *all* input branches
     merged AND the focused suite green. Tests-green alone is insufficient.
   - **L3 composition-root smoke** — real assembly (mock only at the outer
     boundary, never at a migrated seam), one event in, one observable
     behavior out, seconds to run. Required when the issue touches ≥1
     composition root (shape enumerates them).

4. **Tickets stay executor-agnostic.** The dependency graph already encodes
   waves / width / disjoint files; that is the parallelism *possibility*. How
   far an executor exploits it is decided by config budgets. No `fan:` blocks
   in packages. Fans (research / panel / fix-storm / array) are executor-side
   semantics defined in the spec.

5. **E4-style user-run walks demote** from discovery layer to final
   spot-check once L3 exists per wave.

## Consequences

- Gains: parent context near-idle during go; zero-token resume of finished
  agents; wall-clock from wave parallelism; AFK potential once pi's headless
  stale-ctx bug is fixed (today: run under an interactive host).
- Costs: gate invariant design is now load-bearing — one wrong invariant
  ships partial integration; shared ledgers (map.md-style) must use
  evidence-row return (leaf returns rows, integrator appends) instead of
  concurrent writes.
- Deferred: `graph2workflow` compiler (tasks.md graph → `.js` script) as a
  separate issue once more issues have run under manual script authorship.

## Addendum (2026-09-10): graph scheduling, gate tiering, setup step 0

First full production run under dynamic mode (agent-workbench
`legal-agent-capabilities`, 17 slices; field report
`.rope/research/session-01a0840a-dynamic-field-report.md`) validated the
script-driven form and exposed four executor-side defects, all fixed in
`.rope/specs/dynamic-workflow-mode.md`:

1. **Wave compilation → per-slice readiness dispatch** (frontier refill
   after each merge). Under worktree isolation, fixed wave barriers idled
   ready slices behind whole-wave merges + full suites they never needed
   (S14–S16 waited out a full W3 merge). Aligns the executor with ADR
   0007's graph-is-the-scheduler; waves remain the shared-mode concept.
2. **Gate tiering is a hard rule, restated where the script author reads**:
   L1 focused inside leaves; the full suite appears exactly twice — go
   baseline and end-of-issue review. The run put full suites in every
   leaf closing gate and every wave merge (~11 full runs ≈ 38 of 73 min);
   ADR 0013 already forbade this.
3. **Step 0 setup injection**: the script compiler injects the repo's
   `routes.md` `Worktree setup:` command into every leaf brief
   (unconditional, check-first; `setup` line in the return schema). The
   first run omitted it — three leaves went red on missing node_modules
   in harness worktrees; the recompiled run passed first try.
4. **Gates assert on output files, never piped exit codes** — a merge
   regression reported green through `cmd | tail` exit swallowing.

The end-of-issue review protocol for the dynamic path (freeze point,
two parallel leaves, in-script fix loop) lands in the spec's end-of-issue
section the same date.
