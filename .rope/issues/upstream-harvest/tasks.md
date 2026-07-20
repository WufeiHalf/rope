# Upstream Harvest Tasks

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes | Slice 2–3: baseline then delta harvest → brief → marks → close |
| Alternate input or entrypoint | yes | Slice 1: user-invoked name + natural-language triggers in human-facing description |
| Empty or missing input | yes | Slice 2: empty `last-reviewed-sha` → baseline branch (not error) |
| Invalid or malformed input | yes | Slice 3: corrupt/unknown SHA in source.md → explicit repair/reset guidance, no silent invent |
| Unavailable or not-ready dependency | yes | Slice 3: missing clone / fetch fail / no network → visible stop |
| Duplicate or idempotent case | yes | Slice 2–3: re-close same batch / re-run with no new commits → no duplicate noise / SHA stable |
| Boundary or limit case | yes | Slice 1+3: C1 allowlist only; watch/out not scanned unless named; SHA not advanced without close |
| Existing behavior compatibility | yes | Slice 1: does not alter product `skills/rope-*` or `rope add` surface; migrate-docs untouched |
| Real entrypoint or integration path | yes | E2E live baseline (gated) + structural skill checks |

## Slice 1: Skill skeleton + state contract + authoring norms

- Status: completed
- Goal: Create user-invoked `upstream-harvest` skill package that points at
  `.rope/upstream/mattpocock-skills/` and meets write-a-skill / writing-great-skills
  structure (short SKILL.md, progressive disclosure, checkable criteria)
- Scope:
  - `.agents/skills/upstream-harvest/SKILL.md`
  - references as needed: brief template, git/clone conventions, close-gate rules
  - polish committed state docs already started under `.rope/upstream/mattpocock-skills/`
  - ensure skill is **not** under product `skills/`
- Matrix rows: Alternate entrypoint; Existing compatibility; Boundary (allowlist policy documented)
- Public behavior:
  - `disable-model-invocation: true`
  - human-facing description (no model trigger stuffing required beyond clarity)
  - documents baseline vs delta, A1 no product edit, C1 allowlist, close gate
- Tests:
  - structural checklist: frontmatter, branches, completion criteria, pointers to
    source/correspondence/reviews, forbid auto-edit and submodule language
  - path check: skill not installable via `skills/` package layout
- Implementation notes:
  - follow progressive disclosure; keep SKILL.md lean
  - optional `scripts/` only if deterministic git helpers clearly pay off
- Verification: checklist + layout pass; commit `501ce0b`; not under `skills/`
- Review: required → **APPROVE** (rope-reviewer)
- Review reason: public maintenance contract and quality-bar skill shape
- Stop conditions: skill path or product-vs-maintenance boundary unclear (already decided)

## Slice 2: Baseline branch + close gate mechanics

- Status: completed
- Goal: Implement baseline workflow when last-reviewed-sha is empty, and the
  explicit close gate that writes SHA only on human close
- Scope:
  - baseline review artifact shape (Chinese; per-skill vs local Rope; optional suggested marks)
  - update `source.md` fields on close
  - abandoned review leaves SHA empty/unchanged
- Matrix rows: Primary (baseline part); Empty last-reviewed-sha; Duplicate/idempotent close; Boundary (no advance without close)
- Public behavior:
  - first run produces `reviews/*-baseline.md` (or equivalent naming)
  - after human close, `last-reviewed-sha` set to reviewed tip
  - baseline must not be empty SHA-only; optional suggested marks OK (E4 refined B1)
- Tests:
  - fixture or dry narrative: empty SHA → baseline steps → close updates source.md
  - abandoned path does not write SHA
- Implementation notes:
  - clone may be created on baseline (network); document failure if unavailable
- Verification: dry Paths A–D + script `bash -n` + bad-URL fail; commit `3d80e77`
- Review: required → **APPROVE** (rope-reviewer)
- Review reason: pin semantics are easy to get wrong
- Stop conditions: cannot define “reviewed tip” unambiguously (use fetched default-branch tip)

## Slice 3: Delta harvest brief + human marks + failure visibility

- Status: completed
- Goal: From last-reviewed-sha to current tip, produce allowlist-focused review
  brief with suggested marks; record human marks; never edit product skills;
  surface clone/fetch/allowlist failures clearly
- Scope:
  - delta detection for C1 high rows in correspondence
  - brief sections: summary, per-skill changes, suggested mark, Rope target
  - human mark recording on the brief
  - close advances SHA to the tip that was reviewed
  - missing clone, fetch fail, bad SHA, missing allowlist paths
- Matrix rows: Primary (delta); Invalid SHA; Unavailable dependency; Boundary allowlist; Idempotent no-op delta; Compatibility (no product edits)
- Public behavior:
  - delta brief under `reviews/`
  - suggested marks are proposals only
  - harvest skill does not modify `skills/rope-*`
  - re-run with no new upstream commits reports cleanly (no fake work)
- Tests:
  - fixture diffs or scripted log over sample trees if scripts added
  - grep/contract: skill text forbids product auto-edit; failure messages documented
- Implementation notes:
  - read Rope targets only to phrase adapt suggestions, not to patch them
  - watch rows only when human names them
- Verification: dry Paths N/M/S/P/F/A1/I + allowlist-diff fixture smoke; commit `ae65d06`
- Review: required → **APPROVE** (rope-reviewer)
- Review reason: core harvest value and failure modes
- Stop conditions: cannot access upstream history even with fixtures for offline structural tests
