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

1. **Decide workflow mode:** ask the user whether dynamic mode is wanted for this
   issue. If yes: record `mode: dynamic` in the issue package and enforce the
   three-piece slice discipline below (contract slice first, implementation
   slices with disjoint file ownership, per-slice size cap, trailing integration
   slice). If no: record `mode: serial` — behavior unchanged (serial is the
   default).
2. Read CONTEXT, routes, the architecture-continuity reference, and relevant
   adr/research/**specs** (architecture, not PRD).
3. Inspect only enough for public interfaces and verification **seams** (explore leaf if wide).
4. Run the conditional Architecture Impact trigger check. Record `required`, or
   `not-applicable` with the lightweight check. For `required`, list each source,
   status, disposition, invariant, forbidden shortcut, evidence, scope, and conflict.
   If no source is found, record a risk-reviewed New decision candidate.
5. **Confirm seams and architecture dispositions** with the user when a high-risk
   candidate, supersede, exception, or unresolved conflict needs a decision.
6. **Slice outline quiz:** title, user-visible delivery, `Blocked by`, matrix
   rows, constraint IDs, evidence, review hint → iterate until approved → then
   write full files.
7. Write `prd.md` (problem/solution, goals/non-goals, Behavior Contract, public
   behavior, **Testing Decisions**, Architecture Impact, full Constraint Bundle,
   refs, gates).
8. Behavior Matrix in prd or tasks; N/A rows need a reason.
9. `tasks.md` vertical **slices**: complete path each; matrix rows; `Blocked by`;
   **Public behavior** one user sentence; constraint IDs and evidence; tests;
   review mode. Wide refactor → expand–contract (gates-and-vocab.md).
   When `mode: dynamic`, enforce the three-piece slice discipline:
   - a **contract slice** (`kind: contract`, `Blocked by: none`, first) that
     defines interfaces / data structures / call boundaries only — no feature
     implementation;
   - implementation slices with **disjoint** `Scope` / `owned_files` — one core
     file owned by multiple slices is a shape defect (split or serialize), not a
     go problem;
   - a per-slice **size cap** (default ~400 diff lines / ~4 owned files;
     exceeded ⇒ must split);
   - a trailing **serial integration slice** that wires the module slices into
     the main entrypoint and verifies contract alignment.
10. `e2e.md` every item classified; include architecture evidence and resolve
    non-agent gates at shape time.
11. User confirms PRD + architecture decisions + gates → commit package.
12. **Done when** package committed, every impact entry has a disposition or
    recorded blocker, and gates are decided. Handoff go in-session
    (issue path + commit); cross-window only if user switches sessions.

## Guardrails

- No feature code; no ready mark if Contract, seams, architecture dispositions,
  conflicts, or facts are open.
- `not-applicable` requires its trigger-check record; it is not a missing section.
- Do not mark a high-risk New decision candidate ready without a decision.
- Do not auto-detect dynamic mode; it is a manual, shape-time user decision —
  `mode` stays `serial` unless the user opts in.
- No stale file-by-file plans in PRD — public interfaces and seams only.
- Do not call the PRD a “spec” or slices “tickets” in written artifacts.
