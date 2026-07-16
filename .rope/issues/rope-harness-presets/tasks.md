# Rope Harness Presets Tasks

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes | Slice 2–3: pi discover → rank → write agents + manifest |
| Alternate input or entrypoint | yes | Slice 1: invoke via skill name or “刷新 harness preset” phrasing in skill description |
| Empty or missing input | yes | Slice 2: no models / empty enabled list → explicit failure |
| Invalid or malformed input | yes | Slice 3: corrupt/partial prior manifest → overwrite with valid new manifest |
| Unavailable or not-ready dependency | yes | Slice 2: non-pi host → not-implemented message, no fake writes; Slice 3: web research fail → local heuristics |
| Duplicate or idempotent case | yes | Slice 3: re-run skill overwrites same `rope-*` paths cleanly |
| Boundary or limit case | yes | Slice 1: medium template bounds (no nested-spawn, no full go skill dump) |
| Existing behavior compatibility | yes | Slice 4: remove verify settings pin without breaking verify core workflow text |
| Real entrypoint or integration path | yes | E2E: manual skill run on this machine’s pi (gated) |

## Slice 1: Skill skeleton, role schema, template contract

- Status: completed
- Goal: Add `rope-harness-presets` skill package with role schema, manifest schema, medium agent body rules, and no-nested-spawn leaf rules
- Scope:
  - `skills/rope-harness-presets/SKILL.md` (+ references as needed)
  - ensure `rope add` will install it (bundled skills layout)
  - document four roles and agent names
- Matrix rows: Alternate entrypoint; Boundary/limit (template depth)
- Public behavior:
  - skill is discoverable by name/description
  - documents outputs paths and role names
  - template rules: medium depth; tools bounds; output format; forbid nested spawn
- Tests:
  - skill package validates with project’s usual skill validator if available
  - structural check: required sections present (roles, manifest path, pi writer, offline degrade, retire settings note)
- Implementation notes:
  - do not hardcode permanent model winners in skill body
  - host adapter table: pi = implemented; others = not implemented
- Verification: structural checklist pass; nested-spawn forbid grepped in SKILL + refs; validator not vendored (`quick_validate.py` unavailable)
- Review: review_degraded — leaf implementer; no nested reviewer spawn; self-review of contract surface
- Review reason: public skill contract and multi-harness surface
- Stop conditions: role/manifest/path undecided (already decided in grill)

## Slice 2: Pi model discovery + unsupported-host behavior

- Status: pending
- Goal: Skill instructs/implements reliable discovery of pi available models and clear failure/not-implemented paths
- Scope:
  - pi: read user `settings.json` enabledModels / models.json as documented in skill references
  - empty model list → fail visibly
  - non-pi harness → report writer not implemented; do not write pi paths pretending success
- Matrix rows: Empty/missing input; Unavailable dependency (unsupported host)
- Public behavior:
  - discovery sources named in skill
  - observable error strings/classes for no-models and unsupported-host
- Tests:
  - fixture or documented dry checks for: sample enabledModels parse; empty list; host≠pi
  - if pure markdown skill: reference examples + agent-run checklist that go must execute
- Implementation notes:
  - prefer read-only discovery; no mutation in this slice except docs/examples under repo
- Verification: fixture/checklist pass
- Review: required
- Review reason: host coupling and failure modes
- Stop conditions: cannot locate any pi model config path on target host docs

## Slice 3: Ranking, offline degrade, write agents + manifest

- Status: pending
- Goal: Rank models into four roles with research-when-available; always capable of local-heuristic ranking; write medium `rope-*.md` and `~/.config/rope/harness/pi.json`
- Scope:
  - ranking procedure + sources recording
  - default thinking/effort per role (parent override documented)
  - write/overwrite four agents under `~/.pi/agent/agents/`
  - write manifest under `~/.config/rope/harness/pi.json`
  - idempotent re-run
- Matrix rows: Primary path; Invalid/malformed prior manifest; Unavailable research; Duplicate/idempotent; Real entrypoint (with E2)
- Public behavior:
  - files exist with correct names and frontmatter model/thinking fields host accepts
  - body is medium-depth leaf contract
  - manifest maps each role → agent name, model, effort, sources, confidence
- Tests:
  - template snapshot or schema check for agent markdown + manifest JSON shape
  - offline path sets confidence low
  - re-run does not create non-rope clutter
- Implementation notes:
  - only touch `rope-*` agent files
  - create parent dirs for `~/.config/rope/harness/` as needed
- Verification: schema checks + gated live write E2
- Review: required
- Review reason: user-home writes and ranking quality contract
- Stop conditions: human gate denied for live write (then E2 skipped_by_user)

## Slice 4: Retire rope-verify settings pin + README

- Status: pending
- Goal: Single pin path — delete skill-local settings API for verify subagent model
- Scope:
  - remove `skills/rope-verify/settings.example.json`
  - remove Subagent Model Policy settings.json section from `rope-verify` SKILL (replace with: use harness presets / soft degrade)
  - update README Optional Skill Settings
  - mirror in package layout so `rope add` installs clean tree
  - optional: if old settings.json found, skill text says migrate hint only
- Matrix rows: Existing behavior compatibility
- Public behavior:
  - no shipped settings.example for verify pins
  - verify skill no longer tells agents to read skill-local settings for model
  - docs point to `rope-harness-presets`
- Tests:
  - grep repo for `settings.example.json` / review.subagent settings guidance residual
  - verify skill still describes issue-level verify workflow intact
- Implementation notes:
  - do not gut verify itself; only pin channel
- Verification: grep clean + read-through verify skill
- Review: required
- Review reason: public docs/skill contract removal
- Stop conditions: none

## Slice 5: Soft-consume note for future orchestrator (minimal)

- Status: pending
- Goal: Document how go/verify should prefer `rope-*` presets when present without implementing full W1 orchestrator
- Scope:
  - short pointer in `rope-go` and/or `rope-verify` references: if manifest exists, prefer named agents; else soft degrade `preset_missing`
  - no full slice-loop ownership rewrite
- Matrix rows: Existing behavior compatibility (forward compat)
- Public behavior:
  - skills mention manifest path and soft degrade
- Tests:
  - grep for `preset_missing` / manifest path mention
- Implementation notes:
  - keep W1 out of scope; this is a bridge, not parent orchestrator
- Verification: read-through
- Review: self-check
- Review reason: docs-only bridge; low risk if wording is careful
- Stop conditions: none
