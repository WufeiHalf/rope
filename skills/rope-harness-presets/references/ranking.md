# Ranking Procedure

Single source of procedure for mapping discovered models → leaf roles.
Do **not** treat any hardcoded model id list in skill body as permanent truth.

## Inputs

- `models[]`: discovered `provider/modelId` strings
- optional capability hints from `models.json`
- optional user constraints (prefer local, exclude provider) if the user stated any

**Catalog completeness:** rank against the **full** `enabledModels` list, not a
subset filtered to familiar GPT/DeepSeek/flash names. User default session model
and non-English-vendor ids (`glm`, `grok`, etc.) must remain in the pool until
role assignment consumes or deliberately skips them with a recorded reason.
Deduplicate same-family aliases across providers (e.g. multiple `grok-4.5`
providers) by preferring the user's default provider entry.

## Steps

### 1. Research when available

If web/docs tools work, briefly research relative strengths of the **currently
discovered** models only (coding quality, cost/speed, reasoning). Record
concrete sources (URLs or doc paths) in the manifest `sources` array.

Research is best-effort. Time-box it; do not block the skill on perfect data.

### 2. Offline / research-fail heuristics

If research is unavailable or fails, rank by **name and known class signals**
in the model id (case-insensitive). Still produce a complete four-role
assignment. Set `confidence: low` and include `"offline heuristics"` in
`sources`.

| Signal in model id | Bias toward |
| --- | --- |
| `flash`, `mini`, `haiku`, `lite`, `small`, `fast`, `nano`, `luna` | `explore` first; then cheap `implementer` if nothing else |
| `sonnet`, `pro` (non-max), mid tier without max/opus | `implementer` |
| `opus`, `max`, `ultrathink`, `sol`, `terra`, `o1`, `o3`, `gpt-5` high tiers, `reason` | `reviewer` / strong `verify-inspector` |
| `codex`, `code`, `composer`, `coder`, `devstral`, `qwen-coder` | `implementer` |
| `deepseek` + `pro` | strong mid: implementer or reviewer |
| `deepseek` + `flash` | explore / cheap implementer |
| `glm`, `grok` without flash/lite | general mid/strong — prefer implementer or reviewer by residual pool |

### 3. Role assignment algorithm

Work from a mutable pool of discovered models (duplicates of same model under
different providers: prefer the entry already in `enabledModels` order / user
default provider when tied).

1. **explore** — pick the cheapest/fastest signal in the pool. Default thinking
   `low`.
2. **reviewer** — pick the strongest judgment signal remaining. Default
   thinking `high`.
3. **verify-inspector** — pick a strong-but-not-necessarily-top model remaining
   (second-strongest, or same as reviewer if only one strong model). Default
   thinking `medium`.
4. **implementer** — pick the best remaining coding-capable mid/strong model.
   Default thinking `medium`.

If the pool has fewer than four models, **reuse** is allowed: the same model
may cover multiple roles. Prefer distinct models when possible.

If the pool has exactly one model, assign it to all four roles with role-default
thinking levels.

### 4. Confidence

| Situation | confidence |
| --- | --- |
| Research + clear tier separation across ≥3 models | `high` |
| Partial research or only mild tier signals | `medium` |
| Offline heuristics only, or single-model reuse | `low` |

### 5. Parent override reminder

Document in the run report (not inside every agent body): parent may pass a
different `model` / `thinking` at spawn; frontmatter defaults apply when the
parent omits them.

## Fixture: empty models

Input: `enabledModels: []`  
Expected: `no_models_discovered`, no files written.

## Fixture: offline ranking sketch

Input models:

```text
vendor/alpha-flash
vendor/beta-pro
vendor/gamma-max
```

Expected offline sketch:

| Role | Model | thinking |
| --- | --- | --- |
| explore | `vendor/alpha-flash` | `low` |
| implementer | `vendor/beta-pro` | `medium` |
| reviewer | `vendor/gamma-max` | `high` |
| verify-inspector | `vendor/gamma-max` or `vendor/beta-pro` | `medium` |

confidence: `low`, sources include offline heuristics.
