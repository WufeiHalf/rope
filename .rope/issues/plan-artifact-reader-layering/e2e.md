# Plan Artifact Reader Layering E2E

## E1 Doc structures present

Architecture evidence: ADR 0005 + spec + CONTEXT terms + skill updates (D4 extend)
Executor: agent
Risk: local-readonly
Gate Decision: approved
Approved Action: read/grep modified docs
Scope: this repo
Command or Steps:
- `test -f .rope/adr/0005-plan-artifact-reader-layering.md`
- `test -f .rope/specs/plan-artifact-reader-layering.md`
- `grep -n "## Contract Note" skills/rope-shape/references/issue-package.md`
- `grep -n "Leaf Brief Contract (hard budget)" skills/rope-go/references/execution-rules.md`
- `grep -n "60" skills/rope-go/references/execution-rules.md`
- `grep -n "Contract Note" .rope/CONTEXT.md skills/rope-shape/SKILL.md`
- `diff -rq skills .agents/skills`
Pass Criteria:
- all files exist
- Contract Note present in prd template + shape/gill flows
- hard-budget section + 60-line cap present in execution-rules
- CONTEXT has Contract Note / Minimal Leaf Brief / Plan Artifact Reader Layering
- diff only shows upstream-harvest extra in .agents
Failure Report:
- list missing file/section
Forbidden Out-of-Scope Actions:
- none
Result:
- agent_passed