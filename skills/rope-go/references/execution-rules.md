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

## Required Review Execution

For every `Review: required` slice:

1. Discover available subagent types from the current harness/tool error surface before self-review. Do not assume `code-reviewer` exists.
2. If a specialized review type is available, use it in read-only mode and record the review verdict in `tasks.md`.
3. If only generic subagent types are available, use `general-purpose` (or the closest available generic type) with explicit read-only review instructions and record the type used.
4. If a named review type such as `code-reviewer` is rejected but generic subagents exist, record this as `review_degraded: no_specialized_review_subagent_available`, not as total subagent unavailability.
5. If no subagent tool or suitable type is available, run a read-only self-review and record:
   - `review_degraded: no_subagent_tool_available`
   - what discovery was attempted
   - why self-review was used

Do not silently treat `Review: required` as ordinary self-check.

## E2E Execution Statuses

- `agent_passed`: agent ran the classified validation and it passed.
- `agent_failed`: agent ran it and it failed; fix or record blocker.
- `blocked_on_gate`: missing, stale, or changed shape-time approval prevents execution.
- `blocked_on_user`: requires human judgment or unavailable user-only access.
- `skipped_by_user_at_shape`: user skipped an agent-with-gate action during shaping.
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
- E2E `agent-with-gate` items have shape-time decisions and are executed, skipped, or blocked according to that decision.
- Existing behavior compatibility was tested or explicitly waived.
- No unrelated dirty files were included.
