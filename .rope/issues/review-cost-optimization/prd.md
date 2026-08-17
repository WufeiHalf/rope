---
mode: serial
review: batch
---

# Risk-Tiered Review Mode and Lean Leaf Briefs

## Problem Statement

Running rope issues in real code projects costs too many tokens and too much
wall-clock time. Three causes, evidenced by the `agent-workbench` study (101
issues) and first-party external research (`.rope/research/review-cost-token-efficiency.md`):

1. Nearly every code slice is marked `Review: required` (377 required vs 67
   self-check), so each spawns a reviewer leaf — yet most findings concentrate
   in genuinely high-risk slices.
2. `rope-go` ends with a parent-owned overall review whose checklist overlaps
   `rope-verify` heavily: the same diff is read twice by strong-model passes.
3. Leaf briefs inline-copy the full Constraint Bundle (median 5-slice issue:
   ~18KB of prd+tasks text per go cycle), and the parent loads the full issue
   package at startup.

## Solution

Adopt ADR 0004: an opt-in per-issue `review: per-slice | batch` mode; batch
mode keeps per-slice review only for Review Risk Gate slices and runs **one
batch reviewer leaf** over the cumulative diff of the rest before verify; go's
parent overall review is removed (verify stays the sole parent-level assembled
judgment); leaf briefs reference the bundle by path + constraint IDs; the go
parent loads the issue package lean.

## Goals

- Shape asks for review mode; package carries it in frontmatter.
- Slice review marking supports `required | batch | self-check`.
- go schedules reviews by mode; batch review is a real parent-spawned
  read-only leaf with auditable verdicts recorded per covered slice.
- go has no parent overall-review pass; a light handoff checklist remains.
- Leaf briefs carry bundle path + IDs + short global invariant list, not
  inline bundle detail.
- go startup load is lean with on-demand deep reads.
- Legacy packages (no `review` field) behave exactly as today.

## Non-goals

- Changing the Review Risk Gate trigger list itself.
- Changing harness presets, model routing mechanism, or manifest format.
- Weakening commit rules, fix-round limits, or Human Escalation Stop.
- Auto-detecting review mode from issue content (manual shape-time choice).
- Touching `rope-finish`, `rope-grill`, `rope-init`, `rope-summary`,
  `rope-migrate-docs`, `rope-harness-presets` behavior.

## Public Interface / Behavior

- `prd.md` frontmatter gains `review: per-slice | batch` (shape writes it
  after asking; absent ⇒ per-slice).
- Slice review marking in `tasks.md` gains the `batch` value, valid only when
  the package is `review: batch`.
- `rope-go` slice loop: `required` → per-slice reviewer leaf; `batch` →
  deferred; `self-check` → unchanged. After all slices with ≥1 `batch` slice:
  one batch reviewer leaf (cumulative diff, Behavior Contract + constraint
  IDs by reference), verdict recorded per covered slice.
- `rope-go` "After all slices" no longer contains a parent overall review;
  it ends with the handoff checklist + same-session verify handoff.
- Implementer/reviewer brief contract: bundle path + slice Constraint IDs +
  global invariant list inline; leaf reads bundle detail itself; returns
  per-ID confirmation + conflicts.
- `rope-verify` checks batch-slice review verdicts are real and auditable
  (extends the existing required-review reality check).

## Testing Decisions

- Good test: read-through and grep at named text seams — this is a
  documentation/skill-text change with no runtime code.
- Seams under test:
  - `skills/rope-shape/references/issue-package.md` frontmatter and slice
    review field values
  - `skills/rope-shape/SKILL.md` shape-time review-mode question
  - `skills/rope-go/references/execution-rules.md` "Batch Review Execution"
    section; absence of a parent "Overall Review" pass; brief item 5
    by-reference wording; lean startup wording
  - `skills/rope-go/SKILL.md` slice-loop review dispatch by mode
  - `skills/rope-verify/SKILL.md` + `references/verify-rules.md` batch
    reality check
  - `.rope/CONTEXT.md` terms; `.rope/specs/review-cost-optimization.md`
- Prior art: dynamic-workflow-mode issue (same docs-change pattern: read-through
  + grep seams + dry-run E2E).

## Behavior Contract

- System under test: the rope workflow skill texts + `.rope/` docs as one
  coherent contract (shape writes it, go executes it, verify audits it).
- Trigger/input: user shapes a new issue choosing `review: batch`, runs go
  and verify; or runs a legacy package with no `review` field.
- Collaborators: issue package files; `rope-reviewer` preset (reused for the
  batch leaf); tasks.md verdict recording.
- Observable result: shape asks and records the mode; go defers batch slices
  to one batch reviewer leaf whose verdict lands per slice in tasks.md; no
  parent overall review pass exists; verify audits batch verdicts; legacy
  packages read unchanged behavior.
- Failure visibility: tasks.md review verdict pending/blank; verify
  `cannot_verify` finding for unauditable batch verdicts; shape guardrail
  blocks `batch` on Review Risk Gate slices.
- Forbidden shortcuts: treating `batch` as silent self-check; implementer
  self-review; nested spawn from any leaf; deleting the go overall review
  without moving its judgment items to batch brief + verify; weakening
  commit rules; verify becoming a second full TDD pass.

## Architecture Impact

- Impact: required
- Trigger check: changes workflow semantics owned by active ADRs (0001 verify
  boundary, 0003 review-gate wording) and adds a new ADR (0004, written at
  shape time).
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/0001-issue-level-verify-separated-from-go.md`
    Decision status: active
    Scope: issue-level verify owned by parent, read-only, sole accept gate
    Decision disposition: extend
    Inherited invariants:
      - cross-role split of implement vs accept
      - verify does not edit code
      - verify audits that required reviews actually ran
    Affected public interfaces: go "After all slices" flow; verify checklist
    Forbidden shortcuts:
      - moving overall-review judgment into go's parent (restoring a second pass)
      - letting the batch leaf edit code
    Required evidence: go SKILL/execution-rules show no parent overall review
      and handoff checklist instead; verify SKILL/verify-rules gain batch
      reality check; ADR 0001 boundary statements remain true.
    Applies to: issue | Slice 3 | Slice 4 | e2e
    Documentation update: added-new (ADR 0004 records the extension)
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/adr/0003-dynamic-workflow-mode.md`
    Decision status: active
    Scope: dynamic mode fan-out with per-slice review gates intact
    Decision disposition: extend
    Inherited invariants:
      - disjoint file ownership; contract + integration slices serial
      - per-slice review gates and commit rules apply to parallel slices
      - no nested spawn
    Affected public interfaces: execution-rules dynamic-mode section
    Forbidden shortcuts:
      - using batch mode as a license to skip required reviews in dynamic mode
    Required evidence: execution-rules states the interplay (required slices
      reviewed per-slice; batch slices reviewed once at end; fan-out rules
      unchanged).
    Applies to: Slice 3
    Documentation update: added-new (ADR 0004 consequences section)
    Unresolved conflicts: none
  - ID: D4
    Source: `.rope/specs/guides/architecture-continuity.md`
    Decision status: active
    Scope: leaf briefs carry global + slice-relevant constraints with full
      field set
    Decision disposition: extend
    Inherited invariants:
      - every brief field (source, status, disposition, invariant, forbidden
        shortcut, evidence, conflict) reaches the leaf
      - no bare "follow the ADR" briefs
    Affected public interfaces: execution-rules Leaf Brief Contract item 5
    Forbidden shortcuts:
      - by-reference wording that drops the field requirements or lets leaves
        skip reading the bundle
    Required evidence: guide + execution-rules wording agree: path + IDs +
      global invariant list inline, bundle detail read by the leaf, per-ID
      confirmation returned.
    Applies to: Slice 3 | Slice 4
    Documentation update: updated-existing
    Unresolved conflicts: none
- New decision candidate: none (ADR 0004 written at shape time; status active
  upon issue completion)
- Constraint Bundle:
  - Decision sources: D1 `.rope/adr/0001…`, D2 `.rope/adr/0003…`,
    D3 `.rope/adr/0004-risk-tiered-review-mode-and-lean-briefs.md`,
    D4 `.rope/specs/guides/architecture-continuity.md`
  - Decision statuses: all active (D3 active on completion)
  - Scope: issue-wide; Slice 3 owns go contract; Slice 4 owns verify/guide;
    e2e owns assembled consistency
  - Invariants:
      - R1 (D3): review mode opt-in; absent ⇒ per-slice; `batch` never equals
        silent self-check — real leaf, auditable verdict per covered slice
      - R2 (D1): verify is the sole parent-level assembled judgment; go keeps
        only the handoff checklist
      - R3 (D2): dynamic mode interplay — required reviews per-slice, batch
        at end, fan-out/commit/no-nested-spawn unchanged
      - R4 (D3): briefs carry path + IDs + global invariant list; leaf reads
        detail and returns per-ID confirmation + conflicts
      - R5 (D3): lean parent load with on-demand deep reads
      - R6 (D4): full brief field set still reaches the leaf (via reference)
  - Public seams: prd frontmatter `review:`; slice `Review:` values; batch
    reviewer verdict lines in tasks.md
  - Forbidden shortcuts: F1 batch treated as self-check; F2 implementer
    self-review; F3 nested spawn; F4 deleting overall-review judgment items
    instead of moving them; F5 verify as second full TDD pass; F6 bare
    "follow the ADR" briefs
  - Acceptance evidence: grep/read-through seam checks per slice; E1–E3 dry
    runs; Slice 3 required review
  - Open conflicts: none

## References

- Research: `.rope/research/review-cost-token-efficiency.md`
- ADR: `.rope/adr/0004-risk-tiered-review-mode-and-lean-briefs.md`
- ADR: `.rope/adr/0001-issue-level-verify-separated-from-go.md`
- ADR: `.rope/adr/0003-dynamic-workflow-mode.md`
- Spec: `.rope/specs/review-cost-optimization.md` (created by Slice 1)

## Open Questions / Human Gates

- none — decisions confirmed at grill (review mode per-issue, overall review
  removed in favor of batch leaf + verify, briefs by reference, lean load).

## Gate Decisions

- none — all work is local-readonly documentation editing; no gates required.
