# Risk-Tiered Review Mode and Lean Leaf Briefs E2E

## E1 End-to-end docs dry-run (batch-mode issue walkthrough)

Architecture evidence: R1, R2, R4, R5 — validates that shape writes the mode,
go dispatches by it (deferred batch slices → one batch reviewer leaf with
Behavior Contract + IDs by reference), no parent overall review pass exists,
and verify audits batch verdicts.
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: repository docs only
Command or Steps:
- Simulate shaping a hypothetical 6-slice batch issue: read shape SKILL step 1
  + template → confirm the question exists and frontmatter/slice fields carry it.
- Walk go SKILL slice loop + execution-rules against that hypothetical package:
  1 required slice → per-slice leaf; 4 batch slices → deferred; after all
  slices → one batch leaf over cumulative diff; handoff checklist; verify handoff.
- Walk verify SKILL: batch verdict reality check present.
Pass Criteria:
- Every step of the walkthrough is supported by explicit doc text; no step
  requires behavior that is no longer documented (esp. no parent overall review).
Failure Report:
- Record the exact doc location where the walkthrough breaks.
Forbidden Out-of-Scope Actions:
- none beyond reading repo files
Result:
- pending

## E2 Legacy-package back-compat walkthrough

Architecture evidence: R1 (absent ⇒ per-slice), existing-behavior
compatibility — validates that a package without a `review` field flows
exactly as before.
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: repository docs only
Command or Steps:
- Take the existing `.rope/issues/dynamic-workflow-mode/prd.md` (no `review`
  field) and walk it through the new go texts.
Pass Criteria:
- Behavior identical to today: every code slice per-slice reviewed per its
  `Review:` marking; no batch leaf; verify unchanged.
Failure Report:
- Record any text that makes legacy behavior ambiguous.
Forbidden Out-of-Scope Actions:
- none beyond reading repo files
Result:
- pending

## E3 Cross-document consistency sweep

Architecture evidence: R1–R6 assembled — one language across CONTEXT, ADR
0004, spec, all three skills, README, routes.
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: repository docs only
Command or Steps:
- grep the three review values (`required`, `batch`, `self-check`) across the
  touched docs; grep for stale owner language ("overall review" as a go parent
  pass) — ADR 0001 and historical issue records excepted.
- Confirm Review Risk Gate trigger list is identical everywhere it appears.
Pass Criteria:
- No contradictions; the gate list is unchanged; only historical records
  mention the old pass.
Failure Report:
- List each stale/contradictory location.
Forbidden Out-of-Scope Actions:
- none beyond reading repo files
Result:
- pending
