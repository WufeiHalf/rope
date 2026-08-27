# Rope Research Variant (ADR 0011)

Legal carrier for leaf tasks that need **external research with disk output**
(web/docs research whose findings land in `.rope/research/`). Exists because
read-only `rope-explore` cannot write, and borrowing a general-purpose worker
without declaration was an undeclared dispatch deviation.

## Scope bounds

- May use: web search, fetch, reading external sources, `write`/`edit` scoped
  to `.rope/research/**` only.
- Must not: touch product code, tests, or any path outside `.rope/research/`;
  spawn other agents; commit to product branches.
- Output contract: one Markdown file with Question / Verified Facts (each with
  a Source field) / Assumptions / Implications, mirroring existing research
  files; plus a ≤300-word summary in the return.

## Brief shape (minimal)

1. Research question + why it matters (1–2 sentences).
2. Primary-source rule (vendor docs / upstream repo at a pinned commit).
3. Output path + required sections.
4. Return shape: file path + short summary + confidence.

## Provisioning

Optional preset: when the host lacks a `rope-research` agent file, run the
task on a generic worker with this brief and **record the type used** (declared
deviation, ADR 0011). The three core roles and the ranking flow are unchanged.
