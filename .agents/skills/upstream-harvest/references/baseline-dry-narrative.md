# Baseline dry narrative (offline fixture checklist)

Use this to verify empty-SHA → baseline → close/abandon **without** requiring a
live network run. Agents and reviewers can walk the checklist against skill text
and a fictional tip.

## Fixture inputs

| Field | Value |
| --- | --- |
| `source.md` Last reviewed SHA | empty / `_(none yet — establish on first harvest baseline)_` |
| `source.md` Last reviewed at | `_(none)_` |
| Clone path (logical) | `~/.cache/rope-upstream/mattpocock-skills` |
| Default branch | `main` |
| Fictional reviewed tip (after successful fetch) | `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |
| Shortsha | `aaaaaaa` |
| Brief date | `2026-04-08` |
| Expected brief path | `.rope/upstream/mattpocock-skills/reviews/2026-04-08-aaaaaaa-baseline.md` |

## Path A — empty SHA → baseline brief → human close

| Step | Action | Observable check |
| --- | --- | --- |
| A1 | Read `source.md`; SHA empty | Branch = **Baseline** (not error) |
| A2 | Ensure clone + fetch (or pretend success with tip above) | Tip = full fictional SHA; on real failure would **stop** |
| A3 | Write brief at expected path from template baseline body | File name `*-baseline.md`; header range `none (baseline) → aaaa…` |
| A4 | Inspect brief body | **No** adopt/adapt recommendation list; allowlist snapshot names OK |
| A5 | Wait; human says “close this harvest” | Close gate phrases only |
| A6 | Update brief `Status: closed`, set `Closed at` | Status not left `open` |
| A7 | Update `source.md` | `Last reviewed SHA: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`; timestamp set |
| A8 | Product skills | `skills/rope-*` unchanged |

**Pass A:** SHA advanced **only** at A7 after explicit close; brief has no adopt list.

## Path B — empty SHA → baseline brief → abandon

| Step | Action | Observable check |
| --- | --- | --- |
| B1–B4 | Same as A1–A4 | Open baseline brief exists |
| B5 | Human abandons / no close phrase | Not close |
| B6 | Leave `source.md` | Last reviewed SHA still empty / placeholder |
| B7 | Brief | `Status: open` or abandoned note; draft may remain |

**Pass B:** SHA **not** written; no fake pin.

## Path C — idempotent re-close / re-run

| Step | Action | Observable check |
| --- | --- | --- |
| C1 | After Path A closed for tip `aaaa…` | SHA already set |
| C2 | Human says close again for same tip | No SHA churn; no second `*-baseline.md` for same tip |
| C3 | Re-run while SHA still empty and open brief for same tip exists | Reuse brief; no duplicate noise |
| C4 | Re-run while SHA empty but tip becomes `bbbbbbb…` before close | Update/supersede open brief to new tip; SHA still empty until close |

**Pass C:** stable SHA on re-close; no duplicate baseline noise for same tip.

## Path D — clone/fetch failure (no fake success)

| Step | Action | Observable check |
| --- | --- | --- |
| D1 | SHA empty; clone or fetch fails (proxy down, auth, network) | Stop with explicit reason |
| D2 | `source.md` | SHA still empty |
| D3 | Agent output | Does **not** claim “up to date” or invent tip |

**Pass D:** failure visible; pin unchanged.

## Grep / structural anchors (skill package)

Confirm these strings/ideas exist after Slice 2:

- SKILL.md: empty SHA → Baseline; “not an error”
- SKILL.md / close-gate: advance SHA only on close; abandon leaves empty
- brief-template: baseline **forbid** adopt/adapt list
- clone-and-git: reviewed tip = `origin/<default-branch>` after fetch
- clone-and-git: proxy / failure must surface
- This file: Paths A–D present
