---
mode: serial
review: per-slice
---

# Plan Artifact Reader Layering

## Problem Statement

Rope's plan artifacts were read by humans and machines with no explicit budget:
"concise" was a matter of taste, the user rarely read the full PRD before
confirming it, and Matt's "concise plan + list unresolved questions" rule had no
Rope-native equivalent.

## Solution

Add ADR 0005 (plan artifact reader layering) plus its spec, CONTEXT terms, and
skill updates:

- **Contract Note** in `prd.md`: 3–5 observable-outcome bullets; shape step 11
  confirms the note instead of the full PRD.
- **Minimal Leaf Brief**: content allowlist + operational contract + ≤60-line
  cap for implementer/reviewer briefs.
- **Unresolved questions**: resolved at the grill gate; leaf-discovered
  conflicts re-brief to the parent, never silently absorbed.

## Contract Note

- 之后 shape 收尾时，你确认的是一张 3–5 条的「契约便签」，不用再通读 PRD。
- 之后每个 implementer/reviewer brief 都只能带 allowlist 内的内容，正文 ≤60 行，其余按引用。
- leaf 发现的契约冲突一律先回到 parent 重新定夺，不会被打磨成静默吸收。

## Goals

- Make leaf brief budgets explicit and checkable.
- Make human confirmation bind to the Behavior Contract.
- Formalize reader layering as a durable ADR.

## Non-goals

- No change to review modes (`per-slice | batch`).
- No migration of existing issue packages (Contract Note optional there).
- No new subagent/leaf mechanism.

## Public Interface / Behavior

- `prd.md` issue template gains `## Contract Note` (3–5 bullets).
- `rope-shape` step 11 confirms the Contract Note instead of full-PRD read.
- `execution-rules.md` Leaf Brief Contract becomes a hard budget (allowlist +
  ≤60-line cap).
- `.rope/adr/0005-plan-artifact-reader-layering.md`, `.rope/specs/plan-artifact-reader-layering.md`,
  and CONTEXT terms exist.

## Testing Decisions

- Docs-only change; `TDD: waived (docs-only)`.
- Seams: file existence + grep/sed checks for the new sections and terms.

## Behavior Contract

- System under test: Rope workflow docs and skills.
- Trigger/input: reading/shaping/executing a Rope issue.
- Collaborators: `.rope/adr/`, `.rope/specs/`, `skills/rope-*`, `.agents/skills` mirrors.
- Observable result: Contract Note present in `prd.md` template; brief allowlist +
  line cap in execution-rules; ADR 0005 + spec + CONTEXT terms present.
- Failure visibility: grep/read of the changed files shows missing fields or a
  brief section exceeding the allowlist.
- Forbidden shortcuts: keeping the old unbounded "minimum" brief, confirming a
  chat recap that never lands in `prd.md`, or treating the note as the
  acceptance contract.

## Architecture Impact

- Impact: required
- Trigger check: changes Rope's own workflow contract (brief format, human
  confirmation step) — architecture-relevant to ADR 0004.
- Relevant decisions:
  - ID: D4 / ADR 0004
    Source: `.rope/adr/0004-risk-tiered-review-mode-and-lean-briefs.md`
    Decision status: active
    Scope: leaf briefs by reference, lean parent load
    Decision disposition: extend
    Inherited invariants: leaf reads bundle detail by reference; no full inline
      bundle copy; global invariant list stays short.
    Affected public interfaces: Leaf Brief Contract in `execution-rules.md`.
    Forbidden shortcuts: inline bundle detail; dropping TDD/return-shape fields.
    Required evidence: presence of allowlist + line cap in execution-rules.
    Applies to: issue
    Documentation update: added-new
    Unresolved conflicts: none

## References

- Research: `.rope/research/review-cost-token-efficiency.md` (context budget)
- Spec: `.rope/specs/plan-artifact-reader-layering.md`
- ADR: `.rope/adr/0005-plan-artifact-reader-layering.md`

## Open Questions / Human Gates

- none

## Gate Decisions

- Gate: doc consistency
- Decision: approved
- Approved action: grep/read modified docs for section presence
- Scope: repo docs
- Risk: none
- Pass criteria: all listed files contain the new sections
- Failure report: missing section listed
- Forbidden out-of-scope actions: none