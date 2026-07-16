---
name: rope-shape
description: Shapes a clarified requirement into a .rope issue package with PRD, vertical slices, behavior matrix, E2E execution classification, and references. Use after rope-grill or when converting discussion into local markdown work under .rope/issues.
---

# Rope Shape

Turn a clarified requirement into an executable local issue package.

The shape session continues as **Parent Orchestrator**. After the package is
ready, default handoff is same-session `rope-go` (parent owns the slice loop),
not a dual-window paste.

For concrete `prd.md`, `tasks.md`, and `e2e.md` templates, read
[references/issue-package.md](references/issue-package.md).

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
2. Inspect code/tests only enough to choose real public interfaces and verification seams. Prefer an explore leaf for wide surveys (context-protective parent).
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
7. Resolve every non-agent validation before marking the package ready, per the E2E Executor Rules and Gate Approval Rules below: get the user's gate decision (approve / skip / user-run / not-run-waived) for each `agent-with-gate`, `user`, and `not-run` item during shaping.
8. After the user confirms the PRD and gate decisions, commit the issue package docs. Commit message is not prescribed.
9. Hand off to go as **Parent Orchestrator**:
   - **Default (same session):** after the docs commit, continue in this session as parent orchestrator running `rope-go` (spawn implementer/reviewer leaves per go skill). Name the issue directory + commit hash. Do not emit a cross-window copy-paste prompt.
   - **Cross-window only when the user says so:** only when the user signals switching sessions for go (host cannot spawn workers, user wants a dedicated cheap session, etc.) emit a `Next recommended step` block with a copy-paste prompt naming the issue directory and asking `rope-go` to execute it. That top-level go session still acts as Parent Orchestrator for the slice loop.
   - If not ready, list blockers instead of moving to go.

## E2E Executor Rules

- `agent`: local tests, deterministic fixture smoke, read-only HTTP checks, dry-run commands, safe CLI validation. Rope-go must execute these.
- `agent-with-gate`: service restart, deploy, production/shared write, external write API, destructive or expensive command. Shape must get user approval for the action before handoff to rope-go.
- `user`: visual judgment, business acceptance, unavailable credentials, 2FA, private UI session, or environment unreachable to the agent. Use only when real human validation is required.
- `not-run`: explicitly out of scope or blocked; include reason and user-accepted waiver.

## Gate Approval Rules

- Shape approves actions, not exact commands. Example: `restart local dev server`, not `npm run dev`.
- Each approved action must include scope, risk, pass criteria, and forbidden out-of-scope actions.
- Rope-go may choose concrete commands to perform the approved action without asking again.
- Rope-go must ask again only if the action, scope, risk, environment, or target resource changes.
- If the user skips an `agent-with-gate` action during shaping, rope-go must not execute it and must record `skipped_by_user_at_shape`.

## Guardrails

- Do not implement code.
- Do not create unrelated workflow task files or hooks.
- Do not mark work ready if the Behavior Contract is missing or ambiguous.
- Do not mark work ready if answerable facts remain unknown.
- Do not put stale file-by-file implementation plans into PRD; use stable public interfaces and verification seams.
