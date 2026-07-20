---
name: rope-grill
description: Grills a requirement against .rope docs until shared understanding and a shape-ready Behavior Contract — resolving terms, human gates, external facts (search mature libraries before reinventing), and reusable contracts. Use when stress-testing a feature idea, clarifying requirements before shaping slices, or the user says grill / 拷问需求 / 澄清后再 shape.
---

# Rope Grill

Discuss one requirement deeply before implementation. The grill session is the
**Parent Orchestrator**: judgment-primary and **context-protective**. Ask one
decision question at a time, but first inspect code or primary sources when they
can answer the question.

For document formats, read [references/doc-formats.md](references/doc-formats.md)
before editing `.rope/CONTEXT.md`, `.rope/adr/`, `.rope/research/`, or
`.rope/specs/`.

## Inputs

Read these when present:
- `.rope/CONTEXT.md`
- `.rope/routes.md`
- relevant `.rope/adr/*.md`
- relevant `.rope/research/*.md`
- relevant `.rope/specs/**/*.md`
- nearby code and tests named by `.rope/routes.md`

## Context-protective parent

Parent context is scarce; compaction drops chat. During grill:

1. **Spawn an explore leaf** for polluting investigation (large greps, log dumps,
   multi-file surveys, long primary-source reads). Prefer `rope-explore` when
   harness presets exist; soft-degrade to a generic read-only worker if missing
   (`preset_missing`). Do not bulk-load exploratory noise into the parent.
2. **Crystallize durable decisions into `.rope/` promptly** — resolved terms,
   ADRs, research facts, reusable contracts. Chat does not survive compact;
   `.rope/` does. Write as soon as a decision is confirmed, not only at the end.
3. Read **leaf summaries + paths**, not full traces by default.
4. Never ask a leaf to spawn another leaf.

Rare parent self-execution: trivial doc edits, issue-doc writes, or host cannot
spawn workers (degraded mode).

## Fact vs decision

- **Facts** (code, tests, docs, primary sources, mature library landscape): look
  them up. Prefer an explore leaf when the search is wide. **Do not** turn
  answerable facts into multiple-choice questions for the user.
- **Decisions** (product tradeoffs, risk appetite, human gates, which option
  wins): put each to the user with a recommended answer and wait. **Do not**
  write contested product choices into `.rope/` as if settled.

## Domain discipline

While grilling:

1. **Glossary clash** — if the user conflicts with `.rope/CONTEXT.md`, call it
   out immediately and force a choice (keep glossary / change glossary / new term).
2. **Fuzzy language** — propose a precise canonical term and `_Avoid_` list; do
   not leave overloaded words unresolved.
3. **Code contradiction** — when the user states how something works, check the
   code (or explore leaf). If they disagree, surface evidence before continuing.
4. **Scenarios** — for abstract relationships or boundaries, invent concrete
   scenarios (prefer this issue’s real world) that force a precise answer.

## Workflow

1. Restate the target and suspected ambiguity.
2. Check answerable facts before asking (see **Fact vs decision**):
   - repo code/tests/docs for codebase facts (prefer explore leaf when wide)
   - official docs or primary sources for external API/platform facts
   - **external libraries before reinventing**: when the requirement involves a
     capability with mature open-source solutions (compression, parsing, queues,
     caching, auth, encryption, image/PDF/video handling, etc.), search
     npm/pypi/GitHub popular packages, official recommended approaches, and
     existing `.rope/research/` **before** proposing a hand-rolled implementation.
     Route verified external facts to `.rope/research/<topic>.md` and cite it in
     the PRD References. If outbound network is blocked, retry via the
     `http://127.0.0.1:8118` proxy (`curl -x http://127.0.0.1:8118 ...` or set the
     proxy in the web/search tool).
3. Apply **Domain discipline** against `.rope/CONTEXT.md` and code.
4. Resolve the Behavior Contract before shaping:
   - System under test: what behavior is being specified and tested?
   - Trigger/input: what user action, API call, event, command, or state change starts it?
   - Collaborators: what dependencies participate without owning the behavior?
   - Observable result: what output, state, artifact, UI, log, or side effect proves success?
   - Failure visibility: where and how are errors observable?
   - Forbidden shortcuts: what implementation paths would satisfy tests but violate intent?
5. Ask one decision question at a time with a recommended answer. Treat the
   undecided set as a **decision tree**: resolve dependency blockers first; do
   not jump to a question that assumes an unresolved prior choice. Optionally
   label “本问题阻塞：&lt;topic&gt;” when helpful.

   **Question preference (default):** prioritize **product, UX/design, scope,
   and policy** decisions over implementation micro-choices. Prefer asking:
   who is this for, what “good” looks like, what is out of scope, risk/human
   gates, naming users will see, edge behavior the product must own. Defer
   file layout, class names, and framework trivia unless they change the
   Behavior Contract or a human gate. If you catch yourself only probing
   code structure, step back to a product/design question.

   Communication style:
   - use plain language, not jargon dumps; if one sentence is enough, do not use three
   - **explain with simple wording and a concrete example** (用户场景、一次点击、
     一条命令、一屏结果) — prefer the current issue’s real scenario over a generic one
   - when a decision involves an abstract relationship or a boundary condition,
     pair the recommendation with that example so the user can answer without
     rephrasing your question
   - the recommended answer must be something the user can understand on first
     read, not something they have to ask you to rephrase
6. Keep the clarification loop moving:
   - if the user asks for rationale, examples, or discussion of a point, answer it first
   - if the current decision is still unresolved, restate the recommended answer
     and ask for confirmation — do not open a sibling branch that depends on it
   - if the current decision is confirmed, immediately ask the next
     highest-priority **unblocked** decision question
   - do not stop after explanation and wait for the user to say `continue`,
     unless the user explicitly pauses or asks to stay on the topic
7. Stress-test the Behavior Contract with concrete scenarios. At minimum cover:
   - one **primary-path** success case
   - one **failure-visibility** case (where/how the user or system sees the error)
   - one **forbidden-shortcut** case (would pass a shallow test but violate intent)
   - when relevant: empty/missing input, or unavailable collaborator/dependency
8. Update docs inline as decisions crystallize (early — before compact loss):
   - resolved project term -> `.rope/CONTEXT.md`
   - hard-to-reverse surprising tradeoff -> `.rope/adr/NNNN-slug.md` — only when
     **all three** hold (see [doc-formats.md](references/doc-formats.md)): hard to
     reverse, surprising without context, real tradeoff among credible options
   - external or platform fact -> `.rope/research/<topic>.md`
   - reusable implementation contract or gotcha -> `.rope/specs/<area>/<topic>.md`
9. **Shared-understanding gate (before shape):** when you believe grill is done,
   present a short recap (3–6 bullets) of settled decisions including Behavior
   Contract essentials, then **ask the user to confirm** shared understanding and
   readiness to shape. **Do not** write the issue package or treat shape as
   started until they confirm (unless they already ordered “直接 shape”).
10. Stop only when the **Ready for shape** checklist is satisfied and the user
    has confirmed (step 9). If not ready, list blockers instead of moving on.
11. When stopping, hand off to shape as **Parent Orchestrator** continuing
    in-session:
    - **Default (same session):** grill and shape run in the same parent session.
      Once confirmed ready, say you are moving into shape and start writing the
      issue package directly. Do not emit a cross-window copy-paste prompt.
    - **Cross-window only when the user says so:** only when the user's current
      message signals switching sessions for shape (e.g. "I'll shape in another
      window", "shape later elsewhere") do you emit the `Next recommended step`
      block with a copy-paste prompt naming the requirement and asking
      `rope-shape` to create the issue package.
    - When shaping inline, after writing `prd.md`/`tasks.md`/`e2e.md`, show a
      compact shape summary (issue slug, slice count, key gate decisions, E2E
      classification counts) and wait for the user's nod before committing the
      issue package. Do not commit silently.

## Ready for shape

All boxes must hold (and step 9 user confirm) before shape:

- [ ] Behavior Contract six fields have user-confirmed answers
- [ ] Key terms resolved into `.rope/CONTEXT.md` or explicitly deferred
- [ ] External facts in `.rope/research/` or explicitly “not needed”
- [ ] Human gates listed (schema, auth, deploy, destructive, prod/shared, …)
- [ ] Primary / failure-visibility / forbidden-shortcut scenarios discussed
- [ ] User confirmed shared understanding (step 9)

## Document Boundaries

- `CONTEXT.md` is a glossary only. No implementation steps.
- ADRs record why a durable architecture decision was made. Keep them short.
  Offer an ADR only when hard-to-reverse **and** surprising **and** real tradeoff
  ([doc-formats.md](references/doc-formats.md)).
- Research records verified external facts, with source and implication.
- Specs record stable implementation contracts, not transient code maps.
- Current code facts should normally be checked live instead of stored, unless
  they become a reusable contract or gotcha.

## Guardrails

- Do not write feature implementation code.
- Do not create issues; use `rope-shape` for that (and only after step 9 confirm).
- Do not present answerable uncertainty as an implementation branch.
- Do not leave confirmed product decisions only in chat — write them to `.rope/`.
- Do not ask the user for facts the environment can answer; do not invent
  product decisions without the user.
- If a decision touches schema, dependency, auth, deployment, destructive
  git/filesystem, or production/shared environment, stop and mark it as a human gate.
