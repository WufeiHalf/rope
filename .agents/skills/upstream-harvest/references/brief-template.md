# Review brief template

Write briefs under `.rope/upstream/mattpocock-skills/reviews/`.

## Naming

- Baseline: `YYYY-MM-DD-<shortsha>-baseline.md` (shortsha = first 7 of reviewed tip)
- Delta: `YYYY-MM-DD-<shortsha>.md` (shortsha = first 7 of reviewed tip)
- One primary brief per harvest batch; do not duplicate noisily on re-run of the same tip

## Common header

```markdown
# Upstream harvest review — <baseline|delta>

- Upstream: https://github.com/mattpocock/skills
- Reviewed tip: <full sha>
- Range: <last-reviewed-sha or "none (baseline)"> → <tip>
- Clone: <path from source.md>
- Correspondence policy: C1 high only
- Status: open | closed
- Closed at: _(empty until close)_
```

## Baseline body

```markdown
## Baseline note

First pin of this upstream for Rope harvest. No adopt/adapt recommendation list
on baseline (B1). Delta harvest starts on the next run after close.

## Allowlist snapshot (C1 high)

| Matt skill | Rope target | Notes |
| --- | --- | --- |
| …from correspondence.md high rows… | … | optional one-liner |

## Human marks

_(none on baseline — close only pins SHA)_

## Close

- [ ] Human closed batch
- last-reviewed-sha after close: <tip or unchanged if abandoned>
```

**Baseline forbid:** adopt/adapt suggestion lists, product skill edits, advancing
SHA before human close.

## Delta body

```markdown
## Summary

- Commits in range (allowlist-touching): <n or "none">
- Material allowlist changes: yes | no
- Suggested attention: <one short paragraph>

## Per-skill changes (C1 high)

### `<matt-skill>`

- Rope target: `skills/rope-…` (from correspondence)
- Change summary: <what moved in SKILL.md / references>
- Suggested mark: adopt | adapt | ignore | watch
- Rationale: <one or two sentences>
- Human mark: _(pending)_

## Paths missing upstream

- <allowlist path>: not present at tip — listed, not silently skipped

## Watch (only if human named)

_(omit section if unused)_

## Human marks (batch)

| Item | Suggested | Human | Follow-up |
| --- | --- | --- | --- |
| … | adapt | _(pending)_ | ordinary edit after say-so; not this skill |

## Close

- [ ] Human closed batch
- last-reviewed-sha after close: <reviewed tip>
```

## Marks vocabulary

| Mark | Meaning |
| --- | --- |
| `adopt` | Idea fits; plan a small ordinary edit into Rope after close |
| `adapt` | Useful with Rope-shaped rewrite; still a separate edit/issue |
| `ignore` | Not for Rope; do not re-raise unless upstream changes again |
| `watch` | Interesting later; not acting now |

Harvest **never** applies marks by editing `skills/rope-*` (A1).
