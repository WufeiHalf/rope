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
| Skill files in upstream tree | Nested: `skills/<bucket>/<skill-name>/SKILL.md` (not repo-root dirs) |

`allowlist-diff.sh` resolves correspondence skill names by finding
`…/<skill-name>/SKILL.md` under the tip (then last) tree. Renamed upstream
skills appear as `missing-*` until correspondence is updated.

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
(typically each Matt skill dir: `<skill>/` tree root, including `SKILL.md` and
references under that skill).

Current C1 high names (from correspondence — re-read file each run):

- `grill-me`, `grill-with-docs`, `grilling`
- `to-prd`, `to-issues`
- `setup-matt-pocock-skills`
- `tdd`

Path filter per skill: the tree path `<skill>` (git pathspec). Do not scan
`watch` or `out` unless the human **names** a watch skill for this run.

Prefer the deterministic helper:

```bash
.agents/skills/upstream-harvest/scripts/allowlist-diff.sh \
  --clone <clone-path> \
  --last <last-reviewed-sha> \
  --tip <tip-sha> \
  --correspondence .rope/upstream/mattpocock-skills/correspondence.md \
  [--named-watch triage,prototype]
```

Machine-readable output includes `MATERIAL=yes|no`, `COMMITS=`,
`MISSING_AT_TIP=`, per-skill `STATUS=`, and a filtered diff. Exit `2` means bad
or unknown last SHA (repair guidance on stderr); exit `3` means clone/tip
problem.

Illustrative raw git (equivalent path filters):

```bash
git -C <clone-path> log --oneline <last>..<tip> -- <allowlist paths…>
git -C <clone-path> diff <last> <tip> -- <allowlist paths…>
git -C <clone-path> cat-file -t <last-reviewed-sha>   # must print: commit
```

Do **not** default to full-repo `git log` / `git diff` without path filters.
`watch` rows only when the human names them. `out` rows never scanned.
**Baseline** does not run adopt-oriented diffs; optional allowlist **snapshot**
of skill names from correspondence only.

### Delta preflight

1. Fetch (required when claiming currency).
2. Tip = `rev-parse origin/<default-branch>`.
3. If `last-reviewed-sha` == tip → clean no-op (no invent items; no SHA write).
4. Else validate last SHA is a commit in the clone; then allowlist-diff.

## Failure modes (must surface)

| Situation | Behavior |
| --- | --- |
| No network / proxy down / fetch fails | **Stop**; report git stderr class + path; do **not** claim up to date; do **not** write tip into `source.md` |
| Clone path unreadable / not a git dir after failed clone | **Stop**; report path |
| Origin URL points at a different repository | **Stop**; ask human |
| `last-reviewed-sha` corrupt (not a SHA) | **Stop**; repair `source.md` or re-baseline after human say-so — no silent invent |
| `last-reviewed-sha` not a commit in clone (delta) | **Stop**; `git cat-file` / re-fetch / re-baseline guidance — no silent invent |
| Allowlist path absent at tip (delta) | **List** in brief under “Paths missing upstream”; not silent skip-all |
| Tip equals last (delta) | Clean no-op report; not a failure |

Failed clone/fetch is never a successful baseline **or** a successful “no
changes” delta. Partial state allowed only as an open draft brief that does
**not** advance SHA.

## Forbidden

- Adding `mattpocock/skills` as a git submodule of this Rope repo
- Vendoring upstream trees into `skills/` or the product package
- Pushing to the upstream remote
- Installing Matt skills into global agent dirs as part of harvest
- Inventing a tip SHA when fetch did not succeed
