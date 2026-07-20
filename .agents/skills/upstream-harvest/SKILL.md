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

Read `last-reviewed-sha` from `source.md`:

| Condition | Branch |
| --- | --- |
| Empty / none | **Baseline** |
| Present | **Delta** |

### Baseline (skeleton — Slice 2 fleshes execution)

1. Ensure machine-local clone exists and is fetched (see [references/clone-and-git.md](references/clone-and-git.md)).
2. Resolve reviewed tip = default-branch tip after fetch.
3. Write a baseline brief under `reviews/` using [references/brief-template.md](references/brief-template.md) — **no adopt/adapt recommendation list**.
4. Present the brief. Wait for human **close** (or abandon).
5. On close only: set `last-reviewed-sha` (and timestamp) in `source.md` to that tip.

**Done when:** baseline brief exists; on close, SHA equals the reviewed tip; on abandon, SHA still empty/unchanged; `skills/rope-*` untouched.

### Delta (skeleton — Slice 3 fleshes execution)

1. Ensure clone is fetched; resolve current tip.
2. If tip equals `last-reviewed-sha`, report clean no-op (no fake work). Do not invent items.
3. Otherwise diff **C1 high** allowlist paths only between last-reviewed SHA and tip.
4. Write a delta brief: summary, per-skill changes, suggested mark (`adopt` / `adapt` / `ignore` / `watch`), Rope target from correspondence. Suggestions are proposals only.
5. Record human marks on the brief when given.
6. On explicit close only: advance `last-reviewed-sha` to the tip that was reviewed (see [references/close-gate.md](references/close-gate.md)).

**Done when:** brief (or clean no-op report) exists; marks recorded if human provided them; SHA advanced **iff** human closed; product skills unchanged by this skill.

## Failure visibility

Stop with an explicit reason — never fake “up to date”:

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
