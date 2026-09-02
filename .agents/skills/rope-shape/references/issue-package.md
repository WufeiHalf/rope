# Rope Issue Package Template

## Directory

```text
.rope/issues/<issue-slug>/
  prd.md
  tasks.md
  e2e.md
  map.md   # optional: one fact per line, path + date; shared leaf orientation
```

## `prd.md`

```md
# <Issue Title>

## Problem Statement

<User-facing problem.>

## Solution

<User-facing solution.>

## Contract Note

- <3–5 one-sentence bullets: when this issue is done, what can you observe? Include failure visibility where relevant. Direct projection of Behavior Contract — not a separate wish list.>

## Goals

- <goal>

## Non-goals

- <non-goal>

## Public Interface / Behavior

- <callable API, UI behavior, CLI, config, schema, side effect, or observable result>

## Testing Decisions

- Good test: observe external behavior at agreed seams — not implementation details
- Seams under test: <list confirmed with user during shape; when placement is contested, argue it with [seam-design.md](seam-design.md)>
- Prior art (optional): <paths or patterns of similar tests in-repo>

## Behavior Contract

- System under test: <behavior being specified and tested>
- Trigger/input: <user action, API call, event, command, or state change>
- Collaborators: <dependencies that participate but do not own the behavior>
- Observable result: <output, state, artifact, UI, log, or side effect proving success>  <!-- each Contract Note bullet must project from this / Failure visibility -->
- Failure visibility: <where and how errors are visible>
- Forbidden shortcuts: <implementation paths that would violate intent>

## Architecture Impact

- Impact: required | not-applicable
- Trigger check: <for required, name the matched trigger; for not-applicable, explain why all triggers were checked and missed>
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/NNNN-slug.md` or `.rope/specs/<area>/<topic>.md`
    Decision status: active | superseded | deprecated | provisional | unknown
    Scope: <behavior and boundary covered>
    Decision disposition: inherit | extend | supersede | exception | not-applicable
    Inherited invariants:
      - <behavior or dependency invariant>
    Affected public interfaces: <seams or none>
    Forbidden shortcuts:
      - <lazy path that could pass shallow tests but violate intent>
    Required evidence: <test, integration check, review judgment, or document>
    Applies to: issue | Slice N | e2e | verify
    Documentation update: pending-finish | updated-existing | added-new | no-new-decision | exception-recorded
    Unresolved conflicts: <none or conflicting sources and affected behavior>
- New decision candidate: none | <scope, risk, and required decision/rationale>
- Constraint Bundle:
  - Decision sources: <IDs and paths>
  - Decision statuses: <source statuses>
  - Scope: <issue-wide and slice/e2e/verify mapping>
  - Invariants: <IDs or concise list>
  - Public seams: <confirmed seams>
  - Forbidden shortcuts: <IDs or concise list>
  - Acceptance evidence: <test, integration, review, or document evidence>
  - Open conflicts: <none or explicit conflicts>

## References

- Research: `.rope/research/<topic>.md#<anchor>`
- Spec: `.rope/specs/<area>/<topic>.md`
- ADR: `.rope/adr/NNNN-slug.md`

## Open Questions / Human Gates

- <question or gate>

## Gate Decisions

- Gate: <validation name>
- Decision: approved | skipped | user-run | blocked | not-run-waived
- Approved action: <action, not exact command; required for approved agent-with-gate>
- Scope: <repo/env/resource boundary>
- Risk: <why this needs a gate>
- Pass criteria: <observable success condition>
- Failure report: <what the user or agent should report on failure>
- Forbidden out-of-scope actions: <actions that require renewed approval>
```

## `tasks.md`

```md
# <Issue Title> Tasks

Execution mode: worktree | shared   # probed at shape (ADR 0012); go consumes, may degrade with recorded reason

## Behavior Matrix (issue behavior spec — BDD)

| Behavior (Given/When/Then where it helps) | Applies? | Verified at |
| --- | --- | --- |
| Primary path | yes/no | ticket TDD / end-of-issue review |
| Alternate input or entrypoint | yes/no | ticket TDD / review |
| Empty or missing input | yes/no | ticket TDD |
| Invalid or malformed input | yes/no | ticket TDD |
| Unavailable or not-ready dependency | yes/no | ticket TDD |
| Duplicate or idempotent case | yes/no | ticket TDD |
| Boundary or limit case | yes/no | ticket TDD |
| Existing behavior compatibility | yes/no | review |
| Real-entrypoint behavior (real API/env semantics) | yes/no | e2e.md + review probe |

## Slice 1: <Title>

- Status: pending
- Kind: vertical | contract | wide-refactor-expand | wide-refactor-migrate | wide-refactor-contract
- Goal: <user-perspective end-to-end result this slice makes true — not a layer list>
- Demo path: <the behavior you can demo when this slice lands — never a layer name>
- Blocked by: none | Slice N, … (<each edge labeled: file-overlap | seam-required | methodology-order>)
- Scope: <path/area bounds; disjoint from sibling slices when parallel/dynamic>
- Owned files: <explicit files this slice owns; unique within a shared-mode wave — in recorded worktree mode overlap is legal and expressed by a file-overlap edge (ADR 0012)>
- Size cap: <default ~400 diff lines or ~4 owned files; exceeded ⇒ split>
- Matrix rows:
- Constraint IDs: <decision/invariant IDs owned by this slice>
- Required evidence: <evidence for those IDs — each entry cites the matrix row(s) it proves; a matrix row with no slice evidence is a shape defect>
- Public behavior: <one user-visible sentence of what works when this slice is done>
- Tests:
- Implementation notes:
- Verification: <focused seam tests + guards this slice can affect — never a full-suite run (ADR 0013)>
- Stop conditions:
```

Size cap is universal (fresh-context fit); slices that cannot fit are re-cut
at shape, never shipped oversized.

`Verification` granularity (ADR 0013): default is **focused** — the seam
tests and guards the slice can affect, seconds not minutes. The full
suite is an **issue-level** gate (go baseline fallback, end-of-issue
assembly); writing it into a slice makes every leaf pay for the whole
issue. A behavior-preservation refactor that needs the full net records
the reason in Testing Decisions and the net runs at issue level, not per
slice.

## `e2e.md`

```md
# <Issue Title> E2E

## E1 <Validation Name>

Architecture evidence: <constraint/decision IDs and the behavior or invariant this validates>
Executor: agent | agent-with-gate | user | not-run
Risk: local-readonly | local-write | remote-readonly | remote-write | production | human-judgment
Gate Decision: not-required | approved | skipped | user-run | blocked | not-run-waived
Approved Action: <action, not exact command; required for approved agent-with-gate>
Scope: <repo/env/resource boundary>
Command or Steps:
- <command or step>
Pass Criteria:
- <observable pass condition>
Failure Report:
- <what to capture or report if it fails>
Forbidden Out-of-Scope Actions:
- <actions requiring renewed approval>
Result:
- pending
```
