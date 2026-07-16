# Parent Orchestrator Workflow

## Problem Statement

Rope still documents a dual-window human bus (planner vs implementer) and lets
`rope-go` own nested per-slice review. On hosts that strip nested Agents, required
reviews degrade by architecture. Users want one issue surface: parent orchestrates
leaf workers, protects its own context, and stops for human decisions when fixes
fail or design is wrong.

## Solution

Rewrite Rope workflow skills around a **Parent Orchestrator** + **Leaf Workers**
contract: parent owns grill/shape/slice loop/review dispatch/verify/finish;
leaves implement, review, explore, and mechanically inspect; no nested spawn;
context-protective parent; human escalation stop; soft use of harness presets
from W2 without hard dependency.

## Goals

- Replace Window A/B primary language with Parent Orchestrator / Leaf Worker in
  CONTEXT, skills, and README (keep short alias notes if needed)
- `rope-go`: parent owns the slice loop; spawns implementer leaf then reviewer
  leaf (or self-check); never asks a leaf to spawn
- Course correction: parent re-briefs and re-spawns implementer; max **two**
  automated fix rounds per problem then Human Escalation Stop
- Design/requirements/contract failures escalate immediately (no thrash)
- `rope-grill`: spawn explore for polluting work; crystallize decisions into
  `.rope/` before compact loss; context-protective reminders
- `rope-shape`: default handoff is same-session parent orchestration, not
  cross-window paste; cross-window only if user/host requires
- `rope-verify`: verdict stays parent; mechanical checks via verify-inspector
  leaf when available; CHANGES_REQUESTED fix path is parent re-brief +
  implementer leaf (not “paste to Window B” as primary)
- Soft-consume `rope-harness-presets` manifest; `preset_missing` degrade
- Amend or supersede ADR 0001 for role-based (not window-based) separation

## Non-goals

- Re-implementing `rope-harness-presets` or non-pi writers
- Building a new runtime/harness product outside skill docs
- Parallel multi-writer implementers for one issue
- Automatic preset refresh / TTL
- Parent bulk-running full implement/fix loops in its own context
- Deleting the ability to run a top-level cheap session as degraded host mode

## Public Interface / Behavior

- Skill behavioral contracts for: rope-grill, rope-shape, rope-go, rope-verify,
  README Typical Workflow, CONTEXT terms, ADR
- Observable agent instructions when skills are loaded:
  - parent spawns leaves with self-contained briefs
  - leaves return summary + paths only
  - nested spawn forbidden in go/review/verify leaf paths
  - human stop after 2 failed fix rounds or design defect

## Behavior Contract

- System under test: Rope skill workflow semantics for parent-orchestrated
  issue execution
- Trigger/input: agent loads rope-grill/shape/go/verify after this change and
  runs an issue
- Collaborators: harness Agent tool (optional), harness presets (optional),
  issue package artifacts, git
- Observable result: skill text and ADR/CONTEXT instruct the portable contract
  above; greps show no primary “implementer window paste” path as default;
  go no longer requires nested Agent for Review:required
- Failure visibility: missing Agent tool → documented degrade (self-review /
  top-level session); missing presets → preset_missing; escalation stop text
  present for 2-fail / design cases
- Forbidden shortcuts: only renaming Window A/B without changing go ownership;
  leaving nested review as the only required path; infinite fix loops

## References

- Research: `.rope/research/single-window-go-orchestration.md`
- Language: `.rope/CONTEXT.md` (Parent Orchestrator, Leaf Worker, Human Escalation Stop, Harness Profile)
- Prior issue: `.rope/issues/rope-harness-presets/` (W2)
- ADR: `.rope/adr/0001-issue-level-verify-separated-from-go.md` (to amend)

## Open Questions / Human Gates

- None remaining for shape; W1 decisions crystallized in grill/research.

## Gate Decisions

- No agent-with-gate E2E required (docs/skill rewrite only; no user-home writes).
