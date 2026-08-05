---
name: rope-shape
description: Shapes clarified requirements into a .rope issue package with PRD, slices, matrix, E2E, Architecture Impact, and a Constraint Bundle. Use after rope-grill or when the user wants shape / 出 PRD / 拆切片 under .rope/issues.
---

# Rope Shape

Parent Orchestrator: turn a clarified requirement into an **issue package**
(`.rope/issues/<slug>/{prd,tasks,e2e}.md`). Not a `.rope/specs/` architecture
doc — keep **issue / PRD / slice** vocabulary.

Templates: [references/issue-package.md](references/issue-package.md).
Architecture impact and Constraint Bundle: [references/architecture-continuity.md](references/architecture-continuity.md).
E2E classes, gates, vocab, wide-refactor: [references/gates-and-vocab.md](references/gates-and-vocab.md).

Default handoff: same-session `rope-go`.

## Workflow

1. Read CONTEXT, routes, the architecture-continuity reference, and relevant
   adr/research/**specs** (architecture, not PRD).
2. Inspect only enough for public interfaces and verification **seams** (explore leaf if wide).
3. Run the conditional Architecture Impact trigger check. Record `required`, or
   `not-applicable` with the lightweight check. For `required`, list each source,
   status, disposition, invariant, forbidden shortcut, evidence, scope, and conflict.
   If no source is found, record a risk-reviewed New decision candidate.
4. **Confirm seams and architecture dispositions** with the user when a high-risk
   candidate, supersede, exception, or unresolved conflict needs a decision.
5. **Slice outline quiz:** title, user-visible delivery, `Blocked by`, matrix
   rows, constraint IDs, evidence, review hint → iterate until approved → then
   write full files.
6. Write `prd.md` (problem/solution, goals/non-goals, Behavior Contract, public
   behavior, **Testing Decisions**, Architecture Impact, full Constraint Bundle,
   refs, gates).
7. Behavior Matrix in prd or tasks; N/A rows need a reason.
8. `tasks.md` vertical **slices**: complete path each; matrix rows; `Blocked by`;
   **Public behavior** one user sentence; constraint IDs and evidence; tests;
   review mode. Wide refactor → expand–contract (gates-and-vocab.md).
9. `e2e.md` every item classified; include architecture evidence and resolve
   non-agent gates at shape time.
10. User confirms PRD + architecture decisions + gates → commit package.
11. **Done when** package committed, every impact entry has a disposition or
    recorded blocker, and gates are decided. Handoff go in-session
    (issue path + commit); cross-window only if user switches sessions.

## Guardrails

- No feature code; no ready mark if Contract, seams, architecture dispositions,
  conflicts, or facts are open.
- `not-applicable` requires its trigger-check record; it is not a missing section.
- Do not mark a high-risk New decision candidate ready without a decision.
- No stale file-by-file plans in PRD — public interfaces and seams only.
- Do not call the PRD a “spec” or slices “tickets” in written artifacts.
