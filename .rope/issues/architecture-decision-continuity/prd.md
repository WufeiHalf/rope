# Architecture Decision Continuity Workflow

## Problem Statement

Rope currently lets agents read ADRs and specs, but an issue package does not record whether those decisions apply, how each decision is handled, or what evidence proves the implementation preserved them. The parent may understand a decision while a leaf receives only a slice sentence, and issue-level verify has no architecture continuity check.

## Solution

Add a conditional Architecture Impact section to every newly shaped issue. When a trigger is present, record relevant decisions, their source status and per-decision disposition, then derive a Constraint Bundle in `prd.md`. Pass the global bundle plus slice-relevant constraints to implementers and reviewers, check it during issue-level verify, and let finish complete confirmed documentation updates through existing `.rope/` routing.

## Goals

- Make architecture impact explicit without requiring every task to create an ADR.
- Preserve the distinction between source decision status and issue disposition.
- Carry invariants, seams, forbidden shortcuts, and evidence from shape to go and verify.
- Detect unrecorded architecture drift while judging behavior and dependency direction rather than implementation identity.
- Complete the documentation loop at finish without rejecting otherwise verified work solely because a confirmed doc update is pending.
- Let `rope-grill` use structured questions when the host provides them and fall back to plain interview questions.

## Non-goals

- Domain-specific architecture rules for WebUI, DingTalk, channels, or any other product area.
- Full automatic ADR/spec indexing or architecture inference from filenames/diffs.
- Requiring every small task to create an ADR.
- Requiring all callers to use one concrete function, class, or implementation.
- Building static guards or a decision graph.
- Running code; this issue changes workflow documentation and templates only.

## Public Interface / Behavior

- `rope-shape` writes `Architecture Impact` to every new `prd.md`, with `not-applicable` as an explicit lightweight result.
- A required impact lists each relevant source decision and its `inherit | extend | supersede | exception | not-applicable` disposition, or records `Relevant decisions: none found` plus a risk-reviewed `New decision candidate`.
- `prd.md` is the canonical issue-level Constraint Bundle. `tasks.md` references constraint IDs and maps them to slices and evidence.
- `rope-go` copies global constraints and slice-relevant constraints into implementer and reviewer briefs; a leaf reports a newly discovered conflict to the parent.
- `rope-verify` checks decision disposition, invariants, exception evidence, public compatibility, responsibility duplication, and unresolved conflicts. Documentation-only pending work is recorded for finish, not used as a code finding.
- `rope-finish` records one terminal documentation outcome: `updated-existing`, `added-new`, `no-new-decision`, or `exception-recorded`; an unconfirmed architecture change pauses for human/parent disposition.
- `rope-grill` uses `ask_user_question` or a host-equivalent structured tool when available, otherwise uses the same recommendation/example/tradeoff protocol in plain text.

## Testing Decisions

- Good test: inspect generated/updated skill documents and issue templates for required fields, ordered workflow steps, positive handoffs, and explicit completion criteria.
- Seams under test: bundled `skills/rope-{grill,shape,go,verify,finish}` files and their directly linked reference templates; installer output under the requested target.
- Prior art: `skills/rope-shape/references/issue-package.md`, `skills/rope-go/references/execution-rules.md`, and `skills/rope-verify/references/verify-rules.md`.

## Behavior Contract

- System under test: Rope workflow skill instructions and issue-package templates.
- Trigger/input: a parent agent shapes, executes, verifies, and finishes a new issue that may touch an existing architecture decision.
- Collaborators: `.rope/CONTEXT.md`, routes, ADR/spec docs, issue package, parent orchestrator, leaf workers, and `bin/rope.js` installer.
- Observable result: decisions are discovered, dispositioned, bundled, scoped into leaf briefs, checked by review/verify, and documented or explicitly closed at finish.
- Failure visibility: unresolved conflict or unconfirmed high-risk new decision blocks shape/finish; missing invariant evidence is a verify finding; missing host question tool falls back to plain text; missing preset remains a recorded soft degradation.
- Forbidden shortcuts: references-only ADR reading, slice-only leaf briefs, `not-applicable` for an unreviewed impact, silent disposition changes, diff-only architecture inference, and treating confirmed pending docs as a code failure.

## Architecture Impact

- Impact: required
- Trigger check: this issue changes public skill contracts, issue-package fields, leaf brief contracts, verification gates, and documentation closeout behavior.
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/0001-issue-level-verify-separated-from-go.md`
    Decision status: unknown
    Scope: parent-owned issue-level verify; implement/review/accept role separation
    Decision disposition: inherit
    Inherited invariants:
      - C1: verify remains parent-owned and read-only on code
      - C1: code fixes still go through an implementer leaf
      - C1: verify still produces PASS | CHANGES_REQUESTED | BLOCKED
    Affected public interfaces: `rope-verify` workflow and `verify.md` evidence
    Forbidden shortcuts: moving architecture code edits into verify or making leaf nesting the acceptance authority
    Required evidence: verify rules preserve role separation; workflow read-through covers the new architecture checks
    Applies to: issue, verify
    Documentation update: no-new-decision — role separation remains unchanged; the new continuity checks are recorded under D2
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/adr/0002-architecture-decision-continuity.md`
    Decision status: active
    Scope: conditional Architecture Impact, cross-stage Constraint Bundle, and structured grill questions
    Decision disposition: inherit
    Inherited invariants:
      - C2: shape records `not-applicable` explicitly
      - C3: source status and issue disposition stay separate
      - C4: `prd.md` is the canonical full bundle
      - C6: finish uses existing document routing
      - C2: questions remain recommendation-led and scenario-backed
      - C5: unavailable tooling degrades to plain text
    Affected public interfaces: all five workflow skills, issue package templates, and `rope-grill` interview behavior
    Forbidden shortcuts: domain-specific rules, automatic inference, an extra canonical bundle file, or blocking because structured questioning is unavailable
    Required evidence: each changed skill contains its stage contract; cross-stage references and installer output agree; grill fallback wording is present
    Applies to: issue, Slice 1, Slice 2, Slice 3, Slice 4, Slice 5, Slice 6, e2e, verify
    Documentation update: added-new — `.rope/specs/guides/architecture-continuity.md` records the stable implementation contract
    Unresolved conflicts: none
- New decision candidate: none
- Constraint Bundle:
  - Decision sources: D1, D2
  - Decision statuses: active
  - Scope: issue-wide; slice-specific references in `tasks.md`; assembled proof in E2E/verify
  - Invariants: C1 role separation; C2 explicit impact outcome; C3 per-decision disposition; C4 canonical `prd.md` bundle; C5 evidence mapping and fallback; C6 finish documentation outcome
  - Public seams: skill `SKILL.md` contracts, linked reference templates, CLI installer output
  - Forbidden shortcuts: listed per decision and in Behavior Contract
  - Acceptance evidence: structural checks, reference consistency, installer smoke check, and manual workflow read-through
  - Open conflicts: none

## References

- `.rope/adr/0001-issue-level-verify-separated-from-go.md`
- `.rope/adr/0002-architecture-decision-continuity.md`
- `.rope/CONTEXT.md`
- `.rope/upstream/mattpocock-skills/correspondence.md`
- `.rope/upstream/mattpocock-skills/reviews/2026-07-20-9603c1c-baseline.md`
- `/home/wufei/.agents/skills/write-a-skill/SKILL.md`
- `/home/wufei/.agents/skills/writing-great-skills/SKILL.md`

## Open Questions / Human Gates

- None. The requested install target is a local worktree and the installer only writes bundled skill files there.

## Gate Decisions

- Gate: install bundled skills into requested worktree
- Decision: approved
- Approved action: copy the repository's bundled `skills/` into `/home/wufei/orca/workspaces/agent-workbench/feat-code-change/.agents/skills`
- Scope: requested local worktree skill directory
- Risk: overwrites bundled Rope skill files in that target; does not touch project source code
- Pass criteria: target files match bundled source files after installation
- Failure report: report the installer error and mismatched paths
- Forbidden out-of-scope actions: modifying target project source, committing, pushing, or changing user-local skill settings
