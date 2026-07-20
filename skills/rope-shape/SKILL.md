---
name: rope-shape
description: Shapes a clarified requirement into a .rope issue package with PRD, vertical slices, behavior matrix, E2E execution classification, and references. Use after rope-grill or when converting discussion into local markdown work under .rope/issues — shape, 出 PRD, 拆切片.
---

# Rope Shape

Turn a clarified requirement into an executable **issue package** under
`.rope/issues/` (PRD + tasks + e2e). This is **not** a `.rope/specs/` document:
in Rope, **spec** means durable architecture/implementation contracts (Trellis
heritage). Upstream “to-spec / to-tickets” ideas are absorbed as **kernel
habits** only; keep Rope vocabulary: **issue**, **PRD**, **slice**, **spec/ADR**
as separate layers.

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

1. Read `.rope/CONTEXT.md`, `.rope/routes.md`, relevant `.rope/adr/`,
   `.rope/research/`, and `.rope/specs/` (architecture contracts — not the issue PRD).
2. Inspect code/tests only enough to choose real public interfaces and
   **verification seams**. Prefer an explore leaf for wide surveys
   (context-protective parent).
3. **Confirm seams before writing the package (S1):**
   - Propose the seams to test at (prefer existing public boundaries; highest
     useful seam; fewer is better).
   - State why these seams, and what you will **not** test at (internals).
   - Wait for user confirmation (or explicit “按你提的 seams 写”).
   - Do not fill `prd.md` / full `tasks.md` until seams are accepted unless the
     user already fixed seams in grill.
4. **Slice outline quiz (S3), then full write:**
   - Present a numbered outline only: title, **user-visible delivery** (one
     sentence), `Blocked by`, matrix rows touched, review hint.
   - Ask: granularity OK? blocking edges OK? merge/split?
   - Iterate until the user approves the breakdown, **then** write full
     `tasks.md` / `prd.md` / `e2e.md`.
5. Write `prd.md` using the reference template:
   - problem statement / solution (user perspective)
   - goals / non-goals
   - Behavior Contract
   - public interface or user-visible behavior
   - **Testing Decisions** (short): good-test rule, confirmed seams, optional
     prior-art test paths in-repo — do not duplicate the whole matrix
   - research / **architecture** spec / ADR refs (`.rope/specs`, `.rope/adr`)
   - open questions and human gates
6. Write a Behavior Matrix in `prd.md` or `tasks.md` (rows as in the template);
   mark non-applicable rows with a short reason.
7. Write `tasks.md` as vertical **slices** (not tracker “tickets”):
   - each slice is a narrow **complete** path (demoable/verifiable alone)
   - each slice names matrix rows it covers
   - **Blocked by:** `none` or `Slice N, …` (S2) — dependency edges only
   - **Public behavior:** one user-perspective sentence of end-to-end result (S7);
     not a layer-by-layer implementation list
   - public-interface tests first; review mode `required` | `self-check` + reason
   - **Wide refactor exception (S4):** if the work is one mechanical change with
     huge blast radius (rename/retype shared symbol), do **not** fake vertical
     slices. Sequence **expand → migrate batch(es) → contract**; mark
     `Kind: wide-refactor` and set Blocked by along that chain. Prefer green
     batches; if batches cannot stay green alone, note a shared integration
     expectation in Stop conditions.
8. Write `e2e.md` with execution classification for every validation item:
   - `Executor: agent` | `agent-with-gate` | `user` | `not-run`
9. Resolve every non-agent validation before marking the package ready, per the
   E2E Executor Rules and Gate Approval Rules below: get the user's gate decision
   (approve / skip / user-run / not-run-waived) for each `agent-with-gate`,
   `user`, and `not-run` item during shaping.
10. After the user confirms the PRD and gate decisions, commit the issue package
    docs. Commit message is not prescribed.
11. Hand off to go as **Parent Orchestrator**:
    - **Default (same session):** after the docs commit, continue in this session
      as parent orchestrator running `rope-go`. Name the issue directory + commit
      hash. Do not emit a cross-window copy-paste prompt.
    - **Cross-window only when the user says so.**
    - Scheduling hint for go: slices with `Blocked by: none` (or all blockers
      done) form the **frontier**. Independent frontier slices **may** run in
      parallel when go allows; dependent slices stay serial. Shape must record
      honest Blocked by edges so go can schedule.

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

## Vocabulary (do not blur)

| Rope term | Means |
| --- | --- |
| **Issue package** | `.rope/issues/<slug>/{prd,tasks,e2e}.md` — work unit for go |
| **PRD** | Product/requirements view inside the issue (`prd.md`) |
| **Slice** | Vertical unit in `tasks.md` (upstream “ticket” kernel, Rope name) |
| **Spec** | `.rope/specs/**` architecture / implementation contracts — **not** the PRD |
| **ADR** | Hard-to-reverse architecture decision records |

## Guardrails

- Do not implement feature code.
- Do not create unrelated workflow task files or hooks.
- Do not mark work ready if the Behavior Contract is missing or ambiguous.
- Do not mark work ready if answerable facts remain unknown.
- Do not mark work ready if seams were never confirmed (unless user waived).
- Do not put stale file-by-file implementation plans into PRD; use stable public
  interfaces and verification seams.
- Do not rename Rope “issue/PRD/slice” to upstream “spec/ticket” in docs we write.
