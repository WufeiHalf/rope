---
name: rope-grill
description: Grills requirements against .rope docs to a shape-ready contract, including architecture impact and decision disposition. Use when clarifying a feature before slices or discussing ADR/spec inheritance.
---

# Rope Grill

Plain requirements interview. Internally this is a judgment-primary,
**context-protective** Parent Orchestrator workflow; with the user, speak in
simple product language.

Doc formats: [references/doc-formats.md](references/doc-formats.md).  
Interview habits (fact vs decision, domain discipline, scenarios, checklist):
[references/grilling.md](references/grilling.md).
Architecture continuity fields and dispositions:
[../rope-shape/references/architecture-continuity.md](../rope-shape/references/architecture-continuity.md).

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
2. Resolve **facts** (code/docs/libs) before asking the user — dispatch a
   background explore leaf for wide lookups; a running exploration delays only
   the questions downstream of it, never the round. See grilling.md.
3. Apply **domain discipline** (glossary, fuzzy terms, code contradictions).
4. Resolve **Behavior Contract** six fields (grilling.md).
5. Run a conditional architecture-impact check. Use targeted lookup through
   CONTEXT, routes, seams, and relevant ADR/spec paths; record `required`, or
   `not-applicable` with the lightweight trigger check. If a trigger is present,
   resolve each decision's disposition before shape.
6. Ask **product/design-first** decisions with a recommendation, plain language,
   and a concrete example, in **frontier rounds** (grilling.md): one numbered
   round for every decision whose prerequisites are settled; a decision that
   depends on an answer still open goes to a later round. Recompute the
   frontier after each round of answers.
7. When the host exposes `ask_user_question` or an equivalent structured tool,
   prefer it for batches and choices. If unavailable, use the same plain-text
   questions with recommendation, concrete scenario, and tradeoff; do not block.
8. Keep the loop moving: answer digressions, restate until confirmed, then next
   unblocked question — do not wait for “continue” unless the user pauses.
9. Stress-test scenarios (primary / failure visibility / forbidden shortcut).
10. Write CONTEXT / ADR / research / specs as decisions land (ADR three-tests).
11. **Shared-understanding gate:** recap 3–6 bullets; user confirms before shape.
    Do not write the issue package until confirm (unless they said “直接 shape”).
    Shape later projects this recap into a **Contract Note** for the final
    PRD confirmation (ADR 0005) — not a separate wish list, a human projection
    of the Behavior Contract.
12. **Done when** grilling.md Ready checklist holds + user confirm. Else list blockers.
13. Handoff shape in-session by default; cross-window paste only if user switches
    sessions. Inline shape: summary then nod before commit.

## Guardrails

- No feature implementation code; no issue package before step 9 confirm.
- No answerable uncertainty as an “implementation branch.”
- No product decisions only in chat — write `.rope/`.
- Schema, dependency, auth, deploy, destructive FS/git, prod/shared → human gate.
