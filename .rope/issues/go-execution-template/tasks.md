# Fixed Go Execution Template Tasks

Execution mode: worktree

> Probed at shape (ADR 0012). This repository declares
> `Worktree setup: host-managed` — a pure Markdown rules repo with no build, so a
> fresh worktree is immediately testable and no setup command is needed.
> `node --test` requires nothing installed.

## Graph summary

- Slices: 6. **Initial ready count: 1** (Slice 1). **Maximum achievable width: 3**.
- Critical path: Slice 1 → Slice 2 → Slice 3 → Slice 5 (4 levels).
- Every blocking edge below is `seam-required`. No `methodology-order` edge is
  used to hold dispatch.
- The two slices that both own `workflows/go-execute.js` (Slice 2, Slice 3) are
  serial **by construction**: the vm sandbox forbids imports, so the template is
  a single file and cannot be edited concurrently (I11). This is an accepted,
  recorded cost of the fixed-template approach — it is not a re-introduced wave
  barrier.

## Behavior Matrix

| Row | Applies? | Verified at |
| --- | --- | --- |
| Primary path | yes | Slice 2 (scheduling/merge), Slice 3 (gates/review), E1, E2 |
| Alternate input or entrypoint | yes | Declared-but-empty stages (no L3 roots, no E2E items, no L2 suite) are skipped explicitly and reported as skipped, never silently. Slice 3 |
| Empty or missing input | yes | Empty task list, or a plan where no task is ready → refuse before any spawn, with the reason. Slice 2 |
| Invalid or malformed input | yes | Dangling `blocked-by` id, unclassified edge, missing declared command, task with no delivery branch, duplicate task id → rejected naming the offending field, zero spawns. Slice 1 (schema) + Slice 2 (validation) |
| Unavailable or not-ready dependency | yes | Leaf fails to create/报告 its delivery branch; delivery branch points elsewhere; setup or worktree failure; host lacks worktree isolation → explicit blocker with a classification. Slice 2, E3 |
| Duplicate or idempotent case | yes | Re-evaluating an already-integrated plan re-merges nothing and reuses stored evidence for an unchanged commit set + scope. Slice 2 + Slice 3 |
| Boundary or limit case | yes | In-flight window saturated while the ready set is larger (merge-priority ordering); fix rounds at their bound; empty ready set with tasks still running (must not be read as completion). Slice 2 + Slice 3 |
| Existing behavior compatibility | yes | The `agent` (non-dynamic) dispatch path and the parent-owned review path are untouched; the template is additive. Slice 5 + end-of-issue review |
| Real-entrypoint behavior | yes | E2 (real `SubagentWorkflow` closure), E3 (live issue run) |

## Slice 1: Execution contract + offline harness

- Status: pending
- Kind: contract
- Goal: Fix the template's input contract (task data), its output contract
  (structured return), the delivery-branch identity contract, and the repository
  check-policy fields — and make a workflow script **runnable offline** with
  stubbed host globals, so every later slice can do real red→green without
  spending agent tokens. This is the thin interface the other five slices
  consume.
- Demo path: write a ten-line workflow script in a fixture, run `node --test`,
  and see it execute against a stub host whose recorded calls can be asserted —
  while the contract document states every field the template consumes and
  returns.
- Blocked by: none
- Scope: `skills/rope-go/references/execution-template.md` (new),
  `tests/harness/**`, `tests/smoke.test.mjs`, `tests/fixtures/**`,
  `package.json`, `.rope/routes.md`. Owns these files only.
- Owned files:
  - `skills/rope-go/references/execution-template.md`
  - `tests/harness/load-workflow.mjs`
  - `tests/harness/stub-host.mjs`
  - `tests/harness/tmp-repo.mjs`
  - `tests/smoke.test.mjs`
  - `tests/fixtures/*.plan.json`
  - `package.json`
  - `.rope/routes.md`
- Size cap: ~400 diff lines. **Declared exception:** eight owned files, of which
  `package.json` and `.rope/routes.md` are one-to-three-line declarations. The
  cap's purpose (fresh-context fit) is met; the file count heuristic is not the
  binding constraint here.
- Matrix rows: Invalid or malformed input (schema half); Existing behavior
  compatibility (the repository gains a test tree without changing shipped
  skills); Real-entrypoint behavior (harness fidelity)
- Constraint IDs: I7, I11, D3, D6
- Required evidence:
  - B-Invalid: the contract names every required task-data field and every
    returned field, so a missing/unknown field is detectable → `I7`
  - B-Primary: the contract requires every leaf spawn to carry a `schema` and
    states why (on this host `text` is `structuredJson ?? result`, and a
    worktree child's prose carries the host's branch note, so a schema-less
    spawn returns unparseable text) → `I3`
  - B-Primary: `tests/smoke.test.mjs` loads a real workflow-script source through
    the vm loader and asserts stub calls → `I11`
  - D3-reuse: the contract defines the evidence `scope-key` (integrated commit
    set + declared scope) and the repository check-policy fields → `D3`
  - D6-identity: the contract defines the delivery-branch rule
    (`rope/<taskId>`, created by the leaf after committing everything, reported
    with its SHA, verified by git) → `D6`
  - Repository gate: `.rope/routes.md` records `Test roots: tests/` and derived
    quick/full tiers with date and measured time → the approved test-tree gate
- Public behavior: a contributor can run this repository's tests offline and
  read one document that fixes what the go template consumes and returns.
- Tests:
  - red: `tests/smoke.test.mjs` fails — the vm loader does not exist yet
  - green: the loader evaluates a trivial workflow-script source with stubbed
    `agent/phase/log/parallel/pipeline/workflow/args`, records calls, returns the
    script's resolved value, and **throws** when the script touches
    `Date.now()`, `Math.random()`, or `new Date()`, mirroring the host
  - `tests/harness/tmp-repo.mjs` builds a throwaway git repo with a base commit
    and a clean tree, asserted by one test
  - fixture plans for the canonical graphs used by later slices (linear chain,
    wide antichain, file-overlap pair) are committed and parse
- Implementation notes:
  - The loader must replicate the host's compilation shape: strip only the
    `export` keyword from `export const meta = {...}`, wrap the body, inject only
    the documented globals, and enforce determinism.
  - The contract document is the single authority for the task-data and return
    schemas. It must also state what the template is **not** allowed to do
    (invent commands, read the repository, parse agent prose for routing).
  - `package.json` gains only a `test` script (`node --test`); `tests/` stays out
    of the `files` array so it is not published.
  - No external dependency, no CI wiring.
- Verification: `node --test` (focused: `tests/smoke.test.mjs`), plus
  `node bin/rope.js --help` as the entrypoint smoke. Never a full run of
  unrelated suites.
- Stop conditions: any added dependency or network requirement; any loader
  behaviour that diverges from the host's compilation (verify against the host
  source, do not guess).

## Slice 2: Template kernel — plan validation, frontier refill, in-flight window, merge queue, completion assertion

- Status: pending
- Kind: vertical
- Goal: The template exists and is honest about orchestration. Given compiled
  task data, it validates the plan, dispatches ready work under a bounded
  in-flight window that prefers landing finished work over starting new work,
  merges delivered branches serially after git-verifying their identity, refills
  the ready set after each merge without wave barriers, and **refuses to report
  completion while any planned task is not integrated**.
- Demo path: run the template offline over the canonical fixture graphs and the
  audited defect fixtures; the returned record lists every planned task with its
  final state, and a plan containing a task that can never become ready stops
  with a blocker instead of reporting success.
- Blocked by: Slice 1 (seam-required — it consumes the schema, the vm harness and
  the tmp-repo helper)
- Scope: `skills/rope-go/workflows/go-execute.js`,
  `skills/rope-go/scripts/verify-delivery.sh`, `tests/kernel/**`,
  `tests/fixtures/broken/**`. Owns these files only.
- Size cap: ~400 diff lines (kernel half of the template).
- Matrix rows: Primary path (scheduling + merge), Empty or missing input,
  Invalid or malformed input (validation half), Unavailable or not-ready
  dependency, Duplicate or idempotent case, Boundary or limit case (in-flight
  window, empty-ready-not-done)
- Constraint IDs: I2, I3, I4, I7, I9, I11, D2, D4, D6, F1, F2, F9
- Required evidence:
  - B-Primary: dispatch order follows both dependency classes correctly — a
    `seam-required` blocker gates dispatch, a `file-overlap` blocker does not →
    `I2` / `D4`
  - B-Primary: the in-flight window is respected, and when it is saturated the
    scheduler lands a finished branch before starting a newly-ready task → matrix
    row "Boundary or limit case"
  - B-Invalid: malformed plans are rejected before any `agent()` call, with the
    offending field named → `I7`
  - B-Duplicate: a delivered branch already merged into the base is not merged
    twice → `I2`
  - **Audited defect fixture 1 (branch identity):** a stub leaf returns a
    plausible prose footer and a reported SHA, but the predeclared delivery
    branch is absent or points elsewhere → the task is `blocked`, **no merge is
    attempted**, and the run stops → `I3` / `F1` / `D6`
  - **Audited defect fixture 2 (missing downstream mistaken for completion):**
    stubs finish the two tasks that were dispatched and leave S3b/S4/P1–P3
    un-ready; the run must report those tasks by id as never-ready blockers and
    must **not** report success → `I4` / `F2`
  - `verify-delivery.sh` against a throwaway repo: exit code and JSON assert
    branch-exists / resolves-to-reported-SHA / object-exists / clean-tree, for
    the present, absent, and mismatched cases → `D6`
- Public behavior: go's orchestration is a shipped, offline-tested asset whose
  scheduler cannot silently drop planned work or route by prose.
- Tests:
  - red: `tests/kernel/*.test.mjs` fail against a nonexistent template
  - green: the fixture set above passes, plus a linear chain, a wide antichain,
    and a `file-overlap` pair dispatched concurrently
  - regression: the two audited defect fixtures fail loudly if the defect is
    reintroduced
- Implementation notes:
  - Branch routing comes from the **plan**, never from the leaf's text. The
    leaf's reported SHA is evidence checked against the plan's predeclared
    branch (`git rev-parse <branch>` == reported SHA).
  - Every leaf spawn passes a `schema` and the template reads `text` as the JSON
    payload. Never parse agent prose: the host appends its branch note to a
    worktree child's prose `result`.
  - The worktree host commits a leaf's leftover changes into its own branch; the
    leaf's contract is to commit everything first and leave a clean tree, then
    create its own predeclared branch. Both refs may exist; only the
    predeclared one is a routing input.
  - Never infer completion from "nothing is running". Completion is
    `every planned task integrated`.
  - No repo-specific command literal anywhere in the template.
  - `verify-delivery.sh` is shell + git, emits JSON, and its exit code is the
    verdict (usable later as a `gate`).
- Verification: `node --test tests/kernel` and a direct `verify-delivery.sh` run
  against `tests/harness/tmp-repo.mjs` output. Focused only.
- Stop conditions: any need to change the Slice 1 contract (that is a shape
  defect → re-cut, not an in-flight edit); any temptation to parse the host's
  prose footer; any temptation to split the template into modules.

## Slice 3: Gates as preconditions, check timetable, evidence reuse, freeze and review

- Status: pending
- Kind: vertical
- Goal: The template advances only through satisfied preconditions. L2 asserts
  *all planned inputs integrated* **and** the affected suite green before E2E
  runs; the repository's declared check timetable decides when each command
  runs; an unchanged commit set + scope reuses stored evidence instead of
  rerunning; a failed or unevaluated precondition halts advancement; and the
  freeze point runs the two read-only review axes with bounded, delta-only fix
  rounds.
- Demo path: offline, a plan whose merge is skipped fails L2's dual assertion and
  the run stops before E2E and before review; a plan that passes reaches a stubbed
  freeze, two review axes run, one blocking finding produces exactly one fix
  round plus a delta re-review, and the budget bound produces a Human Escalation
  Stop instead of a third round.
- Blocked by: Slice 2 (seam-required — same file; the gates are the second half
  of one single-file artifact)
- Scope: `skills/rope-go/workflows/go-execute.js` (extends the kernel),
  `skills/rope-go/scripts/run-check.sh`, `tests/gates/**`. Owns these files only.
- Size cap: ~400 diff lines.
- Matrix rows: Primary path (gates + review), Alternate input or entrypoint
  (declared-but-empty stages), Duplicate or idempotent case (evidence reuse),
  Boundary or limit case (fix-round bound), Real-entrypoint behavior (E2E
  executor resolution)
- Constraint IDs: I4, I5, I6, I8, I10, D3, D5
- Required evidence:
  - B-Primary: L2 is a **precondition** on L3/E2E/review — the audited shape
    where `l2`/`e2ePass` are returned as fields while later stages still run is
    impossible by construction → `I5` / `D5`
  - **Audited defect fixture 3 (false L2):** a plan whose merges are all skipped
    but whose test command exits 0 on the un-integrated checkout must fail L2's
    dual assertion → `I4` / `D5`
  - B-Duplicate: the same commit set + scope evaluated twice runs the expensive
    command once; the second evaluation's check record says `reused: true` and
    points at the same evidence path → `I6` / `D3`
  - B-Boundary: a scope change or a new commit invalidates reuse → `I6`
  - B-Boundary: fix rounds stop at the bound and the run returns a structured
    stop carrying the remaining findings and round history → `I8`
  - B-Alternate: a plan declaring no L3 roots / no E2E items reports those stages
    as explicitly skipped, never as passed → matrix row
  - B-Existing-behavior: nothing in this slice reaches outside the freeze point;
    no second review gate is created → `I8`
- Public behavior: go cannot advance past an unmet gate, cannot claim a review it
  did not run, and cannot silently spend an expensive command twice on unchanged
  code.
- Tests:
  - red: `tests/gates/*.test.mjs` fail before the gate stage exists
  - green: the three audited fixtures (identity, missing downstream, false L2)
    plus the reuse, bound, and empty-stage fixtures pass
  - `run-check.sh` writes output and exit status to the evidence directory and
    the verdict is asserted on the saved artifact, not on a piped exit code
- Implementation notes:
  - Checks are scheduled from the declared timetable, not from a hardcoded
    position; each check carries an id, command, scope, and an
    exclusive-or-concurrent marking used for lane scheduling.
  - Evidence path: `.rope/issues/<slug>/evidence/<scope-key>/<check-id>.{out,json}`.
  - The early per-merge warning is a cheap declared check and is **not** a review
    axis; it must not be reported as a verdict.
  - Review axes are spawned as two read-only leaves in one message at the freeze
    point; verdict is the mechanical worst-of-two; findings are transcribed
    verbatim into the one fix brief; re-review is delta-only.
- Verification: `node --test tests/gates` and a targeted `run-check.sh` run in a
  throwaway repo. Focused only.
- Stop conditions: any pressure to add a review gate; any evidence reuse across
  changed commits or scope; any citation of a full-suite run as a fix for a
  scheduling bug.

## Slice 4: Shape-side critical-path review

- Status: pending
- Kind: vertical
- Goal: Shape stops reporting only slice counts. The graph quiz additionally
  reports the initial ready count, the maximum achievable width, the longest
  dependency chain, and the justification for each blocking edge — and explicitly
  looks for a critical dependency that could be split into a thin interface plus
  separate hardening so consumers stop waiting on depth.
- Demo path: shape runs on this very issue package and reports initial ready
  count 1, maximum width 3, critical path 4, with every edge justified.
- Blocked by: Slice 1 (seam-required — it references the contract document and
  the repository check-policy fields)
- Scope: `skills/rope-shape/SKILL.md`,
  `skills/rope-shape/references/issue-package.md`. Owns these files only.
- Size cap: ~250 diff lines.
- Matrix rows: Invalid or malformed input (a blocking edge with no real seam
  consumption is a shape defect); Existing behavior compatibility (slicing rules
  and the granularity quiz are unchanged)
- Constraint IDs: I2, D2, D3
- Required evidence:
  - B-Primary: the graph-confirmation step reports initial ready count, maximum
    width, and the longest chain, and every blocking edge carries a class plus a
    one-line justification → `I2` / `D2`
  - B-Primary: the two-stage contract-slice rule (ADR 0011) is surfaced as a
    critical-path question when a consumer must wait on depth → `D2`
  - D3: `issue-package.md`'s Testing Decisions requires recording the
    repository's broader-suite policy (impact-selected vs required at freeze)
    when one is declared → `D3`
- Public behavior: a shaped issue carries the numbers that tell the user where
  the wall-clock actually goes, instead of a slice count.
- Tests:
  - This slice changes Markdown only; the harness has no seam for it.
  - Stand-in evidence: a dry-run of the graph-confirmation step over this issue
    package, pasted, showing the three numbers and per-edge justifications; plus
    the resulting `tasks.md` graph-summary block in this package as the worked
    example.
  - Structure check: `node bin/rope.js --help` and a reference-anchor check on
    the edited files.
- Implementation notes:
  - Do not add a new mandatory Q&A round; fold the numbers into the existing
    graph-confirmation step.
  - Do not require more slices — require each blocking edge to be justified, and
    name the split option when depth, not width, is the bottleneck.
  - Reference the check-policy fields defined in the Slice 1 contract document;
    do not restate their definition.
- Verification: `node --test` (smoke + structure) and a read-through of the
  edited section against the shipped contract. Focused only.
- Stop conditions: a new serial gate appearing in the shape flow; any wording
  that makes slice count a target.

## Slice 5: Go-side operational docs

- Status: pending
- Kind: vertical
- Goal: The go-side contract describes what actually shipped. `rope-go`'s startup
  compiles task data and invokes the template by absolute `scriptPath` resolved
  from the skill's installed location; the runtime reference's Go section owns the
  invocation contract, the check timetable, merge-priority scheduling, exclusive
  lanes, evidence reuse and the delivery-branch contract in the leaf return
  schema.
- Demo path: a reader can go from `rope-go` SKILL.md to a successful template
  invocation without reading the template source, and every claim in these three
  files matches shipped behaviour.
- Blocked by: Slice 3 (seam-required — these documents describe the behaviour the
  template actually has, and the audited failure was exactly a document
  describing a contract the executor did not implement)
- Scope: `skills/rope-go/SKILL.md`,
  `skills/rope-go/references/dynamic-workflow.md`,
  `skills/rope-go/references/execution-rules.md`. Owns these files only.
- Size cap: ~400 diff lines.
- Matrix rows: Existing behavior compatibility (the `agent` path and the
  parent-owned review path remain described and unchanged)
- Constraint IDs: I1, I3, I5, I6, I7, I8, A-D1..D6 (the ADR constraints they
  document)
- Required evidence:
  - B-Primary: SKILL.md's startup names the template invocation (absolute
    `scriptPath` resolved from the skill's installed directory) and the
    compile-then-invoke order → `I7`
  - B-Primary: the Go section defines the check timetable, exclusive-lane
    marking, merge-priority ordering, and evidence reuse, referencing the
    contract document rather than restating field names → `I5` / `I6`
  - B-Primary: the leaf return schema in execution-rules carries the
    delivery branch and its commit SHA, and states that routing uses the plan,
    not the leaf's text → `I3`
  - B-Existing-day-one: the `agent` (non-dynamic) path is still fully described;
    the retired `mode:` package field does not reappear → `D1` / `F9`
  - B-Anchor: every reference link and anchor resolves from the installed
    directory (no Rope-checkout dependency) → contract requirement from ADR 0014
- Public behavior: a fresh session can run dynamic go correctly by following the
  shipped documents alone.
- Tests:
  - Structure/anchor check over the three edited files (frontmatter present,
    relative references resolve), plus `node bin/rope.js --help`.
  - Stand-in evidence: the end-of-issue reviewer confirms every documented claim
    against the shipped template source; a documented claim with no
    corresponding behaviour is a blocking finding.
- Implementation notes:
  - Keep the canonical contract in `execution-template.md`; these files point at
    it and own the *when*, not the field list.
  - `routes.md`'s check-policy fields are the repository's declaration; describe
    how go honours them, not what the repository declared.
- Verification: `node --test` (smoke + anchor checks) and a read-through against
  the shipped template. Focused only.
- Stop conditions: documentation of a capability the template lacks; a second
  canonical definition of the schema appearing in a skill reference.

## Slice 6: Architecture record

- Status: pending
- Kind: vertical
- Goal: The decisions this issue makes are recorded where the next session will
  look: an ADR 0014 addendum for the fixed-template execution contract, an ADR
  0013 addendum making the check timetable, evidence reuse and repository policy
  mechanism, updated `CONTEXT.md` entries for the new terms, and the maintainer
  spec pointing at the shipped contract.
- Demo path: a reader opening `.rope/adr/0014` learns why the template exists and
  where its contract lives, without reading this issue package.
- Blocked by: Slice 1 (seam-required — it records the frozen contract and points
  at the contract document)
- Scope: `.rope/adr/0014-workflow-execution-mode.md`,
  `.rope/adr/0013-test-cost-tiering.md`, `.rope/CONTEXT.md`,
  `.rope/specs/dynamic-workflow-mode.md`. Owns these files only.
- Size cap: ~300 diff lines.
- Matrix rows: Existing behavior compatibility (ADR 0007/0010 review semantics
  and the config-decided execution form are recorded as unchanged)
- Constraint IDs: D1, D2, D3, D7
- Required evidence:
  - D1: the ADR 0014 addendum records the fixed-template decision, its
    consequences (single-file template, serialized template edits, no
    schema-version gate — an accepted risk), and the honest limitation that the
    template cannot be course-corrected mid-run → `D1`
  - D3: the ADR 0013 addendum records the timetable, evidence reuse and the
    repository check-policy field as executor mechanism → `D3`
  - D7: `CONTEXT.md` gains or revises entries for the template, task data, check
    timetable and delivery-branch contract, without contradicting the existing
    `Workflow execution mode` / `Graph-Driven Execution` entries → `D7`
  - Spec: `dynamic-workflow-mode.md` remains a maintainer route and points at the
    shipped contract rather than duplicating it → ADR 0014 §6
- Public behavior: a future session reads the architecture record and does not
  re-derive these decisions or reintroduce the retired ones.
- Tests:
  - Structure check: references and anchors resolve; no duplicated canonical
    schema; the retired `mode:` field appears nowhere as an active convention.
  - Stand-in evidence: the end-of-issue reviewer checks the addenda against the
    shipped template and the contract document.
- Implementation notes:
  - Prefer an addendum to ADR 0014 over a new ADR: a separate document would
    create a second definition of dynamic execution (blocking the intent of
    ADR 0014 §6).
  - Record the declined schema-version gate with its accepted risk so it is not
    silently reintroduced.
- Verification: structure/anchor check plus `node --test` smoke. Focused only.
- Stop conditions: a contradiction with an active ADR left unresolved; recording
  a decision that was not actually made.
