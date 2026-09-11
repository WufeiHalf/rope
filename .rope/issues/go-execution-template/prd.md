# Fixed Go Execution Template

## Problem Statement

Under `dynamic`, go is executed by a workflow script the model authors from
scratch for **every issue**. That authorship is itself the defect surface.

The audited session (agent-workbench `legal-retrieval-pagination`,
2026-09-11) split go across two workflows, and its replacement script
(`wf_cfd94049809c`) marked **both** concurrent implementers `blocked`:
its branch parser matched the first `branch` occurrence in the returned text
(`branch: HEAD`, from a brief quote) instead of the host's delivery footer
`Changes saved to branch \`pi-agent-…\``. With no task integrated, the script
still ran L2 — green, because tests passed on the un-integrated checkout —
and then E2E, and slices S3b/S4/P1/P2/P3 appear nowhere in its result at all.
`L2` and `e2ePass` were returned as fields, never used as preconditions.
Offline `node:vm` replay of the saved script with stubbed hooks reproduced
every one of these mechanically, with no agents, network or git involved
(`.rope/issues/dynamic-go-session-audit/diagnosis.md`).

The rule side was not the gap: the shipped runtime reference already required
frontier refill, L2's dual assertion, gate-on-output-files, and step-0 setup
injection. The gap is that each run produces a **fresh, unproven orchestrator**
whose correctness is never checked before it is trusted with the whole issue.

Separately, the first production dynamic run spent **38 of 73 minutes** in
~11 full-suite executions (`.rope/research/session-01a0840a-dynamic-field-report.md`),
all of them legal but none of them required by frequency.

## Solution

Ship one **fixed go execution template** as a versioned skill asset. The
model stops writing orchestration and starts compiling data.

- The template lives at `skills/rope-go/workflows/go-execute.js`, is invoked
  by absolute `scriptPath` (pi resolves a non-absolute path against the
  target repo's cwd, so the parent resolves it from this skill's installed
  location), and receives the issue's compiled **task data** through `args`.
- Every repo-specific fact — commands, tiers, setup, exclusive resources,
  evidence paths — travels in the task data. The template reads no repository,
  contains no repo-shaped command, and knows only policy.
- The template owns a fixed **correctness kernel**: plan validation before
  any spawn, readiness refill without wave barriers, a bounded in-flight
  window that prefers landing finished work over starting new work, a serial
  merge queue with **git-verified** delivery identity, a completion assertion
  that refuses to advance on a partially integrated plan, tiered gates as
  control-flow preconditions, a repository-declared check timetable with
  evidence reuse, and freeze → two-axis review → bounded fix rounds.
- Its orchestration is regression-tested **offline** against a stub host
  before it is trusted with a real issue: the audited defect classes become
  permanent, runnable fixtures.

Because a workflow script body executes inside a `vm` context with only the
injected globals (`agent`, `phase`, `log`, `workflow`, `parallel`, `pipeline`,
`args`) — no `require`, no `import`, no filesystem — the template **must be a
single self-contained file**. That is a real cost, recorded here: template
edits serialize, and the test harness cannot `import` the template (it reads
the source and evaluates it in `node:vm`, the same technique that reproduced
the audited defects).

## Contract Note

- go 不再每次现场写脚本：一份固定模板 + 该需求编译出的任务数据。
- 返回值是结构化的，且"计划里的每个任务都已集成"是推进的硬前提——没集成就不会跑到 L2 / E2E / 验收，而是带着原因停下来。
- 交付分支的身份由 git 核验，不解析 agent 的自然语言；agent 声称的和仓库里真实的必须一致。
- 检查按仓库声明的时刻表跑，同一代码状态 + 同一范围不重复跑昂贵的检查；这次 go 跑了几次、分别多久，可选地在证据目录里查到。
- 模板自身的编排缺陷能在离线用例里复现并被拦住，不烧真实 agent token。

## Goals

- One fixed, shipped execution template replaces per-issue script authorship
  for `dynamic` go.
- The parent's job becomes compiling **task data** from the approved
  `tasks.md` (mechanically validated before launch) instead of authoring
  control flow.
- Orchestration identity facts (which branch, which commit, is it merged) are
  established by git, never by parsing agent prose.
- No-run and partial-integration are distinguished: "nothing is running" is
  never mistaken for "everything is integrated".
- Check scheduling is data-driven: the repository declares its tier commands,
  tiers policy, exclusive resources, and setup command; the template decides
  *when* to run them.
- Repeated expensive checks on an unchanged code state are eliminated by
  evidence reuse keyed on commit + scope.
- Parallelism is exploited where the shape graph offers it, without wave
  barriers and without unbounded fan-out.
- The audited defect classes are permanently reproducible offline.

## Non-goals

- **No pi extension changes.** The template works inside the current public
  script API. `WorkflowSpawnResult` exposes no branch or base-SHA field, and
  this issue does not add one.
- No cross-harness compatibility work (pi-first; other hosts are out of scope).
- No arbitrary orchestration language and no per-issue scheduler rewriting.
- No re-slicing, dependency removal, or acceptance-scope change during
  execution — the graph and acceptance are fixed at shape.
- No per-slice multi-reviewer. The end-of-issue review stays the single
  review gate (ADR 0007/0010).
- **No schema-version gate** (declined by the user). Template/plan shape drift
  is an accepted, recorded risk.
- No second hand-maintained task ledger; task data is derived from the
  approved `tasks.md`.
- No lossless recovery under arbitrary interruption — pi prefix replay plus
  repository-state verification only.
- The test tree is not shipped in the npm package (it stays out of
  `package.json` `files`).

## Public Interface / Behavior

- **`skills/rope-go/workflows/go-execute.js`** — the template. Invoked as
  `<scriptPath: "<resolved skill dir>/workflows/go-execute.js", args: <task data>>`.
  Single file; no imports; no filesystem access; deterministic (no
  `Date.now()`, `Math.random()`, `new Date()`).
- **Task data** — the compiled plan passed in `args`. It must carry, per task:
  id, title, brief reference, declared delivery branch, edge list with edge
  class, owned files, focused check commands, required-evidence items keyed to
  Behavior-Matrix rows, and constraint ids. Issue-wide it must carry: base
  SHA, worktree setup command, check timetable and tiers policy, exclusive
  resources, evidence directory, gate definitions (L2/L3), E2E items, review
  axes, and concurrency/fix budgets. Exact field names are fixed by Slice 1
  and are the seam every other slice builds against.
- **Structured return** — task states (integrated / bounced / blocked /
  never-ready), merge records with commit ids, gate outcomes with commands and
  exit codes, E2E statuses, review verdict with both axes and fix-round
  history, check records (command, scope key, exit code, reused-or-run,
  duration, evidence path), and explicit blockers with classification.
  Exact field names fixed by Slice 1.
- **Every leaf spawn carries a `schema`.** On this host `text` is
  `structuredJson ?? result`, and a worktree child's prose `result` has the
  branch note appended, so a schema-less spawn hands the script text it cannot
  parse — the audited run's failure mode. The template must never depend on
  agent prose.
- **Delivery-branch contract** — a leaf's last action, after committing
  everything and leaving a clean tree, is to create its **predeclared**
  branch `rope/<taskId>` at its HEAD and report that commit's SHA. Routing
  uses the branch name from the **plan**, not from the leaf's text; the leaf's
  return is evidence checked against the plan. Missing, non-matching, or
  unreachable delivery is a blocker.
- **`skills/rope-go/scripts/verify-delivery.sh`** — mechanical git probes
  (branch exists, resolves to the reported SHA, reported SHA is a real object,
  tree clean). Exit code is the verdict; JSON on stdout.
- **`skills/rope-go/scripts/run-check.sh`** — runs one declared check command,
  saves output and exit status to the evidence directory, asserts on the saved
  artifact rather than a piped exit code.
- **Evidence** — `.rope/issues/<slug>/evidence/<scope-key>/<check-id>.{out,json}`,
  where `scope-key` is derived from the integrated commit set plus the check
  scope, so an unchanged code state reuses prior evidence instead of rerunning.
- **Repository check policy** — `routes.md` declares, next to `Test tiers`,
  whether broader suites are impact-selected or required at freeze, plus any
  exclusive-resource commands.
- **`tests/`** — `node --test`, no external dependencies, runnable offline.

## Testing Decisions

- Good test: exercise the template's **only** interaction surface — the host
  globals — with stubs, and assert on its structured return and on real git
  state in a throwaway repository. Not wording, not implementation internals.
- Seams under test (confirmed with the user during shape):
  1. **Host-global seam** — `agent()` (incl. `gate`, `resume`, structured
     schema), `phase()`, `log()`, `parallel()`, `pipeline()`, `workflow()`,
     `args`. The harness evaluates the template's real source in `node:vm`
     with these stubbed, replicating the host's constraint that
     `Date.now()`/`Math.random()`/`new Date()` throw.
  2. **Git delivery seam** — `verify-delivery.sh` against a throwaway repo,
     asserting on exit code and JSON, including the exact audited failure
     (delivery branch absent, or present but pointing elsewhere).
  3. **Plan-validation seam** — malformed or incomplete task data is rejected
     before any `agent()` call, with the offending field named.
- Prior art (in-repo): the offline `node:vm` replay in
  `.rope/issues/dynamic-go-session-audit/diagnosis.md`, which reproduced the
  branch-parser and missing-downstream defects from a saved script with
  stubbed hooks. This issue turns that ad-hoc technique into a committed
  harness.
- Test scope: `tests/**` only. This repository has no test tree today
  (`routes.md` records `Test roots: Unknown`); Slice 1 derives and writes the
  tier lines per the ADR 0013 derivation rule (guards + entrypoint smoke
  mandatory, pure units optional, ≤60s, dated and timed).
- Broader-suite trigger: none beyond the repo requirement — for this
  repository `node --test` is both the quick and the full tier.
- Excluded: live `SubagentWorkflow` runs (real leaves, real tokens) are E2E
  items E2/E3, not part of the quick tier.

## Behavior Contract

- System under test: the fixed go execution template and the task-data
  contract it consumes.
- Trigger/input: a parent compiles task data from an approved `tasks.md` and
  invokes the template via `scriptPath` + `args`.
- Collaborators: pi's `SubagentWorkflow` host (the only executor), leaf
  agents via presets, `git` in the main checkout, `scripts/*.sh`,
  `routes.md`'s declared check policy, the issue package's `evidence/` dir.
- Observable result: a structured return whose every planned task is either
  `integrated` (with a git-verified commit) or reported as a blocker; gates
  and review recorded with commands, exit codes and identities; check records
  showing what ran, what was reused, and how long it took.
- Failure visibility: a plan with a task that never becomes ready, a leaf
  that fails to deliver its branch, a merge conflict that cannot be resolved,
  a failed gate, an exhausted fix budget, or a missing repository
  configuration are all **explicit blockers** with a classification
  (product / stale contract / environment / host-or-template) — never silence
  and never inferred success.
- Forbidden shortcuts: deriving routing from agent prose; treating
  "nothing is running" as completion; running L2/E2E/review without the
  completion assertion holding; rerunning an expensive check whose commit
  set and scope are unchanged without a recorded reason; letting the template
  invent a command the repository never declared; changing acceptance scope
  inside a fix round; spawning a leaf from inside a leaf.

## Architecture Impact

- Impact: required
- Trigger check: matches triggers — an existing public interface changes
  (go's execution contract, `routes.md`'s declared policy), an adapter /
  runtime entrypoint changes (the parent→template invocation), a new shipped
  runtime asset is added under `skills/`, concurrency and merge-ordering
  semantics change, and the issue cites ADRs 0007/0008/0011/0012/0013/0014.
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/0014-workflow-execution-mode.md`
    Decision status: active
    Scope: execution form is decided by config + host probe; under `dynamic`
    a deterministic script owns readiness, dispatch, serial merges, gates and
    fix rounds; the model lives only in leaves.
    Decision disposition: extend
      — the script stops being authored per issue and becomes a versioned,
      tested asset fed by compiled task data. The config decision, the gate
      menu, and ticket executor-agnosticism are unchanged.
    Inherited invariants:
      - execution form is never an issue-package field or a user question
      - tickets stay executor-agnostic: no `fan:` blocks in packages
      - gate scripts live in repo files, never inline shell in workflow JS
      - fix rounds are fresh agents (`resume` cannot carry `gate`)
      - partial integration cannot pass
    Affected public interfaces: the go execution contract; `routes.md`'s
    declared check policy
    Forbidden shortcuts:
      - reintroducing model-authored orchestration as the default path
      - encoding repo-specific commands inside the template
    Required evidence: template asset + contract doc land; offline fixtures
    prove the kernel; ADR 0014 addendum records the change
    Applies to: issue | Slice 1 | Slice 2 | Slice 3 | Slice 5 | verify
    Documentation update: updated-existing (ADR 0014 addendum)
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/adr/0007-graph-driven-go-single-review.md`
    Decision status: active
    Scope: the slice graph is the scheduler; one end-of-issue review gate;
    go's default intent is maximum concurrency.
    Decision disposition: inherit
    Inherited invariants:
      - readiness comes from the graph, not from wave grouping
      - exactly one review gate, at the end, with new eyes
      - serialization requires a recorded reason
    Affected public interfaces: none (semantics preserved; now enforced)
    Forbidden shortcuts:
      - wave barriers reappearing as a barrier in the scheduler
      - adding a review point that ADR 0007 does not have
    Required evidence: fixtures show frontier refill without barriers and a
    completion assertion that blocks advancement
    Applies to: Slice 2 | Slice 3 | e2e
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D3
    Source: `.rope/adr/0013-test-cost-tiering.md`
    Decision status: active
    Scope: tests are selected by impact, not by frequency; full suites are
    issue-level evidence; same-HEAD evidence is reused; repo requirements win.
    Decision disposition: extend
      — the timetable and evidence reuse become executor mechanism instead of
      advisory text, and the repository declares its broader-suite policy and
      exclusive commands.
    Inherited invariants:
      - broader suites need a recorded impact or repo-requirement reason
      - stored output and exit status are parsed, never rerun to recover
      - scope-green proves only that scope
      - a repo's explicit all-suite requirement is never overridden to save time
    Affected public interfaces: `routes.md` check policy fields
    Forbidden shortcuts:
      - a per-wave or per-slice full-suite ritual
      - reusing evidence whose commit set or scope changed
      - treating a reused green as proof for a different scope
    Required evidence: check records showing reuse vs run, scope keys, and the
    declared policy being honoured; the audited full-suite count is not
    reproduced by the timetable
    Applies to: Slice 1 | Slice 3 | Slice 5 | e2e
    Documentation update: updated-existing (ADR 0013 addendum)
    Unresolved conflicts: none
  - ID: D4
    Source: `.rope/adr/0012-worktree-verified-full-demotion-of-file-overlap-edges.md`
    Decision status: active
    Scope: under verified worktree execution, `file-overlap` edges never block
    dispatch; they order landing. Conflicts resolve on the unmerged branch.
    Decision disposition: inherit
    Inherited invariants:
      - only `seam-required` edges gate dispatch
      - the merge queue is serial
      - a conflict costs one re-dispatch, resolved on the unmerged branch
    Affected public interfaces: the delivery-branch contract (the merge
    queue's identity input)
    Forbidden shortcuts:
      - treating a merge-order preference as a dispatch gate
      - merging in parallel
    Required evidence: fixtures show concurrent dispatch across a
    `file-overlap` edge and a serial merge queue
    Applies to: Slice 2 | Slice 3
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D5
    Source: `.rope/adr/0011-edge-classification-and-acceptance-gates.md`
    Decision status: active
    Scope: edge labels, the Mechanical Return Gate (evidence reconciliation,
    not review), the L2 dual assertion, the Defense Budget, and the bounce
    protocol.
    Decision disposition: extend
      — the return gate and L2's dual assertion become template control flow;
      L2 additionally becomes a **precondition** on later stages rather than a
      reported field.
    Inherited invariants:
      - evidence reconciliation is not code review and reruns nothing
      - L2 requires all inputs integrated AND the suite green
      - a correction brief adds zero acceptance requirements
      - missing evidence bounces the leaf, never the parent
    Affected public interfaces: the structured return (gate outcomes are
    preconditions, not facts reported after the fact)
    Forbidden shortcuts:
      - running a later stage whose precondition already failed
      - back-filling a leaf's missing evidence from the parent
    Required evidence: fixtures where a failed precondition halts advancement
    Applies to: Slice 2 | Slice 3
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D6
    Source: `.rope/adr/0008-slice-ready-worktree-execution.md`
    Decision status: active
    Scope: worktree isolation as the leaf primitive, slice-ready scheduling,
    the serial merge queue, step-0 setup injection, parent-owned map updates.
    Decision disposition: extend
      — identity becomes explicit: the leaf declares and creates its delivery
      branch, and the integrator verifies it with git before merging. The
      host's own cleanup branch is not a routing input.
    Inherited invariants:
      - one worktree per leaf; ready = seam-required blockers merged
      - step 0 setup injection is unconditional
      - concurrent leaves never write the shared map
    Affected public interfaces: the leaf return schema (delivery branch +
    commit SHA), `verify-delivery.sh`
    Forbidden shortcuts:
      - inferring a branch from the host's prose footer
      - merging a branch that no plan declared
    Required evidence: fixtures for absent / mismatched / unreachable delivery;
    E2 in a throwaway repo
    Applies to: Slice 1 | Slice 2 | Slice 3 | e2e
    Documentation update: updated-existing (execution-rules delivery contract)
    Unresolved conflicts: none
  - ID: D7
    Source: `.rope/CONTEXT.md` (`Workflow execution mode`, `Graph-Driven Execution`)
    Decision status: active
    Scope: the project's language for execution mode and graph-driven go.
    Decision disposition: extend
      — the language gains the template, task data, check timetable and
      delivery-branch terms; the existing entries are revised, not replaced.
    Inherited invariants:
      - execution mode is resolved mechanically, never asked
      - the graph is the scheduler
    Affected public interfaces: `.rope/CONTEXT.md`
    Forbidden shortcuts:
      - a second, drifting definition of dynamic execution in prose
    Required evidence: CONTEXT.md entries updated and consistent with the
    shipped contract
    Applies to: Slice 6
    Documentation update: updated-existing
    Unresolved conflicts: none
- New decision candidate:
  - Scope: the fixed-template execution contract itself — a shipped,
    offline-tested orchestrator fed by compiled task data, with a
    git-verified delivery-branch identity and a repository-declared check
    policy.
  - Risk: high (replaces the per-issue orchestration path; wrong behaviour
    would affect every future `dynamic` go, and the template is dead code
    that cannot be course-corrected mid-run).
  - Decision needed: recorded as an **ADR 0014 addendum**, not a new ADR —
    0014 already owns executor form, and a separate document would create a
    second definition of dynamic execution. Recorded in Slice 6.
- Constraint Bundle:
  - Decision sources: D1 (ADR 0014), D2 (0007), D3 (0013), D4 (0012),
    D5 (0011), D6 (0008), D7 (CONTEXT.md); new decision → ADR 0014 addendum.
  - Decision statuses: all active; ADR 0003 already superseded by 0014
    (the `mode:` field is retired and must not reappear).
  - Scope: issue-wide — S1 contract+harness, S2 kernel, S3 gates+review,
    S4 shape-side graph review, S5 go-side docs, S6 architecture record.
  - Invariants:
    - I1 execution form comes from config + host probe, never a package field
    - I2 the graph is the scheduler; `seam-required` edges gate dispatch,
      `file-overlap` orders merges, `methodology-order` never gates
    - I3 identity is git-verified; agent prose is evidence, never routing
    - I4 a partially integrated plan cannot advance to L2 / E2E / review
    - I5 gates are control-flow preconditions, asserted on saved artifacts
    - I6 check scheduling follows the repository's declared policy; expensive
      checks reuse evidence for an unchanged commit set + scope
    - I7 the template contains no repository-specific command and invents none
    - I8 one review gate at freeze, two read-only axes, ≤2 fix rounds, then a
      Human Escalation Stop
    - I9 no nested spawn; leaves never spawn leaves
    - I10 a correction brief adds zero acceptance requirements
    - I11 the template is a single self-contained file (vm sandbox: no
      imports, no filesystem, no clock/randomness)
  - Public seams: `scriptPath` invocation with `args`; the task-data schema; the
    structured return schema; the delivery-branch contract;
    `scripts/verify-delivery.sh`; `scripts/run-check.sh`; `routes.md` check
    policy fields; `tests/` + `node --test`.
  - Forbidden shortcuts:
    - F1 routing from parsed agent prose
    - F2 "nothing running" treated as completion
    - F3 advancing past a failed or unevaluated precondition
    - F4 repo-shaped commands inside the template
    - F5 per-slice / per-wave full-suite rituals; evidence reuse across
      changed commits or scopes
    - F6 a second review gate, or per-slice review
    - F7 splitting the template into modules / adding `require`/`import`
    - F8 changing acceptance scope inside a fix round
    - F9 re-introducing the retired `mode:` package field
  - Acceptance evidence: offline fixtures for every audited defect class;
    `verify-delivery.sh` probes against a throwaway repo; a real
    `SubagentWorkflow` closure in a fixture repo (E2); a live issue run
    measuring wall-clock and full-suite count (E3).
  - Open conflicts: none.

## References

- Research: `.rope/research/dynamic-go-template-and-parallelism.md`
- Research: `.rope/research/dynamic-go-harness-contract-research.md`
- Research: `.rope/research/dynamic-go-template-scope-primary-sources.md`
- Research: `.rope/research/dynamic-go-token-latency-primary-sources.md`
- Research: `.rope/research/session-01a0840a-dynamic-field-report.md`
- Diagnosis: `.rope/issues/dynamic-go-session-audit/diagnosis.md`
- ADR: `.rope/adr/0014-workflow-execution-mode.md`
- ADR: `.rope/adr/0013-test-cost-tiering.md`
- ADR: `.rope/adr/0011-edge-classification-and-acceptance-gates.md`
- ADR: `.rope/adr/0008-slice-ready-worktree-execution.md`
- ADR: `.rope/adr/0007-graph-driven-go-single-review.md`
- Spec: `.rope/specs/dynamic-workflow-mode.md`
- Skills: `skills/rope-go/**`, `skills/rope-shape/**`
- Runtime contract: `skills/rope-go/references/dynamic-workflow.md`

## Open Questions / Human Gates

- None blocking. The three shape-time decisions the user made are recorded in
  Gate Decisions below and are not reopened at go.

## Gate Decisions

- Gate: introduce a test tree into this repository
- Decision: approved
- Approved action: add `tests/` using Node's built-in test runner plus a
  `test` script in `package.json`, and update this repository's `Test tiers`
  declaration in `.rope/routes.md`
- Scope: repository-local; no external dependencies, no CI service, no npm
  `files` change beyond keeping `tests/` out of the published package
- Risk: low (local, additive; the repository currently has no test tree)
- Pass criteria: `node --test` runs offline and green; `routes.md` records the
  derived tiers with date and measured time
- Failure report: any added dependency, any network requirement, or a tier
  declaration that exceeds the ≤60s derivation budget
- Forbidden out-of-scope actions: adding a test framework dependency, wiring
  CI, or publishing tests in the npm package

- Gate: persist check evidence for reuse
- Decision: approved
- Approved action: write check output and exit status into
  `.rope/issues/<slug>/evidence/<scope-key>/`, keyed by the integrated commit
  set plus the check's declared scope
- Scope: issue-package-local; evidence files are committed with the issue
- Risk: low (local writes inside `.rope/issues/`)
- Pass criteria: a second evaluation of the same commit set + scope reuses the
  stored evidence instead of rerunning, and the check record says so
- Failure report: evidence reused across a changed commit set or a changed
  scope, or a check that cannot be shown to have run at all
- Forbidden out-of-scope actions: caching outside the issue directory, or
  treating reused evidence as proof for a different scope

- Gate: cheap per-merge check
- Decision: approved
- Approved action: run the repository's declared fast check (lint / typecheck
  class) after each landed merge as an early warning
- Scope: the declared fast command only; it is not a review axis and does not
  replace the end-of-issue review
- Risk: low (seconds per merge)
- Pass criteria: a defect introduced by a merge is visible at that merge
- Failure report: an expensive command being classified as fast, or the check
  being presented as a review verdict
- Forbidden out-of-scope actions: adding a per-merge full-suite run, or
  turning the early warning into a second review gate

- Gate: schema-version gate between template and task data
- Decision: skipped
- Approved action: none — the template does not reject a plan on a version
  mismatch, and task data carries no schema version
- Scope: n/a
- Risk: accepted — if the template's shape changes while an issue is in
  flight, the mismatch is silent and can only be diagnosed from the returned
  record after the fact
- Pass criteria: n/a
- Failure report: a run failing in a way that cannot be attributed to a
  template/plan shape mismatch
- Forbidden out-of-scope actions: reintroducing a version field or gate
  without a new user decision
