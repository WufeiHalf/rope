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
4. Resolve the Behavior Contract before shaping:
   - System under test: what behavior is being specified and tested?
   - Trigger/input: what user action, API call, event, command, or state change starts it?
   - Collaborators: what dependencies participate without owning the behavior?
   - Observable result: what output, state, artifact, UI, log, or side effect proves success?
   - Failure visibility: where and how are errors observable?
   - Forbidden shortcuts: what implementation paths would satisfy tests but violate intent?
5. Ask one decision question at a time with a recommended answer.
6. Keep the clarification loop moving:
   - if the user asks for rationale, examples, or discussion of a point, answer it first
   - if the current decision is still unresolved, restate the recommended answer and ask for confirmation
   - if the current decision is confirmed, immediately ask the next highest-priority decision question
   - do not stop after explanation and wait for the user to say `continue`, unless the user explicitly pauses or asks to stay on the topic
7. Stress-test concrete scenarios and edge cases against the Behavior Contract.
8. Update docs inline as decisions crystallize:
   - resolved project term -> `.rope/CONTEXT.md`
   - hard-to-reverse surprising tradeoff -> `.rope/adr/NNNN-slug.md`
   - external or platform fact -> `.rope/research/<topic>.md`
   - reusable implementation contract or gotcha -> `.rope/specs/<area>/<topic>.md`
9. Stop when `rope-shape` can write a PRD, Behavior Contract, vertical slices, and E2E plan without hidden ambiguity.
10. When stopping, provide `Next recommended step`:
   - recommended skill: `$rope-shape`
   - why the requirement is ready to shape
   - a copy-paste prompt that names the requirement and asks `rope-shape` to create the issue package
   - if not ready, list blockers instead of recommending the next skill

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
