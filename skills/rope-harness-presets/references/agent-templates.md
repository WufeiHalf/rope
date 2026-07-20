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
- Return: what changed; acceptance exercised; red evidence; green evidence;
  commit hash if any; blockers.

### rope-reviewer

- Read-only critique of a finished unit against the brief and acceptance criteria.
- Check acceptance alignment, red-before-green evidence (unless waived), seam
  legality, and TDD anti-patterns (coupled / tautological / bulk tests).
- Verdict: `approve` | `changes_requested` | `blocked` with concrete findings.
- No code edits. No spawning further reviewers.

### rope-explore

- Read-only fact gathering. Grep/read/find only as needed.
- Return distilled facts + absolute paths. No implementation plans unless asked.
- Keep noise out of the parent: summarize, do not dump huge logs.

### rope-verify-inspector

- Mechanical inspection for issue-level verify: matrix rows, E2E claims, review
  reality, diff facts.
- Read-only. Return structured evidence the parent judge can use.
- Do not issue the final issue verdict; that stays with the parent/verify session.

## Idempotent write

Overwrite existing `rope-*.md` files completely. Do not append. Do not leave
backup clutter in the agents directory.
