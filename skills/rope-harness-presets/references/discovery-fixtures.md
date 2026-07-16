# Discovery Fixtures and Agent-Run Checklist

Markdown-only skill: execute these checks when implementing or verifying the
discovery path. No host mutation.

## Fixture A — sample enabledModels parse

Input file shape (`~/.pi/agent/settings.json` excerpt):

```json
{
  "enabledModels": [
    "vendor/alpha-flash",
    "vendor/beta-pro",
    "vendor/gamma-max"
  ]
}
```

Expected discovery result:

```text
models = [
  "vendor/alpha-flash",
  "vendor/beta-pro",
  "vendor/gamma-max"
]
error = null
```

## Fixture B — empty list → fail

```json
{
  "enabledModels": []
}
```

Expected:

```text
error = no_models_discovered
writes = none
```

Same outcome when `enabledModels` is missing or the JSON file is absent.

## Fixture C — host ≠ pi → not implemented

Preconditions: skill invoked with host `claude-code` (or any non-pi id), or
the environment is known non-pi and the user did not request a pi write.

Expected:

```text
error = writer_not_implemented
host = <that host>
writes = none
```

Must not create:

- `~/.pi/agent/agents/rope-*.md` as a stand-in
- `~/.config/rope/harness/<host>.json` claiming agents were written

## Agent-run checklist (Slice 2 / E4)

- [ ] Read real `~/.pi/agent/settings.json` when host is pi; list enabled models
- [ ] Simulate empty list mentally or against Fixture B wording; confirm skill
      documents hard stop
- [ ] Simulate host≠pi via Fixture C; confirm skill documents not-implemented
- [ ] Confirm skill never instructs mutating `enabledModels`
