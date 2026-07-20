# Upstream Inspiration Sources

## Question

Which external projects currently inspire Rope workflows, and what are their
repo/license facts for a future human-gated harvest skill?

## Verified Facts

### mattpocock/skills

Fact: Primary public source of Matt Pocock agent skills is
`https://github.com/mattpocock/skills` (MIT). Install path commonly used locally
is `npx skills add mattpocock/skills` into agent skills dirs such as
`~/.agents/skills`. Local machine already has many of these skills installed
(e.g. `grill-me`, `grill-with-docs`, `setup-matt-pocock-skills`, `tdd`,
`to-prd`, `to-issues`, `triage`).
Source: GitHub repo README / skills.sh listing; local `~/.agents/skills` listing
Verified by: web_search + local filesystem listing
Stability: medium (repo layout and skill set change over time)
Implication: This is the natural first pin for skill/workflow/reference harvest.
Diff unit is skill directories and their `SKILL.md` / references, not Rope
product APIs.

### mindfold-ai/Trellis

Fact: Trellis is a team-level agent harness with repo-local wiki/workflow under
`.trellis/` (specs, tasks, research). Public repo:
`https://github.com/mindfold-ai/trellis`, license **AGPL-3.0**.
Source: GitHub repo metadata; docs.trytrellis.app architecture notes
Verified by: web_search
Stability: medium
Implication: Useful as **workflow/layout inspiration** (already reflected in
`rope-migrate-docs` mapping). AGPL makes vendoring/copying code or shipping
Trellis files as product surface risky; harvest should prefer idea extraction and
Rope-native rewrite, not file sync. Treat as secondary/careful source.

### Existing one-time bridge in Rope

Fact: `skills/rope-migrate-docs` already maps Matt-style docs and Trellis
`.trellis/` layout into `.rope/`, without deleting originals. It is adoption
migration, not ongoing upstream tracking.
Source: `skills/rope-migrate-docs/SKILL.md`, `references/mapping.md`
Verified by: repo read
Stability: high for current code
Implication: Do not overload migrate-docs into a recurring sync tool. Recurring
harvest is a separate maintenance concern for this repo.

## Assumptions

- “Sync” means human-gated idea/reference harvest into Rope semantics (R1), not
  mechanical vendor merge of upstream skill files into `skills/rope-*`.

## Decisions (grill)

- **R1**: Harvest run produces a human review brief; no auto-merge into product skills.
- **U1**: v1 pins only `https://github.com/mattpocock/skills`. Trellis is historical
  inspiration / one-time migrate source, not a recurring pin (little ongoing use).
- **S1**: Pin mechanism is machine-local clone of upstream + repo-committed
  last-reviewed SHA / review artifacts. Not a git submodule. Upstream is not a
  runtime or package dependency of Rope.
- **L1**: In-repo harvest state lives under
  `.rope/upstream/mattpocock-skills/{source.md,correspondence.md,reviews/}`.
  Machine-local clone default: `~/.cache/rope-upstream/mattpocock-skills`.
- **C1**: Default scan allowlist is high-interest correspondence only (grill*,
  to-prd, to-issues, setup-matt-pocock-skills, tdd). triage/prototype are
  `watch`; see `.rope/upstream/mattpocock-skills/correspondence.md`.
- **A1**: Harvest skill ends at review brief + human marks + advancing
  `last-reviewed-sha`. It does not edit `skills/rope-*` by itself. Absorbing a
  change is a **separate, usually lightweight edit** after human accept (same or
  later session: “apply brief item 2 to rope-grill”). Full rope-grill/shape is
  only for large semantic workflow shifts, not routine small upstream tweaks.
- **B1**: First run is baseline — pin current upstream SHA. Brief is **Chinese**
  and must include per-skill comparison vs **local Rope targets** when no prior
  review exists (not a bare SHA+name list). Delta runs compare vs last-reviewed
  SHA. Optional suggested marks only; still no auto-edit of product skills.
- **N1**: Maintenance skill path/name is
  `.agents/skills/upstream-harvest/` (not under product `skills/`, not `rope-*`).
- **Quality bar**: Author `upstream-harvest` to satisfy Matt's skill-writing norms
  from `write-a-skill` + `writing-great-skills` (progressive disclosure, checkable
  completion criteria, pruned description/body, no sprawl). Those guides are
  authoring standards for this skill, not harvest scan targets (still `out` in
  correspondence).
- **I1**: `upstream-harvest` is **user-invoked**
  (`disable-model-invocation: true`). Maintainer types the skill name; agent does
  not auto-fire it during unrelated work.
- **Close gate**: Advance `last-reviewed-sha` only when the human explicitly
  closes the review batch. Abandoned or partial review leaves SHA unchanged;
  draft brief may remain under `reviews/`.

## Open Questions

- None blocking shape for v1 (brief template and optional helper scripts are
  implementation details for the issue package).
