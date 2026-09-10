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
return reconciliation, and the two-axis review contract before compiling.

- Compile `tasks.md` into a host workflow script. The script owns dispatch,
  serial merges, mechanical gates, and bounded fix rounds; leaves own code
  and judgment. Leaves receive self-contained briefs and never spawn leaves.
- Refill the ready frontier after each merge, without worktree wave barriers.
  Shared execution uses disjoint-file waves. Preset-based implementers use
  isolated worktrees when supported; retain the ≤60-line brief budget.
- Inject step 0: the repo's `routes.md` worktree setup, check-first and
  idempotent. Require a returned setup result; environment failure is a
  blocker, not a code fix round.
- Validate briefed test commands/paths against the repo before dispatch.
  Missing commands or evidence return as blocked/missing. A replacement
  requires an explicit parent correction preserving the same acceptance;
  changed acceptance returns to shape. A leaf's substitute is not proof.
- The integrator merges serially and owns shared ledger updates from leaf
  evidence rows. Concurrent leaves never edit the shared map. Mechanical
  conflicts resolve on the unmerged branch or return a blocker; unresolved
  inputs remain unmerged. Other independent lanes may continue, but the
  batch cannot pass and consumers of the blocked seam wait.

## Mechanical gates

Gate commands live in repo files, not inline shell embedded in workflow JS.
Save command output and exit status, then assert both. A pipeline's final
command succeeding does not establish the test command's success.

- **L1:** leaf-focused seam tests and required evidence only.
- **L2:** every intended input branch is integrated **and** the affected
  integration suite is green. Account for every input with commit/branch
  evidence; a partial merge with green tests fails this dual assertion.
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

## End-of-issue review — inside the script

Freeze only when every slice is integrated, required gates are green, the
tree is clean, and no leaf is running. Spawn the two read-only review axes
concurrently against that HEAD: Standards scanner and Behavior reviewer.
Only the Behavior reviewer runs the product. It walks the Matrix and E2E;
issue-level test selection follows execution-rules, not automatic full suites.

Aggregate the worst verdict mechanically. Preserve structured findings
(`severity: blocking|note`, `path:line`, `issue`, `fix`) and both identities.
Blocking findings → one fresh implementer brief → delta-only re-review,
at most two fix rounds. Notes are recorded, not repaired by a round.
Budget exhausted → structured stop with remaining findings and round history.

After the script returns, the parent updates tasks/map/review records from
its evidence; missing results remain missing. Do not repeat the review outside
the script. Use host-supported monitoring/resume; verify capability before
headless execution rather than assuming interactive success proves it.
