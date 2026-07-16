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

- `tasks.md`: a slice `Status: completed` whose `Review verdict` is still `pending` or blank; a slice missing a verification result.
- `e2e.md`: a `Result:` field left blank or marked `agent_passed` with no command/evidence; an `agent_failed` that was never re-run but whose slice drifted to `completed`.
- `prd.md`: a typo or a stale Open Question that was actually resolved during go.

Each document fix is recorded in `verify.md` under `Document Fixes Applied` with the file, the change, and the reason.

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
4. Parent re-runs `rope-verify` on the same issue; appends Round N+1.
5. **Human Escalation Stop:** after **two** unsuccessful automated fix rounds on the same problem, or when the parent judges a design/requirements/contract defect, stop and present a short precise problem to the user. No third silent retry.

Degraded / historical path (only when parent cannot spawn a code-writing worker):

1. Emit the fix brief for a top-level implement session (historical "Window B" / implementer window paste).
2. After that session fixes, re-run verify in the parent/judge session.
3. Record the degrade mode in `verify.md` Scope Reviewed.
