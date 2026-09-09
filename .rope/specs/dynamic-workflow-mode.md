# Workflow Execution Mode — Spec

Contract for script-driven workflow execution of rope go phases.
Companion to `.rope/adr/0014-workflow-execution-mode.md`. This spec
**replaces** the ADR 0003-era `mode: dynamic` contract (per-issue
model-driven parallel dispatch); the `prd.md` frontmatter `mode:` field is
retired and must not be written into new packages.

## Source of truth

Execution form = user config + host probe. Nothing in an issue package
influences it.

`~/.rope/config.toml`:

```toml
[execution]
default = "dynamic"   # dynamic | agent; absent ⇒ agent

[execution.fans]      # optional ceilings; executor-side only
research = 20
panel = 3
fix_storm = 3
```

Resolution:

```
execution.default == "dynamic"?
 ├─ no  ⇒ parent Agent dispatch (ADR 0007 behavior, unchanged)
 └─ yes ⇒ host has deterministic workflow runner? (pi: SubagentWorkflow tool present)
          ├─ yes ⇒ workflow execution (this spec)
          └─ no  ⇒ soft-degrade: Agent dispatch, narrower fan,
                   degrade reason recorded in issue map.md
```

- Small work routes to rope-quick and never reaches go — that is the
  structural small-issue path, not a mode exception.
- Mid-run manual takeover is steering (kill the workflow run, parent
  continues remaining slices via Agent dispatch); one-off, no persistent
  field.

## Workflow execution semantics

- The dependency graph in `tasks.md` is the truth source. The script
  schedules **per-slice readiness**: a slice dispatches the moment its
  `seam-required` blockers are merged; after every merge the ready set is
  recomputed (frontier refill). Fixed waves are the shared-mode concept —
  a workflow script adds scheduling edges or wave barriers on top of the
  graph only in shared mode. It never invents dependency edges.
- Leaves run in isolated worktrees via harness presets
  (`rope-implementer`, `rope-reviewer`, …) — same registry as Agent
  dispatch; the executor is just a different consumer.
- Leaves receive self-contained briefs: read the slice entry themselves;
  no workflow context leaks into leaves; leaves never spawn leaves.
- Every leaf brief opens with **step 0 = the repo's `routes.md`
  `Worktree setup:` command** (unconditional, check-first, idempotent —
  the execution-rules contract). The compiler injects the step; a leaf
  never discovers after a red test that it needed setup. The return
  schema carries a `setup` line (`setup: ran <cmd>` | `setup: no-op` |
  setup failure as the blocker). Undeclared line ⇒ execution-rules
  fallback: environment failure is a blocker, never a fix-round target.
- Merge/integration is a dedicated mechanical agent, not the
  parent: merges landed branches serially in landing order (batched as
  frontier refill produces them), runs the L2 gate, commits. Briefs must
  say "resolve mechanical conflicts (append sections) or report and
  continue", never "stop on conflict".
- Fix rounds: gate red ⇒ fresh fix agent (same brief + failure output),
  budget 2 rounds, fail-fast. **Resume cannot carry a gate** — never combine
  them.
- After the run the parent does bookkeeping from returned results:
  tasks.md status, map.md evidence rows, verify/ review records. Workflow
  returns are the input; nothing is re-derived.
- Monitoring: interactive host only (TUI `/agents → Workflows`). Headless
  `pi -p` is broken today (stale-ctx crash in pi-custom-subagent); do not
  schedule AFK runs until fixed.

## Gate menu

All gates are mechanical, cheap, per merge batch. **Gate scripts live in
repo files** (e.g. `gate_legal.py` pattern) — inline shell in the
orchestrating JS gets silently corrupted by quoting layers. Every gate
command writes its output to a file and asserts on the file — a piped
exit code is not evidence (`cmd | tail` swallowed a real nonzero exit in
the field and reported a red tree green).

- **L1 — slice-focused tests.** Run inside each leaf against its own
  worktree; leaf reports red/green evidence per matrix row. L1 is the only
  suite a leaf ever runs. **The full suite appears exactly twice in an
  issue — the go baseline and the end-of-issue review** (ADR 0013); a leaf
  or merge gate that runs it has mis-tiered.
- **L2 — integration invariant (dual assertion).**
  1. every input branch of the wave is merged into the integration branch
     (`git branch --merged` covers them), AND
  2. the focused suite for the issue's modules is green.
  Tests-green alone is insufficient — a partial merge on a stale tree can be
  green.
- **L3 — composition-root smoke.** Required when the issue touches ≥1
  composition root (shape enumerates them; harness missing ⇒ shape grows a
  harness slice first). Real assembly, one event in, one observable
  behavior out, seconds to run. Mocks only at the outer boundary
  (transport/CLI/HTTP), never at a seam under migration. Example (dingtalk
  class): assemble the real stream wiring with a fake transport, feed one
  `/clear` event, assert a reply delivery marker is enqueued.

## Fans (executor-side semantics; never in tickets)

| Fan | Use | Default ceiling |
| --- | --- | --- |
| research | grill/shape fact-gathering leaves, schema-structured returns | 20 |
| panel | per-slice fresh-eyes reviewers + judge aggregation | 3 |
| fix-storm | concurrent fix hypotheses on a red gate + judge | 3 |
| array | homogeneous many-source implementation slices (graph width) | graph width |

The dependency graph already declares parallelism *possibility* (waves,
disjoint files); fans describe how an executor may exploit it within config
budgets.

## Shared ledgers

Concurrent leaves never write shared ledger files (issue `map.md`, similar
appender files). Leaves **return evidence rows** in their final report; the
wave's integration agent appends them in one pass. (Experiment finding: 5
concurrent map.md writers = guaranteed conflict.)

## Forbidden shortcuts

- Any execution-form field inside an issue package (`mode:`, `fan:` blocks).
- Single-assertion integration gates (tests green without all-branches-merged).
- Mocking a migrated seam instead of the outer boundary in L3.
- Inline gate commands in orchestrator scripts instead of repo gate files.
- Combining `resume` with `gate` in workflow agent calls.
- Parallelizing overlapping slices (unchanged from ADR 0003-era rule; still
  true).
- Hard-coding a model list in scripts instead of resolving harness presets.
