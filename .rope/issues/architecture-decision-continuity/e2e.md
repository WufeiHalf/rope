# Architecture Decision Continuity Workflow E2E

## E1 Source workflow structure

Architecture evidence: C1, C2, C3, C4, C6 — stage contracts preserve role separation, disposition, canonical bundle, and finish routing.
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: N/A
Scope: current Rope repository
Command or Steps:
- Read the changed rope-grill, rope-shape, rope-go, rope-verify, and rope-finish skills and linked references.
- Check required continuity terms and stage handoffs against the issue PRD.
Pass Criteria:
- Every stage has an explicit contract for its owned continuity work.
- No stage silently reverses the accepted role-separation or documentation-routing decisions.
Failure Report:
- Record the missing or contradictory path and source location.
Forbidden Out-of-Scope Actions:
- Do not modify target project source code.
Result:
- agent_passed — source read-through completed; required stage handoffs are present.

## E2 Structured question fallback

Architecture evidence: C2, C5 — structured questions are preferred and unavailable tooling falls back to plain text.
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: N/A
Scope: rope-grill skill text
Command or Steps:
- Inspect rope-grill for structured question preference and plain-text fallback.
- Confirm recommendation, concrete scenario, and tradeoff remain required in either mode.
Pass Criteria:
- The structured tool is preferred when available and unavailable tooling does not block grilling.
Failure Report:
- Record the missing fallback or incomplete question contract.
Forbidden Out-of-Scope Actions:
- Do not invoke external services or install a question tool.
Result:
- agent_passed — batch/blocker ordering and recommendation/example/tradeoff fallback wording present.

## E3 Installer smoke and source-target parity

Architecture evidence: C4, C5 — bundled source is the canonical transport and installer preserves target settings.
Executor: agent
Risk: local-write
Gate Decision: approved
Approved Action: run the local Rope installer against the requested worktree skill directory and compare installed bundled files with source
Scope: `/home/wufei/orca/workspaces/agent-workbench/feat-code-change/.agents/skills`
Command or Steps:
- Run `node bin/rope.js --help`.
- Run `node bin/rope.js add --target /home/wufei/orca/workspaces/agent-workbench/feat-code-change/.agents/skills`.
- Compare every bundled source file under `skills/` with its installed target counterpart.
Pass Criteria:
- Installer exits successfully.
- Updated Rope skill files match source files byte-for-byte.
- Existing target settings files remain untouched.
Failure Report:
- Capture command output, mismatched paths, and any changed settings file.
Forbidden Out-of-Scope Actions:
- Do not modify target project source, commit, push, merge, or delete files.
Result:
- agent_passed — CLI help/install passed; 27 bundled files matched; settings file set unchanged.

## E4 Shape template contract

Architecture evidence: C2, C3, C4 — template records impact, source status/disposition, and the canonical bundle with mapped slice evidence.
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: N/A
Scope: `skills/rope-shape/references/issue-package.md`
Command or Steps:
- Inspect the issue-package template for Architecture Impact and Constraint Bundle fields.
- Inspect tasks template for constraint ID and scope/evidence mapping.
Pass Criteria:
- New packages have a canonical full bundle in `prd.md` and slice references in `tasks.md`.
Failure Report:
- Record absent fields, inconsistent enums, or duplicate canonical sources.
Forbidden Out-of-Scope Actions:
- Do not edit generated issue packages during this check.
Result:
- agent_passed — required fields, enums, candidate/conflict/legacy paths, and mapping are present.

## E5 Verify/finish boundary

Architecture evidence: C1, C4, C6 — verify proves behavior/invariants and finish closes confirmed documentation without approving unconfirmed drift.
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: N/A
Scope: rope-verify and rope-finish skill/reference files
Command or Steps:
- Inspect verify classification for pending documentation updates.
- Inspect finish terminal outcomes and unconfirmed-change pause.
Pass Criteria:
- Confirmed pending docs are routed to finish without being a code finding.
- Unconfirmed architecture changes pause instead of being auto-approved.
Failure Report:
- Record the contradictory rule and path.
Forbidden Out-of-Scope Actions:
- Do not create or update an ADR/spec during this E2E check.
Result:
- agent_passed — verify distinguishes pending-finish from code findings; finish has four terminal outcomes and a human pause.
