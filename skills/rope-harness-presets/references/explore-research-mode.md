# Explore Research Mode (ADR 0011)

External research with disk output is a **brief-selected mode of
`rope-explore`** — not a separate agent. Exists because plain explore is
read-only and cannot persist findings; borrowing a general-purpose worker
without declaration was an undeclared dispatch deviation (observed twice in
the field).

## Mode contract

- Default mode (codebase navigation, end-of-issue scanner): read-only —
  unchanged; no web, no writes.
- Research mode (the brief asks for a findings file): may use web search /
  fetch; may write exactly one findings artifact under `.rope/research/**` —
  nowhere else. Never touches product code, tests, or branches; never spawns.
- The reviewed-tree guarantee of ADR 0010 is unaffected: research writes go
  to docs, outside reviewed product code, and scanner briefs never request
  writes.

## Research brief shape (minimal)

1. Research question + why it matters (1–2 sentences).
2. Primary-source rule (vendor docs / upstream repo at a pinned commit).
3. Output path + required sections (Question / Verified Facts with Sources /
   Assumptions / Implications).
4. Return shape: file path + ≤300-word summary + confidence.

## Degradation

If the host's explore preset lacks web/write tools, run the research brief on
a generic worker and **record the type used** (declared deviation, ADR 0011).
No schema, ranking, or manifest change — the three core roles are unchanged.
