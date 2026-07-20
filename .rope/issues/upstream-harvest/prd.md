# Upstream Harvest (mattpocock/skills)

## Problem Statement

Rope’s workflow ideas largely come from Matt Pocock’s agent skills, but there
is no repeatable way to notice upstream idea/reference changes and decide what
Rope should absorb. Ad-hoc browsing does not leave a reviewed SHA, a brief, or a
clear human gate — and treating upstream as a submodule/vendor merge would
either drag product consumers into maintenance noise or auto-import changes that
do not fit Rope.

## Solution

Add a **repo-local maintenance skill** `upstream-harvest` (user-invoked, not
shipped by `rope add`) that:

1. Uses a **machine-local clone** of `https://github.com/mattpocock/skills`
2. Diffs only the **C1 allowlist** against the last reviewed SHA
3. Writes a **human review brief** under `.rope/upstream/mattpocock-skills/reviews/`
4. Records human marks (`adopt` / `adapt` / `ignore` / `watch`) and advances
   `last-reviewed-sha` only when the human **closes** the batch
5. Does **not** edit `skills/rope-*` itself; small accepted tweaks are ordinary
   follow-up edits after human say-so

First run is **baseline only** (pin SHA, no adopt list). Author the skill to
Matt’s `write-a-skill` / `writing-great-skills` quality bar.

## Goals

- Ship `.agents/skills/upstream-harvest/` as user-invoked maintenance skill
- Formalize pin/state under `.rope/upstream/mattpocock-skills/`
- Baseline branch + delta harvest branch with checkable completion criteria
- Allowlist-driven scan via `correspondence.md` (C1 high only by default)
- Review brief + human marks; SHA close gate; no product-skill auto-edit
- Progressive disclosure (short `SKILL.md`, references for templates/commands)
- Optional deterministic helpers for clone/fetch/allowlist log if they reduce
  flaky agent shell

## Non-goals

- Git submodule / vendoring Matt into the product tree
- Shipping this skill via `skills/` + `rope add`
- Auto-merging or auto-editing `skills/rope-*`
- Pinning or harvesting Trellis on a schedule
- Scanning entire upstream repo by default
- Opening a full rope-grill/shape issue for every small accepted tweak
- Building a general multi-upstream harvest framework in v1
- Replacing `rope-migrate-docs` (one-time adoption remains separate)

## Public Interface / Behavior

- Skill path: `.agents/skills/upstream-harvest/SKILL.md`
- Frontmatter: `name: upstream-harvest`, `disable-model-invocation: true`
- Human invoke: skill name / “harvest upstream” / “看看 matt skills 有没有更新”
- State:
  - `.rope/upstream/mattpocock-skills/source.md` (URL, last-reviewed SHA, clone path)
  - `.rope/upstream/mattpocock-skills/correspondence.md` (allowlist + interest)
  - `.rope/upstream/mattpocock-skills/reviews/*.md` (briefs)
- Local clone default: `~/.cache/rope-upstream/mattpocock-skills` (overridable in source.md)
- Branches:
  - **Baseline** when `last-reviewed-sha` empty
  - **Delta** when SHA present: allowlist-focused change brief + suggested marks
- Close: human says batch is done → update marks on brief → set last-reviewed-sha
  to the reviewed tip; abandoned mid-review does not advance SHA

## Behavior Contract

- System under test: Upstream Harvest maintenance workflow for this Rope repo
- Trigger/input: maintainer user-invokes `upstream-harvest` (baseline or delta)
- Collaborators: local git clone of mattpocock/skills; correspondence allowlist;
  existing Rope skills only as **read context** when suggesting adapt targets;
  human for marks and close
- Observable result:
  - baseline or delta review artifact under `reviews/`
  - human marks recorded when provided
  - `last-reviewed-sha` advanced **only** on explicit close
  - product `skills/rope-*` unchanged by the harvest skill itself
- Failure visibility:
  - missing/unreadable clone path or failed fetch → stop with explicit reason
  - allowlist paths missing upstream → listed in brief, not silent skip-all
  - no network when fetch required → explicit failure, no fake “up to date”
- Forbidden shortcuts:
  - auto-edit product skills to “finish” harvest
  - advance SHA without human close
  - default full-repo scan ignoring correspondence
  - submodule as the pin mechanism
  - place skill under product `skills/` so `rope add` ships it
  - treat first baseline as a mass adopt pass

## References

- Language: `.rope/CONTEXT.md` (Upstream Harvest)
- Research: `.rope/research/upstream-inspiration-sources.md`
- State: `.rope/upstream/mattpocock-skills/source.md`
- Map: `.rope/upstream/mattpocock-skills/correspondence.md`
- Routes: `.rope/routes.md` (Harvest Matt Pocock section)
- Authoring norms (external, local install): `write-a-skill`, `writing-great-skills`
- Related but separate: `skills/rope-migrate-docs` (one-time migration only)

## Open Questions / Human Gates

- Live baseline needs network git clone/fetch into machine-local cache (gated E2)
- Optional: human judges brief usefulness after first real baseline (E4)

## Gate Decisions

- Gate: E2 first live baseline (clone/fetch upstream to default cache path)
- Decision: approved
- Approved action: clone or update machine-local `mattpocock/skills` under the
  configured cache path and write baseline review + last-reviewed-sha
- Scope: machine-local cache path + this repo’s `.rope/upstream/mattpocock-skills/`
  only
- Risk: network fetch; writes outside repo under cache home path
- Pass criteria: clone exists; `source.md` has last-reviewed-sha; baseline review
  file exists with no adopt list
- Failure report: git stderr, path, network error class
- Forbidden out-of-scope actions: push to upstream; modify `skills/rope-*`;
  install Matt skills into global agent dirs as part of harvest

- Gate: E4 human usefulness of a real brief
- Decision: user-run
- Approved action: n/a (user judgment)
- Scope: read review brief only
- Risk: human-judgment
- Pass criteria: user accepts that brief is usable for decide-and-maybe-edit
- Failure report: what was missing/noisy
- Forbidden out-of-scope actions: n/a
