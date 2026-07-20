# Rope Issue Package Template

## Directory

```text
.rope/issues/<issue-slug>/
  prd.md
  tasks.md
  e2e.md
```

## `prd.md`

```md
# <Issue Title>

## Problem Statement

<User-facing problem.>

## Solution

<User-facing solution.>

## Goals

- <goal>

## Non-goals

- <non-goal>

## Public Interface / Behavior

- <callable API, UI behavior, CLI, config, schema, side effect, or observable result>

## Testing Decisions

- Good test: observe external behavior at agreed seams — not implementation details
- Seams under test: <list confirmed with user during shape>
- Prior art (optional): <paths or patterns of similar tests in-repo>

## Behavior Contract

- System under test: <behavior being specified and tested>
- Trigger/input: <user action, API call, event, command, or state change>
- Collaborators: <dependencies that participate but do not own the behavior>
- Observable result: <output, state, artifact, UI, log, or side effect proving success>
- Failure visibility: <where and how errors are visible>
- Forbidden shortcuts: <implementation paths that would violate intent>

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

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes/no | <test/smoke/slice> |
| Alternate input or entrypoint | yes/no | <test/smoke/slice> |
| Empty or missing input | yes/no | <test/smoke/slice> |
| Invalid or malformed input | yes/no | <test/smoke/slice> |
| Unavailable or not-ready dependency | yes/no | <test/smoke/slice> |
| Duplicate or idempotent case | yes/no | <test/smoke/slice> |
| Boundary or limit case | yes/no | <test/smoke/slice> |
| Existing behavior compatibility | yes/no | <test/smoke/slice> |
| Real entrypoint or integration path | yes/no | <test/smoke/slice> |

## Slice 1: <Title>

- Status: pending
- Kind: vertical | wide-refactor-expand | wide-refactor-migrate | wide-refactor-contract
- Goal: <user-perspective end-to-end result this slice makes true — not a layer list>
- Blocked by: none | Slice N, …
- Scope: <path/area bounds; for parallel frontier, non-overlap with sibling slices>
- Matrix rows:
- Public behavior: <one user-visible sentence of what works when this slice is done>
- Tests:
- Implementation notes:
- Verification:
- Review: required | self-check
- Review reason:
- Stop conditions:
```

## `e2e.md`

```md
# <Issue Title> E2E

## E1 <Validation Name>

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
