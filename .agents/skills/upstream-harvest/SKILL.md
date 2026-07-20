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

### Delta (skeleton — Slice 3 fleshes execution)

1. Ensure clone is fetched; resolve current tip (same definition as baseline).
2. If tip equals `last-reviewed-sha`, report clean no-op (no fake work). Do not invent items.
3. Otherwise diff **C1 high** allowlist paths only between last-reviewed SHA and tip.
4. Write a delta brief: summary, per-skill changes, suggested mark (`adopt` / `adapt` / `ignore` / `watch`), Rope target from correspondence. Suggestions are proposals only.
5. Record human marks on the brief when given.
6. On explicit close only: advance `last-reviewed-sha` to the tip that was reviewed (see [references/close-gate.md](references/close-gate.md)).

**Done when:** brief (or clean no-op report) exists; marks recorded if human provided them; SHA advanced **iff** human closed; product skills unchanged by this skill.

## Failure visibility

Stop with an explicit reason — never fake “up to date” or invent a tip:

- missing/unreadable clone path or failed fetch / no network when fetch required
- corrupt or unknown `last-reviewed-sha` → repair/reset guidance (no silent invent)
- allowlist path missing upstream → list in brief; do not silent skip-all

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
