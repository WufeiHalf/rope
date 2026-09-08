# Discovery Fixtures and Agent-Run Checklist

Markdown-only skill: execute these checks when implementing or verifying the
discovery path. No host mutation.

## Fixture A — sample model inventory parse

Input file shape (pi example, `~/.pi/agent/settings.json` excerpt):

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

(Non-pi hosts: same discipline against their native inventory source —
e.g. codex `config.toml` + catalog `models[]`.)

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

Same outcome when the inventory is missing or unparsable.

## Fixture C — host has no discoverable agent mechanism → capability gap

Preconditions: host identified (e.g. `some-host`), but no custom-agent
registry could be located or verified per host-discovery §2.

Expected:

```text
error = no_agent_mechanism
host = some-host
agent_writes = none
capability_gap_recorded = yes
manifest = absent, unless the user asked to persist the gap
```

Must not:

- create another host's `rope-*` agents as a stand-in
- write `~/.config/rope/harness/<host>.json` claiming agents were written
- guess a format from a similar host

## Fixture D — host unidentifiable → stop

Preconditions: no self-report, no user-named host, no config fingerprint.

Expected:

```text
error = host_unidentified
candidates = <what was probed, with evidence>
writes = none
```

## Agent-run checklist

- [ ] Read the host's real model inventory when identified; list models
- [ ] Simulate empty inventory via Fixture B; confirm hard stop
- [ ] Simulate no-mechanism via Fixture C; confirm gap report, no writes
- [ ] Simulate unidentified host via Fixture D; confirm stop with candidates
- [ ] Confirm skill never instructs mutating any host's model/provider settings
