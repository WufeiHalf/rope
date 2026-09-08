---
name: rope-harness-presets
description: Discovers the active harness's agent mechanism and model catalog, then writes Rope leaf worker presets in that harness's native format plus a user-global manifest. Invoke by name when refreshing harness presets.
disable-model-invocation: true
---

# Rope Harness Presets

Generate or refresh host-native agent presets for Rope leaf roles **on
whatever harness this skill runs in**. Discovery-based: no host is hardcoded
— the running model probes the host's ecosystem and writes native files.
Manual invoke only.

| Reference | Contents |
| --- | --- |
| [host-discovery.md](references/host-discovery.md) | Core procedure: identify host, probe agent registry + models, capability gaps |
| [role-schema.md](references/role-schema.md) | Shared leaf roles, agent names, tool bounds (host-neutral) |
| [manifest-schema.md](references/manifest-schema.md) | User-global manifest shape and soft-degrade contract |
| [agent-templates.md](references/agent-templates.md) | Medium-depth agent body rules and no-nested-spawn (host-neutral) |
| [pi-adapter.md](references/pi-adapter.md) | Worked example: one complete discovery/write cycle (pi) |
| [ranking.md](references/ranking.md) | Ranking procedure, offline heuristics, confidence |
| [offline-ranking-fixture.md](references/offline-ranking-fixture.md) | Research-fail → confidence low still ranks |
| [discovery-fixtures.md](references/discovery-fixtures.md) | Dry checks |
| [explore-research-mode.md](references/explore-research-mode.md) | Explore research mode (ADR 0011) |
| [bounce-rate-replay.md](references/bounce-rate-replay.md) | Planner model-selection replay protocol |

## Host support

There is **no hardcoded host table**. Any harness whose custom-agent mechanism
can be discovered per host-discovery.md is supported at run time. pi ships a
full worked example (pi-adapter.md); probe leads for codex/agy are embedded in
host-discovery.md (dated leads, verify locally — never trust them over a local
probe or current docs).

## Workflow

Execute every step. Mark each completion criterion before moving on.

### 1. Resolve host

Follow [host-discovery.md](references/host-discovery.md) §1: session
self-report, config-directory fingerprints, or a user-named host.

- Ambiguous → list the candidates with the evidence seen, ask the user once.
- Unidentifiable → report `host_unidentified` and stop. No writes of any kind.

Completion:
- [ ] Host identity recorded with its evidence source
- [ ] Ambiguous/unidentified path stopped without writes (when applicable)

### 2. Discover the host agent mechanism

Follow host-discovery.md §2: locate the host's custom-agent registry and its
file format; confirm against a local working example or current official docs
(web research when available; a user proxy is acceptable when offered).

- Mechanism found → record format, frontmatter/field names, and write targets.
- The host has **no** custom-agent mechanism, or registration cannot be
  verified → record a **capability gap**, report `no_agent_mechanism`, write no
  agent files. Optionally (only if the user asks for a persistent record)
  write a manifest whose `capability_gaps` carries it. Never fabricate agent
  paths to keep the flow moving.

Completion:
- [ ] Registry path + format + field names recorded (or explicit gap)
- [ ] No writes happened for an unverifiable mechanism

### 3. Discover available models

Follow host-discovery.md §3: read the host's model inventory from its native
config/settings/catalog. Enrich read-only when the host offers a catalog.

- Missing, empty, or unparsable → fail with `no_models_discovered`. Do not
  write presets.

Completion:
- [ ] Model list captured (or explicit failure)
- [ ] No mutation of any host model/provider settings

### 4. Rank models into three roles

Follow [ranking.md](references/ranking.md) (unchanged, host-neutral input):

1. Attempt lightweight web/docs research on relative model fit when network
   tools are available.
2. If research fails or is unavailable, use local name/capability heuristics.
3. Assign one model + default thinking/effort to each role:
   `implementer`, `reviewer`, `explore`.
4. Record sources and confidence (`high` | `medium` | `low`). Offline /
   research-fail always still ranks; set `confidence: low`.

Parent may override model or thinking at spawn time; presets only supply
defaults. Do not hardcode a permanent global winner list in this skill body.

### 5. Write harness-native agents

For each role, write/overwrite the agent file at the **host-native location
in the host-native format** discovered in step 2 (pi: Markdown + frontmatter
under `~/.pi/agent/agents/`; codex: TOML under `~/.codex/agents/`; agy:
Markdown + frontmatter under `.agents/agents/` or its global equivalent —
whatever step 2 verified):

| Role | Agent name |
| --- | --- |
| implementer | `rope-implementer` |
| reviewer | `rope-reviewer` |
| explore | `rope-explore` |

Rules:

- Only touch `rope-*` agent files.
- Frontmatter/fields must carry the model + thinking/effort in the form the
  host accepts (e.g. pi `model`/`thinking`; codex `model`/
  `model_reasoning_effort`).
- Body follows role-schema + agent-templates (host-neutral): role contract,
  tool bounds, output format, **forbid nested spawn**.
- Re-run is idempotent: same paths, clean overwrite.

Completion:
- [ ] Three `rope-*` files exist, readable, in the verified host format
- [ ] Each forbids nested spawn
- [ ] No non-`rope-*` agents modified

### 6. Write user-global manifest

Write `~/.config/rope/harness/<host>.json` per
[manifest-schema.md](references/manifest-schema.md). Create parent dirs if
needed. Overwrite a corrupt/partial prior manifest with a valid full one.
Append `capability_gaps` when step 2 found any.

Completion:
- [ ] Manifest maps all three roles → agent name, model, thinking/effort,
      sources, confidence
- [ ] `host`, `generated_at`, and skill identity present

### 7. Report

Return a short report only:

- host (+ how identified), confidence, sources summary
- agent paths written (host-native), manifest path
- capability gaps / degrade notes (`research_offline`, `no_agent_mechanism`,
  migrate hint if old `rope-verify/settings.json` is found on disk)

## Graph-driven concurrency (waves)

`rope-go` runs the slice graph wave by wave: frontier slices with disjoint
owned files spawn **multiple concurrent `rope-implementer` leaves**, all from
the presets written above — through the host's own subagent mechanism.

- The manifest and agent naming already support concurrent multi-spawn: one
  preset per role, instantiated once per spawned leaf.
- **No schema change** to the manifest, role-schema, or rankings.
- **No new model mechanism** — model routing reuses the same harness presets;
  parent may still override model/thinking at spawn time per leaf.
- Each concurrent leaf is still an ordinary `rope-implementer` leaf: no nested
  spawn, same tool bounds, same output format.

## Explore research mode & declared dispatch deviation (ADR 0011)

- **Research is a mode of `rope-explore`**, selected by the brief: a research
  brief unlocks web/search + write scoped to `.rope/research/**` (findings
  artifact only); default and scanner dispatches stay read-only. See
  [references/explore-research-mode.md](references/explore-research-mode.md).
  No fourth agent name; the three core roles and the ranking flow are
  unchanged.
- **Declared deviation:** spawning with a `type` or `model` that differs from
  the preset row requires a one-line reason in the dispatch record (what host
  capability the preset lacks). Undeclared deviation is a dispatch defect.
- **Bounce-rate replay protocol:** planner-window model selection is measured,
  not guessed — see [references/bounce-rate-replay.md](references/bounce-rate-replay.md).

## Soft-degrade contract (for consumers)

If the manifest or `rope-*` agents are missing later, orchestrators
(`rope-go`, `rope-verify`) soft-degrade: use generic host workers, record
`preset_missing`, continue. No hard block; no auto-refresh. A manifest
`capability_gaps` entry (e.g. the host cannot spawn model-pinned subagents)
is information for the same degrade path — record it, use generic workers,
do not treat it as failure.

## Guardrails

- Manual refresh only — never invent TTL/auto-refresh.
- **No per-host writer branches in this skill**: host specifics live as dated
  leads in host-discovery.md and the pi worked example. New hosts are
  discovered at run time, not coded here.
- Do not change host model scope or provider settings.
- Do not delete non-`rope-*` agents.
- Do not write project-level agent dirs by default.
- Do not claim success for an undiscoverable mechanism; never write fake agent
  paths into a manifest.
- Probing one host must never write another host's paths.
- Do not hard-fail solely because web research is unavailable.
- Leaf presets must not instruct spawning other agents.
