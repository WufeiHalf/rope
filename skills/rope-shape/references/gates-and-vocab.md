# Shape gates, E2E classes, vocabulary

## E2E Executor Rules

- `agent`: local tests, fixture smoke, read-only checks, safe CLI. Go must run.
- `agent-with-gate`: restart, deploy, shared/prod write, expensive/destructive.
  Shape gets approval first.
- `user`: visual/business judgment, 2FA, private session, unreachable env.
- `not-run`: out of scope; reason + user-accepted waiver.

## Gate Approval Rules

- Approve **actions**, not exact commands (e.g. restart local dev server).
- Each approval: scope, risk, pass criteria, forbidden out-of-scope actions.
- Go may pick commands; re-ask only if action/scope/risk/env/target changes.
- Skipped agent-with-gate → go records `skipped_by_user_at_shape`, does not run.

## Vocabulary (do not blur)

| Term | Means |
| --- | --- |
| **Issue package** | `.rope/issues/<slug>/{prd,tasks,e2e}.md` |
| **PRD** | Product/requirements in `prd.md` |
| **Slice** | Vertical unit in `tasks.md` |
| **Spec** | `.rope/specs/**` architecture contracts — **not** the PRD |
| **ADR** | Hard-to-reverse architecture decisions |

Upstream “spec/ticket” is kernel only; keep Rope names in artifacts we write.

## Wide refactor (expand–contract)

One mechanical change with huge blast radius: do not fake vertical slices.
Sequence expand → migrate batch(es) → contract; `Kind: wide-refactor-*`;
Blocked by along the chain; prefer green batches.

## Frontier

Slices with `Blocked by: none` (or blockers completed) are the frontier.
Independent frontier slices may run in parallel in go when Scope does not
overlap; dependents stay serial.
