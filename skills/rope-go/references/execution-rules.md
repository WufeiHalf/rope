# Rope Go Execution Rules

## Review Risk Gate

Use `Review: required` when the slice touches:
- public interface or user-visible behavior
- external system or adapter behavior
- auth, permission, secret, or data leak risk
- persistence, schema, migration, stored format
- routing, app entrypoint, runtime wiring, background worker
- multi-layer behavior
- E2E critical path

Use `Review: self-check` only for low-risk docs, fixture, or isolated behavior.

## E2E Execution Statuses

- `agent_passed`: agent ran the classified validation and it passed.
- `agent_failed`: agent ran it and it failed; fix or record blocker.
- `blocked_on_gate`: requires user approval before execution.
- `blocked_on_user`: requires human judgment or unavailable user-only access.
- `not_run_with_reason`: intentionally not run; reason recorded.

## Commit Rules

- Commit each completed slice independently.
- Commit review fixes independently.
- Commit plan/doc adjustments independently when they change tracked docs.
- Do not combine unrelated slices.
- Do not push, merge, rebase, or delete branches unless the user explicitly asks.

## Overall Review Checklist

- PRD goals and non-goals still match the final diff.
- Each applicable Behavior Matrix row has test, smoke, or explicit waiver.
- E2E `agent` items were actually executed.
- E2E `agent-with-gate` items are either approved and executed or blocked on gate.
- Existing behavior compatibility was tested or explicitly waived.
- No unrelated dirty files were included.

