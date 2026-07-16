# Parent Orchestrator Workflow E2E

## E1 Skill contract greps — go ownership

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: skills/rope-go
Command or Steps:
- Grep that parent owns slice loop / spawns implementer and reviewer leaves
- Grep nested spawn forbidden for leaves
- Grep Human Escalation Stop / two fix rounds
- Confirm Review:required does not require nested Agent inside implementer leaf
Pass Criteria:
- Contracts present; no primary “implementer must spawn review subagent” path
Result:
- pending

## E2 Grill + shape handoff wording

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: skills/rope-grill, skills/rope-shape
Command or Steps:
- Grep context-protective / explore leaf / durable .rope writes in grill
- Grep shape default same-session parent go; cross-window only when user asks
Pass Criteria:
- Both present
Result:
- pending

## E3 Verify fix-loop wording

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: skills/rope-verify
Command or Steps:
- Grep fix path uses parent + implementer leaf (or equivalent role language)
- Confirm still read-only on code; issue-level only
Pass Criteria:
- Role-based fix loop; verify separation intact
Result:
- pending

## E4 CONTEXT + ADR consistency

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: .rope/CONTEXT.md, .rope/adr/
Command or Steps:
- Confirm Parent Orchestrator / Leaf Worker / Human Escalation Stop defined
- ADR 0001 amended or superseded for roles without dropping verify separation
Pass Criteria:
- Language consistent; verify still separated from go
Result:
- pending

## E5 README typical workflow

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: README.md
Command or Steps:
- Read Typical Workflow; ensure parent orchestration narrative; presets skill referenced
Pass Criteria:
- No dual-window-only story as the only path
Result:
- pending

## E6 User smoke (optional narrative)

Executor: user
Risk: human-judgment
Gate Decision: user-run
Scope: reading updated skills
Command or Steps:
- User skims go/grill/verify SKILL headers and confirms the story matches intent
Pass Criteria:
- User OK or lists wording fixes
Result:
- pending
