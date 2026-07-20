---
name: rope-grill
description: Grills a requirement against .rope docs to a shape-ready Behavior Contract with shared understanding. Use when clarifying a feature before slices, or the user says grill / 拷问需求 / 澄清后再 shape.
---

# Rope Grill

Parent Orchestrator interview: judgment-primary, **context-protective**. One
decision at a time; look up facts before asking.

Doc formats: [references/doc-formats.md](references/doc-formats.md).  
Interview habits (fact vs decision, domain discipline, scenarios, checklist):
[references/grilling.md](references/grilling.md).

## Inputs

When present: `.rope/CONTEXT.md`, `routes.md`, relevant `adr/`, `research/`,
`specs/`, and code named by routes.

## Context-protective parent

1. Explore leaf for polluting investigation (`rope-explore` or soft-degrade).
2. Crystallize confirmed decisions into `.rope/` immediately (chat dies on compact).
3. Read leaf summaries + paths, not full traces.
4. Never ask a leaf to spawn a leaf.

## Workflow

1. Restate target and suspected ambiguity.
2. Resolve **facts** (code/docs/libs) before questions; see grilling.md.
3. Apply **domain discipline** (glossary, fuzzy terms, code contradictions).
4. Resolve **Behavior Contract** six fields (grilling.md).
5. Ask one **product/design-first** decision at a time with a recommended answer;
   walk the decision tree (blockers first); plain language + concrete example.
6. Keep the loop moving: answer digressions, restate until confirmed, then next
   unblocked question — do not wait for “continue” unless the user pauses.
7. Stress-test scenarios (primary / failure visibility / forbidden shortcut).
8. Write CONTEXT / ADR / research / specs as decisions land (ADR three-tests).
9. **Shared-understanding gate:** recap 3–6 bullets; user confirms before shape.
   Do not write the issue package until confirm (unless they said “直接 shape”).
10. **Done when** grilling.md Ready checklist holds + user confirm. Else list blockers.
11. Handoff shape in-session by default; cross-window paste only if user switches
    sessions. Inline shape: summary then nod before commit.

## Guardrails

- No feature implementation code; no issue package before step 9 confirm.
- No answerable uncertainty as an “implementation branch.”
- No product decisions only in chat — write `.rope/`.
- Schema, dependency, auth, deploy, destructive FS/git, prod/shared → human gate.
