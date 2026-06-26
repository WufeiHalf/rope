# Rope Verify Rules

## Verdict

- `PASS` — no `must-fix` findings. The issue's completion state is trustworthy against its PRD, Behavior Matrix, and E2E plan. `rope-finish` may proceed.
- `CHANGES_REQUESTED` — one or more `must-fix` findings. A fix prompt is produced for the implementer window. The issue is not ready to finish.
- `BLOCKED` — a human decision is required (real-environment E2E failure, ambiguous PRD conflict, missing credential the user must supply). List the blockers; do not fabricate a verdict.

## Finding Severity

- `must-fix` — blocks finish. Routed to the implementer window via the fix prompt.
- `nice-to-fix` — recorded, does not block. Picked up by the implementer window on the next pass.
- `cannot_verify` — the verifier could not confirm a claim (e.g. an E2E marked `agent_passed` with no recorded command, a review verdict with no evidence). Treated as a finding; escalate to `must-fix` if it concerns a high-risk boundary, else `nice-to-fix`.

## What Verify May Edit Directly (Document Fixes Only)

Verify may correct stale or wrong metadata **in issue documents**, never in code:

- `tasks.md`: a slice `Status: completed` whose `Review verdict` is still `pending` or blank; a slice missing a verification result.
- `e2e.md`: a `Result:` field left blank or marked `agent_passed` with no command/evidence; an `agent_failed` that was never re-run but whose slice drifted to `completed`.
- `prd.md`: a typo or a stale Open Question that was actually resolved during go.

Each document fix is recorded in `verify.md` under `Document Fixes Applied` with the file, the change, and the reason.

## High-Risk Boundaries (inspect more deeply when touched)

Reuse `rope-go`'s Review Risk Gate list verbatim — do not re-list it here. Read [`execution-rules.md`](../rope-go/references/execution-rules.md) for the authoritative list (public interface, external/adapter, auth/secret, persistence/schema, routing/runtime wiring, multi-layer, E2E-critical path).

## Token-Conscious Inspection

The verify model is the budget-scarcest resource. To keep its tokens on judgment rather than mechanical reading:

- Dispatch read-only subagents for mechanical checks: "does Behavior Matrix row X have a real test in the diff?", "was E2E item E5 re-run after its `agent_failed`?", "list the public-interface signatures changed by commits A..B".
- Read changed files yourself only for judgment calls: a contract break, a Non-goal violation, a high-risk boundary touch.
- The `Scope Reviewed` section of `verify.md` records what you read yourself versus what you delegated, so the decision is auditable.

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
- Delegated to subagents: <what each subagent checked and returned>

### Findings
- [must-fix|nice-to-fix|cannot_verify] <finding> — evidence: <commit / file / matrix row / e2e item>
  ...

### Document Fixes Applied
- <file>: <what was changed> — reason: <why>

### Fix Prompt for Implementer Window
(Only when Verdict = CHANGES_REQUESTED. A copy-paste prompt for the implementer window.)

<structured prompt naming each must-fix finding, the evidence, and the expected fix direction>
```

## Loop With the Implementer Window

1. Verify returns `CHANGES_REQUESTED` + fix prompt.
2. User pastes the fix prompt into the implementer window (the `rope-go` session).
3. Implementer window applies fixes, commits, and re-runs its own slice/E2E verification.
4. User re-runs `rope-verify` in the planner window on the same issue.
5. Verify appends Round N+1 to `verify.md`. Repeat until `PASS` or the user waives.
