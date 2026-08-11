# 0003 Dynamic Workflow Mode

Rope adds an **opt-in, per-issue dynamic workflow mode** decided at `rope-shape`
time. When enabled it produces a **contract-first, disjoint file-ownership**
slice set and, at `rope-go`, concurrently spawns cheap implementer leaves for the
**non-overlapping** slices, while keeping per-slice review gates and issue-level
verify. Serial behavior is unchanged when the mode is off or absent.

## Context

Empirical evidence (issue `code-change-session-repo-management`) showed long
wall-clock times: ~6h across 7 serial slices, where `code_change_session_service.py`
was touched by 5/8 slices and one slice was ~7000 lines. The existing
`optional parallel frontier` in `rope-go` (Scope-disjoint slices may parallelize)
is rarely exercised because slices are usually shaped by function logic, so
multiple slices append to the same core file and physical parallelism is
impossible (or conflict-prone).

The user's goal is a manually toggled mode that plans a feature into
small file-owning slices, builds them in parallel with cheap models, and wires
them together — matching the now-mainstream external pattern (contract-first +
disjoint file ownership + worktree isolation + parallel subagents). See
`.rope/research/dynamic-workflow-mode.md`.

## Decision

- **Opt-in, decided at shape time.** `rope-shape` asks the user whether dynamic
  mode is wanted. If yes, shape enforces a three-piece slice discipline and
  writes `mode: dynamic` into the issue package. If no, behavior is unchanged.
- **`mode` field.** `mode: serial | dynamic` in `prd.md`. Absent or `serial` ⇒
  current serial behavior.
- **Three-piece slice discipline (shape, when dynamic):**
  1. a **contract slice** (`kind: contract`) that only defines interfaces / data
     structures / call boundaries; serial and must be first;
  2. **implementation slices** cut by **disjoint file ownership** — one core
     file owned by multiple slices is a shape defect, not a go problem;
  3. a **per-slice size cap** (default ~400 diff lines / ~4 owned files) and a
     trailing **integration slice** that wires the module slices and verifies
     contract alignment.
- **go fan-out.** When `mode: dynamic`, the frontier is the set of slices with no
  unresolved blockers. Disjoint-scope frontier slices are spawned to **concurrent
  cheap implementer leaves**; overlapping slices serialize. Per-slice **review
  gates** and **commit rules** still apply. **Issue-level verify** stays
  parent-owned and read-only.
- **Model routing reuses harness presets.** No new model mechanism. Workers are
  spawned via existing `rope-harness-presets` role templates; the parent may
  override per spawn when risk warrants.

## Why this split

- **Parallelism is the weak case for coding agents** (Cognition / Anthropic): so
  the mode is safe only where slices are **disjoint + independently verifiable**.
  The contract slice and disjoint ownership are the load-bearing guard rails;
  slices sharing a core file stay serial.
- **Implement/accept separation preserved** (ADR 0001): review gates and
  issue-level verify are not weakened by parallelism.
- **Parent is the only orchestrator** (research direction 3): parallel implementer
  leaves must not spawn leaves; the parent owns all dispatch.
- **Interface is the contract**: the contract slice governs any shared boundary,
  so backend and frontend slices can build in parallel against a frozen interface.

## Consequences

- A dynamic-mode issue is shaped as: contract slice → parallel disjoint
  implementation slices → light integration slice.
- go fans out disjoint frontier slices concurrently; overlapping slices and the
  contract/integration slices stay serial.
- If go cannot spawn concurrent workers, it degrades to serial and records the
  reason in `tasks.md`.
- Serial issues are unaffected; the mode is entirely opt-in.

## Considered Options

- **Auto-detect dynamic mode.** Rejected: the user wants a manual, shape-time
  toggle.
- **go-time flag.** Rejected: slices wouldn't be shaped with disjoint ownership,
  weakening the three-piece guarantee; durable `mode` field is the bus.
- **Adopt `pi-dynamic-workflows` as the go engine.** Rejected: prototype, no
  worktree isolation, no approval/concurrency controls, and it would fight
  Rope's review/commit/verify gates. It may still be used manually for one-off
  read-only fan-out.
- **Blanket parallelization.** Rejected as forbidden shortcut: violates the
  disjoint + independently-verifiable rule.