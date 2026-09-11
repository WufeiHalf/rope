# Go Execution Template

The fixed execution kernel for dynamic go. `skills/rope-go/workflows/go-execute.js`
is a shipped, offline-tested asset; the parent session **compiles task data** and
**reads the run record** — it never authors the script.

Two schemas are the whole interface: the **plan** going in, the **run record**
coming back. Both are plain JSON. This file is their single authority;
`dynamic-workflow.md`, `execution-rules.md`, and the ADRs point here.

Invoke by absolute path, resolved from this skill's installed directory — never a
name and never a relative path, because a non-absolute `scriptPath` resolves
against the repository, not the skill directory:

```
SubagentWorkflow({
  scriptPath: "<skill-location>/workflows/go-execute.js",
  args: <plan>
})
```

## What the kernel owns, and what the parent owns

| The kernel (fixed) | The parent (per issue) |
| --- | --- |
| Readiness, dispatch order, in-flight window, refill | Which tasks exist and what each one builds |
| The delivery contract inside every leaf prompt | Each task's brief file contents |
| Branch identity, merge order, conflict re-dispatch | The declared checks and their commands |
| Advancing only through a satisfied precondition | Which items the E2E stage covers |
| Bounded repair rounds, delta re-review | Reading the record and updating issue docs |
| Never inferring completion from silence | — |

The parent writes no orchestration code and never restates the delivery
contract. A leaf that reports a wrong SHA, forgets its branch, or claims success
without committing cannot happen through prompt drift, because the kernel builds
that part of every prompt itself.

## Hard host limits the plan lives inside

Measured against the installed `@tintinweb/pi-subagents` source, 2026-09-11.

- **No shell, no filesystem, no `require`/`import` in the script.** Every effect
  is an `agent()` call. This is why the kernel is one file and why commands live
  in `skills/rope-go/scripts/`.
- **`agent()` returns `{ok, text, tokens, outputTokens, toolCalls, cwd}`** on
  success and **`null`** on failure. There is no `branch` and no `baseSha`, so
  branch identity can only come from git — see *Delivery identity*.
- **`text` is `structuredJson ?? result`.** With a `schema` the kernel receives
  the payload; without one it receives prose, and a worktree child's prose has
  the host's branch note appended, so it does not parse. **Every spawn in this
  kernel carries a schema.**
- **A `schema` mismatch is retried by the host**, so `required` fields are a real
  fence rather than a hope.
- **A `gate` runs before the worktree is cleaned up** (isolated child) or in the
  checkout (non-isolated child). Its exit code is the verdict: **a passing gate
  leaves nothing on the result, and a failing gate folds its output into a `null`
  return.** The kernel therefore treats *exit code as the verdict* and *the
  evidence files as the detail* — per-check durations, reuse flags and delivery
  SHAs are read by the parent from disk, never relayed through the script. Gate
  wall-clock bound is 10 minutes; a gate that hangs wedges the slot it holds.
- **Worktree cleanup commits leftovers to `pi-agent-<id>`** and deletes the
  copy, only when the tree is dirty or HEAD moved. A leaf that leaves work
  uncommitted loses it from the plan's point of view, which is why
  `verify-delivery.sh --recover-dirty` commits it first.
- **A merge conflict is not recoverable from the kernel**: a leaf whose work was
  rejected is re-dispatched from its delivery branch, so the branch must exist
  before the gate rejects anything.
- **Concurrency is `max(1, min(16, cpus − 2))`**, agent cap 1000, one call at
  most 4096 items. `inFlight` is a ceiling to stay under.
- **`Date.now()`, `Math.random()`, and argless `new Date()` throw** — a journaled
  run is replayed by prefix. The kernel reads no clock and generates no id.

## Plan schema (args)

```jsonc
{
  "issue": "legal-retrieval-pagination",   // required
  "baseSha": "<40-hex>",                   // required; what the plan was compiled against
  "mode": "worktree",                      // "worktree" (default) | "shared"
  "targetBranch": "main",                  // required in worktree mode
  "mainCheckout": "/abs/path",             // required in worktree mode
  "branchPrefix": "rope/",                 // default
  "inFlight": 6,                           // default 6, clamped to 1..16; forced to 1 in shared mode
  "fixRounds": 2,                          // default 2, 0..5
  "setupCommand": "bash /abs/setup.sh .",  // optional; injected as step 0 into every leaf prompt
  "verifyScript": "/abs/.../verify-delivery.sh",   // required in worktree mode
  "checkScript": "/abs/.../run-check.sh",          // required if any check is declared
  "evidenceDir": "/abs/path/.git/rope-evidence/<issue>",   // required if checks or a review are declared
  "tasks": [ /* Task, ≥1, ids unique */ ],
  "checks": [ /* Check, optional */ ],
  "e2e": [ /* E2eItem, optional */ ],
  "review": { /* Review, optional */ },
  "explain": false                          // optional; compile the schedule and return without spawning
}
```

**Keep `evidenceDir` outside the working tree** — under
`<mainCheckout>/.git/rope-evidence/<issue>` is the intended path. Evidence is
written by the gate scripts while the tree must stay clean, and an untracked
evidence directory inside the tree would read as a dirty delivery.

Unknown fields are rejected by name at every level. A plan with a typo fails
before a single leaf is spent.

### Task

```jsonc
{
  "id": "S2",                              // required, unique, non-empty
  "title": "Cursor pagination on the connector",  // required
  "briefPath": "/abs/.../briefs/S2.md",    // required; the leaf reads it
  "blockedBy": [ { "id": "S1", "class": "seam-required" } ],  // optional
  "ownedFiles": ["src/connector.py"],      // optional; shown to the leaf
  "evidence": [ { "id": "S2-E1", "item": "cursor round-trip", "row": "B4" } ],
  "preset": "rope-implementer"             // optional
}
```

- `class` is one of `seam-required`, `file-overlap`, `methodology-order`
  (ADR 0011). In `worktree` mode only `seam-required` gates dispatch; the other
  two order merges. In `shared` mode `file-overlap` gates dispatch too (ADR 0012).
- The delivery branch is **derived**: `branchPrefix + id`. The plan names it
  once, so it cannot name it inconsistently.
- Every `evidence[].id` must appear in the leaf's return with a non-empty
  result, or the task bounces back with exactly the missing ids (ADR 0011).
- The focused L1 commands are **not** declared here — they belong in the brief,
  which is the only place a leaf's own tests are described.

### Check

```jsonc
{
  "id": "quick",                 // required, unique
  "stage": "merge",              // required: merge | l2 | l3 | freeze
  "command": "npm test",         // required; runs as the host's gate command
  "scope": "repo",               // optional; part of the reuse key (default "repo")
  "required": true,              // optional, default true
  "cwd": "/abs/path"             // optional
}
```

- **Checks never run concurrently with each other.** One batch per stage, serial
  inside it, so nothing here needs an "exclusive lane": a batch holds the only
  check slot there is and a CPU-heavy suite cannot be started beside another.
- `stage: "merge"` checks are the post-merge early-warning signal, and the one
  batch that overlaps running leaves. Declare them **cheap** (seconds); the
  evidence file's `durationMs` makes a breach visible. A failed warning never
  gates.
- A `required: false` check informs without gating: its non-zero exit is
  recorded and does not fail the batch.
- **Reuse is mechanical.** The key is `<scope>@<integrated commit set>` and
  `run-check.sh` skips a check whose evidence file already exists for that key,
  reporting `reused: true`. Re-running an unchanged state therefore cannot happen
  by accident — only by deleting evidence or changing the scope.
- Every `command` runs verbatim through `bash -c`. The kernel never composes
  shell for a check.

### E2eItem and Review

```jsonc
"e2e": [ { "id": "E1", "prompt": "…", "preset": "rope-reviewer", "required": true } ],

"review": {
  "base": "<40-hex>",                       // optional; defaults to plan.baseSha
  "scanner":  { "prompt": "…", "preset": "rope-explore" },
  "behavior": { "prompt": "…", "preset": "rope-reviewer" }
}
```

Omitting `e2e` or `review` is recorded as **skipped**, never as passed. A run
with no declared review is not a delivered run.

## Delivery identity

Routing never reads agent prose. The chain is:

1. The leaf commits everything and leaves a **clean tree** — the host commits
   leftovers to `pi-agent-<id>`, a branch the plan does not know about.
2. The leaf creates its branch as the **last** write: `git branch -f rope/S2 HEAD`.
3. The host runs `verify-delivery.sh` as the spawn's `gate`, inside the leaf's
   worktree and before cleanup. The script writes
   `<evidenceDir>/delivery/<taskId>-r<round>.json`:

   ```jsonc
   { "ok": true, "mode": "branch", "reason": "branch-verified",
     "branch": "rope/S2", "sha": "<40-hex>", "clean": true,
     "recovered": false,    // leftovers were committed here
     "moved": true,         // the branch did not exist or lagged; it was created/moved here
     "headMovedFromBase": true, "baseSha": "<40-hex>" }
   ```

   A rejection carries `ok:false` and `reason: "dirty-tree" | "missing-commit" |
   "commit-not-ancestor-of-head" | "cannot-move-branch" | "git-missing" |
   "not-a-git-worktree" | "no-head"`, with the offending paths where there are any.

4. The kernel merges **the branch the plan declared**, whose existence the gate
   has just proved by exit code. The SHA is established by the **merge agent**
   from `git rev-parse`, never by the leaf's claim; a claim that disagrees is
   recorded as `claimMismatch` on the task and the git value wins.
5. A rejected delivery is a repair round, not a lost implementation: the gate's
   `--recover-dirty` commits leftovers, and the repair leaf starts from
   `git checkout -B rope/S2 rope/S2`.

So a forgotten branch costs one `moved: true` flag, and a forgotten commit costs
one `recovered: true` flag, rather than either costing the work.

`headMovedFromBase: false` — a clean tree at base, i.e. a slice that changed
nothing — is a parent-visible signal in the verdict file, not a kernel decision.

## Run record (return value)

```jsonc
{
  "verdict": "delivered" | "partial" | "stopped" | "explain",
  "issue": "…", "baseSha": "…", "headSha": "…",
  "tasks": [ { "id", "state", "branch", "commit", "mergeCommit", "rounds",
               "reason", "claimMismatch", "setup", "summary",
               "scopeDeviations", "mapLines" } ],
  "merged": [ { "id", "branch", "commit", "mergeCommit", "conflict", "conflictPaths" } ],
  "neverReady": ["S3b"],
  "blockers": [ { "id", "class", "message" } ],
  "checks": [ { "id", "stage", "scope", "key", "required", "ok",
                "verdictFile", "outputFile" } ],
  "stages": { "merge": {…}, "l2": {…}, "l3": {…}, "e2e": {…}, "freeze": {…} },
  "e2e": [ { "id", "status", "evidence", "detail", "required" } ],
  "review": { "verdict", "axes": [ { "axis", "verdict", "identity" } ],
              "rounds", "fixes": [ { "round", "branch", "commit", "mergeCommit" } ],
              "findings", "blockingRemaining" },
  "concurrency": { "inFlight", "peak" },
  "tokens": { "output": 0 },
  "suggestDowngrade": { "reason": "…", "tasks": ["S2"] } | null
}
```

- `state` is `integrated`, `blocked`, `not-started`, or `running` (only if the
  host ended the run early).
- Each stage is `{ran, ok, skipped, reason}`. `skipped: true` means the stage was
  declared empty and does not block; a stage held up by a prior failure is never
  skipped and never ok.
- `verdict` is `delivered` only when **every planned task is `integrated`, no
  required stage failed, and the review returned `approve`**. Nothing else
  produces it — an absent review yields `partial`, not `delivered`.
- `checks` carries verdicts and evidence paths, not durations: read the per-check
  JSON beside the output file for `exitCode`, `durationMs` and `reused`.
- `review.identity` is self-reported by each axis leaf; the host exposes no model
  field on a spawn result.

### `explain`

`"explain": true` compiles the plan, validates it and returns
`{verdict: "explain", schedule, declaredStages}` without spawning anything.
`schedule` carries `initialReady`, `levels` (one entry per gating level),
`maxLevelWidth`, `criticalPath`, `inFlight`, `workersBeyondCriticalPath`, and
`crossLevelPreferences` (the edges that order merges without delaying dispatch).

Shape asks for it when it needs the graph's numbers, and so does go before it
commits to a plan — the numbers come from the same code that will schedule the
run, not from hand arithmetic.

### `suggestDowngrade`

Set when the run did not deliver **and** either a blocker was classified
`environment`/`host-template`, or two or more slices exhausted their repair
rounds. The kernel never falls back to parent dispatch itself; it names the
remaining tasks so the parent can take over instead of paying for the same
failure again.

## Staged preconditions

In order, each advancing only if the previous one is satisfied:

| Stage | Advances when |
| --- | --- |
| dispatch | a planned task is ready, or a leaf is running |
| integration | **every planned task is integrated** |
| `merge` | the cheap post-merge batch ran (never gating) |
| `l2` | every required `l2` check exited zero |
| `l3` | every required `l3` check exited zero |
| `e2e` | every required E2E item reported `passed` |
| `freeze` | every required `freeze` check exited zero |
| review | both axes returned; the verdict is the mechanical worst of the two |
| fix rounds | ≤ `fixRounds` blocking-finding rounds, delta re-review only, then the record stops with the remaining findings |

The `l2` row is the audited failure's fence. "Every planned task integrated
**and** the affected suite green" is asserted by the kernel before anything
downstream starts, where the failed run returned `l2` as a field and then ran E2E
anyway with nothing merged.

## Stub fidelity (what the offline tests may claim)

`tests/` runs the kernel against a stub host. A stub that drifts from the real
host produces false green, so every behaviour the tests rely on carries a source
citation in `tests/harness/stub-host.mjs`: sandbox globals, `text` selection, the
branch note, the null-on-failure path, gate timing, and the determinism throws.

A stub behaviour with no citation is a finding, and a citation that no longer
matches the installed extension is a finding too — with a fixed kernel and a
moving host, these tests are the only fence between the two.

## Using the kernel as a parent

1. Compile `tasks` from the approved `tasks.md` graph, and `checks` from the
   repository's declared `Test tiers` and broader-suite policy. Write the briefs.
2. Ask for `explain: true` first when the plan is new: it costs nothing and
   surfaces a mis-declared graph before a leaf is spent.
3. Invoke with an absolute `scriptPath`.
4. Read the record: update `tasks.md`/`map.md` from it, render blockers and
   `suggestDowngrade` to the user, and hand off to `rope-verify` only on
   `delivered` with the review identities recorded.

Determinism is what makes the script resumable by prefix: the same plan replays
the same calls, so a resumed run reuses the journaled prefix instead of
re-spawning leaves.
