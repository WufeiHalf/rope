---
name: rope-shape
description: Shapes a clarified requirement into a .rope issue package with PRD, vertical slices, behavior matrix, E2E execution classification, and references. Use after rope-grill or when converting discussion into local markdown work under .rope/issues.
---

# Rope Shape

Turn a clarified requirement into an executable local issue package.

For concrete `prd.md`, `tasks.md`, and `e2e.md` templates, read [references/issue-package.md](references/issue-package.md).

## Required Output

Create or update:

```text
.rope/issues/<issue-slug>/
  prd.md
  tasks.md
  e2e.md
```

## Workflow

1. Read `.rope/CONTEXT.md`, `.rope/routes.md`, relevant `.rope/adr/`, `.rope/research/`, and `.rope/specs/`.
2. Inspect code/tests only enough to choose real public interfaces and verification seams.
3. Write `prd.md` using the reference template:
   - problem statement
   - solution
   - goals / non-goals
   - Behavior Contract
   - public interface or user-visible behavior
   - research/spec/ADR refs
   - open questions and human gates
4. Write a Behavior Matrix in `prd.md` or `tasks.md`:
   - primary path
   - alternate input or entrypoint
   - empty/missing input
   - invalid/malformed input
   - unavailable/not-ready dependency
   - duplicate/idempotent case
   - boundary/limit case
   - existing behavior compatibility
   - real entrypoint or integration path
   - mark non-applicable rows with a short reason
5. Write `tasks.md` as vertical slices using the reference template:
   - each slice delivers a narrow complete behavior
   - each slice names matrix rows it covers
   - each slice defines public-interface tests first
   - mark review mode: `required` or `self-check`, with reason
6. Write `e2e.md` with execution classification for every validation item:
   - `Executor: agent`
   - `Executor: agent-with-gate`
   - `Executor: user`
   - `Executor: not-run`

## E2E Executor Rules

- `agent`: local tests, deterministic fixture smoke, read-only HTTP checks, dry-run commands, safe CLI validation. Rope-go must execute these.
- `agent-with-gate`: service restart, deploy, production/shared write, external write API, destructive or expensive command. Rope-go must ask before executing.
- `user`: visual judgment, business acceptance, unavailable credentials, 2FA, private UI session, or environment unreachable to the agent.
- `not-run`: explicitly out of scope or blocked; include reason.

## Guardrails

- Do not implement code.
- Do not create unrelated workflow task files or hooks.
- Do not mark work ready if the Behavior Contract is missing or ambiguous.
- Do not mark work ready if answerable facts remain unknown.
- Do not put stale file-by-file implementation plans into PRD; use stable public interfaces and verification seams.
