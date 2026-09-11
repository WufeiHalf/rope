# Dynamic workflow

Installed operational contract for grill, shape, and go. Resolve links from
this file's installed directory, whether user-global or project-local.
Rope's source checkout is not a runtime dependency. Install the full Rope
skill set; a missing sibling reference is an incomplete installation — report
its resolved path and repair the installation before continuing dynamic work.

## Startup — every phase

Read this section before research, shaping, or dispatch. Reuse the execution
form already resolved in this session; on direct entry or a new session:

1. Read `~/.rope/config.toml`, `[execution] default`.
   Absent file/key or `agent` → parent Agent dispatch.
2. `dynamic` + an available, permitted deterministic workflow runner
   (pi: `SubagentWorkflow`) → script-driven execution.
3. `dynamic` without that capability → parent dispatch with a narrower fan;
   record the capability/permission reason in the existing work record.
   An unreadable config or unsupported value needs an explicit resolution,
   not an invented default.

This is mechanical, not a user preference question or an issue-package field.
The optional `[execution.fans]` values are ceilings, not agent-count targets:
`research = 20`, `panel = 3`, `fix_storm = 3` by default. Honor host limits.
Presets remain the spawn configuration; the executor does not pin new models.

## Grill / shape — coverage before fan-out

Before fact-gathering, name each independent question, its evidence target,
and its owning leaf. Dispatch independent questions concurrently through the
workflow runner under dynamic; a dependent question starts when its evidence
arrives. Use a pipeline for independent chains; wait for all results only
when the next decision genuinely needs cross-result comparison.

After returns, reconcile every planned question to evidence or an explicit
unknown. Reopen gaps that change a decision; record skipped/degraded coverage
and its reason. Keep this in the existing research/work record, not another
ledger. A running investigation delays only questions that depend on it.
Three independent domains justify three leaves; twenty is not a quota.

At shape's graph quiz, challenge every coarse slice and blocking edge:
keep demoable, fresh-context-sized work; separate thin interfaces from deep
hardening; seek independent consumer work after the interface exists.
Show initial ready count and maximum achievable width separately. Under
worktree isolation only `seam-required` edges block; `file-overlap` orders
merges. Under shared execution overlap also blocks dispatch. Pure
`methodology-order` preferences never block. Record constrained concurrency
and why; slicing more finely must buy a real independent delivery.

## Go — compile and execute

Read [execution-rules.md](execution-rules.md) for test scope, setup, briefs,
return reconciliation, and the two-axis review contract. The plan schema, the
run record and the host limits live in
[execution-template.md](execution-template.md) — read that contract before
compiling, not after a failure.

- Compile task data from `tasks.md` and invoke the shipped kernel at
  `workflows/go-execute.js` by absolute `scriptPath`. The kernel owns dispatch,
  serial merges, mechanical gates, bounded repair rounds and the in-run review;
  leaves own code and judgment. Leaves receive self-contained briefs and never
  spawn leaves.
- The kernel refills the ready frontier after each merge, without worktree wave
  barriers. Shared execution serializes to one leaf at a time (one index, one
  checkout); preset-based implementers run in isolated worktrees.
- Inject step 0 into the plan as `setupCommand`: the repo's `routes.md` worktree
  setup, check-first and idempotent. The kernel puts it in every leaf prompt
  unconditionally; environment failure is a blocker, not a code fix round.
- Validate briefed test commands/paths against the repo before dispatch.
  Missing commands or evidence return as blocked/missing. A replacement
  requires an explicit parent correction preserving the same acceptance;
  changed acceptance returns to shape. A leaf's substitute is not proof.
- The merge queue is the kernel's: serial, one branch at a time, in landing
  order, with conflict resolution on the unmerged slice's intent. The parent
  updates the shared ledger from the record afterwards, never concurrently.

## Mechanical gates

Gate commands live in repo files, not inline shell embedded in workflow JS.
Save command output and exit status, then assert both. A pipeline's final
command succeeding does not establish the test command's success.

The kernel runs each stage's declared checks through `scripts/run-check.sh` as
the host's gate, so the verdict is an exit code rather than an agent's report.
Reuse is keyed by `<scope>@<integrated commit set>`: an unchanged state finds
its evidence and does not spend the command again.

- **L1:** leaf-focused seam tests and required evidence only, described in the
  brief.
- **L2:** every intended input branch is integrated **and** the affected
  integration suite is green. Account for every input with commit/branch
  evidence; a partial merge with green tests fails this dual assertion, and the
  kernel does not start L3/review/e2e until it holds.
- **L3:** each touched composition root in `tasks.md` exercises real assembly,
  one event in, one observable result out. Fake only outer boundaries;
  migrated seams remain real. Shape adds a harness slice if needed.

Broad suites follow execution-rules' impact-based selection, never a fixed
run count. Failed, missing, or not-run evidence stays visibly so; expected
interleaving is not green. Report exact command, failing assertion/output,
classification (product, stale contract, environment, or host/script), and
held/continuing lanes. Code repairs get fresh implementers, at most two
rounds per problem; exhausted or contract-changing failures stop for a human.
Use the host's documented retry contract; on pi, `resume` cannot carry `gate`.

## End-of-issue review — inside the kernel

The kernel freezes only when every slice is integrated, required gates are green
and no leaf is running. It spawns the two read-only review axes concurrently
against that HEAD: Standards scanner and Behavior reviewer. Only the Behavior
reviewer runs the product. It walks the Matrix; issue-level test selection
follows execution-rules, not automatic full suites.

It aggregates the worst verdict mechanically and preserves structured findings
(`severity: blocking|note`, `path:line`, `issue`, `fix`) with both identities.
Blocking findings become one fresh implementer brief, land through the same
merge queue, and get a delta-only re-review — at most `fixRounds`. Notes are
recorded, not repaired by a round. Budget exhausted yields a structured stop
carrying the remaining findings and the round history.

## The real environment — after the review, and it is repairable

**The kernel walks e2e after the review, not before it.** The read-only review is
cheap and the real-environment walk is not, so reviewing first means the walk runs
once, on the commit that will actually be delivered. Running it before the review
meant a review fix moved the HEAD and the walk's green described a commit that was
gone.

Only items whose `executor` says the agent runs them are walked. A failed item
enters the same bounded loop as a review failure: one fix leaf briefed with the
failing items verbatim, landed through the merge queue, then every declared item
re-walked (an e2e fix moves the HEAD, so the previous round's green is gone), plus
a delta re-review of the fix commit — at most `fixRounds`. Budget exhausted stops
the run with the failure named.

An item Shape kept out of the run (`user`, `not-run`, a declined gate) is recorded
with its terminal status and does not gate. `blocked_on_user` is an honest outcome
a run may still deliver with; it is never reported as passed, and a leaf that ran
and reported `blocked` has not passed either.

After the record returns, the parent updates tasks/map/review records from it;
missing results remain missing. Do not repeat the review outside the kernel.
Use host-supported monitoring/resume; verify capability before headless
execution rather than assuming interactive success proves it.
