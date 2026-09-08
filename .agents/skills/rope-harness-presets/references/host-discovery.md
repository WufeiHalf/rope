# Host Discovery

The core procedure that makes this skill host-neutral. The running model
executes it **inside the target harness** — discovery is something the model
does, not a table it looks up. Worked example for one host (pi):
[pi-adapter.md](pi-adapter.md).

## §1 Identify the host

Evidence sources, in order of trust:

1. The harness names itself (session banner, env vars, self-report).
2. A host-named invocation ("refresh presets for codex").
3. Config-directory fingerprints — probe, do not assume:

| Fingerprint | Host |
| --- | --- |
| `~/.pi/agent/` exists | pi |
| `~/.codex/` exists | codex |
| `~/.gemini/` and/or project `.agents/agents/` | agy / Antigravity CLI |

- Ambiguous (multiple fingerprints): list candidates + evidence, ask the user
  once, record the answer.
- No fingerprint and no self-report: report `host_unidentified`, stop, no
  writes.

## §2 Discover the host agent mechanism

Find where custom agents/subagents are registered and in what file format.

Known leads (dated 2026-09-08; **leads, not authority** — always verify with a
local example or current docs before writing):

| Host | Registry | Format | Verify by |
| --- | --- | --- | --- |
| pi | `~/.pi/agent/agents/*.md` | Markdown + YAML frontmatter (`model`, `thinking`, `tools`, …) | existing agent files |
| codex | `~/.codex/agents/*.toml` | TOML (`name`, `description`, `model`, `model_reasoning_effort`, `developer_instructions`) | existing agent files; docs: learn.chatgpt.com subagents; watch version drift |
| agy | project `.agents/agents/*.md` (global equivalent per docs) | Markdown + YAML frontmatter | `agy agents` listing; docs: antigravity.google/docs/cli; known list-refresh bug — confirm registration |

Verification discipline:

1. Prefer a **local working example** (an existing agent file) over docs.
2. Otherwise consult current official docs; align the version actually
   installed locally (e.g. `codex --version`). Use a user proxy when offered
   and the network requires it.
3. Record what verified the mechanism (path read / doc URL + date) — it
   becomes a manifest `sources` entry.
4. Still unverifiable → **capability gap**: report `no_agent_mechanism`,
   write no agent files. Optionally persist the gap in the manifest's
   `capability_gaps` (user asks). Never guess a format from a similar host.

## §3 Discover the model inventory

Read-only, host-native:

| Host | Source |
| --- | --- |
| pi | `~/.pi/agent/settings.json` → `enabledModels` (enrich from `models.json`) |
| codex | `~/.codex/config.toml` → `model`, `model_providers.*`, `review_model`; catalog JSON via `model_catalog_json` (`{models[]}`) |
| agy | `--model`/config per docs; probe `~/.gemini/` equivalents |

- Empty / missing / unparsable → `no_models_discovered`; stop; no writes.
- Never mutate any of these files. Enrichment failure is non-fatal.

## §4 Confirm the invocation surface (optional but recommended)

Check whether the host reads a skills directory and a global instructions file
(`AGENTS.md`-class). This tells the user how rope skills themselves behave in
this host — it does not change what this skill writes. Record as a report
line, not a gate.

## §5 Write, §6 manifest, §7 report

Follow SKILL.md steps 5–7: three `rope-*` agent files in the verified native
format at the verified native location; manifest
`~/.config/rope/harness/<host>.json`; short report with confidence and any
capability gaps.

## Capability-gap examples worth recording when hit

- Host cannot spawn subagents with per-leaf model pinning (subagents inherit
  parent settings — codex newer-version behavior reported).
- File-based agents exist but never appear in the host's agent list (agy
  list-refresh bug reported).
- Agent registry exists but only inside a GUI, unreachable from the CLI a
  rope parent would drive.
