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
^- agent_passed — walked shape SKILL step 1 (review-mode question: "Then ask the
  user for the **review mode** … Record `review: per-slice | batch`", lines
  21-27) + issue-package.md template (`review: per-slice | batch` frontmatter;
  slice field `Review: required | batch | self-check` + validity note) for a
  hypothetical 6-slice `review: batch` package (1 required / 4 batch / 1
  self-check); walked go SKILL slice loop item 3 (`required` → reviewer leaf,
  `batch` → deferred with nothing recorded beyond slice status, `self-check`
  unchanged) + execution-rules "Batch Review Execution" (one leaf over the
  cumulative diff of all batch slices, brief carries Behavior Contract +
  Constraint IDs by reference, verdict per covered slice, zero batch ⇒ no
  leaf) + go SKILL "After all slices" items 3-5 (batch leaf before verify,
  handoff checklist, same-session verify handoff); walked verify SKILL step 3
  (batch verdicts real and auditable; `batch` treated as self-check is a
  must-fix). No parent overall-review pass exists in go SKILL or
  execution-rules (Handoff Checklist: assembled-diff judgment lives in the
  batch brief + rope-verify, "not in a go parent pass").

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
^- agent_passed — walked `.rope/issues/dynamic-workflow-mode/prd.md` (frontmatter
  `mode: dynamic` only; no `review:` field) through go SKILL slice loop item 3
  ("absent or `per-slice` ⇒ today's binary `required | self-check` behavior")
  and execution-rules (batch execution is scoped to "In `review: batch`
  packages", so a legacy package never enters it; "Zero `batch` slices ⇒ no
  batch leaf"). Its tasks.md marks slices `Review: required` ×4 and
  `Review: self-check` ×1 (lines 46/83/123/180, 152) — required slices get
  their per-slice reviewer leaf, self-check unchanged, no batch markings
  anywhere, no batch leaf, verify texts unchanged for the legacy flow. No
  text found that makes legacy behavior ambiguous.

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
^- agent_passed — grepped the three values across CONTEXT, ADR 0004, spec, the
  shape/go/verify skill sets (skills/ + .agents/skills/), README, routes:
  `required`/`batch`/`self-check` all present where expected (routes.md is a
  navigation map and carries none — ADR 0004 reference supplies the
  vocabulary). Stale "overall review" parent-pass language appears only in
  ADR 0001 (excepted), ADR 0004 (decision history), and this issue's own
  prd/tasks/spec records — no active shape/go/verify skill text owns an
  overall-review pass. Review Risk Gate list identical in all 4 occurrences:
  execution-rules lines 105-112 (authoritative 7-bullet list),
  ADR 0004 decision 2, spec slice-marking section, verify-rules
  High-Risk Boundaries (defer-verbatim note + same 7 items). No
  contradictions; gate list unchanged.
