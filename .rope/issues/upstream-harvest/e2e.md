# Upstream Harvest E2E

## E1 Skill package structure and non-product placement

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: this repository only
Command or Steps:
- Confirm `.agents/skills/upstream-harvest/SKILL.md` exists with
  `disable-model-invocation: true` and required workflow sections
- Confirm progressive disclosure references exist as claimed by SKILL.md
- Confirm skill is **not** under `skills/` (not part of `rope add` bundle)
- Confirm `.rope/upstream/mattpocock-skills/{source.md,correspondence.md,reviews/}` exist
- Grep skill for forbidden shortcuts: no submodule pin, no auto-edit product skills
Pass Criteria:
- Structure and placement match PRD
- C1/A1/B1/close-gate language present
Failure Report:
- missing files/sections; accidental product packaging
Forbidden Out-of-Scope Actions:
- network; writing user global agent skill installs
Result:
- pending

## E2 Live baseline harvest (clone/fetch + pin SHA)

Executor: agent-with-gate
Risk: local-write
Gate Decision: approved
Approved Action: clone or update machine-local mattpocock/skills cache and run
baseline harvest writing only cache + `.rope/upstream/mattpocock-skills/`
Scope: default cache path (or source.md override) and this repo’s
`.rope/upstream/mattpocock-skills/` only
Command or Steps:
- Invoke `upstream-harvest` with empty last-reviewed-sha
- Complete baseline and human close
- Inspect `source.md` and new baseline review file
Pass Criteria:
- Local clone present
- `last-reviewed-sha` set
- Baseline review exists and has no adopt/adapt recommendation list
- `skills/rope-*` unchanged by the harvest run
Failure Report:
- git/network errors; paths written; partial state
Forbidden Out-of-Scope Actions:
- push/modify GitHub upstream; `rope add` installs; editing product skills for “sync”
Result:
- pending

## E3 Delta path smoke (no new commits or fixture)

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: repo + existing local clone if present after E2; otherwise fixture/dry path
  documented by the skill
Command or Steps:
- With last-reviewed-sha equal to current tip (or fixture equivalent), run delta
- Or use skill-documented dry/fixture path proving no-op delta behavior
Pass Criteria:
- Reports no material allowlist changes (or fixture expected output)
- Does not advance SHA without close; does not invent adopt items
Failure Report:
- actual brief content; SHA before/after
Forbidden Out-of-Scope Actions:
- forcing unrelated product skill edits
Result:
- pending

## E4 Human judgment: brief is usable

Executor: user
Risk: human-judgment
Gate Decision: user-run
Approved Action: n/a
Scope: read one real baseline (and delta if available) brief
Command or Steps:
- Maintainer reads brief and says whether it is enough to decide
  ignore vs small edit vs later larger change
Pass Criteria:
- User accepts brief format/noise level for periodic use
Failure Report:
- what to change in template (too long, missing targets, etc.)
Forbidden Out-of-Scope Actions:
- n/a
Result:
- pending

## E5 Product install surface unchanged

Executor: agent
Risk: local-readonly
Gate Decision: not-required
Approved Action: n/a
Scope: `bin/rope.js` + `skills/` tree
Command or Steps:
- Confirm `upstream-harvest` is not under `skills/`
- Confirm `node bin/rope.js add --target` would not install it from product bundle
  (layout inspection sufficient)
Pass Criteria:
- Maintenance skill remains repo-local under `.agents/skills/`
Failure Report:
- if skill was wrongly placed under `skills/`
Forbidden Out-of-Scope Actions:
- publishing/npm
Result:
- pending
