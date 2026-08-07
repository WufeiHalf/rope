---
name: rope-finish
description: Closes a .rope issue after go, verify, E2E, and confirmed architecture documentation outcomes are terminal. Invoke by name when the user wants to close the issue.
disable-model-invocation: true
---

# Rope Finish

Close out a Rope issue package. This skill does not implement new functionality.

For final status checks and reusable lesson routing, read [references/finish-checklist.md](references/finish-checklist.md).
Architecture continuity fields: [../rope-shape/references/architecture-continuity.md](../rope-shape/references/architecture-continuity.md).

## Preconditions

- `.rope/issues/<issue>/prd.md`, `tasks.md`, and `e2e.md` exist.
- `.rope/issues/<issue>/verify.md` exists with `Verdict: PASS`, **or** the user explicitly waives issue-level verify.
- All slices are completed or explicitly waived by the user.
- Reviews are passed or explicitly waived.
- Every E2E item has a terminal status:
  - agent executed and passed
  - user confirmed
  - explicitly waived
  - blocked with reason
  - not-run with reason
- New packages contain Architecture Impact. A confirmed `pending-finish` outcome
  is allowed as finish input; finish must replace it with a terminal documentation
  outcome. Legacy packages record the compatibility marker before closeout.

## Workflow

1. Read the issue package and referenced `.rope/` docs.
2. Confirm no new development is needed.
3. Check git status and recent commits.
4. Update issue docs only if they are missing final status, E2E outcome, commit summary,
   or Architecture Impact documentation outcome.
5. If Architecture Impact contains a confirmed `pending-finish` outcome, route the
   change through the existing `.rope/` homes and write the canonical update directly;
   do not ask again. Replace `pending-finish` with `updated-existing`, `added-new`,
   `no-new-decision`, or `exception-recorded` and record the path/reason.
6. If final behavior reveals an architecture change that was not confirmed by
   shape or a later parent decision, pause for human/parent disposition before
   writing or closing. Do not invent an exception.
7. If reusable lessons were learned:
   - update `.rope/specs/` for implementation contracts or gotchas
   - update `.rope/research/` for external facts
   - update `.rope/CONTEXT.md` for stable project terms
   - update `.rope/adr/` for hard-to-reverse decisions
8. Commit final doc updates if any were made.
9. Report final status, terminal documentation outcome, and remaining blocked/user-only validation, if any.

## Guardrails

- Do not archive, delete, push, merge, rebase, or clean worktrees unless the user explicitly asks.
- Do not invent successful E2E results.
- Do not force user validation when all required E2E was agent-executable and passed.
