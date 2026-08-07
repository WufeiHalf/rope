# Rope Finish Checklist

## Required Checks

- Issue directory exists.
- `prd.md`, `tasks.md`, and `e2e.md` are present.
- `verify.md` is present with `Verdict: PASS`, or the user explicitly waived issue-level verify.
- All slices are completed or explicitly waived.
- Review findings are resolved or explicitly waived.
- E2E entries have terminal statuses:
  - `agent_passed`
  - `covered_by_slice`
  - `user_confirmed`
  - `waived`
  - `blocked_on_gate`
  - `blocked_on_user`
  - `not_run_with_reason`
- Terminal statuses are about **recorded outcomes** (with evidence); finish does not re-run validation that go/verify already recorded as green.

## Architecture Documentation Closure

Read the Architecture Impact and Constraint Bundle from `prd.md`.

- A confirmed `pending-finish` outcome is finish work, not a verify failure.
- Route confirmed changes using the existing homes: ADR for a hard-to-reverse,
  surprising tradeoff; spec for a stable implementation contract/gotcha; CONTEXT
  for a domain term; research for an external fact.
- Write directly when the disposition was already confirmed. Preserve source
  status, scope, invariants, exception bounds, evidence, and invalidating condition.
- Replace every `pending-finish` with one terminal value:
  `updated-existing`, `added-new`, `no-new-decision`, or `exception-recorded`.
- If final behavior reveals an unconfirmed architecture change, pause and request
  disposition. A finish run cannot invent an exception or close with a todo.
- Record the terminal outcome and changed paths in the final report.

## Reusable Lesson Routing

- Stable term -> `.rope/CONTEXT.md`
- External/platform fact -> `.rope/research/`
- Implementation contract/gotcha -> `.rope/specs/`
- Durable architecture tradeoff -> `.rope/adr/`

## Final Report Shape

```md
## Final Status

- Issue:
- Verify verdict:
- Slice status:
- E2E status:
- Commits:
- Remaining gates:
- Docs updated:
- Architecture documentation outcome: updated-existing | added-new | no-new-decision | exception-recorded
```
