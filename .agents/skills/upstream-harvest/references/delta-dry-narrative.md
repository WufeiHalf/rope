# Delta dry narrative (offline fixture checklist)

Use this to verify Delta harvest **without** requiring a live network run.
Walk against skill text, templates, and (optional) a local fixture git repo.

## Fixture inputs (shared)

| Field | Value |
| --- | --- |
| `source.md` Last reviewed SHA (when pin present) | `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` |
| Clone path (logical) | `~/.cache/rope-upstream/mattpocock-skills` |
| Default branch | `main` |
| Correspondence | `.rope/upstream/mattpocock-skills/correspondence.md` |
| C1 high skills | `grill-me`, `grill-with-docs`, `grilling`, `to-prd`, `to-issues`, `setup-matt-pocock-skills`, `tdd` |
| Product skills | `skills/rope-*` must remain untouched in every path |

Optional local git fixture (for script smoke):

```bash
# Create a tiny bare-like working clone with two commits and one allowlist path
FIX=/tmp/rope-upstream-delta-fixture
rm -rf "$FIX" && mkdir -p "$FIX/grill-me" && cd "$FIX"
git init -q && git checkout -q -b main
echo 'v1' > grill-me/SKILL.md
git add grill-me && git commit -q -m 'add grill-me'
LAST=$(git rev-parse HEAD)
echo 'v2' > grill-me/SKILL.md
git add grill-me && git commit -q -m 'change grill-me'
TIP=$(git rev-parse HEAD)
# Run from Rope repo root:
# .agents/skills/upstream-harvest/scripts/allowlist-diff.sh \
#   --clone "$FIX" --last "$LAST" --tip "$TIP"
# Expect MATERIAL=yes and STATUS=changed for grill-me; missing others listed.
```

## Path N — clean no-op (tip == last-reviewed-sha)

| Step | Action | Observable check |
| --- | --- | --- |
| N1 | SHA present = tip after fetch | Branch = **Delta** |
| N2 | Compare tip to last | Equal |
| N3 | Report | Clean no-op: no material allowlist changes |
| N4 | Brief | No invent adopt/adapt items; optional skip writing a delta file |
| N5 | `source.md` | SHA **unchanged** (close not required) |
| N6 | Product skills | `skills/rope-*` untouched |

**Pass N:** no fake work; pin stable; E3 no-op criteria.

## Path M — material delta → brief → marks → close

| Step | Action | Observable check |
| --- | --- | --- |
| M1 | SHA present; tip **ahead** of last after fetch | Range `last → tip` non-empty |
| M2 | Allowlist diff C1 high only | No full-repo default scan |
| M3 | Write `YYYY-MM-DD-<tip-shortsha>.md` | Delta body: summary, per-skill, suggested marks, Rope targets |
| M4 | Suggested marks | Labeled proposals only; Human mark pending |
| M5 | Human records marks (e.g. adapt / ignore) | Brief Human mark fields updated |
| M6 | Human says “close this harvest” | Close gate only |
| M7 | Update brief + `source.md` | `Last reviewed SHA` = **full tip**; status closed |
| M8 | Product skills | Still **not** edited by harvest |

**Pass M:** brief exists; SHA advances **only** at M7; A1 holds.

## Path S — bad / unknown SHA

| Step | Action | Observable check |
| --- | --- | --- |
| S1a | Corrupt pin (not 40-hex), e.g. `not-a-sha` | **Stop**; repair guidance; no invent |
| S1b | Well-formed SHA absent from clone after fetch | **Stop**; `cat-file` / re-baseline guidance |
| S2 | `source.md` | Pin **unchanged** |
| S3 | Agent output | Does **not** claim up to date or fabricate range |

**Pass S:** failure visible; no silent invent (matrix: invalid SHA).

## Path P — missing allowlist path upstream

| Step | Action | Observable check |
| --- | --- | --- |
| P1 | Tip reachable; at least one C1 high skill dir missing at tip | Diff still runs for present paths |
| P2 | Brief section “Paths missing upstream” | Missing skill(s) **listed** by name |
| P3 | Not silent skip-all | Present-path changes still summarized if any |
| P4 | Close behavior | Unchanged rules; missing list remains on brief |

**Pass P:** missing paths visible; not treated as empty success without listing.

## Path F — fetch / clone failure (delta)

| Step | Action | Observable check |
| --- | --- | --- |
| F1 | Pin present; clone missing or fetch fails | **Stop** with reason |
| F2 | Do not report “no changes” / “up to date” | Failure ≠ no-op |
| F3 | SHA | Unchanged |

**Pass F:** unavailable dependency visible.

## Path A1 — product skills untouched (contract)

| Step | Action | Observable check |
| --- | --- | --- |
| A1a | Any of N/M/S/P/F | Grep skill package: forbids auto-edit `skills/rope-*` |
| A1b | After simulated close with marks | Marks on brief only; no product file writes by this skill |
| A1c | Watch rows | Scanned **only** if human names them |

**Pass A1:** compatibility + boundary rows.

## Path I — idempotent delta re-run / re-close

| Step | Action | Observable check |
| --- | --- | --- |
| I1 | After Path M closed for tip T | SHA = T |
| I2 | Re-run delta; tip still T | Clean no-op (Path N) |
| I3 | Re-close same batch | No SHA churn |
| I4 | Open brief exists for same tip, re-run before close | Reuse/refresh; no second noisy file |

**Pass I:** stable pin; no duplicate noise.

## Grep / structural anchors (skill package)

Confirm after Slice 3:

- SKILL.md: full **Delta** section (not skeleton); clean no-op; close only advances SHA
- SKILL.md / close-gate: suggested marks ≠ applied product edits (**A1**)
- brief-template: delta structural rules; no-op report text; missing paths section
- clone-and-git: allowlist-diff helper; bad SHA repair; C1 high path list
- `scripts/allowlist-diff.sh` executable; `bash -n` clean
- This file: Paths N, M, S, P, F, A1, I present
- Forbidden shortcuts still list: no auto-edit product skills; no submodule pin

```bash
# From repo root — structural greps (expect matches for forbid language)
grep -n 'skills/rope-\*' .agents/skills/upstream-harvest/SKILL.md
grep -n 'auto-edit\|Do \*\*not\*\* edit `skills/rope-\*`' .agents/skills/upstream-harvest/SKILL.md
grep -n 'Clean no-op\|last-reviewed-sha' .agents/skills/upstream-harvest/SKILL.md
grep -n 'Paths missing upstream\|repair\|silent invent' \
  .agents/skills/upstream-harvest/SKILL.md \
  .agents/skills/upstream-harvest/references/*.md
test ! -e skills/upstream-harvest   # not product-packaged
bash -n .agents/skills/upstream-harvest/scripts/ensure-clone-and-tip.sh
bash -n .agents/skills/upstream-harvest/scripts/allowlist-diff.sh
```
