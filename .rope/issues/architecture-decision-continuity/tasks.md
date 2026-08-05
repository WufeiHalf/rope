# Architecture Decision Continuity Workflow Tasks

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes | skill structure checks and installer smoke check |
| Alternate input or entrypoint | yes | structured grill tool available vs unavailable fallback |
| Empty or missing input | yes | no relevant decision / `not-applicable` and no-decision-candidate wording |
| Invalid or malformed input | yes | unresolved conflict, unknown status, and unconfirmed change handling read-through |
| Unavailable or not-ready dependency | yes | missing question tool and missing preset soft-degrade wording |
| Duplicate or idempotent case | yes | installer preserves existing settings and source/target comparison |
| Boundary or limit case | yes | legacy package, exception, supersede, and finish pending-doc cases |
| Existing behavior compatibility | yes | existing role separation, E2E classification, and doc routing retained |
| Real entrypoint or integration path | yes | `node bin/rope.js add --target <requested target>` and installed-file comparison |

## Slice 1: Grill continuity and structured questions

- Status: completed
- Kind: vertical
- Goal: a parent can clarify architecture impact and use structured questions without losing the plain-text fallback
- Blocked by: none
- Scope: `skills/rope-grill/**`
- Matrix rows: Primary path; Alternate input or entrypoint; Empty or missing input; Invalid or malformed input; Unavailable or not-ready dependency
- Constraint IDs: C2, C5
- Required evidence: structured-tool preference, batch/blocker ordering, plain-text fallback, recommendation/example/tradeoff protocol
- Public behavior: `rope-grill` checks architecture-impact facts and asks disposition questions with a structured-tool fallback.
- Tests: docs-only structural checks for tool preference, fallback, recommendation/example/tradeoff, and shared-understanding gate
- Implementation notes: keep the main skill concise; put architecture continuity details in a linked reference if needed
- Verification: source read-through and target comparison after install; passed E1/E2
- Review: self-check
- Review reason: docs-only change with no runtime code
- Stop conditions: missing required grill rule or contradiction with `grilling.md`

## Slice 2: Shape Architecture Impact and Constraint Bundle

- Status: completed
- Kind: vertical
- Goal: a new issue package records whether architecture matters and carries a canonical, traceable constraint bundle
- Blocked by: Slice 1
- Scope: `skills/rope-shape/**`
- Matrix rows: Primary path; Empty or missing input; Invalid or malformed input; Boundary or limit case; Existing behavior compatibility
- Constraint IDs: C2, C3, C4
- Required evidence: Architecture Impact template, source-status/disposition enums, candidate/conflict/legacy handling, PRD canonical bundle, tasks mapping
- Public behavior: `rope-shape` writes explicit Architecture Impact, per-decision disposition, and mapped constraint evidence into a new issue package.
- Tests: template field and enum checks; conflict/candidate/legacy wording read-through
- Implementation notes: `prd.md` is canonical; `tasks.md` references IDs and maps slice evidence
- Verification: source read-through and target comparison after install; passed E4
- Review: self-check
- Review reason: docs-only template contract
- Stop conditions: missing mapping or `not-applicable` ambiguity

## Slice 3: Go leaf bundle and review continuity

- Status: completed
- Kind: vertical
- Goal: implementer and reviewer leaves receive the constraints they must preserve and report conflicts instead of silently changing them
- Blocked by: Slice 2
- Scope: `skills/rope-go/**`
- Matrix rows: Primary path; Invalid or malformed input; Boundary or limit case; Existing behavior compatibility
- Constraint IDs: C1, C4, C6
- Required evidence: leaf brief fields for source/status/disposition/invariants/evidence, reviewer return evidence, parent re-brief rule, assembled review checklist
- Public behavior: `rope-go` passes global and slice-relevant constraints to each leaf and records architecture review evidence.
- Tests: execution-rules brief fields, reviewer checklist, and conflict re-brief wording checks
- Implementation notes: positive instructions should lead; keep implementation shape unconstrained
- Verification: source read-through and target comparison after install; passed E1
- Review: self-check
- Review reason: docs-only change
- Stop conditions: leaf brief can omit invariants, evidence, or conflict escalation

## Slice 4: Verify continuity evidence

- Status: completed
- Kind: vertical
- Goal: issue-level verify proves inherited invariants and recorded exceptions without requiring a specific implementation shape
- Blocked by: Slice 3
- Scope: `skills/rope-verify/**`
- Matrix rows: Primary path; Invalid or malformed input; Boundary or limit case; Existing behavior compatibility; Real entrypoint or integration path
- Constraint IDs: C1, C3, C4, C6
- Required evidence: architecture continuity checklist, decision/invariant evidence mapping, pending-finish classification, legacy handling, BLOCKED rule for unconfirmed changes
- Public behavior: `rope-verify` reports architecture continuity findings and keeps confirmed documentation pending work for finish.
- Tests: verify checklist and `verify.md` format checks for disposition, evidence, drift, and documentation-pending classification
- Implementation notes: verify remains parent-owned and read-only on code
- Verification: source read-through and target comparison after install; passed E5
- Review: self-check
- Review reason: docs-only change
- Stop conditions: docs-only pending work becomes a code finding or architecture inference relies only on diff/file names

## Slice 5: Finish documentation closure

- Status: completed
- Kind: vertical
- Goal: finish records a terminal documentation outcome and pauses only for an unconfirmed architecture change
- Blocked by: Slice 4
- Scope: `skills/rope-finish/**`
- Matrix rows: Primary path; Invalid or malformed input; Boundary or limit case; Existing behavior compatibility
- Constraint IDs: C4, C6
- Required evidence: pending-finish handoff, four terminal values, existing document routing, unconfirmed-change pause, final report field
- Public behavior: `rope-finish` routes confirmed architecture changes to canonical docs and records the resulting terminal outcome.
- Tests: finish precondition/checklist wording checks for pending-finish, four terminal values, and human pause
- Implementation notes: use existing ADR/spec/CONTEXT/research routing; do not create a second knowledge layer
- Verification: source read-through and target comparison after install; passed E5
- Review: self-check
- Review reason: docs-only change
- Stop conditions: finish silently invents disposition or closes an unconfirmed change

## Slice 6: Cross-stage references and installer validation

- Status: completed
- Kind: vertical
- Goal: all bundled skills and their installed copies agree on the same continuity vocabulary and workflow
- Blocked by: Slice 5
- Scope: `skills/` and requested target output
- Matrix rows: Duplicate or idempotent case; Unavailable or not-ready dependency; Real entrypoint or integration path
- Constraint IDs: C2, C4, C5, C6
- Required evidence: CLI help, successful install, 27-file source-target parity, unchanged settings file set
- Public behavior: installing Rope skills into the requested target produces the updated contracts without changing unrelated target settings.
- Tests: CLI help, install smoke check, recursive source/target comparison, duplicate-install settings preservation check
- Implementation notes: no project source changes in target
- Verification: run command and compare checksums/paths; passed E3
- Review: self-check
- Review reason: installer/docs-only
- Stop conditions: source and target differ, settings are overwritten, or unrelated files are modified
