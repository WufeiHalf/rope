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

Names only — not recommendations.

| Matt skill | Rope target | Notes |
| --- | --- | --- |
| …from correspondence.md high rows… | … | optional one-liner |

## Human marks

_(none on baseline — close only pins SHA)_

## Close

- [ ] Human closed batch
- last-reviewed-sha after close: <tip or unchanged if abandoned>
```

### Baseline structural rules (checkable)

| Rule | Required |
| --- | --- |
| Filename ends with `-baseline.md` | yes |
| Header `Reviewed tip` is full SHA from fetch | yes |
| Range starts with `none (baseline)` | yes |
| **No** section titled like “Suggested marks”, “Adopt list”, or per-skill `Suggested mark:` rows | **forbid** |
| **No** `adopt` / `adapt` recommendation list (table or bullets) | **forbid** |
| Allowlist snapshot may list correspondence **names** only | yes |
| `Status: open` until human close | yes |
| Product `skills/rope-*` not edited when writing this brief | yes |

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

- Rope target: `skills/rope-…` or `_(none yet)_` (from correspondence)
- Change summary: <what moved in SKILL.md / references; or "unchanged">
- Suggested mark: adopt | adapt | ignore | watch
- Rationale: <one or two sentences; proposals only>
- Human mark: _(pending)_

_(Prefer one subsection per **changed** or **missing** high skill.
Unchanged high skills may be omitted or listed in a single “Unchanged” line.)_

## Paths missing upstream

- `<matt-skill>` (`<path>`): not present at tip — listed, not silently skipped
- _(or “none” if every high path exists at tip)_

## Watch (only if human named)

_(omit section entirely if the human did not name watch rows for this run)_

### `<named-watch-skill>`

- Rope target: …
- Change summary: …
- Suggested mark: watch | ignore | …
- Human mark: _(pending)_

## Human marks (batch)

| Item | Suggested | Human | Follow-up |
| --- | --- | --- | --- |
| … | adapt | _(pending)_ | ordinary edit after say-so; **not** this skill |

## Close

- [ ] Human closed batch
- last-reviewed-sha after close: <reviewed tip full SHA, or unchanged if abandoned>
```

### Delta structural rules (checkable)

| Rule | Required |
| --- | --- |
| Filename `YYYY-MM-DD-<shortsha>.md` (**not** `*-baseline.md`) | yes |
| Header `Reviewed tip` is full SHA of fetched tip | yes |
| Range is `<last-reviewed-sha> → <tip>` (both full SHAs) | yes |
| Summary states material allowlist changes yes/no | yes |
| Suggested marks are labeled **Suggested** (proposals only) | yes |
| Human mark fields start pending until human provides them | yes |
| Missing allowlist paths listed (or explicit “none”) — not silent skip-all | yes |
| Watch section only if human named watch rows | yes |
| **No** product `skills/rope-*` edits when writing or closing this brief | **forbid** |
| **No** advancing SHA before human close | **forbid** |
| Clean no-op (tip == last): **no** invent adopt list; optional skip file | yes |

**Delta forbid:** auto-editing product skills, advancing SHA without close,
full-repo scan as default, treating suggested marks as applied work.

### Clean no-op report (tip == last-reviewed-sha)

Do **not** open a noisy empty delta brief. Report to the human, e.g.:

```text
Delta no-op: origin/<branch> tip equals last-reviewed-sha (<full sha>).
No material C1 allowlist changes. Pin unchanged (close not required).
skills/rope-* not touched.
```

If a brief is still written, it must say material changes **no** and contain
**zero** invented adopt/adapt items.

## Marks vocabulary

| Mark | Meaning |
| --- | --- |
| `adopt` | Idea fits; plan a small ordinary edit into Rope after close |
| `adapt` | Useful with Rope-shaped rewrite; still a separate edit/issue |
| `ignore` | Not for Rope; do not re-raise unless upstream changes again |
| `watch` | Interesting later; not acting now |

Harvest **never** applies marks by editing `skills/rope-*` (A1).
Suggested marks on the brief are **proposals only** until the human records a
human mark; even then, product edits are a separate ordinary follow-up.
