# Rope Go Execution Rules

## Parent / Leaf Contract

The go session is the **Parent Orchestrator**. Leaf workers:

| Role | Typical preset | Job |
| --- | --- | --- |
| implementer | `rope-implementer` | TDD, implement one slice unit, commit, return summary + paths |
| reviewer | `rope-reviewer` | End-of-issue new-eyes review: assembled diff, behavior acceptance, real-entrypoint probe; return verdict |
| explore | `rope-explore` | Read-only facts when re-brief needs more context |

Rules:

- Parent spawns leaves with **self-contained briefs**; leaves return
  **summary + artifact paths/status** only.
- **No nested spawn.** Parent owns all dispatch.
- Correction = rewrite brief + re-spawn implementer. Max **2** automated fix
  rounds per problem → Human Escalation Stop. Design/contract defect →
  immediate stop. A fix round never pauses dispatch of other ready slices.
- **Concurrency default**: every ready slice gets a background leaf; a
  single parallel pair still runs in parallel; any serialization needs a
  recorded reason in `tasks.md`.

## Modes

- **Worktree mode** — host can isolate a spawn in a git worktree (pi
  subagents: `isolation: "worktree"`; Claude Code: agent `--worktree`; a
  hand-made worktree works too). Slice-ready: ready = blockers **merged**;
  dispatch into a fresh worktree from the latest merged HEAD. Overlapping
  slices may run concurrently — overlap surfaces in the merge queue.
- **Shared mode** — waves; same-wave parallelism needs disjoint owned
  files; parallel leaves must not commit simultaneously (index contention):
  the parent collects commits serially in landing order, or leaves stop at
  green + diff and the parent commits.

## Merge queue (worktree mode)

Landed branches merge **serially, one at a time**, in landing order:

1. Merge one branch; conflict → re-dispatch **one** implementer leaf with
   both branch names and conflicting paths; its fix rejoins the queue.
2. After each merge: update `map.md` from leaf summaries, re-check the
   ready set, dispatch newly-ready slices.
3. No per-merge test ritual — leaves ran TDD; downstream worktrees cut from
   merged HEAD exercise upstream changes; assembled truth is the
   end-of-issue review.

## Worktree setup (repo contract, in `routes.md`)

```md
- Worktree setup: `./scripts/worktree-setup.sh`   # or: host-managed | npm ci | uv sync | …
```

- **`host-managed`** — a host hook prepares worktrees. State its **scope**:
  hooks firing only for host-created worktrees do not cover rope-spawned
  isolation worktrees — declare the script invoked manually instead
  (usually `bash <host-setup.sh> <path>`).
- **Declared command** — goes into every worktree leaf's brief as a
  condition step:
  ```md
  Worktree setup (only if the green command fails on a missing
  environment): <command>. Retry green once after. Still failing → report
  blocker; do not spend fix rounds on environment setup.
  ```
- **Undeclared** — leaf tries green first; environment failure is a
  blocker. Parent falls back to shared mode for remaining slices and
  records the reason. Before accepting any "setup friction" reason to fall
  back, check whether the host setup script applies manually — it usually
  can, keeping worktree mode available.

## Leaf Brief Contract (hard budget)

Per ADR 0005: **minimal brief** — allowlist + ≤60-line cap (paths and
command blocks excluded). The parent checks the budget before dispatch.

**Content payload (allowed inline):**

1. Issue path + slice id/title
2. **Public behavior:** one user-visible sentence — or, for a component
   slice, the user-story row it serves + its own completion criteria
   (interface signature / tests green)
3. **Behavior Contract:** the 6 fields cut to their thinnest form
4. **Architecture constraints (by reference):** Constraint Bundle **path**
   + slice **Constraint IDs** + short global invariant list
5. **Test seam + prior art:** the seam from PRD Testing Decisions + one
   prior-art path

**Operational contract (required, not counted as content):**

- TDD mode: `required` (default for code) | `waived (docs-only)` + reason;
  when required — red command(s) + what counts as red, green command(s)
  after minimal implementation; focused/incremental, may cite prior
  full-suite evidence
- Expected return shape: summary, paths changed, commit hash (or branch
  name in worktree mode), acceptance text exercised, red evidence
  (command + failure) unless waived, green evidence, constraint IDs
  checked + disposition conflicts, falsified/needed map lines (worktree
  mode), blockers
- Relevant artifact paths (prd/tasks/e2e, bundle, map, specs, files)
- Map path — orient by it; update falsified lines before commit (shared
  mode) or report them in the summary (worktree mode)
- Worktree mode: the worktree-setup condition step when the repo declares one
- No nested spawn; commit rules; Blocked by / Scope

Reviewer briefs (end-of-issue): diff base..HEAD + commit list, Matrix
behavior rows, bundle path + constraint IDs, map + e2e paths, the two axes
+ real-entrypoint instruction + high-risk focus list. Same allowlist and
line cap.

## End-of-Issue Review Execution (parent-owned)

After all slices and before verify, the parent spawns exactly **one**
reviewer leaf — new eyes that never watched the build:

1. Prefer `rope-reviewer` from the harness manifest; generic worker with
   explicit review instructions otherwise (record the type used).
2. The reviewer is read-only on code; it may start/stop local processes
   and drive a browser to probe the real entrypoint. It must not edit code
   or spawn workers.
3. Record the verdict + run/agent identity + fix rounds in `tasks.md`.
4. Findings → one fix brief → implementer leaf; ≤2 automated rounds, then
   Human Escalation Stop.

## High-risk boundaries (the reviewer's deepest look)

- public interface or user-visible behavior
- external system or adapter behavior
- auth, permission, secret, or data leak risk
- persistence, schema, migration, stored format
- routing, app entrypoint, runtime wiring, background worker
- multi-layer behavior; E2E critical path

## E2E Execution Statuses

e2e.md carries **real-environment behaviors only** (real APIs, real
entrypoints, real external systems). Ticket-level units live in TDD
evidence, never in e2e.md.

- `agent_passed`: agent ran it; record command + evidence.
- `agent_failed`: ran and failed; fix or record blocker.
- `blocked_on_gate` / `blocked_on_user`: missing approval / human-only.
- `skipped_by_user_at_shape` / `not_run_with_reason`: intentional skips.

## Commit Rules

- Commit each completed slice independently; commit review fixes
  independently; do not combine unrelated slices; never push/merge/rebase
  unless asked.

## Handoff Checklist

- Per-slice commits present; the end-of-issue review verdict (+ fix
  rounds) recorded with identity; e2e statuses terminal; no unrelated
  dirty files.

---

## Fault manual (read on failure, not upfront)

**No harness presets** (`~/.config/rope/harness/<host>.json` or `rope-*`
agents missing): use a generic host worker without model pin; record
`preset_missing` in `tasks.md`; continue. Never auto-run
`rope-harness-presets`; never hard-block.

**Cannot background-spawn**: run waves foreground, one leaf at a time;
record the reason in the parallelism declaration.

**Worktree requested but result carries no branch name / copy toplevel**:
the host downgraded to a shared-checkout run — record the downgrade and
hold shared-mode discipline for the rest of the issue.

**Cannot spawn any reviewer worker at all**: self-review and record
`review_degraded: no_subagent_tool_available` + what was attempted + why
self-review. Never silently skip review when a worker can be spawned; never
instruct an implementer leaf to spawn the reviewer.

**Leaf truncated / aborted mid-work**: probe git status + test state before
re-dispatch; recover uncommitted work or reset, then re-brief.
