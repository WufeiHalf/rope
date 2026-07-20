# Clone and git conventions (S1)

Pin mechanism: **machine-local clone + last-reviewed SHA**. Not a git submodule.
Upstream is not a Rope runtime or `rope add` dependency.

## Paths

| Item | Default / source |
| --- | --- |
| Remote URL (HTTPS) | `https://github.com/mattpocock/skills` (from `source.md`) |
| Remote URL (SSH, preferred when keys work) | `git@github.com:mattpocock/skills.git` |
| Default branch | `main` (from `source.md`) |
| Local clone | `~/.cache/rope-upstream/mattpocock-skills` unless `source.md` overrides |
| Reviewed pin | `last-reviewed-sha` in `.rope/upstream/mattpocock-skills/source.md` |

Expand `~` to the maintainer home. Do not invent a second cache root without
updating `source.md`.

## Network / proxy (this machine)

GitHub traffic often needs the local proxy. See
`.rope/research/github-access.md`:

| Transport | How |
| --- | --- |
| HTTPS | `git config` (or one-shot `-c`) `http.https://github.com.proxy=http://127.0.0.1:8118` |
| SSH | `~/.ssh/config` Host `github.com` → `ProxyCommand nc -X connect -x 127.0.0.1:8118 %h %p` |

Prefer SSH remote when the maintainer’s GitHub key works through the proxy;
otherwise HTTPS + proxy. If the proxy is down, clone/fetch **fails** — stop and
report; do not claim the pin is current.

Optional helper (from repo root or any cwd):

```bash
# Prints CLONE_PATH, DEFAULT_BRANCH, TIP_SHA, SHORT_SHA; exit non-zero on failure
.agents/skills/upstream-harvest/scripts/ensure-clone-and-tip.sh \
  [.rope/upstream/mattpocock-skills/source.md]
```

Env overrides: `ROPE_UPSTREAM_CLONE`, `ROPE_UPSTREAM_URL`, `ROPE_UPSTREAM_BRANCH`,
`ROPE_UPSTREAM_PROXY` (default `http://127.0.0.1:8118` for HTTPS).

## Ensure clone

1. If clone path is missing or not a git repo:
   - Create parent directory.
   - Clone with either:
     - `git clone git@github.com:mattpocock/skills.git <clone-path>`, or
     - `git -c http.https://github.com.proxy=http://127.0.0.1:8118 clone https://github.com/mattpocock/skills <clone-path>`
2. If clone exists:
   - `git -C <clone-path> remote get-url origin` must match the URL in
     `source.md` or a documented equivalent (HTTPS ↔ SSH for the same repo is
     OK). On mismatch to a **different** repo, stop and ask — do not overwrite.
   - `git -C <clone-path> fetch origin` (with the same proxy/`-c` as needed).
   - Do not push. Do not add this path as a submodule of the Rope repo.

## Reviewed tip (definition)

**Reviewed tip** = the object name of the remote-tracking default branch **after
a successful fetch**:

```bash
git -C <clone-path> rev-parse "origin/<default-branch>"
```

- Full SHA is what goes into `source.md` on close and into the brief header.
- **Shortsha** = first 7 hex characters of that full SHA (brief filename).
- Do **not** use an unfetched local branch, `HEAD` of a dirty worktree, or a
  guessed/cached value from a failed fetch.
- Baseline and delta both use this same tip definition for “the tip that was
  reviewed.”

## Diff scope (C1) — delta only

Default: only paths for correspondence rows with interest `high`
(typically each Matt skill dir: `<skill>/SKILL.md` and that skill’s tree).

```bash
# Illustrative — paths derived from correspondence high rows
git -C <clone-path> log --oneline <last>..<tip> -- <allowlist paths…>
git -C <clone-path> diff <last> <tip> -- <allowlist paths…>
```

Do **not** default to full-repo `git log` / `git diff` without path filters.
`watch` rows only when the human names them. `out` rows never scanned.
**Baseline** does not run adopt-oriented diffs; optional allowlist **snapshot**
of skill names from correspondence only.

## Failure modes (must surface)

| Situation | Behavior |
| --- | --- |
| No network / proxy down / fetch fails | **Stop**; report git stderr class + path; do **not** claim up to date; do **not** write tip into `source.md` |
| Clone path unreadable / not a git dir after failed clone | **Stop**; report path |
| Origin URL points at a different repository | **Stop**; ask human |
| `last-reviewed-sha` not in clone (delta) | **Stop**; suggest re-baseline or repair — no silent invent |
| Allowlist path absent at tip (delta) | List in brief under missing paths |

Failed clone/fetch is never a successful baseline. Partial state allowed only as
an open draft brief that does **not** advance SHA.

## Forbidden

- Adding `mattpocock/skills` as a git submodule of this Rope repo
- Vendoring upstream trees into `skills/` or the product package
- Pushing to the upstream remote
- Installing Matt skills into global agent dirs as part of harvest
- Inventing a tip SHA when fetch did not succeed
