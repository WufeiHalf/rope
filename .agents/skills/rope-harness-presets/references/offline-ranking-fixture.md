# Offline Ranking Fixture (E3)

Simulates research failure: no web sources, heuristics only.

## Input

```text
enabledModels:
  - vendor/alpha-flash
  - vendor/beta-pro
  - vendor/gamma-max
```

Research: forced failure / unavailable.

## Expected ranking decision record

```json
{
  "host": "pi",
  "confidence": "low",
  "sources": [
    "enabledModels from ~/.pi/agent/settings.json",
    "offline heuristics"
  ],
  "roles": {
    "explore": {
      "agent": "rope-explore",
      "model": "vendor/alpha-flash",
      "thinking": "low"
    },
    "implementer": {
      "agent": "rope-implementer",
      "model": "vendor/beta-pro",
      "thinking": "medium"
    },
    "reviewer": {
      "agent": "rope-reviewer",
      "model": "vendor/gamma-max",
      "thinking": "high"
    },
    "verify-inspector": {
      "agent": "rope-verify-inspector",
      "model": "vendor/gamma-max",
      "thinking": "medium"
    }
  }
}
```

## Pass criteria

- Complete four-role assignment still produced
- `confidence` is `low`
- `sources` includes offline heuristics
- Skill does not hard-fail solely due to missing web research
