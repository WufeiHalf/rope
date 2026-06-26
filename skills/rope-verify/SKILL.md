---
name: rope-verify
description: Verifies an issue's completion state against its PRD, Behavior Matrix, and E2E plan after rope-go finishes all slices. Runs in the planner window with a strong model. Does not edit code; produces findings, may fix issue-document metadata, and routes a fix prompt back to the implementer window when needed. Use after rope-go reports final status and before rope-finish.
---

# Rope Verify

Verify whether a finished issue's completion state actually satisfies its PRD, Behavior Matrix, and E2E plan. This is the issue-level gate between `rope-go` and `rope-finish`.

For verdict rules, finding severity, document-fix scope, and the verify.md format, read [references/verify-rules.md](references/verify-rules.md).

## Scope Boundary

- **Issue-level, not slice-level.** Verify does not redo per-slice review (that is `rope-go`'s job). Verify checks that per-slice review actually happened rather than being silently degraded, and that the issue as a whole meets its PRD/E2E.
- **Read-only on code.** Code findings become a fix prompt routed back to the implementer window, never an edit. Verify may edit issue-document metadata only (stale status records in `tasks.md`/`e2e.md`/`prd.md`); record each such fix in `verify.md` under Document Fixes Applied.

## Inputs

Read these when present. Decide for yourself how much to read — you are the judge of whether the completion state is trustworthy. Use read-only subagents to do mechanical inspection and save your own tokens.

- `.rope/issues/<issue>/prd.md`
- `.rope/issues/<issue>/tasks.md`
- `.rope/issues/<issue>/e2e.md`
- `.rope/CONTEXT.md`
- referenced `.rope/adr/`, `.rope/research/`, `.rope/specs/`
- the final diff and commit list since the issue package was committed at shape time

## Workflow

1. Load the issue package and form an initial picture of the claimed completion state: slice statuses, review verdicts, E2E results, commits.
2. Decide what to verify and how deeply. **Be token-conscious: dispatch read-only subagents for mechanical checks** (e.g. "does row X of the Behavior Matrix actually have a corresponding test in the diff?", "was E2E item E5, marked `agent_failed`, ever re-run?") rather than reading every changed file yourself. Reserve your own reading for judgment calls.
3. Verify, at minimum, against these dimensions — escalate depth autonomously when something looks off:
   - **Per-slice review reality:** were `Review: required` slices actually reviewed by a subagent, or all `review_degraded`? Flag silently degraded required reviews.
   - **Behavior Matrix coverage truth:** for each applicable row, does a real test/smoke/waiver exist in the code, not just a claim in `tasks.md`?
   - **E2E drift:** every `agent_failed` or `pending` E2E item — was it actually re-run and resolved, or did it drift into a `completed` slice with no re-verification? Drift is the highest-risk leak; hunt it.
   - **PRD contract intact:** public interface / Behavior Contract not broken by the diff; Non-goals not violated.
   - **High-risk boundary touch:** if the diff touches a high-risk boundary (the list in `rope-go`'s Review Risk Gate — auth, persistence/schema, public interface, routing, runtime wiring, E2E-critical path), inspect more deeply. Do not re-list them here; read `execution-rules.md`.
4. Fix stale or wrong issue-document metadata directly (status records, blank Result fields, mislabeled verdicts). Record each fix in `verify.md`.
5. Classify each code-level finding:
   - `must-fix`: blocks finish. Goes into the fix prompt.
   - `nice-to-fix`: recorded, does not block. The implementer window can pick it up next time.
6. Write or append `verify.md` in the issue directory with the structure in the reference. Set `Verdict`:
   - `PASS` — no must-fix findings; issue completion state is trustworthy. May proceed to `rope-finish`.
   - `CHANGES_REQUESTED` — one or more must-fix findings. Produce a fix prompt for the implementer window.
   - `BLOCKED` — needs a human decision (e.g. a real-environment E2E failure the user must adjudicate, an ambiguous PRD conflict). List the blockers.
7. Hand off:
   - `PASS`: tell the user the issue is ready to close and give a one-line handoff to `rope-finish` naming the issue directory.
   - `CHANGES_REQUESTED`: give the user the fix prompt to paste into the implementer window. After the implementer window fixes, the user re-runs `rope-verify` in this window; append a new round to `verify.md` (do not overwrite history).
   - `BLOCKED`: surface the blockers and wait for the user.

## Guardrails

- Do not skip verify by trusting `tasks.md`/`e2e.md` claims. Verify against the actual diff, tests, and commits.
- Do not invent a PASS. If you cannot verify something, mark it `cannot_verify` and treat it as a finding.
- Do not recommend `rope-finish` unless `Verdict: PASS`.
- Do not delete or overwrite prior verify rounds in `verify.md`; append.
