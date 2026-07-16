# Rope Leaf Role Schema

Shared across harness writers. Parent/session role is **not** a preset row.

## Roles

| Role key | Agent name | Job | Default tools (pi) | Default thinking |
| --- | --- | --- | --- | --- |
| `implementer` | `rope-implementer` | Write, test, commit one unit of work from a self-contained brief | full write set: read, bash, edit, write, grep, find, ls (+ host equivalents) | `medium` |
| `reviewer` | `rope-reviewer` | Read-only critique of a finished unit; verdict only | read-only: read, bash, grep, find, ls | `high` |
| `explore` | `rope-explore` | Read-only fact gathering / codebase navigation | read-only: read, bash, grep, find, ls | `low` |
| `verify-inspector` | `rope-verify-inspector` | Mechanical issue-level inspection for verify (matrix/E2E/diff facts) | read-only: read, bash, grep, find, ls | `medium` |

## Shared leaf rules

1. Receive a self-contained brief + artifact paths + acceptance criteria.
2. Return a **short** summary plus paths/status only — not full traces.
3. **Must not spawn other agents / subagents.** No nested orchestration.
4. Do not expand scope beyond the brief.
5. Prefer filesystem artifacts (issue package, git) over chat history.

## Parent override

Presets pin default `model` + `thinking` (effort). The parent orchestrator may
override either field at spawn when risk warrants. Hosts that ignore per-agent
effort simply drop the field. Leaves do not self-pick effort as the primary
strategy.

## Naming

Harness-native agent type names are exactly:

- `rope-implementer`
- `rope-reviewer`
- `rope-explore`
- `rope-verify-inspector`

Spawn example (pi / pi-subagents):

```text
Agent({ subagent_type: "rope-implementer", prompt: "<brief>" })
```
