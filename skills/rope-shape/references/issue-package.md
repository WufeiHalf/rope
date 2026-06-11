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
- Goal:
- Scope:
- Matrix rows:
- Public behavior:
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
Command or Steps:
- <command or step>
Pass Criteria:
- <observable pass condition>
Result:
- pending
```
