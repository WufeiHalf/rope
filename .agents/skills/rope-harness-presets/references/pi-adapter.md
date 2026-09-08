# Pi Adapter (Worked Example)

A complete worked example of one discovery/write cycle, for pi. New hosts do
**not** get a file like this — they are discovered at run time per
[host-discovery.md](host-discovery.md). Use this file to see what a verified
cycle looks like end to end.

## Discovery (read-only)

| Source | Path | Use |
| --- | --- | --- |
| Primary model inventory | `~/.pi/agent/settings.json` → `enabledModels` | Required list of `provider/modelId` |
| Optional enrichment | `~/.pi/agent/models.json` | Names, reasoning flags, thinking maps |
| Project override note | `<cwd>/.pi/settings.json` | May also list `enabledModels`; prefer merge semantics if both exist — **user-global settings are the default source for this skill** unless the user asks for project scope |

### Parse rules

1. Load `~/.pi/agent/settings.json` as JSON.
2. Read `enabledModels` as an array of strings.
3. Normalize entries to `provider/modelId` (already the pi form).
4. If the file is missing, JSON is invalid, `enabledModels` is missing, or the
   array length is 0 → **`no_models_discovered`**. Stop. Do not write agents
   or manifest.
5. Optionally map each id through `models.json` `providers.*.models[]` for
   display name / `reasoning` / supported thinking levels. Enrichment failure
   is non-fatal.

### Forbidden mutations

- Do not edit `settings.json`, `enabledModels`, or `models.json`.
- Do not delete non-`rope-*` files under `~/.pi/agent/agents/`.

## Write targets

| Artifact | Path |
| --- | --- |
| Agents | `~/.pi/agent/agents/rope-implementer.md` (and three siblings) |
| Manifest | `~/.config/rope/harness/pi.json` |

Create parent directories as needed (`agents/`, `~/.config/rope/harness/`).

## Frontmatter fields pi-subagents accepts

Minimum for Rope presets:

```yaml
description: ...
display_name: ...
tools: ...
model: provider/modelId
thinking: low|medium|high|...
prompt_mode: replace
```

`model` and `thinking` in frontmatter are authoritative for that agent type
when spawned without parent override.

## Error classes (observable)

| Class | When | Behavior |
| --- | --- | --- |
| `no_models_discovered` | empty/missing inventory | Stop; no writes |
| `host_unidentified` / `no_agent_mechanism` | see host-discovery §1/§2 | Per host-discovery; no pi path writes involved |
| `research_offline` | web/docs research failed | Continue with heuristics; `confidence: low` |
| `partial_write` | agent or manifest write failed mid-run | Report paths attempted; do not claim full success |

## Non-pi hosts (pointer)

When host is not pi, the run follows host-discovery.md §1–§7 on that host.
This file's rules still apply defensively: never write pi paths from a
non-pi run, and never fabricate agent paths for any host.

## Optional migrate hint

If `skills/rope-verify/settings.json` (or an installed copy under an agent
skills dir) still exists with `review.subagent` pins, mention once:

> Old rope-verify skill-local settings pin detected. Presets from this skill
> replace that channel; you may delete the old settings.json after verifying
> rope-* agents work.

Do not auto-delete it.
