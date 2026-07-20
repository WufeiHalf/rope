# Grill habits (load when running the interview loop)

## Fact vs decision

- **Facts** (code, tests, docs, primary sources, mature libraries): look up.
  Prefer explore leaf when wide. Never turn answerable facts into user quizzes.
- **Decisions** (product tradeoffs, risk, gates, which option wins): one question
  at a time with a recommended answer. Never write contested choices into
  `.rope/` as settled.

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

- Plain language; one sentence when enough.
- Pair recommendations with a concrete example (user scenario, click, command,
  screen result).
- Recommended answer must be understandable on first read.

## Decision tree

Resolve blockers first. Do not open a sibling branch that depends on an
unresolved choice. Optionally label “本问题阻塞：&lt;topic&gt;”.

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
