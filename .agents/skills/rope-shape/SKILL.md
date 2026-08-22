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
   Seed `<issue>/map.md` from what exploration learned — one fact per line, each
   with a file path and a date. Later leaves read the map for orientation and
   update the lines they falsify.
3. Run the conditional Architecture Impact trigger check. Record `required`, or
   `not-applicable` with the lightweight check. For `required`, list each source,
   status, disposition, invariant, forbidden shortcut, evidence, scope, and conflict.
   If no source is found, record a risk-reviewed New decision candidate.
4. **Confirm seams and architecture dispositions** with the user when a high-risk
   candidate, supersede, exception, or unresolved conflict needs a decision.
5. **Slice outline quiz:** title, user-visible delivery, `Blocked by`, matrix
   rows, constraint IDs, evidence → iterate until approved → then
   write full files.
6. Write `prd.md` (problem/solution, goals/non-goals, **Contract Note**, Behavior Contract, public
   behavior, **Testing Decisions**, Architecture Impact, full Constraint Bundle,
   refs, gates).
7. Behavior Matrix in prd or tasks; N/A rows need a reason.
8. `tasks.md` vertical **slices**: complete path each; matrix rows; `Blocked by`;
   **Public behavior** one user sentence; constraint IDs and evidence; tests.
   Every slice fits a **fresh context window** (default ~400 diff lines / ~4 owned
   files; exceeded ⇒ re-cut on the spot, and keep re-cutting until it fits).
   Wide refactor → expand–contract (gates-and-vocab.md).
9. **Read the graph, then ask one question.** From `Blocked by` edges derive
    **waves** (topological levels) and **rivers** (slice clusters with no edge,
    direct or transitive, between them). Show the graph with numbers: serial
    total vs longest river, wave count, size violations already re-cut. Then
    exactly one execution question:
    - two or more rivers ⇒ offer the **split** — each river its own issue, its
      own pipeline, deliverable alone — or one issue with the rivers running in
      parallel;
    - one chain ⇒ confirm the wave order and go.
    If re-cutting a slice to fit would bend the requirement, stop: take the
    specific misalignment **back to grill** — early grill is cheaper than late
    rework.
10. `e2e.md` every item classified; include architecture evidence and resolve
    non-agent gates at shape time.
11. **Contract Note gate:** output the `## Contract Note` from `prd.md` (3–5
    one-sentence bullets: “when this issue is done, what can you observe?” +
    failure visibility where relevant). The user confirms the note **instead of
    reading the full PRD**; confirming the note confirms the Behavior Contract,
    because the note is its direct human projection — not a separate wish list.
    Then confirm architecture decisions + gates → commit package.
12. **Done when** package committed, every impact entry has a disposition or
    recorded blocker, and gates are decided. Handoff go in-session
    (issue path + commit); cross-window only if user switches sessions.

## Guardrails

- No feature code; no ready mark if Contract, seams, architecture dispositions,
  conflicts, or facts are open.
- `not-applicable` requires its trigger-check record; it is not a missing section.
- Do not mark a high-risk New decision candidate ready without a decision.
- Do not ask serial-or-parallel before the slice graph exists; the graph answers
  it (step 9), with numbers.
- Do not merge rivers into one slice to dodge the split question.
- Fresh-context fit is an iron rule for every slice, not advice.
- No stale file-by-file plans in PRD — public interfaces and seams only.
- Do not call the PRD a “spec” or slices “tickets” in written artifacts.
- Contract Note must be 3–5 bullets derived from Behavior Contract fields
  (Observable result / Failure visibility / boundary), never a second contract
  that can drift from the PRD.
- Do not ask the user to read the full PRD by default; step 11 confirms the
  Contract Note. Full-PRD review is opt-in.
