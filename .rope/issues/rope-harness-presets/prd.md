# Rope Harness Presets

## Problem Statement

Rope leaf workers need host-specific model and effort bindings, but local
harness model catalogs change often. Skill-local `settings.json` pins (e.g.
`rope-verify`) are a second, incomplete channel and do not produce native
subagent presets. Without a portable preset skill, orchestrators either hardcode
models or silently inherit expensive session models.

## Solution

Add `rope-harness-presets`: a manually invoked skill that discovers the current
harness's available models, researches relative fit (with offline degrade),
writes medium-depth **harness-native** agent presets for Rope leaf roles into
the host **user-level** agents directory, and records a thin **user-global**
manifest. Retire `rope-verify`'s skill-local settings pin so presets are the
single pin path.

## Goals

- Ship skill `rope-harness-presets` with shared role schema and manifest format
- Implement a real **pi** writer (discover models, write `rope-*.md` agents,
  write `~/.config/rope/harness/pi.json`)
- Cover four leaf roles: implementer, reviewer, explore, verify-inspector
- Encode default model + thinking/effort per role; document parent override
- Offline/web-fail path still produces presets with `confidence: low`
- Soft-degrade contract when presets/manifest missing (documented for later W1)
- Remove `rope-verify` skill-local settings pin and README guidance
- Install path works via existing `rope add` skill packaging

## Non-goals

- Parent-orchestrator workflow rewrite (W1: no-nested-spawn, go slice loop
  ownership, grill context-protective wording as a full cutover)
- Full Claude Code / Codex writers in v1 (detect host; report not implemented)
- Project-level agent dir as default write target
- Automatic/TTL refresh of presets
- Hard-blocking go/verify when presets are missing
- Dual-read compatibility with old `rope-verify/settings.json`
- Nested subagent spawning from leaf agents

## Public Interface / Behavior

- Skill name: `rope-harness-presets`
- Manual invoke only (user says refresh/generate harness presets, or skill name)
- Writes (pi):
  - `~/.pi/agent/agents/rope-implementer.md` (and three sibling roles)
  - `~/.config/rope/harness/pi.json`
- Agent names:
  - `rope-implementer`
  - `rope-reviewer`
  - `rope-explore`
  - `rope-verify-inspector`
- Removes `skills/rope-verify/settings.example.json` and settings policy from
  `rope-verify` SKILL + README (and installed copies via normal skill install)
- Optional one-shot migrate hint if an old settings file is found on disk

## Behavior Contract

- System under test: generating and recording harness-native Rope leaf presets
  from the current host model inventory, and retiring skill-local settings pins
- Trigger/input: user manually invokes `rope-harness-presets` (or equivalent
  phrase) on a supported or unsupported harness
- Collaborators: host settings/models files, host agents directory layout, web
  search/docs when available, existing rope skill installer
- Observable result:
  - four medium-depth native agent presets on disk (pi)
  - user-global manifest with role→agent/model/effort, sources, confidence
  - no rope-verify settings pin channel in shipped skills/docs
- Failure visibility:
  - unsupported host: clear "writer not implemented", no fake files
  - no models discovered: skill stops with explicit error, no empty silent success
  - research offline: presets still written, manifest `confidence: low`
- Forbidden shortcuts:
  - hardcoding a permanent model list in skill body as the only ranking source
  - writing project-level agents by default
  - auto-refresh without user invoke
  - leaf agent prompts that instruct spawning other agents
  - keeping dual settings.json pin as supported API

## References

- Research: `.rope/research/single-window-go-orchestration.md`
- Language: `.rope/CONTEXT.md` (Parent Orchestrator, Leaf Worker, Harness Profile)
- Related later work: W1 parent-orchestrator workflow (not this issue)

## Open Questions / Human Gates

- First real write into user home agents/config during E2E needs user approval
  (local user-write). See Gate Decisions.

## Gate Decisions

- Gate: E2 write user-level pi agents + global manifest
- Decision: approved
- Gate: E6 user acceptance of generated agent quality
- Decision: user-run
- Approved action: create/overwrite `rope-*.md` under the user's pi agents dir
  and write `~/.config/rope/harness/pi.json`
- Scope: current user home rope/pi config only; not project repo paths except
  skill sources under this rope repository
- Risk: overwrites prior `rope-*` agent defs and manifest for host `pi`
- Pass criteria: four agents + manifest exist and are readable; names match
  contract
- Failure report: paths attempted, errors, partial files left
- Forbidden out-of-scope actions: delete non-`rope-*` agents; change
  `settings.json` enabledModels; push/remote; write other users' homes
