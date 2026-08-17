# Rope Verify Rules

## Verdict

- `PASS` — no `must-fix` findings. The issue's completion state is trustworthy against its PRD, Behavior Matrix, and E2E plan. `rope-finish` may proceed.
- `CHANGES_REQUESTED` — one or more `must-fix` findings. A fix brief is produced for the **Parent Orchestrator** to spawn an **implementer leaf**. The issue is not ready to finish.
- `BLOCKED` — a human decision is required (real-environment E2E failure, ambiguous PRD conflict, missing credential the user must supply). List the blockers; do not fabricate a verdict.

## Finding Severity

- `must-fix` — blocks finish. Routed via fix brief → parent spawns implementer leaf.
- `nice-to-fix` — recorded, does not block. Parent may schedule later.
- `cannot_verify` — the verifier could not confirm a claim (e.g. an E2E marked `agent_passed` with no recorded command, a review verdict with no evidence). Treated as a finding; escalate to `must-fix` if it concerns a high-risk boundary, else `nice-to-fix`.

## What Verify May Edit Directly (Document Fixes Only)

Verify may correct stale or wrong metadata **in issue documents**, never in code:

- `tasks.md`: a slice `Status: completed` whose `Review verdict` is still `pending` or blank; a slice missing a verification result; for a `batch` slice, the verdict may be the shared batch-review verdict line — verify requires that line to exist, name the covered slices, and carry run/agent identity (batch execution is defined in [execution-rules](../../rope-go/references/execution-rules.md) "Batch Review Execution", not re-listed here). A missing or unauditable batch verdict is a `cannot_verify` finding, escalated to `must-fix` on high-risk boundaries per the existing severity rule.
- `e2e.md`: a `Result:` field left blank or marked `agent_passed` with no command/evidence; an `agent_failed` that was never re-run but whose slice drifted to `completed`.
- `prd.md`: a typo or a stale Open Question that was actually resolved during go.

Each document fix is recorded in `verify.md` under `Document Fixes Applied` with the file, the change, and the reason.

## Architecture Continuity Review

Use the Architecture Impact and full Constraint Bundle in `prd.md` as the issue's
claimed architecture contract. For every relevant decision:

- confirm the source and source status were recorded;
- confirm the disposition is final (`inherit`, `extend`, `supersede`, `exception`,
  or `not-applicable`), or that a risk-reviewed New decision candidate is explicit;
- trace each inherited invariant to behavior, dependency, review, test, integration,
  or document evidence named in the bundle;
- check that public behavior, ownership, and dependency direction preserve those
  invariants without requiring one concrete implementation shape;
- check for a silently duplicated state, persistence, permission, concurrency, or
  error strategy;
- check every exception for scope, reason, invalidating condition, and evidence;
- check unresolved conflicts and any leaf-reported disposition change;
- for `not-applicable`, record the lightweight trigger-check confirmation.

Classify a missing invariant/exception proof or unrecorded architecture drift as a
finding. A confirmed `pending-finish` documentation update is evidence for the
finish handoff, not a code finding. For a legacy package, record `legacy package —
architecture continuity not assessed`; if the final work touches a trigger, require
an Architecture Impact assessment before PASS. If final behavior reveals an
unconfirmed architecture change, use `BLOCKED` for the required human/parent
disposition; do not invent an exception.

### Scope and responsibility split

The parent owns the judgment. A verify-inspector may mechanically map decision IDs
to changed paths, tests, review notes, and E2E items, but the parent decides whether
behavior and dependencies actually satisfy the invariant. Verify remains read-only
on code.

## High-Risk Boundaries (inspect more deeply when touched)

Reuse `rope-go`'s Review Risk Gate list verbatim — do not re-list it here. Read [`execution-rules.md`](../../rope-go/references/execution-rules.md) for the authoritative list (public interface, external/adapter, auth/secret, persistence/schema, routing/runtime wiring, multi-layer, E2E-critical path).

## Token-Conscious Inspection

The verify model is the budget-scarcest resource. To keep its tokens on judgment rather than mechanical reading:

- Dispatch **verify-inspector** (prefer `rope-verify-inspector`) or explore leaves for mechanical checks: "does Behavior Matrix row X have a real test in the diff?", "was E2E item E5 re-run after its `agent_failed`?", "list the public-interface signatures changed by commits A..B".
- Read changed files yourself only for judgment calls: a contract break, a Non-goal violation, a high-risk boundary touch.
- The `Scope Reviewed` section of `verify.md` records what you read yourself versus what you delegated, so the decision is auditable.
- Soft-degrade with `preset_missing` if harness presets are absent; continue with a generic read-only worker.

## Drift

The failure mode verify exists to catch: an `agent_failed` or `pending` E2E item drifting into a `completed` slice with no re-verification. Hunt drift on every `agent_failed`/`pending` E2E item — confirm it was re-run and resolved, not silently absorbed.

`agent_passed` and `covered_by_slice` items are **not** re-run: verify checks the recorded command + evidence in `e2e.md` (for `covered_by_slice`, the cited slice runs) instead. Re-run only `agent_failed`/`pending` items.

## `verify.md` Format

Append a new round each verify run; do not overwrite prior rounds.

```md
# <Issue Title> Verify

## Round N — <date>

### Verdict
PASS | CHANGES_REQUESTED | BLOCKED

### Scope Reviewed
- Read directly: <files/sections the verify model read itself>
- Delegated to leaves: <what each verify-inspector/explore leaf checked and returned>
- preset_missing: <yes/no and which roles>

### Architecture Continuity Check
- Impact outcome: required | not-applicable
- Decisions checked: <IDs and final dispositions>
- Invariants/evidence: <mapping or delegated inspection result>
- Exceptions: <scope, reason, invalidating condition, evidence, or none>
- Drift/conflicts: <none or finding and classification>
- Documentation outcome: pending-finish | updated-existing | added-new | no-new-decision | exception-recorded

### Findings
- [must-fix|nice-to-fix|cannot_verify] <finding> — evidence: <commit / file / matrix row / e2e item>
  ...

### Document Fixes Applied
- <file>: <what was changed> — reason: <why>

### Fix Brief for Implementer Leaf
(Only when Verdict = CHANGES_REQUESTED. Self-contained brief for parent to spawn implementer leaf.)

<structured brief naming each must-fix finding, the evidence, expected fix direction, paths, and acceptance>
```

## Fix Loop (parent + implementer leaf)

Primary path (same parent session):

1. Verify returns `CHANGES_REQUESTED` + fix brief.
2. Parent spawns an **implementer leaf** with that brief (prefer `rope-implementer`).
3. Leaf applies fixes, commits, re-runs relevant verification; returns summary + paths.
4. Parent re-runs `rope-verify` on the same issue; appends Round N+1. Round N+1 re-checks only the must-fix scope plus any E2E still `agent_failed`/`pending`; items already `agent_passed`/`covered_by_slice` are evidence-checked, not re-run.
5. **Human Escalation Stop:** after **two** unsuccessful automated fix rounds on the same problem, or when the parent judges a design/requirements/contract defect, stop and present a short precise problem to the user. No third silent retry.

Degraded / historical path (only when parent cannot spawn a code-writing worker):

1. Emit the fix brief for a top-level implement session (historical "Window B" / implementer window paste).
2. After that session fixes, re-run verify in the parent/judge session.
3. Record the degrade mode in `verify.md` Scope Reviewed.
