# Fixed Go Execution Template E2E

## E1 Offline fault regression suite

Architecture evidence: I3 (git-verified identity), I4 (partial integration cannot
advance), I5 (gates are preconditions) — the three defect classes the audited
session produced.
Mechanism: cli
Executor: agent
Risk: local-write (throwaway directories under the system temp dir; no network)
Gate Decision: not-required
Approved Action: —
Scope: this repository only; `node --test`; no network, no external dependency
Command or Steps:
- `node --test`
- Inspect the reported test names for the three audited fixtures by name:
  delivery-identity, missing-downstream, false-L2.
Pass Criteria:
- The suite is green.
- Each of the three audited defect fixtures is present and, when its defect is
  reintroduced (verified once by temporarily inverting the guard locally, then
  reverting), the fixture fails loudly rather than passing.
- No test requires network access or a dependency outside Node's standard
  library, and the whole suite completes well inside the repository's declared
  quick tier.
Failure Report:
- The failing fixture name, the assertion, and the captured output; if a fixture
  cannot be made to fail under the reintroduced defect, report it as a
  non-regressing test rather than a passing one.
Forbidden Out-of-Scope Actions:
- Adding a test framework dependency, wiring CI, or contacting any network
  service; running the live `SubagentWorkflow` from this suite.
Result:
- pending

## E2 Real closure in a throwaway repository

Architecture evidence: I2 (graph is the scheduler), I3 (delivery identity), I6
(check timetable and reuse), I8 (single review gate at freeze) — the whole kernel
under the real host, not a stub.
Mechanism: api
Executor: agent
Risk: local-write (a throwaway git repository and temporary worktrees; real
subagents are spawned, so real tokens are spent)
Gate Decision: approved
Approved Action: invoke the shipped template once through the real
`SubagentWorkflow`, from the installed skill directory, using
`scriptPath` resolved to an absolute path, against a purpose-built throwaway
repository
Scope: one throwaway repository created for this run; no writes outside it and
the system temp dir; no push, no remote
Command or Steps:
- Build a throwaway repository whose base commit contains a trivial module and a
  declared quick/full tier pair, plus a `routes.md`-equivalent declaration.
- Author compiled task data with four tasks: a `seam-required` chain of two, a
  `file-overlap` pair that must dispatch concurrently, and one task whose brief
  deliberately instructs a change that will conflict with the other pair member.
- Invoke via the installed path:
  `scriptPath` = the absolute path of `…/skills/rope-go/workflows/go-execute.js`,
  `args` = the compiled task data (proves the path-only invocation decision).
- After the return, inspect the repository's real git history, not the script's
  claims.
Pass Criteria:
- The structured return lists every planned task with a terminal state and a git
  object that exists in the repository.
- Exactly one branch per task is merged; the merge history is serial; the
  conflicting pair produced exactly one re-dispatch and the conflict was resolved
  on the unmerged branch.
- The run did not advance past a failed or unevaluated gate; a deliberately
  broken acceptance item appears as a blocker or a failed E2E, never as a pass.
- The review gate ran once, at freeze, with two read-only axes, and its findings
  are recorded with identities.
- Full-suite executions are attributable to the declared timetable: no per-slice
  or per-wave ritual appears in the check records; a repeated evaluation of an
  unchanged commit set + scope reports `reused`.
- Total wall-clock and check durations are recorded per stage.
Failure Report:
- The structured return verbatim, the real `git log --graph` of the throwaway
  repository, and the check records; classify the failure as product, stale
  contract, environment, or host/template.
Forbidden Out-of-Scope Actions:
- Pushing anywhere; modifying this Rope repository during the run; editing the
  template mid-run to make the run pass (that is a finding, not a fix).
Result:
- pending

## E3 Live run on a real issue, measured

Architecture evidence: the whole constraint bundle — this is the only item that
shows the template survives contact with real work, and the only one that can
falsify the speed claim.
Mechanism: cli
Executor: agent-with-gate
Risk: local-write
Gate Decision: approved
Approved Action: run one real issue's dynamic go with the shipped template, in a
repository and issue the user names at execution time
Scope: exactly one issue in one named repository; that repository's own declared
checks and worktree setup apply; no push or remote write
Command or Steps:
- The user names the repository and issue.
- Compile task data from that issue's approved `tasks.md`.
- Run go through the template and record, separately: go wall-clock,
  time waiting on leaves, time in merges, time in checks, and the count and
  duration of full-suite executions.
- Compare against the recorded baseline of the audited session
  (`.rope/research/session-01a0840a-dynamic-field-report.md`: ~11 full-suite runs,
  ≈38 of 73 minutes) and against that issue's own shape-time numbers.
Pass Criteria:
- Every planned task is integrated or explicitly reported as a blocker with a
  classification; no planned task is absent from the return.
- The defect classes from the audited session do not occur: no routing from prose,
  no advancement past an unmet precondition, no un-integrated stage reported as
  passed.
- Full-suite executions are attributable to a declared reason; on a repository
  whose policy is impact-selected, the count is materially below the audited
  baseline.
- Wall-clock, merge, check, and wait durations are separately reported so the
  next shape decision can use them.
Failure Report:
- The structured return, the evidence directory listing, and the per-stage
  durations; if the run is slower than the audited session, report which stage
  grew rather than a single total.
Forbidden Out-of-Scope Actions:
- Running more than one issue under this item; pushing; changing the target
  repository's own test policy to make the numbers look better; treating a
  degraded run (host capability missing) as a template failure without recording
  the degradation.
Result:
- pending
