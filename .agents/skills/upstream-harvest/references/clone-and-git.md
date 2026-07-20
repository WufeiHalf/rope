# Clone and git conventions (S1)

Pin mechanism: **machine-local clone + last-reviewed SHA**. Not a git submodule.
Upstream is not a Rope runtime or `rope add` dependency.

## Paths

| Item | Default / source |
| --- | --- |
| Remote URL | `https://github.com/mattpocock/skills` (from `source.md`) |
| Default branch | `main` (from `source.md`) |
| Local clone | `~/.cache/rope-upstream/mattpocock-skills` unless `source.md` overrides |
| Reviewed pin | `last-reviewed-sha` in `.rope/upstream/mattpocock-skills/source.md` |

Expand `~` to the maintainer home. Do not invent a second cache root without
updating `source.md`.

## Ensure clone

1. If clone path is missing or not a git repo:
   - `git clone https://github.com/mattpocock/skills <clone-path>`
2. If clone exists:
   - `git -C <clone-path> remote get-url origin` must match the URL in `source.md`
     (or a documented equivalent). On mismatch, stop and ask — do not overwrite.
   - `git -C <clone-path> fetch origin`
   - Check out / update local tracking of default branch as needed for diff

## Resolve tips

- **Current tip:** `git -C <clone-path> rev-parse origin/<default-branch>` after fetch
  (or the branch named in `source.md`).
- **Last reviewed:** the full SHA in `source.md` `Last reviewed SHA`.
- **Shortsha:** first 7 hex chars of the reviewed tip, for brief filenames.

## Diff scope (C1)

Default: only paths for correspondence rows with interest `high`
(typically each Matt skill dir: `<skill>/SKILL.md` and that skill’s tree).

```bash
# Illustrative — paths derived from correspondence high rows
git -C <clone-path> log --oneline <last>..<tip> -- <allowlist paths…>
git -C <clone-path> diff <last> <tip> -- <allowlist paths…>
```

Do **not** default to full-repo `git log` / `git diff` without path filters.
`watch` rows only when the human names them. `out` rows never scanned.

## Failure modes (must surface)

| Situation | Behavior |
| --- | --- |
| No network / fetch fails | Stop; report git stderr class; do not claim up to date |
| Clone path unreadable | Stop; report path |
| `last-reviewed-sha` not in clone | Stop; suggest re-baseline or repair — no silent invent |
| Allowlist path absent at tip | List in brief under missing paths |

## Forbidden

- Adding `mattpocock/skills` as a git submodule of this Rope repo
- Vendoring upstream trees into `skills/` or the product package
- Pushing to the upstream remote
- Installing Matt skills into global agent dirs as part of harvest
