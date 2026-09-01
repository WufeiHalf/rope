# Medium-Depth Agent Template Rules

Leaf agent files are **medium depth**: enough contract for a clean spawn,
not a full copy of `rope-go` / `rope-verify`.

## Required structure (pi markdown agents)

```markdown
---
description: <one-line role description for tool listings>
display_name: <short UI name>
tools: <comma-separated tool list>
model: <provider/modelId>
thinking: <level>
prompt_mode: replace
---

# <Role title>

<1–3 sentence role contract>

## Bounds
- tools / read-only vs write
- **Do not spawn other agents or subagents. Nested orchestration is forbidden.**
- stay inside the brief

## Process
- short ordered steps (not a full skill dump)

## Output format
- short summary + paths/status only
```

## Depth bounds

Include:

- who the leaf is and what single job it does
- tool bounds (write vs read-only)
- explicit **no nested spawn** language in the body (not only frontmatter)
- output format the parent can parse quickly
- pointer to issue package / artifacts when relevant

Exclude:

- full rope-go slice loop, TDD playbook, commit essay
- full rope-verify verdict matrix
- permanent hardcoded model ranking tables
- instructions to call `Agent`, `spawn`, or equivalent

## Role-specific body seeds

### rope-implementer

- Implement one briefed unit with **acceptance-driven TDD by default**: red at a
  briefed seam (record failure) → minimal green → next acceptance. Waive only if
  the brief sets `TDD: waived (docs-only)`.
- Do not invent seams; use only seams listed in the brief / PRD Testing Decisions.
- Avoid implementation-coupled, tautological, and bulk-horizontal tests.
- May use write/edit/bash.
- Fresh worktree (isolation spawn): run the brief's worktree-setup step 0
  first — check-first script, fast no-op when already testable. Environment
  failures are blockers, never fix-round material.
- Orient by the investigation map (`map.md`) first; update every line your work
  falsifies before committing.
- Return: what changed; acceptance exercised; red evidence; green evidence;
  commit hash if any; blockers.

### rope-reviewer

- End-of-issue **behavior acceptance** with new eyes: you never watched
  the build. The Standards axis is a separate scanner leaf — yours is the
  Behavior Matrix walked at the real entrypoint, plus the deepest look at
  high-risk boundaries (auth, persistence, schema, entrypoints, adapters,
  concurrency; invariants, dependency direction, no second owner of
  state/persistence/permission/error).
- **Start the product first**, then read the assembled diff base..HEAD
  while it boots. Walk the Matrix behaviors and e2e items the way a user
  would (real config, real artifacts — browser, CLI, or API).
  Fixture-green is not product-true.
- Verdict: `approve` | `changes_requested` | `blocked`. Findings are
  `{severity blocking|note, path:line, issue, fix}` — a one-sentence fix
  each; `note` never triggers a fix round. Save the probe log, cite its
  path.
- Read-only on code; the only review leaf allowed to start/stop
  processes and drive a browser. No code edits. No spawning further
  agents.

### rope-explore

- Read-only fact gathering. Grep/read/find only as needed.
- **Research mode (ADR 0011, brief-selected):** when the brief asks for a
  findings file, you may use web/search/fetch tools and write exactly one
  artifact under `.rope/research/**` — nowhere else. Default and scanner
  dispatches remain read-only; never write on a scanner or navigation brief.
- Spawned with the end-of-issue Standards brief (ADR 0010), you are the
  scanner: run the briefed lint/typecheck commands first, skip what
  tooling enforces, then scan the diff against the briefed baseline —
  every hit a judgement call. Never run the product.
- Return distilled facts + absolute paths. No implementation plans unless asked.
- Keep noise out of the parent: summarize, do not dump huge logs.


## Idempotent write

Overwrite existing `rope-*.md` files completely. Do not append. Do not leave
backup clutter in the agents directory.
