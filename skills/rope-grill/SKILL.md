---
name: rope-grill
description: Grills a requirement against .rope docs until it can be shaped without hidden ambiguity — resolving terms, human gates, external facts (search mature libraries before reinventing), and reusable contracts. Use when stress-testing a feature idea or clarifying requirements before shaping slices.
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
   - **external libraries before reinventing**: when the requirement involves a capability with mature open-source solutions (compression, parsing, queues, caching, auth, encryption, image/PDF/video handling, etc.), search npm/pypi/GitHub popular packages, official recommended approaches, and existing `.rope/research/` **before** proposing a hand-rolled implementation. Do not reinvent the wheel when a mature dependency exists. Route verified external facts to `.rope/research/<topic>.md` and cite it in the PRD References. If outbound network is blocked, retry via the `http://127.0.0.1:8118` proxy (`curl -x http://127.0.0.1:8118 ...` or set the proxy in the web/search tool).
3. Challenge vocabulary against `.rope/CONTEXT.md`.
4. Resolve the Behavior Contract before shaping:
   - System under test: what behavior is being specified and tested?
   - Trigger/input: what user action, API call, event, command, or state change starts it?
   - Collaborators: what dependencies participate without owning the behavior?
   - Observable result: what output, state, artifact, UI, log, or side effect proves success?
   - Failure visibility: where and how are errors observable?
   - Forbidden shortcuts: what implementation paths would satisfy tests but violate intent?
5. Ask one decision question at a time with a recommended answer. Communication style:
   - use plain language, not jargon dumps; if one sentence is enough, do not use three
   - when a decision involves an abstract relationship or a boundary condition, pair it with a concrete scenario example — prefer the current issue's real scenario over a generic one
   - the recommended answer must be something the user can understand on first read, not something they have to ask you to rephrase
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
10. When stopping, hand off to shape:
   - **Default (inline):** grill and shape run in the same session. Once the requirement is ready, say you are moving into shape and start writing the issue package directly. Do not emit a cross-window copy-paste prompt.
   - **Cross-window only when the user says so:** only when the user's current message signals switching windows for shape (e.g. "I'll shape in another window", "shape later elsewhere") do you emit the `Next recommended step` block with a copy-paste prompt naming the requirement and asking `rope-shape` to create the issue package.
   - If not ready, list blockers instead of moving to shape.
   - When shaping inline, after writing `prd.md`/`tasks.md`/`e2e.md`, show a compact shape summary (issue slug, slice count, key gate decisions, E2E classification counts) and wait for the user's nod before committing the issue package. Do not commit silently.

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
