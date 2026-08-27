# Rope Go Execution Rules

## Parent / Leaf Contract

The go session is the **Parent Orchestrator**. Leaf workers:

| Role | Typical preset | Job |
| --- | --- | --- |
| implementer | `rope-implementer` | TDD, implement one slice unit, commit, return summary + paths |
| reviewer | `rope-reviewer` | End-of-issue behavior acceptance: Matrix walk at the real entrypoint + probe; verdict owner |
| scanner | `rope-explore` + Standards brief | End-of-issue Standards fast-scan: lint/typecheck gate, conventions, smell baseline; never runs the product |
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
   When tasks.md records methodology-order preferences (ADR 0011), order
   the queue by them when convenient — they never gate dispatch, only
   landing order.
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
  mode), blockers — **plus the Return Gate payload:** every slice
  Required-evidence item mapped to pasted command output or an artifact
  path, keyed by evidence id (ADR 0011)
- Relevant artifact paths (prd/tasks/e2e, bundle, map, specs, files)
- Map path — orient by it; update falsified lines before commit (shared
  mode) or report them in the summary (worktree mode)
- Worktree mode: the worktree-setup condition step when the repo declares one
- No nested spawn; commit rules; Blocked by / Scope

End-of-issue briefs (two, ADR 0010): **scanner** — diff + commit list +
standards-source paths + inline global invariants + pasted smell baseline
(below); **reviewer** — diff + commit list + Matrix behavior rows + e2e
path + entrypoint start hint + inline global invariants (bundle path on
suspected conflict only; no map). Axes and high-risk list live in the
reviewer preset body, not the brief. Same allowlist and line cap.

## Return Gate reconciliation & Defense Budget (ADR 0011)

On each landing, reconcile mechanically — a table check, not a review:

```md
| Evidence item (id) | Required by (matrix row) | Returned output/path | verdict |
| --- | --- | --- | --- |
| S2-E1 crash-after-rename | B4 | pasted pytest output | ok |
| S2-E2 concurrent get-or-create | B5 | (missing) | BOUNCE |
```

- Any `BOUNCE` row → re-dispatch the leaf with exactly the missing item
  ids; nothing else reopens.
- The gate never re-reads implementations, never reruns tests, never
  issues verdicts — the end-of-issue review stays the only review gate
  (ADR 0007).
- **Defense Budget:** a correction brief contains **zero** acceptance
  requirements absent from the Behavior Matrix. A gap discovered
  mid-execution goes back to shape as a re-cut (new slice) or is demoted
  to a recorded non-blocking note in tasks.md. Design-constraint drift
  across rounds ("fix2 replaces what fix1 built") is a Defense Budget
  violation — stop and re-cut instead.

## Human Gate Panel (ADR 0011)

Multiple pending gates render once, batched:

```md
## Human Gate Panel (2 pending)
1. [S5] authorize fail-open → fail-closed switch — blast radius: summary
   gate path; lanes S2/S3 continue, S4 holds.
2. [S8] approve destructive worktree cleanup — blast radius: none unmerged;
   all lanes continue.
```

Each entry: affected slices / exact authorization requested / blast radius /
other lanes' continue-or-hold status. Never present gates one-at-a-time while
other lanes sit idle without an explicit hold statement.

## End-of-Issue Review Execution (parent-owned)

After all slices and before verify, the parent spawns **two read-only
leaves in one message** (ADR 0010) — both new eyes, never watched the
build:

1. **Scanner leaf** — the `rope-explore` preset with the Standards brief
   below (generic read-only worker otherwise; record the type used).
   Runs lint/typecheck/build first and skips what tooling enforces;
   never runs the product.
2. **Reviewer leaf** — `rope-reviewer` from the harness manifest (generic
   worker with explicit review instructions otherwise). Read-only on
   code; the **only** leaf allowed to start/stop processes and drive a
   browser. Starts the product first, reads the diff while it boots.
3. **Aggregate mechanically**: verdict = worst of axis verdicts
   (`approve` < `changes_requested` < `blocked`); blocking findings from
   either leaf → one fix brief. No rerank, no merge, no re-judgment —
   the parent is not a second reviewer. Record verdict + both leaf
   identities + fix rounds in `tasks.md`.
4. **Fix protocol**: the fix brief transcribes blocking findings verbatim
   — `{severity, path:line, issue, fix}` — nothing left to explore.
   ≤2 automated rounds, then Human Escalation Stop. `note` findings are
   recorded in `tasks.md`, never fixed by a round.
5. **Delta re-review**: after a fix round, the scanner re-scans the fix
   commit diff only; the reviewer re-probes only affected paths. A full
   re-review never repeats.

### Diff hygiene (both leaves)

```md
git diff <base>...HEAD -- . ':(exclude)*lock*' ':(exclude)*.snap' ':(exclude)dist/'
```

Extend the excludes per repo (vendor/, build output, generated files) —
lockfile/snapshot noise is 20–50 % of a web project's assembled diff, and
both leaves pay for every included line.

### Scanner brief (paste, ~35 lines)

- diff command (with excludes) + commit list
- standards-source paths (CODING_STANDARDS / CONTRIBUTING / lint config)
- inline global invariants (short list from the bundle)
- the smell baseline below, pasted verbatim
- return contract: "Report `clean` or findings, ≤200 words, each
  `{severity blocking|note, path:line, issue, fix}`. Every hit is a
  judgement call, never a violation; documented repo standards override
  the baseline; skip what tooling enforces."

**Smell baseline** (Fowler, _Refactoring_ ch.3, one line each; plus rope's
TDD anti-patterns: implementation-coupled, tautological, bulk-horizontal):

- Mysterious Name — the name doesn't say what it does → rename; no honest name means murky design
- Duplicated Code — same logic shape in >1 hunk → extract the shared shape
- Feature Envy — method reaches into another's data more than its own → move it there
- Data Clumps — same fields/params travel together → bundle into one type
- Primitive Obsession — a primitive stands in for a domain concept → give the concept a type
- Repeated Switches — same switch/if-cascade recurs → polymorphism or one shared map
- Shotgun Surgery — one change scattered across many files → gather into one module
- Divergent Change — one module edited for unrelated reasons → split by reason
- Speculative Generality — hooks the spec doesn't need → delete, inline back
- Message Chains — long `a.b().c().d()` walks → hide behind one method
- Middle Man — mostly delegates onward → cut it, call the target
- Refused Bequest — implementer ignores most of what it inherits → compose instead

### Reviewer brief

- diff command (same excludes) + commit list
- Matrix behavior rows + e2e path
- entrypoint start hint: the project's documented start command when one
  exists; otherwise the leaf derives it from the README
- inline global invariants + bundle path (read only on suspected conflict)
- no map; no upfront bundle read; axes and high-risk focus live in the
  reviewer preset body

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
