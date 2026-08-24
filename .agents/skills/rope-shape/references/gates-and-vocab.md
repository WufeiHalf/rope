# Shape gates, E2E classes, vocabulary

## E2E Executor Rules

- `agent`: local tests, fixture smoke, read-only checks, safe CLI. Go must run.
- `agent-with-gate`: restart, deploy, shared/prod write, expensive/destructive.
  Shape gets approval first.
- `user`: visual/business judgment, 2FA, private session, unreachable env.
- `not-run`: out of scope; reason + user-accepted waiver.

E2E items carry **real-environment behaviors only** (real APIs, real entrypoints, real data). Ticket-level unit validation lives in TDD evidence and never appears as an E2E item — no `covered_by_slice` bookkeeping: if it would be `covered_by_slice`, it does not belong in e2e.md at all.

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
| **River** | Zero-dependency slice cluster — a second journey inside the graph |
| **Wave** | Topological level of the slice graph; frontier slices run concurrently |
| **Map** | `<issue>/map.md` — one fact per line with path + date; shared orientation for leaves |
| **Component slice** | A slice serving part of one user story; brief cites the story row + its own completion criteria; legal under tracer-bullet slicing |
| **Prefactor** | A structural-enabling slice that makes later slices easy ("make the change easy, then make the easy change"); often the first source of wide parallelism |

Upstream “spec/ticket” is kernel only; keep Rope names in artifacts we write.

## Wide refactor (expand–contract)

One mechanical change with huge blast radius: do not fake vertical slices.
Sequence expand → migrate batch(es) → contract; `Kind: wide-refactor-*`;
Blocked by along the chain; prefer green batches.

## Frontier, waves, rivers

Read the slice graph from `Blocked by` edges — never guess it.

- **Frontier** — slices with no unresolved blockers. Frontier slices whose
  owned files do not overlap run concurrently.
- **Wave** — one topological level of the graph; wave N+1 starts as wave N
  clears.
- **River** — a slice cluster with no edge, direct or transitive, to the rest
  of the graph. Two rivers are two journeys: shape offers to split them into
  separate issues (each its own pipeline, deliverable alone) or keeps one
  issue and lets go run the rivers in parallel. Never merge rivers into one
  slice to dodge the question.
