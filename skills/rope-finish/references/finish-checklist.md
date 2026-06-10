# Rope Finish Checklist

## Required Checks

- Issue directory exists.
- `prd.md`, `tasks.md`, and `e2e.md` are present.
- All slices are completed or explicitly waived.
- Review findings are resolved or explicitly waived.
- E2E entries have terminal statuses:
  - `agent_passed`
  - `user_confirmed`
  - `waived`
  - `blocked_on_gate`
  - `blocked_on_user`
  - `not_run_with_reason`

## Reusable Lesson Routing

- Stable term -> `.rope/CONTEXT.md`
- External/platform fact -> `.rope/research/`
- Implementation contract/gotcha -> `.rope/specs/`
- Durable architecture tradeoff -> `.rope/adr/`

## Final Report Shape

```md
## Final Status

- Issue:
- Slice status:
- E2E status:
- Commits:
- Remaining gates:
- Docs updated:
```

