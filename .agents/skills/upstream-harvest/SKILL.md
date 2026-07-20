---
name: upstream-harvest
description: Repo-local maintenance skill — pin and review idea changes from mattpocock/skills into a human brief; never ships via rope add.
disable-model-invocation: true
---

# Upstream Harvest

Compare the pinned Matt Pocock skills upstream to the last reviewed revision,
write a human review brief, record marks, and advance the pin **only on
explicit human close**. This is **Upstream Harvest** for this Rope repo — not a
product skill, not vendor merge, not `rope-migrate-docs`.

## State (read first)

| Artifact | Path |
| --- | --- |
| Pin / clone path / last-reviewed SHA | [`.rope/upstream/mattpocock-skills/source.md`](../../../.rope/upstream/mattpocock-skills/source.md) |
| C1 allowlist + interest map | [`.rope/upstream/mattpocock-skills/correspondence.md`](../../../.rope/upstream/mattpocock-skills/correspondence.md) |
| Review briefs | [`.rope/upstream/mattpocock-skills/reviews/`](../../../.rope/upstream/mattpocock-skills/reviews/) |

Research context (optional): `.rope/research/upstream-inspiration-sources.md`.
GitHub network notes (this machine): `.rope/research/github-access.md`.
Language: `.rope/CONTEXT.md` term **Upstream Harvest**.

## Decisions (do not re-litigate)

| Id | Rule |
| --- | --- |
| **R1** | Output is a human review brief — no auto-merge into product skills |
| **S1** | Machine-local clone + last-reviewed SHA (not a git submodule) |
| **C1** | Diff only correspondence rows with interest `high` (unless human names `watch`) |
| **A1** | Do **not** edit `skills/rope-*`. Accepted tweaks are ordinary follow-up edits after human say-so |
| **B1** | First run is **Baseline** only — pin SHA, no adopt list |
| **Close gate** | Advance `last-reviewed-sha` only when the human explicitly closes the batch |

## Branch

Read `last-reviewed-sha` from `source.md` (the line
`Last reviewed SHA: …`). Treat as **empty** when the value is blank, missing,
or the placeholder `_(none yet …)_` / `none` / `—`.

| Condition | Branch |
| --- | --- |
| Empty / none | **Baseline** (not an error) |
| Present (full git SHA) | **Delta** |

### Baseline

Empty `last-reviewed-sha` means first pin — **not** a failure and **not** a mass
adopt pass (**B1**). Full mechanics:
[references/clone-and-git.md](references/clone-and-git.md),
[references/brief-template.md](references/brief-template.md),
[references/close-gate.md](references/close-gate.md).
Offline dry path: [references/baseline-dry-narrative.md](references/baseline-dry-narrative.md).

1. **Read state.** Load URL, default branch, clone path, and last-reviewed fields
   from `source.md`. Confirm branch = Baseline (empty SHA).
2. **Ensure machine-local clone.** Default path
   `~/.cache/rope-upstream/mattpocock-skills` (expand `~`; honor `source.md`
   override). Prefer the helper
   [`scripts/ensure-clone-and-tip.sh`](scripts/ensure-clone-and-tip.sh), or follow
   clone-and-git steps. Prefer `git@github.com:mattpocock/skills.git` or HTTPS
   with the proxy notes in github-access / clone-and-git.
3. **Fetch.** Update remotes. On clone/fetch failure: **stop** with explicit
   reason (git stderr class, path, network). Never fake success or invent a tip.
4. **Resolve reviewed tip.** After a successful fetch, tip =
   `origin/<default-branch>` object name (full SHA). That is the only meaning of
   “reviewed tip” for baseline. Shortsha = first 7 hex chars.
5. **Write baseline brief** under
   `.rope/upstream/mattpocock-skills/reviews/` named
   `YYYY-MM-DD-<shortsha>-baseline.md` using the baseline body in
   brief-template. Include: upstream URL, full tip, range
   `none (baseline) → <tip>`, clone path, C1 allowlist snapshot (names only),
   `Status: open`. **No** adopt/adapt/ignore/watch recommendation list.
6. **Present and wait.** Show the brief path and tip. Wait for human
   **close** or **abandon** (see close-gate phrases). Do not advance SHA yet.
7. **Close only:** set brief `Status: closed` + closed timestamp; update
   `source.md` `Last reviewed SHA` to the **full** reviewed tip and
   `Last reviewed at` to a timestamp. Confirm no `skills/rope-*` edits.
8. **Abandon:** leave `last-reviewed-sha` empty/unchanged; brief stays open or
   marked abandoned; do not delete the draft unless human asks.

**Idempotency (baseline):**

- Re-run while SHA still empty and a baseline brief for the **same tip** already
  exists: reuse that brief; do not open a second noisy file.
- Re-close of an already-closed baseline for the same tip: no SHA churn; no
  second brief.
- If tip moved upstream before first close: update or supersede the open baseline
  brief to the new tip; still no adopt list; SHA remains empty until close.

**Done when:** baseline brief exists; on close, `Last reviewed SHA` equals the
reviewed tip; on abandon, SHA still empty/unchanged; `skills/rope-*` untouched.

### Delta

Present `last-reviewed-sha` means compare pin → current tip. Full mechanics:
[references/clone-and-git.md](references/clone-and-git.md),
[references/brief-template.md](references/brief-template.md),
[references/close-gate.md](references/close-gate.md).
Offline dry path: [references/delta-dry-narrative.md](references/delta-dry-narrative.md).

1. **Read state.** Load URL, default branch, clone path, and full
   `last-reviewed-sha` from `source.md`. Confirm branch = Delta (SHA present).
2. **Validate pin shape.** If the value is not a plausible full git SHA
   (40 hex) — corrupt / placeholder left in place — **stop** with repair
   guidance (see Failure visibility). Do not invent a pin.
3. **Ensure machine-local clone + fetch.** Same helper and failure rules as
   baseline ([`scripts/ensure-clone-and-tip.sh`](scripts/ensure-clone-and-tip.sh)).
   On missing clone / fetch fail / no network: **stop** — never claim “up to
   date” from a stale worktree.
4. **Resolve tip.** After successful fetch, tip =
   `origin/<default-branch>` full SHA (same definition as baseline).
5. **Validate pin exists in clone.**
   `git -C <clone> cat-file -t <last-reviewed-sha>` must be `commit`.
   If unknown (rewritten history, wrong clone, typo): **stop** with repair/
   re-baseline guidance — no silent invent, no partial fake brief that pretends
   the range is known.
6. **Clean no-op.** If tip **equals** `last-reviewed-sha`:
   - Report cleanly: no material allowlist changes; pin already current.
   - Do **not** invent adopt/adapt items.
   - Do **not** write a noisy empty delta brief (optional one-line note is OK).
   - Do **not** advance SHA (close not required for no-op; re-close is a no-op).
   - Stop. Done.
7. **Allowlist diff (C1 high only).** Diff **only** correspondence rows with
   interest `high` between last-reviewed and tip. Path filter = each Matt skill
   tree root (`<skill>/…`). Prefer helper
   [`scripts/allowlist-diff.sh`](scripts/allowlist-diff.sh):

   ```bash
   .agents/skills/upstream-harvest/scripts/allowlist-diff.sh \
     --clone <clone-path> --last <last-reviewed-sha> --tip <tip-sha> \
     [--correspondence .rope/upstream/mattpocock-skills/correspondence.md] \
     [--named-watch skill1,skill2]   # only if human named watch rows
   ```

   - Do **not** full-repo scan by default.
   - `watch` rows only when the human **names** them for this run.
   - `out` rows never scanned.
   - Allowlist path missing at tip and/or last: **list** under brief
     “Paths missing upstream” — not silent skip-all.
8. **Write delta brief** under
   `.rope/upstream/mattpocock-skills/reviews/` named
   `YYYY-MM-DD-<shortsha>.md` (shortsha of **tip**) using the delta body in
   brief-template. Include:
   - summary (commits touching allowlist, material yes/no, short attention note)
   - per-skill changes for high rows that moved (or explicit “unchanged” only if
     useful — prefer listing **changed** + **missing**)
   - each item: Rope target from correspondence, change summary, **Suggested
     mark** (`adopt` / `adapt` / `ignore` / `watch`), rationale
   - **Suggested marks are proposals only** — not applied edits
   - human mark fields pending; `Status: open`
   - never edit `skills/rope-*` while writing the brief (**A1**)
9. **Present and wait.** Show brief path, range, material yes/no. Record human
   marks on the brief when given (update Human mark fields / batch table).
   Wait for **close** or **abandon** (close-gate phrases).
10. **Close only:** set brief `Status: closed` + closed timestamp; update
    `source.md` `Last reviewed SHA` to the **full reviewed tip** (the tip in the
    brief header) and `Last reviewed at`. Confirm no `skills/rope-*` edits.
11. **Abandon:** leave `last-reviewed-sha` unchanged; brief stays open or marked
    abandoned; do not delete draft unless human asks.

**Suggesting marks (proposals only):**

| Signal | Lean toward |
| --- | --- |
| Small wording/structure improvement that fits existing Rope skill | `adapt` or `adopt` |
| Idea useful but Rope-shaped differently | `adapt` |
| Noise / already covered / wrong product surface | `ignore` |
| Interesting later, not acting now | `watch` |

Read Rope targets **only** as phrasing context for suggestions. Never patch them
in this skill. Large semantic shifts → note “consider a Rope issue later”; still
do not open grill/shape automatically.

**Idempotency (delta):**

- Re-run when tip still equals `last-reviewed-sha`: clean no-op; no fake adopt
  list; SHA stable.
- Re-run while an **open** delta brief already exists for the **same tip**: reuse
  / refresh that brief; do not spawn a second noisy file for the same tip.
- Re-close of an already-closed delta for the same tip: no SHA churn.
- Tip moved while a prior delta brief is still open: supersede/update the open
  brief to the new tip range; SHA unchanged until close.

**Done when:** clean no-op report **or** delta brief exists; human marks recorded
if provided; SHA advanced **iff** human closed; `skills/rope-*` untouched by
this skill.

## Failure visibility

Stop with an explicit reason — never fake “up to date” or invent a tip/pin:

| Situation | Behavior |
| --- | --- |
| Missing / unreadable clone path | Stop; report path |
| Failed fetch / no network when fetch required | Stop; git stderr class + path; do **not** claim up to date |
| Corrupt `last-reviewed-sha` (not 40-hex / garbage) | Stop; repair: fix `source.md` or re-baseline after human say-so; no silent invent |
| Unknown SHA (not a commit in clone after fetch) | Stop; repair: confirm clone URL, `git cat-file -t <sha>`, or clear pin and re-baseline with human close; no silent invent |
| Allowlist path missing upstream | List in delta brief “Paths missing upstream”; do **not** silent skip-all |
| Origin URL points at a different repository | Stop; ask human |

Failed fetch is never a successful “no changes” delta.

## Forbidden shortcuts

- Auto-edit `skills/rope-*` to “finish” harvest (**A1**)
- Advance SHA without human close
- Default full-repo scan ignoring correspondence (**C1**)
- Git submodule as the pin mechanism (**S1**)
- Place this skill under product `skills/` so `rope add` ships it
- Treat first **Baseline** as a mass adopt pass (**B1**)

## Placement

Lives only at `.agents/skills/upstream-harvest/` (repo maintenance). Not under
`skills/`. Not part of the `rope add` bundle.
