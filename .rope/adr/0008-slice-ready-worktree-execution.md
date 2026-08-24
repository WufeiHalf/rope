# 0008 Slice-Ready Worktree Execution

**Status:** active — refines ADR 0007's wave loop; slicing philosophy
further refined by [0009](0009-ticket-tdd-issue-bdd-layering.md).

Date: 2026-08-23

## Decision

1. When the host can isolate a spawned leaf in a git worktree, `rope-go`
   switches from **wave-scheduling** to **slice-ready scheduling**: a slice
   is ready the moment all its blockers are merged; the parent dispatches
   it immediately into its **own worktree** cut from the latest merged HEAD.
   No wave barrier exists — the dependency graph alone is the scheduler.
2. A serial **merge queue** replaces wave boundaries: each landed leaf is
   merged by the parent, one at a time; after each merge the parent
   re-evaluates the ready set. A merge conflict re-dispatches one
   implementer leaf with both branch names.
3. **Worktree readiness is a repo contract**, not host magic: one
   declarative line in `routes.md` (`worktree-setup:`) — a command that
   makes a fresh worktree's green command pass, or `host-managed` when the
   host already prepares worktrees. Three tiers: host-managed / declared
   command / undeclared (leaf tries green first; environment failure is a
   blocker, not a fix-round; remaining slices fall back to shared mode).
4. In worktree mode the **parent owns `map.md`**: leaves report falsified /
   needed lines in their summaries; the parent writes them after each
   merge. Concurrent leaves never share the file.
5. Overlapping slices may run concurrently in worktrees — overlap defers
   its cost to the merge queue (conflict → re-dispatch), instead of
   forbidding parallelism up front. Owned-files disjointness stays the
   safety rule of **shared mode**, which remains the default fallback for
   hosts without isolation.
6. **Concurrency is the default intent in both modes** (field refinement,
   2026-08-24: the first real run serialized its only parallel pair on
   friction reasoning). Every ready slice gets a background leaf; a single
   parallel pair still runs in parallel; small gain only factors into
   setup-cost weighing, never alone justifies serializing; any
   serialization needs a recorded reason. A fix round on one slice never
   pauses dispatch of other ready slices. Startup report declares max
   parallelism X (widest wave / largest antichain) vs planned Y, with
   reasons when Y < X.

## Context

ADR 0007 kept waves because a shared checkout has one HEAD: waves are the
coarsest safe barrier. Host-level worktree isolation (pi subagents
`isolation: "worktree"`; Claude Code agents `--worktree`) removes that
constraint — each leaf can run against its own HEAD cut from the latest
merged state. Session 01a01ece's slice durations were highly uneven
(7–32 min per slice); wave barriers waste exactly that variance, and its
rivers were already identified at shape.

Dependency setup does not travel with a worktree (untracked files are not
copied), so every leaf in a fresh worktree would otherwise fail its green
command — hence the readiness contract. The owner's herdr script
symlinks dependencies on worktree creation for agent-workbench
(host-managed tier); other repos declare a command.

## Why this shape

- The graph, not a barrier, is the true dependency statement: slice-ready
  scheduling is never worse than waves and recovers all idle time between
  uneven slices.
- Merge conflicts are cheaper than lost concurrency: disjointness was
  load-bearing only when slices shared one checkout.
- Per-merge test rituals add no truth the model already has: leaves run
  TDD inside their worktrees; downstream worktrees cut from merged HEAD
  exercise upstream changes; assembled truth is the end-of-issue
  reviewer's job (ADR 0007, unchanged).

## Consequences

- go's loop reads: ready-check → dispatch (worktree) → merge-queue →
  repeat. Simpler to follow than wave + overlap bookkeeping.
- `map.md` hand-off changes in worktree mode only; shared mode keeps
  leaf-side maintenance.
- Setup cost per leaf is real (install or symlink); the contract makes it
  one line per repo, and `rope-shape` catches missing declarations for
  existing repos without re-running `rope-init`.

## Alternatives considered

- Keep waves, worktree per river (ADR 0007's section): leaves scheduler
  simplicity on the table; superseded.
- Per-merge integration test gate: duplicates downstream-slice TDD and
  the end-of-issue review; rejected.
- Wait for field data on wave mode before upgrading: owner chose to ship
  both behind the host-capability check now.
