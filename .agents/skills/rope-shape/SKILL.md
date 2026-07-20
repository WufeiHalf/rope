---
name: rope-shape
description: Shapes a clarified requirement into a .rope issue package (PRD, slices, matrix, E2E). Use after rope-grill or when the user wants shape / 出 PRD / 拆切片 under .rope/issues.
---

# Rope Shape

Parent Orchestrator: turn a clarified requirement into an **issue package**
(`.rope/issues/<slug>/{prd,tasks,e2e}.md`). Not a `.rope/specs/` architecture
doc — keep **issue / PRD / slice** vocabulary.

Templates: [references/issue-package.md](references/issue-package.md).  
E2E classes, gates, vocab, wide-refactor: [references/gates-and-vocab.md](references/gates-and-vocab.md).

Default handoff: same-session `rope-go`.

## Workflow

1. Read CONTEXT, routes, relevant adr/research/**specs** (architecture, not PRD).
2. Inspect only enough for public interfaces and verification **seams** (explore leaf if wide).
3. **Confirm seams** with the user (prefer existing high seams; fewer better)
   before writing the package, unless already fixed in grill.
4. **Slice outline quiz:** title, user-visible delivery, `Blocked by`, matrix
   rows, review hint → iterate until approved → then write full files.
5. Write `prd.md` (problem/solution, goals/non-goals, Behavior Contract, public
   behavior, **Testing Decisions**, refs, gates).
6. Behavior Matrix in prd or tasks; N/A rows need a reason.
7. `tasks.md` vertical **slices**: complete path each; matrix rows; **Blocked by**;
   **Public behavior** one user sentence; tests; review mode. Wide refactor →
   expand–contract (gates-and-vocab.md).
8. `e2e.md` every item classified; resolve non-agent gates at shape time.
9. User confirms PRD + gates → commit package.
10. **Done when** package committed and gates decided. Handoff go in-session
    (issue path + commit); cross-window only if user switches sessions.

## Guardrails

- No feature code; no ready mark if Contract/seams/facts are open.
- No stale file-by-file plans in PRD — public interfaces and seams only.
- Do not call the PRD a “spec” or slices “tickets” in written artifacts.
