# Plan Artifact Reader Layering Tasks

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes | read: ADR 0005 + spec + skill updates present |
| Alternate input or entrypoint | no | docs-only change, no alternate entrypoint |
| Empty or missing input | no | n/a |
| Invalid or malformed input | no | n/a |
| Unavailable or not-ready dependency | no | n/a |
| Duplicate or idempotent case | no | n/a |
| Boundary or limit case | yes | line cap ≤60 specified in execution-rules |
| Existing behavior compatibility | yes | ADR 0004 by-reference + review modes unchanged |
| Real entrypoint or integration path | yes | `.agents/skills` mirror synced with `skills/` |

## Slice 1: Reader layering docs + skill updates

- Status: done
- Kind: docs-only
- Goal: Rope docs/skills express reader layering, Contract Note, and the
  Minimal Leaf Brief budget.
- Blocked by: none
- Scope: `.rope/adr/`, `.rope/specs/`, `.rope/CONTEXT.md`, `.rope/routes.md`,
  `README.md`, `skills/rope-shape`, `skills/rope-go`, `skills/rope-grill`,
  `.agents/skills` mirrors
- Owned files: see git status at close
- Size cap: n/a (docs-only)
- Matrix rows: Primary, Boundary, Existing compatibility, Real entrypoint
- Constraint IDs: D4 (ADR 0004, extend)
- Required evidence: files present with new sections
- Public behavior: shape confirms Contract Note; briefs follow allowlist + line
  cap; ADR 0005 exists.
- Tests:
  - `test -f .rope/adr/0005-plan-artifact-reader-layering.md`
  - `test -f .rope/specs/plan-artifact-reader-layering.md`
  - grep `## Contract Note` in skills/rope-shape/references/issue-package.md
  - grep `Leaf Brief Contract (hard budget)` and `60` in
    skills/rope-go/references/execution-rules.md
  - grep `Contract Note` in .rope/CONTEXT.md and skills/rope-shape/SKILL.md
  - diff -rq skills .agents/skills (only upstream-harvest extra)
- Implementation notes: done directly in parent session (no subagents).
- Verification: agent_passed (see e2e E1)
- Review: self-check
- Review reason: docs-only, no code behavior
- Stop conditions: n/a