# Rope Harness Presets E2E

## E1 Skill package structure and installability

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: this repository only
Command or Steps:
- Validate `skills/rope-harness-presets` exists with SKILL.md and required sections
- Run skill validator if available (`quick_validate.py` or equivalent)
- Confirm `rope add` target list would include the new skill (package layout)
Pass Criteria:
- Skill package present; required role/manifest/pi/offline/retire sections exist
- Validator passes when tool is available; otherwise structural checklist recorded
Failure Report:
- missing files/sections; validator output
Forbidden Out-of-Scope Actions:
- writing user home; network-dependent checks
Result:
- agent_passed
- Package present: SKILL.md + references (role-schema, manifest-schema,
  agent-templates, pi-adapter, discovery-fixtures, ranking, offline-ranking-fixture)
- `disable-model-invocation: true`; host table pi/other; nested-spawn forbid grepped
- `quick_validate.py` not vendored — structural checklist only
- Layout under `skills/` so `rope add` installs it

## E2 Live pi preset generation (user home write)

Executor: agent-with-gate
Risk: local-write
Gate Decision: approved
Approved Action: run `rope-harness-presets` for host pi and write/overwrite user-level `rope-*` agents plus `~/.config/rope/harness/pi.json`
Scope: current user's `~/.pi/agent/agents/rope-*.md` and `~/.config/rope/harness/pi.json` only
Command or Steps:
- Invoke skill in this environment after implementation
- Confirm four agent files and manifest written
- Confirm agent names and role keys match PRD
Pass Criteria:
- Four `rope-*.md` files exist; manifest exists and maps all four roles
- Agents include model/thinking defaults and leaf no-nested-spawn language
Failure Report:
- paths, partial writes, stderr, ranking confidence
Forbidden Out-of-Scope Actions:
- delete non-`rope-*` agents; modify enabledModels; remote/network deploys; other homes
Result:
- agent_passed
- Agents:
  - `~/.pi/agent/agents/rope-implementer.md` → arkegnines/deepseek-v4-pro medium
  - `~/.pi/agent/agents/rope-reviewer.md` → aio/gpt-5.6-sol high
  - `~/.pi/agent/agents/rope-explore.md` → arkegnines/deepseek-v4-flash low
  - `~/.pi/agent/agents/rope-verify-inspector.md` → aio/gpt-5.6-terra medium
- Manifest: `~/.config/rope/harness/pi.json` confidence high
- Plan.md and non-rope agents untouched; enabledModels untouched

## E3 Offline / research-fail degrade

Executor: agent
Risk: local-write
Gate Decision: not-required
Approved Action: n/a
Scope: repo fixtures and/or a controlled skill dry path that simulates research failure without requiring live web
Command or Steps:
- Exercise documented offline path (fixture or forced research failure)
- Inspect resulting manifest confidence/sources fields (fixture output or live if safe)
Pass Criteria:
- Offline path still produces a complete ranking decision record with `confidence: low` (or equivalent)
- Does not hard-fail solely due to missing web research
Failure Report:
- how research failure was simulated; actual skill behavior
Forbidden Out-of-Scope Actions:
- depending on external paid APIs as the only path
Result:
- agent_passed
- Simulated via `skills/rope-harness-presets/references/offline-ranking-fixture.md`
  (forced research failure on vendor/alpha-flash|beta-pro|gamma-max)
- Expected record includes confidence low + offline heuristics + all four roles

## E4 Unsupported host message

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: skill instructions + any dry-run/fixture for host≠pi
Command or Steps:
- Follow skill unsupported-host path (fixture or documented simulation)
Pass Criteria:
- Clear not-implemented outcome; no claim that non-pi agents were written
Failure Report:
- incorrect success claim; accidental pi path writes during non-pi simulation
Forbidden Out-of-Scope Actions:
- implementing full non-pi writers in this issue
Result:
- agent_passed
- Fixture C in discovery-fixtures.md + pi-adapter `writer_not_implemented`
- Skill host table: non-pi stops without writing pi paths

## E5 rope-verify settings pin removed

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: this repository skills + README
Command or Steps:
- Grep for `settings.example.json`, `review.subagent`, skill-local settings policy in verify/README
Pass Criteria:
- No shipped verify settings.example pin path; README no longer documents it as supported
- verify skill still describes issue-level verify behavior
Failure Report:
- residual references list
Forbidden Out-of-Scope Actions:
- rewriting verify workflow beyond pin retirement
Result:
- agent_passed
- `skills/rope-verify/settings.example.json` deleted
- Subagent Model Policy replaced with harness preset / soft-degrade policy
- README Optional Skill Settings replaced with Harness leaf presets section
- Remaining settings.example mentions are issue/research/history or migrate hints only
- Verify workflow (inputs, dimensions, verdicts, guardrails) intact

## E6 User acceptance of generated agent quality

Executor: user
Risk: human-judgment
Gate Decision: user-run
Approved Action: n/a
Scope: generated `rope-*` agents after E2
Command or Steps:
- User opens generated agents + manifest and judges role fit / model choices acceptable for local use
Pass Criteria:
- User reports accept or lists required re-rank fixes
Failure Report:
- which roles/models rejected and why
Forbidden Out-of-Scope Actions:
- none
Result:
- user_passed
- Final accepted mapping (after user re-ranks):
  - implementer: xai-auth/grok-4.5 medium
  - reviewer: xai-auth/grok-4.5 high
  - explore: arkegnines/deepseek-v4-flash low
  - verify-inspector: aio/gpt-5.6-sol medium
- User confirmed OK on 2026-07-16 (user-run)

## User validation steps (E6)

1. Open `~/.config/rope/harness/pi.json` and confirm role→model choices fit your budget/quality needs.
2. Open each `~/.pi/agent/agents/rope-*.md` and skim frontmatter + body.
3. Optionally spawn `rope-explore` on a tiny question to confirm model routing.
4. Report accept, or which roles need re-rank (then re-run `rope-harness-presets` after adjusting constraints).
