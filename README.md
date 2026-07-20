# Rope Skill

Rope is a lightweight repo-local coding harness for agentic coding tools. It keeps
project knowledge under `.rope/` and uses small skills for requirement grilling,
issue shaping, TDD execution, and closeout.

## What It Provides

- `rope-init` initializes `.rope/` in a target repository.
- `rope-grill` discusses requirements and updates `.rope/CONTEXT.md`,
  `.rope/adr/`, `.rope/research/`, and `.rope/specs/`.
- `rope-shape` turns clarified requirements into `.rope/issues/<issue>/` with
  PRD, vertical slices, behavior matrix, and E2E classification.
- `rope-go` executes slices as **Parent Orchestrator**: spawns implementer and
  reviewer leaf workers, TDD, commits, and classified E2E.
- `rope-verify` verifies an issue's completion state against its PRD, Behavior
  Matrix, and E2E plan after `rope-go` finishes. Parent-owned, read-only on
  code; produces findings and a fix brief for an implementer leaf when needed.
- `rope-finish` closes a Rope issue after implementation, validation, and verify.
- `rope-summary` updates `.rope/` architecture/context docs after implementation
  when reusable contracts or bug-fix learnings should be preserved.
- `rope-migrate-docs` migrates existing Matt Pocock-style docs and Trellis docs
  into `.rope/` without deleting originals.
- `rope-harness-presets` discovers the host model catalog and writes Rope leaf
  agent presets (`rope-*`) plus a user-global harness manifest (manual refresh).

## Install Skills

Install the bundled skills into the default agent skills directory:

```bash
npx git+ssh://git@github.com/WufeiHalf/rope.git add
```

Install to a project-local skills directory:

```bash
npx git+ssh://git@github.com/WufeiHalf/rope.git add --target ./.agents/skills
```

Install to a custom directory:

```bash
npx git+ssh://git@github.com/WufeiHalf/rope.git add --target /path/to/skills
```

`rope add` copies bundled skills and overwrites bundled files.

## Harness leaf presets

Leaf worker model/thinking pins live in harness-native agent presets produced by
`rope-harness-presets` (user-level agents + `~/.config/rope/harness/<host>.json`).
Skill-local `settings.json` pins (including the former `rope-verify` review
subagent pin) are not a supported API. Run `rope-harness-presets` after local
model catalog changes. If presets are missing, go/verify soft-degrade with
`preset_missing` and continue.

## Typical Workflow

One issue → one parent session (Parent Orchestrator). The parent spawns leaf
workers for noisy implement/review/inspect work; it does not require dual human
windows as the architecture.

1. Run `rope-init` in a target repo.
2. Use `rope-grill` to clarify the requirement and update durable Rope docs
   (spawn explore leaves for polluting investigation; write decisions to `.rope/`
   early).
3. Use `rope-shape` to create `.rope/issues/<issue>/prd.md`, `tasks.md`, and
   `e2e.md`. Default: continue in the same session.
4. Use `rope-go` as parent orchestrator: for each slice, spawn implementer leaf,
   then reviewer leaf when `Review: required` (self-check when allowed). Max two
   automated fix rounds per problem, then Human Escalation Stop.
5. Use `rope-verify` in the same parent session to verify issue completion against
   PRD/E2E. If `CHANGES_REQUESTED`, parent spawns an implementer leaf with the
   fix brief and re-verifies. (Hosts that cannot spawn workers may use a
   top-level implement session as a degraded handoff.)
6. Use `rope-summary` when the implementation revealed reusable contracts or
   architecture facts that should be preserved.
7. Use `rope-finish` to close the issue.

Optional: run `rope-harness-presets` once per machine/model-catalog change so
go/verify can prefer `rope-implementer` / `rope-reviewer` / `rope-explore` /
`rope-verify-inspector`. Missing presets soft-degrade; they are not a hard block.

## `.rope/` Layout

```text
.rope/
  CONTEXT.md
  routes.md
  adr/
  research/
  specs/
    index.md
    guides/
  issues/
    <issue-slug>/
      prd.md
      tasks.md
      e2e.md
      verify.md   # written by rope-verify after go completes
```

## E2E Classification

Rope does not default all E2E validation to manual user work. `rope-shape`
classifies each E2E item:

- `agent`: the agent must execute it.
- `agent-with-gate`: the agent executes a shape-approved action without asking again unless action scope or risk changes.
- `user`: human-only validation, used only when real human judgment or access is required.
- `not-run`: intentionally skipped with a user-accepted reason.

## Development

Validate a skill:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/rope-init
```

Run the CLI locally:

```bash
node bin/rope.js --help
```
