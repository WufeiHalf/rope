---
name: rope-grill
description: Runs a grill-with-docs style requirements discussion against .rope docs, resolving terms, decisions, external facts, and reusable implementation contracts. Use when stress-testing a feature idea, clarifying requirements, or updating .rope/CONTEXT.md, .rope/adr, .rope/research, or .rope/specs before shaping issues.
---

# Rope Grill

Discuss one requirement deeply before implementation. Ask one decision question at a time, but first inspect code or primary sources when they can answer the question.

For document formats, read [references/doc-formats.md](references/doc-formats.md) before editing `.rope/CONTEXT.md`, `.rope/adr/`, `.rope/research/`, or `.rope/specs/`.

## Inputs

Read these when present:
- `.rope/CONTEXT.md`
- `.rope/routes.md`
- relevant `.rope/adr/*.md`
- relevant `.rope/research/*.md`
- relevant `.rope/specs/**/*.md`
- nearby code and tests named by `.rope/routes.md`

## Workflow

1. Restate the target and suspected ambiguity.
2. Check answerable facts before asking:
   - repo code/tests/docs for codebase facts
   - official docs or primary sources for external API/platform facts
3. Challenge vocabulary against `.rope/CONTEXT.md`.
4. Ask one decision question at a time with a recommended answer.
5. Stress-test concrete scenarios and edge cases.
6. Update docs inline as decisions crystallize:
   - resolved project term -> `.rope/CONTEXT.md`
   - hard-to-reverse surprising tradeoff -> `.rope/adr/NNNN-slug.md`
   - external or platform fact -> `.rope/research/<topic>.md`
   - reusable implementation contract or gotcha -> `.rope/specs/<area>/<topic>.md`
7. Stop when `rope-shape` can write a PRD, vertical slices, and E2E plan without hidden ambiguity.

## Document Boundaries

- `CONTEXT.md` is a glossary only. No implementation steps.
- ADRs record why a durable architecture decision was made. Keep them short.
- Research records verified external facts, with source and implication.
- Specs record stable implementation contracts, not transient code maps.
- Current code facts should normally be checked live instead of stored, unless they become a reusable contract or gotcha.

## Guardrails

- Do not write feature implementation code.
- Do not create issues; use `rope-shape` for that.
- Do not present answerable uncertainty as an implementation branch.
- If a decision touches schema, dependency, auth, deployment, destructive git/filesystem, or production/shared environment, stop and mark it as a human gate.
