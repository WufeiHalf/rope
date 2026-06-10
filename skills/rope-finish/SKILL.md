---
name: rope-finish
description: Finalizes a .rope issue after rope-go has completed slices, reviews, and classified E2E outcomes. Use when development is done and the user wants to close the local rope issue.
---

# Rope Finish

Close out a Rope issue package. This skill does not implement new functionality.

For final status checks and reusable lesson routing, read [references/finish-checklist.md](references/finish-checklist.md).

## Preconditions

- `.rope/issues/<issue>/prd.md`, `tasks.md`, and `e2e.md` exist.
- All slices are completed or explicitly waived by the user.
- Reviews are passed or explicitly waived.
- Every E2E item has a terminal status:
  - agent executed and passed
  - user confirmed
  - explicitly waived
  - blocked with reason
  - not-run with reason

## Workflow

1. Read the issue package and referenced `.rope/` docs.
2. Confirm no new development is needed.
3. Check git status and recent commits.
4. Update issue docs only if they are missing final status, E2E outcome, or commit summary.
5. If reusable lessons were learned:
   - update `.rope/specs/` for implementation contracts or gotchas
   - update `.rope/research/` for external facts
   - update `.rope/CONTEXT.md` for stable project terms
   - update `.rope/adr/` for hard-to-reverse decisions
6. Commit final doc updates if any were made.
7. Report final status and remaining blocked/user-only validation, if any.

## Guardrails

- Do not archive, delete, push, merge, rebase, or clean worktrees unless the user explicitly asks.
- Do not invent successful E2E results.
- Do not force user validation when all required E2E was agent-executable and passed.
