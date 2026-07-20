---
name: rope-harness-presets
description: Discovers the active harness model catalog and writes Rope leaf worker agent presets plus a user-global manifest. Invoke by name when refreshing harness presets.
disable-model-invocation: true
---

# Rope Harness Presets

Generate or refresh host-native agent presets for Rope leaf roles from the
current harness model inventory. Manual invoke only.

| Reference | Contents |
| --- | --- |
| [role-schema.md](references/role-schema.md) | Shared leaf roles, agent names, tool bounds |
| [manifest-schema.md](references/manifest-schema.md) | User-global manifest shape and soft-degrade contract |
| [agent-templates.md](references/agent-templates.md) | Medium-depth agent body rules and no-nested-spawn |
| [pi-adapter.md](references/pi-adapter.md) | Pi discovery paths, write targets, unsupported-host |
| [discovery-fixtures.md](references/discovery-fixtures.md) | Empty-models / unsupported-host dry checks |
| [ranking.md](references/ranking.md) | Ranking procedure, offline heuristics, confidence |
| [offline-ranking-fixture.md](references/offline-ranking-fixture.md) | Research-fail → confidence low still ranks |

## Host support

| Host | Writer |
| --- | --- |
| `pi` | implemented |
| other | not implemented — stop with a clear message; do not write pi paths |

## Workflow

Execute every step. Mark each completion criterion before moving on.

### 1. Resolve host

- Detect the active harness (this environment: pi when `~/.pi/agent/` exists
  and the session is pi; otherwise treat as non-pi unless the user names a host).
- If host ≠ `pi`: report `writer_not_implemented` for that host and stop.
  Do not create agents or a manifest pretending success.

Completion:
- [ ] Host identity recorded
- [ ] Non-pi path stopped with explicit not-implemented message (when applicable)

### 2. Discover available models (pi)

Follow [pi-adapter.md](references/pi-adapter.md):

1. Read `~/.pi/agent/settings.json` → `enabledModels` (array of
   `provider/modelId` strings).
2. Optionally enrich names/capabilities from `~/.pi/agent/models.json`
   (read-only; do not mutate).
3. If `enabledModels` is missing, empty, or unparsable → fail with
   `no_models_discovered`. Do not write presets.

Completion:
- [ ] Model list captured (or explicit failure)
- [ ] No mutation of `settings.json` / `enabledModels`

### 3. Rank models into four roles

Follow [ranking.md](references/ranking.md):

1. Attempt lightweight web/docs research on relative model fit when network
   tools are available.
2. If research fails or is unavailable, use local name/capability heuristics.
3. Assign one model + default thinking/effort to each role:
   `implementer`, `reviewer`, `explore`, `verify-inspector`.
4. Record sources and confidence (`high` | `medium` | `low`). Offline /
   research-fail always still ranks; set `confidence: low`.

Parent may override model or thinking at spawn time; presets only supply
defaults. Do not hardcode a permanent global winner list in this skill body.

Completion:
- [ ] All four roles have model + thinking
- [ ] Sources + confidence recorded
- [ ] Offline path still produced a full ranking when research failed

### 4. Write harness-native agents (pi)

For each role, write/overwrite the agent file under
`~/.pi/agent/agents/` using [agent-templates.md](references/agent-templates.md)
and the role contracts in [role-schema.md](references/role-schema.md):

| Role | Agent file |
| --- | --- |
| implementer | `rope-implementer.md` |
| reviewer | `rope-reviewer.md` |
| explore | `rope-explore.md` |
| verify-inspector | `rope-verify-inspector.md` |

Rules:

- Only touch `rope-*.md` agent files.
- Frontmatter must include `model` and `thinking` the host accepts.
- Body is medium depth: role contract, tool bounds, output format,
  **forbid nested spawn**. Not a full rope-go dump.
- Re-run is idempotent: same paths, clean overwrite.

Completion:
- [ ] Four `rope-*.md` files exist and are readable
- [ ] Each forbids nested spawn
- [ ] No non-`rope-*` agents modified

### 5. Write user-global manifest

Write `~/.config/rope/harness/pi.json` per
[manifest-schema.md](references/manifest-schema.md). Create parent dirs if
needed. Overwrite a corrupt/partial prior manifest with a valid full one.

Completion:
- [ ] Manifest maps all four roles → agent name, model, thinking/effort,
      sources, confidence
- [ ] `host`, `generated_at`, and skill identity present

### 6. Report

Return a short report only:

- host, confidence, sources summary
- agent paths written
- manifest path
- any degrade notes (`research_offline`, migrate hint if old
  `rope-verify/settings.json` found on disk)

## Soft-degrade contract (for consumers)

If the manifest or `rope-*` agents are missing later, orchestrators
(`rope-go`, `rope-verify`) soft-degrade: use generic host workers, record
`preset_missing`, continue. No hard block; no auto-refresh.

## Guardrails

- Manual refresh only — never invent TTL/auto-refresh.
- Do not change `enabledModels` or other host model scope settings.
- Do not delete non-`rope-*` agents.
- Do not write project-level agent dirs by default.
- Do not claim success for unsupported hosts.
- Do not hard-fail solely because web research is unavailable.
- Leaf presets must not instruct spawning other agents.
