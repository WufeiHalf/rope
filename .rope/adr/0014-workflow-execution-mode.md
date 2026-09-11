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

2. **dynamic means script-driven.** A deterministic script (JS) owns graph
   readiness, dispatch, serial merges, gates, and fix rounds. The model exists only inside
   leaves and review agents. Non-negotiables learned from the experiment:
   gate scripts live in repo files (quoting layers silently corrupt inline
   commands); fix rounds are fresh agents (resume cannot carry a gate);
   unresolved merges remain blocked while independent lanes may continue.
   Partial integration cannot pass (a production run incorrectly accepted
   a 3/5 integration with a single-assertion gate).

3. **Gate menu** (per integration batch, cheap and mechanical):
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
   semantics defined in the shipped runtime reference. Research covers
   independent questions with evidence reconciliation; shape challenges
   coarse slices and false dependencies, not an arbitrary fan-out quota.

5. **E4-style user-run walks demote** from discovery layer to final
   spot-check once L3 exists for each touched root.

6. **Runtime documentation ships with the skills.** The canonical contract
   lives at [dynamic workflow](../../skills/rope-go/references/dynamic-workflow.md).
   Grill, shape, and go read its explicit startup pointer relative to their
   installed directory. `.rope/specs/dynamic-workflow-mode.md` is a maintainer
   route, not a second operational copy. Full-set user-global and project
   installs must resolve it without a Rope checkout. No installer precedence
   changes or model-plan display are introduced.

## Consequences

- Gains: parent context near-idle during go; zero-token resume of finished
  agents; wall-clock from graph parallelism. The replay's headless stale-ctx
  failure limits that historical evidence; validate the current host before
  unattended execution.
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
script-driven form and exposed four executor-side defects, addressed by the runtime contract now shipped in
`skills/rope-go/references/dynamic-workflow.md`:

1. **Wave compilation → per-slice readiness dispatch** (frontier refill
   after each merge). Under worktree isolation, fixed wave barriers idled
   ready slices behind whole-wave merges + full suites they never needed
   (S14–S16 waited out a full W3 merge). Aligns the executor with ADR
   0007's graph-is-the-scheduler; waves remain the shared-mode concept.
2. **Gate tiering belongs where the script author reads**: L1 is focused
   inside leaves; broad runs follow ADR 0013's impact selection at issue
   level. This corrects the earlier “exactly twice” wording. The field run
   put full suites in every leaf closing gate and wave merge (~11 full runs
   ≈ 38 of 73 min); ADR 0013 already forbade per-slice full-suite requirements.
3. **Step 0 setup injection**: the script compiler injects the repo's
   `routes.md` `Worktree setup:` command into every leaf brief
   (unconditional, check-first; `setup` line in the return schema). The
   first run omitted it — three leaves went red on missing node_modules
   in harness worktrees; the recompiled run passed first try.
4. **Gates assert on output files, never piped exit codes** — a merge
   regression reported green through `cmd | tail` exit swallowing.

The end-of-issue review protocol for the dynamic path (freeze point,
two parallel leaves, in-script fix loop) is retained in the shipped
reference's end-of-issue section.

## Addendum (2026-09-11): the fixed execution kernel, and why doc-only rules failed

The audited session (`agent-workbench` `legal-retrieval-pagination`;
diagnosis in `.rope/issues/dynamic-go-session-audit/diagnosis.md`, research in
`.rope/research/dynamic-go-template-and-parallelism.md`) split go across two
workflows: a first one carrying S1 alone, a hand-merge by the parent between
them, then a second for the rest. The stated reason was that the script has no
shell, so "the script owns serial merges" read as impossible. The consequence
was measurable: the second script's own branch parser matched the string
`branch: HEAD` quoted inside a brief instead of the host's delivery footer,
both concurrent implementers were marked blocked with nothing integrated, and
L2 and E2E still ran and were returned as **fields** rather than used as
preconditions. S3b/S4/P1–P3 appear nowhere in the result.

The rule-side conclusion is narrow and worth recording: the documents were not
wrong about *what* to do, and the executor that ignored them was not evidence
that the model cannot follow them. **A prose contract that a fresh session must
re-implement as code will be re-implemented wrong, differently each time.** The
repair is to stop asking for a re-implementation.

### Decision

1. **The orchestration kernel is a shipped asset**, not per-issue source:
   `skills/rope-go/workflows/go-execute.js`, invoked by absolute `scriptPath`
   from the skill's installed directory. The parent compiles **task data** and
   reads a **run record**; it writes no orchestration code. Schema authority:
   [`skills/rope-go/references/execution-template.md`](../../skills/rope-go/references/execution-template.md).
2. **Delivery identity is git-verified, never taken from agent prose.** The
   leaf commits, leaves a clean tree, and points its predeclared branch at the
   final commit; the host runs `scripts/verify-delivery.sh` as the spawn's gate
   inside the worktree *before* cleanup, and the exit code is the verdict.
   Branch-level routing replaces text parsing, which is what produced the
   `branch: HEAD` mis-match.
3. **Preconditions are structural.** L2 is "every planned task integrated **and**
   the affected suite green" asserted before L3/E2E/review may start; a stage
   that cannot run is reported `{ran:false, ok:false}` or explicitly
   `skipped:true`, never as passed. `verdict: "delivered"` additionally requires
   a review that returned `approve`.
4. **Check reuse is part of the contract.** `scripts/run-check.sh` keys evidence
   by `<scope>@<integrated commit set>` and reuses it, so an unchanged state
   cannot spend an expensive command again by accident. Checks run serially per
   stage, which is why no exclusive-lane scheduler exists.
5. **The kernel is offline-tested against its own failure history.** `tests/`
   reproduces the four audited defect classes (branch identity, missing
   downstream read as completion, false L2, per-slice full suites) with a stub
   host whose behaviours cite the installed extension source, so a host
   contract change surfaces as a test failure instead of a silent divergence.
6. **A single-file kernel is an accepted cost.** The workflow sandbox forbids
   `import`, so the kernel cannot be modularized and two slices that both edit
   it must serialize. This is not a re-introduced wave barrier; it is disclosed
   in the issue graph and in `execution-template.md`.
7. **No schema-version gate** (user decision). A plan compiled against a
   different kernel shape fails silently rather than loudly; the accepted
   mitigation is that `explain` validates the plan and the run record names what
   it did at every stage. This is recorded as an accepted risk, not an oversight.

### Consequences

- The parent session's per-issue token cost drops by the size of the script it
  no longer writes, and the class of defect it can introduce drops with it.
- Capability fixes now land in one artifact. A kernel bug affects every issue
  until fixed — which is why the offline suite is a prerequisite for shipping
  it, not a nicety.
- Kernel changes are serialized edits: two concurrent slices cannot both own
  `go-execute.js`.
- `rope add` already copies skill subdirectories recursively, so
  `workflows/` and `scripts/` install with no installer change and stay
  version-locked to the skill.
