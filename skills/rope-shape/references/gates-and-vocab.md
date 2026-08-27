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

## Edge Classification (ADR 0011)

Every `Blocked by` edge gets exactly one label at shape; only the first two
block dispatch:

| Label | Test | Effect |
| --- | --- | --- |
| **file-overlap** | the downstream slice reads/writes files the upstream owns (verify against owned-files, not intuition) | blocks dispatch |
| **seam-required** | the downstream consumes a public seam the upstream must first create | blocks dispatch |
| **methodology-order** | no overlap, no seam — only "reads better if done first" (e.g. instrumentation before refactor) | merge-order preference only; go dispatches across it |

A missing label is a shape defect. "Feels safer sequential" is not a label —
it is a merge-order preference at best.

## Slice granularity hard rules & anti-patterns (ADR 0011)

- **Demo path (mandatory per slice):** the answer to "what can I demo when
  this slice lands?" — a behavior, never a layer name ("schema done" fails).
- **Lower bound:** the whole change fits one fresh context window ⇒ do not
  make a multi-slice issue; recommend `rope-quick` (ADR 0006).
- **Upper bound:** one slice ≈ one fresh context window; exceeded ⇒ re-cut on
  the spot (existing rule).
- **Two-stage contract slices:** deep durability/concurrency/protocol work in
  a contract slice is thin-interface + hardening; consumers block only on the
  thin-interface half.
- **Anti-patterns** (field evidence: mattpocock/skills pin 6654f6b6 —
  horizontal slicing produced 26 tickets × ~20 agent runs each, 3/4 rework):
  horizontal (per-layer) slicing; over-decomposition (trivial grouping lost);
  acceptance criteria that are already true on the base commit, satisfiable
  only by another ticket's work, or restatements of the request instead of
  artifact-derived checks.

## Wide refactor (expand–contract)

One mechanical change with huge blast radius: do not slice it into fake
independent pieces (tracer bullets still apply — but along the
expand → migrate → contract chain, not across it).
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
