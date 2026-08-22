<div align="center">

# Rope

**Grill. Shape. Go.**

**English** · [简体中文](README.zh-CN.md)

A repo-local skill harness for agentic coding tools — spec-driven,
graph-driven, and honest about what "done" means.

</div>

---

## What is Rope

Rope is a set of small skills + a `.rope/` knowledge layer that turns one
messy feature request into shipped, verified work. It exists because agent
sessions fail in two familiar ways: **long-session drift** (the agent forgets
what it decided three hours ago) and **green-pipeline rot** (every test
passes, the product is still broken — nobody started it for real).

Rope answers both. Durable knowledge lives in files, not chat. Heavy work
runs in fresh-context leaf workers, orchestrated by one lean parent. And
nothing is called done until a reviewer with **new eyes** walks the **real
entrypoint** — starting the product the way a user would.

Works with any host that supports skills and subagents (pi, Claude Code, …);
`rope-harness-presets` adapts leaf model routing to whatever catalog your
machine has.

## How it works

One issue, one parent session, five moves:

1. **Grill** — a plain-language interview that settles behavior and
   architecture *before* planning. Decisions land in `.rope/` docs
   immediately; chat is treated as volatile.
2. **Shape** — requirements become an issue package: PRD with a
   **Contract Note** (3–5 observable outcomes), vertical slices sized to a
   fresh context window, and a behavior matrix. Then shape **reads the slice
   graph** — waves, rivers, numbers — and asks you exactly one execution
   question.
3. **Go** — waves run with concurrent background implementer leaves for
   disjoint slices; leaves orient by a shared investigation **map** and
   commit slice by slice. TDD discipline lives here, at agreed seams.
4. **Review (once)** — after all slices, one reviewer leaf that never
   watched the build reads the assembled diff on two axes — Standards and
   Contract — then probes the real entrypoint. Findings route to one fix
   brief, max two rounds, then it stops and asks you.
5. **Verify & finish** — verify is a thin paperwork gate (review recorded,
   E2E terminal, tree clean); finish closes the issue and routes
   architecture-doc updates home.

Small fix with the diagnosis already done? Skip all of it: `rope-quick` is
the solo path — red → green at the nearest seam, one page of record, four
stop lines back to the full pipeline.

## What makes it different

| Idea | What it buys you |
| --- | --- |
| **The graph answers, not vibes** | Serial-vs-parallel is decided *after* slicing, from `Blocked by` edges, with numbers. Zero-dependency "rivers" get offered as splits. |
| **Contract Note** | You confirm 3–5 observable bullets instead of reading a PRD. The note *is* the contract's human projection — never a second contract. |
| **Fresh-context iron rule** | Every slice fits one clean context window. Oversized slices are re-cut at shape; a re-cut that bends the requirement goes back to grill. |
| **One review, new eyes** | Per-slice reviews see per-slice problems. The failure classes that kill issues — cross-slice conflicts, spec-observable gaps, fixture-vs-product drift — only show at the assembled diff. The budget goes there. |
| **Real entrypoint probe** | Fixture-green is not product-true. The reviewer starts the product — browser, CLI, or API, whatever the project ships — and walks the primary paths. |
| **Investigation map** | One fact per line, path + date. Leaves stop re-finding the same code (in our field data, 56–71% of big-slice tool calls were wayfinding). |
| **Architecture continuity** | Every issue records a disposition — inherit, extend, supersede — for each ADR it touches, and hands leaves a Constraint Bundle by reference. |
| **Thin verify** | Paperwork only. It never re-judges code; it checks the gate really closed. |

## How our thinking evolved

- **2026-06-27 · ADR 0001** — Verify splits from go as its own gate; parent/leaf roles get names.
- **2026-08-05 · ADR 0002** — Decisions get dispositions; issues inherit, extend, or supersede recorded architecture — never silently.
- **2026-08-11 · ADR 0003** — First parallelism: an opt-in "dynamic mode" with disjoint file ownership. (Later superseded.)
- **2026-08-17 · ADR 0004** — Review goes risk-tiered per-slice/batch; leaf briefs get a hard budget (≤60 lines, allowlist).
- **2026-08-19 · ADR 0005/0006** — Humans confirm a Contract Note, not a PRD; small fixes get a solo quick path.
- **2026-08-22 · ADR 0007** — A 7.5-hour all-green session shipped a broken product. Execution turns graph-driven; review collapses to one new-eyes gate with a real-entrypoint probe; verify goes thin.

## Install

```bash
# into the default agent skills directory
npx git+https://github.com/WufeiHalf/rope.git add

# or project-local
npx git+https://github.com/WufeiHalf/rope.git add --target ./.agents/skills
```

Then, in the repo you want to manage:

```bash
rope-init        # scaffold .rope/ (CONTEXT, routes, adr, specs, …)
```

Optional, once per machine or model-catalog change:

```bash
rope-harness-presets   # write rope-* leaf presets for your host
```

Missing presets never block — go/verify soft-degrade and record it.

## Skills

| Skill | Job |
| --- | --- |
| `rope-init` | Scaffold `.rope/` in a target repository |
| `rope-grill` | Plain-language requirement interview; decisions land in durable docs |
| `rope-shape` | Issue package: PRD + Contract Note, slices, matrix, E2E, graph read |
| `rope-go` | Wave execution, investigation map, TDD at seams, per-slice commits |
| `rope-verify` | Thin paperwork gate between go and finish |
| `rope-finish` | Close the issue; route architecture-doc updates |
| `rope-summary` | Preserve reusable contracts/learnings into `.rope/` after the fact |
| `rope-quick` | Solo quick-fix path with four stop lines back to the pipeline |
| `rope-harness-presets` | Bind leaf roles to harness-native presets for your host |

## `.rope/` layout

```text
.rope/
  CONTEXT.md        # glossary / project language
  routes.md         # navigation map
  adr/              # architecture decision records
  research/         # verified external/internal facts
  specs/            # architecture contracts
  issues/<slug>/
    prd.md          # contract, matrix source, constraint bundle
    tasks.md        # slices + statuses + review verdict
    e2e.md          # classified end-to-end plan
    map.md          # investigation facts, one per line
    verify.md       # paperwork rounds
    quick.md        # solo-path record (rope-quick)
```

## Development

```bash
node bin/rope.js --help          # CLI usage
python3 /path/to/skill-creator/scripts/quick_validate.py skills/rope-init
```

---

<div align="center">

**Agents forget. Rope remembers — and checks.**

</div>
