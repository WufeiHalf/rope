# Architecture Decision Continuity Across Issues

Rope makes architecture decisions continuous across an issue lifecycle: shape conditionally identifies relevant decisions and records a per-decision disposition; go passes a scoped Constraint Bundle to implementation and review leaves; verify checks invariants, exceptions, and evidence; finish completes any missing canonical documentation through the existing `.rope/` routing rules. This preserves architecture behavior without forcing every task to create an ADR or every implementation to use one concrete internal shape.

## Status

active

## Decision

- Every newly shaped issue records an explicit Architecture Impact result. `not-applicable` is a lightweight checked outcome, not an omitted section.
- Shape performs targeted document lookup using CONTEXT, routes, the issue's public seams, and relevant ADR/spec references. It does not require a full scan of every architecture document.
- Relevant source decisions are listed individually with source path, source status, scope, disposition, invariants, affected public interfaces, forbidden shortcuts, required evidence, documentation update, and unresolved conflicts. Each decision and invariant is mapped to its scope (`issue`, one or more slices, `e2e`, or `verify`) and evidence.
- Source decision status and issue disposition remain separate. Source status is `active`, `superseded`, `deprecated`, `provisional`, or `unknown`; disposition is `inherit`, `extend`, `supersede`, `exception`, or `not-applicable`.
- When a trigger is present but targeted lookup finds no existing decision to inherit, the record says `Relevant decisions: none found` and creates a separate `New decision candidate` entry; it must not overload `not-applicable`. The candidate is handled by risk: a hard-to-reverse change, public contract change, or real tradeoff blocks shaping for a decision; a lower-risk candidate may proceed only with an explicit parent conclusion about whether a durable document is needed.
- An unresolved conflict that affects the issue blocks shaping until the conflicting sources and resolution are explicit. The workflow must not choose a source silently.
- The issue-level Constraint Bundle is canonical in `prd.md`. The parent retains the full bundle; each leaf receives the global constraints and slice-relevant subset, with source paths preserved.
- Implementers and reviewers may not silently change a disposition. A discovered conflict returns to the parent for re-briefing, shape adjustment, and human confirmation where required.
- Review and issue-level verify judge inheritance of behavior and invariants, duplicated responsibility, dependency direction, public compatibility, recorded exceptions, and evidence. They do not require a particular function, class, or implementation shape. Even `not-applicable` receives a lightweight trigger-check confirmation.
- A source with missing status is recorded as `unknown`. It blocks only when the uncertainty could change the issue's applicable rule or disposition; otherwise the issue may proceed with the uncertainty explicit.
- The full Constraint Bundle and per-decision mapping are canonical in `prd.md`; `tasks.md` references decision/constraint IDs and records slice-level applicability and evidence rather than copying the full text.
- If the final work changes a decision, the canonical documentation outcome is completed during `rope-finish` through existing routing: ADR for a hard-to-reverse, surprising tradeoff; spec for a stable implementation contract or gotcha; CONTEXT for a domain term; research for an external fact. A missing documentation update alone is not a verify failure; finish writes confirmed changes directly without asking again.
- If finish discovers an unconfirmed architecture change, it pauses for a human/parent disposition instead of inventing an exception or closing with a documentation todo.
- Finish records one terminal documentation outcome: `updated-existing`, `added-new`, `no-new-decision`, or `exception-recorded` with scope, reason, and expiry/invalidating condition. Before finish, an issue may use `pending-finish`; finish must replace it with a terminal value.
- `rope-grill` prefers a host-provided structured question tool such as `ask_user_question`; when unavailable, it falls back to plain questions with a recommendation, concrete example, and tradeoff.

## Consequences

- Architecture Impact and the Constraint Bundle add issue-package and leaf-brief content, but keep the decision source in the existing `.rope/` documents.
- Small tasks can remain lightweight when the trigger check finds no architecture impact.
- `supersede` and `exception` require an explicit explanation and corresponding evidence; they do not authorize an unrecorded shortcut.
- Older issue packages may be handled in compatibility mode. They are not bulk-migrated automatically; verify records when continuity was not assessed and requires attention.
- Verify may challenge a `not-applicable` assessment when assembled behavior or dependency evidence shows a trigger was missed, but it must not infer architecture solely from filenames or diffs.
