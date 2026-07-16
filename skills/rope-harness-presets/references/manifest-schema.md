# Rope Harness Manifest Schema

## Location

User-global only:

```text
~/.config/rope/harness/<host>.json
```

For pi: `~/.config/rope/harness/pi.json`.

Not project `.rope/`. Not skill-local settings. Not a second prompt database.

## Shape

```json
{
  "host": "pi",
  "generated_at": "2026-07-16T12:00:00Z",
  "skill": "rope-harness-presets",
  "confidence": "low",
  "sources": [
    "enabledModels from ~/.pi/agent/settings.json",
    "offline heuristics"
  ],
  "roles": {
    "implementer": {
      "agent": "rope-implementer",
      "model": "provider/modelId",
      "thinking": "medium",
      "path": "~/.pi/agent/agents/rope-implementer.md"
    },
    "reviewer": {
      "agent": "rope-reviewer",
      "model": "provider/modelId",
      "thinking": "high",
      "path": "~/.pi/agent/agents/rope-reviewer.md"
    },
    "explore": {
      "agent": "rope-explore",
      "model": "provider/modelId",
      "thinking": "low",
      "path": "~/.pi/agent/agents/rope-explore.md"
    },
    "verify-inspector": {
      "agent": "rope-verify-inspector",
      "model": "provider/modelId",
      "thinking": "medium",
      "path": "~/.pi/agent/agents/rope-verify-inspector.md"
    }
  }
}
```

## Field rules

| Field | Required | Notes |
| --- | --- | --- |
| `host` | yes | Harness id (`pi`, …) |
| `generated_at` | yes | ISO-8601 UTC |
| `skill` | yes | Always `rope-harness-presets` |
| `confidence` | yes | `high` \| `medium` \| `low` |
| `sources` | yes | Non-empty string array describing how ranking was produced |
| `roles` | yes | Must include all four role keys |
| `roles.*.agent` | yes | Exact rope agent name |
| `roles.*.model` | yes | Host model id as written into agent frontmatter |
| `roles.*.thinking` | yes | Host thinking/effort level |
| `roles.*.path` | yes | Absolute or `~/…` path of the agent file |

## Write policy

- Create `~/.config/rope/harness/` if missing.
- Overwrite the whole file on each successful run (idempotent).
- Corrupt/partial prior content is not merged — replace with a valid full manifest.
- Do not write a manifest if agent writes failed mid-way; report partial failure
  with paths attempted.

## Soft-degrade contract (consumers)

When `rope-go` / `rope-verify` / a future parent orchestrator wants a leaf:

1. If `~/.config/rope/harness/<host>.json` exists and maps the role, prefer the
   named `rope-*` agent (and its pinned model/thinking).
2. If missing or unreadable: record `preset_missing`, use a generic host worker
   without forced model pin, continue. Do **not** hard-block. Do **not**
   auto-run this skill.
