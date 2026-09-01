# Grill habits (load when running the interview loop)

## Fact vs decision

- **Facts** (code, tests, docs, primary sources, mature libraries): look up.
  Prefer a background explore leaf when wide — a running exploration delays
  only the questions downstream of it, never the current round. Never turn
  answerable facts into user quizzes.
- **Decisions** (product tradeoffs, risk, gates, which option wins): put to
  the user in frontier rounds, each with a recommended answer. Never write
  contested choices into `.rope/` as settled.

## Domain discipline

1. Glossary clash with `.rope/CONTEXT.md` → force a choice immediately.
2. Fuzzy language → propose canonical term + `_Avoid_`.
3. User claim vs code → surface evidence before continuing.
4. Abstract boundaries → concrete scenario (prefer this issue’s world).

## Question preference

Prioritize **product, UX/design, scope, policy** over file layout / class names /
framework trivia unless they change the Behavior Contract or a human gate. If
you are only probing structure, step back to a product question.

## Communication

Use a plain interview. The user-facing answer must be simpler than the internal
Rope reasoning.

- Translate internal terms before speaking:
  - Behavior Contract -> “what behavior must we guarantee”
  - Failure visibility -> “where the user sees the error”
  - Forbidden shortcut -> “a lazy implementation that could still pass tests”
  - Human gate -> “this needs your explicit approval before we touch it”
- Ask the frontier in **rounds**: independent decisions share one numbered
  round (structured question tool preferred); each item still has its own plain
  question, recommendation, concrete example, and tradeoff. A decision that
  depends on an answer still open belongs to a later round — never guess at an
  answer not yet heard. A stalled branch never pauses the rest of the round.
- Pair the recommended answer with a concrete example: user scenario, click,
  command, screen result, file, or message.
- State the tradeoff of the other option when it affects product behavior.
- If the user does not understand, stop advancing the checklist and re-explain
  through a real scenario.

Completion criterion: the recommendation is understandable on first read, and
the user can choose without learning Rope vocabulary.

## Design tree + frontier rounds

- Map the decisions as a tree: every decision branches into the decisions
  that hang off it.
- The **frontier** is every decision whose prerequisites are already settled —
  the questions askable **now** without guessing at answers not yet heard. Ask
  the whole frontier in one numbered round; a question whose answer depends on
  another question still open in this round belongs to a **later** round.
- Each answered round reshapes the tree: settled decisions push the frontier
  outward and unblock what depended on them. Recompute the frontier, then ask
  the next round.
- Done when the frontier is empty: every branch visited, nothing silently
  assumed. The Ready-for-shape checklist below still gates shape.

## External libraries

When the capability has mature open-source options, search popular packages and
official guidance **before** inventing. Write facts to `.rope/research/` and cite
from the PRD. If network is blocked, retry via `http://127.0.0.1:8118`.

## Behavior Contract fields

- System under test
- Trigger/input
- Collaborators
- Observable result
- Failure visibility
- Forbidden shortcuts

## Scenario minimum

- Primary-path success
- Failure visibility
- Forbidden shortcut (shallow test would pass, intent violated)
- When relevant: empty input or unavailable dependency

## Doc crystallize targets

| Decision | File |
| --- | --- |
| Term | `.rope/CONTEXT.md` |
| Hard-to-reverse tradeoff (all three ADR tests) | `.rope/adr/` |
| External fact | `.rope/research/` |
| Stable contract/gotcha | `.rope/specs/` |

ADR only when hard to reverse **and** surprising **and** real tradeoff — see
[doc-formats.md](doc-formats.md).

## Ready for shape checklist

- [ ] Behavior Contract six fields user-confirmed
- [ ] Key terms in CONTEXT or explicitly deferred
- [ ] External facts in research or “not needed”
- [ ] Human gates listed
- [ ] Primary / failure / forbidden-shortcut scenarios discussed
- [ ] User confirmed shared understanding
