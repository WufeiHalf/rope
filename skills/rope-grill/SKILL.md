---
name: rope-grill
description: Grills a requirement against .rope docs to a shape-ready Behavior Contract with shared understanding. Use when clarifying a feature before slices, or the user says grill / 拷问需求 / 澄清后再 shape.
---

# Rope Grill

Plain requirements interview. Internally this is a judgment-primary,
**context-protective** Parent Orchestrator workflow; with the user, speak in
simple product language.

Doc formats: [references/doc-formats.md](references/doc-formats.md).  
Interview habits (fact vs decision, domain discipline, scenarios, checklist):
[references/grilling.md](references/grilling.md).

## Plain interview

Internal Rope terms are reasoning labels, not user language. Translate before
speaking: say “what behavior must we guarantee” before Behavior Contract, “where
the user sees the error” before failure visibility, and “a lazy implementation
that could still pass tests” before forbidden shortcut.

Every decision question must use this shape:

1. One plain-language question.
2. Recommended answer.
3. Concrete example of what the user would click, run, see, or receive.
4. Tradeoff if they choose the other option.

Completion criterion: the user can repeat the decision in their own words without
asking what a Rope term means. If they look confused, pause the workflow and
explain with a real scenario, not more framework language.

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
