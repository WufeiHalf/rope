# Parent Orchestrator Workflow Tasks

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes | Parent-orchestrated go loop documented + README/workflow consistent |
| Alternate input or entrypoint | yes | Degraded host without Agent / without presets documented |
| Empty or missing input | yes | Missing issue package / missing presets soft-degrade paths |
| Invalid or malformed input | yes | Design-defect escalation path (not treated as implement miss) |
| Unavailable or not-ready dependency | yes | No nested Agent; preset_missing; no subagent tool |
| Duplicate or idempotent case | yes | Second fix round rules; no infinite retry |
| Boundary or limit case | yes | Human Escalation Stop after 2 failed fix rounds |
| Existing behavior compatibility | yes | Issue-level verify still read-only on code; still between go and finish |
| Real entrypoint or integration path | yes | Skill load path: grill→shape→go→verify wording end-to-end |

## Slice 1: CONTEXT + ADR role language

- Status: completed
- Goal: Make Parent/Leaf/Human Escalation the canonical language; amend ADR 0001 from windows to roles
- Scope: `.rope/CONTEXT.md`, `.rope/adr/0001-...` or new ADR superseding window-only wording; research cross-links if needed
- Matrix rows: Existing compatibility (verify separation preserved)
- Public behavior: terms + ADR state role-based implement vs accept split without requiring two human windows
- Tests: read-through; grep Window A/B still only as historical alias if kept
- Review: required — architecture language
- Stop conditions: none

## Slice 2: rope-go parent slice loop

- Status: completed
- Goal: Rewrite rope-go so the session running go is the parent orchestrator of leaves, not a nested-review owner
- Scope: `skills/rope-go/SKILL.md`, `references/execution-rules.md`
- Matrix rows: Primary; Unavailable nested agent; Duplicate fix rounds; Boundary 2-fail stop; Missing presets
- Public behavior:
  - For each slice: brief implementer leaf → verify gates → brief reviewer leaf when Review:required (or self-check)
  - No instruction for go to spawn review *from inside* an implementer leaf
  - Correction: re-brief implementer; count fix rounds; stop at 2 with human escalation
  - Design defect → immediate human escalation
  - Prefer rope-* presets; preset_missing soft-degrade
- Tests: grep nested review ownership removed; escalation stop present; leaf brief contract present
- Review: required
- Stop conditions: none

## Slice 3: rope-grill context-protective parent

- Status: completed
- Goal: Grill teaches parent to protect context and crystallize durable decisions
- Scope: `skills/rope-grill/SKILL.md` (+ refs if needed)
- Matrix rows: Primary grill path; Boundary compact loss
- Public behavior:
  - Spawn explore leaf for polluting investigation
  - Write resolved terms/facts to `.rope/` promptly
  - Handoff to shape inline by default (already); align vocabulary with Parent Orchestrator
- Tests: grep explore/spawn + durable write reminders
- Review: required
- Stop conditions: none

## Slice 4: rope-shape handoff

- Status: completed
- Goal: Shape handoff defaults to parent orchestration, not dual-window paste
- Scope: `skills/rope-shape/SKILL.md`
- Matrix rows: Alternate handoff when user requests cross-window
- Public behavior:
  - Default: same session continues to go as parent orchestrator
  - Cross-window copy-paste only when user/host requires
- Tests: grep handoff section
- Review: self-check
- Stop conditions: none

## Slice 5: rope-verify role-based fix loop

- Status: completed
- Goal: Verify stays issue-level read-only on code; fix routing is parent re-brief + implementer leaf
- Scope: `skills/rope-verify/SKILL.md`, `references/verify-rules.md`
- Matrix rows: Existing verify separation; mechanical leaf; fix loop wording
- Public behavior:
  - Prefer rope-verify-inspector for mechanical checks
  - CHANGES_REQUESTED produces fix brief for parent to spawn implementer leaf (not “Window B” primary)
  - Still no code edits by verify
- Tests: grep implementer window primary path removed or demoted; inspector + parent language present
- Review: required
- Stop conditions: none

## Slice 6: README + finish consistency

- Status: pending
- Goal: Typical workflow and any finish references match parent orchestrator
- Scope: `README.md`; `skills/rope-finish` only if it still says dual-window
- Matrix rows: Real entrypoint end-to-end wording
- Public behavior: one-issue one parent session narrative; presets skill mentioned; W2 soft-use
- Tests: read-through README workflow
- Review: self-check
- Stop conditions: none
