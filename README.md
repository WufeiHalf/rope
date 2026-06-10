# Rope Skill

Rope is a lightweight repo-local coding harness for Codex-style agents. It keeps
project knowledge under `.rope/` and uses small skills for requirement grilling,
issue shaping, TDD execution, and closeout.

## What It Provides

- `rope-init` initializes `.rope/` in a target repository.
- `rope-grill` discusses requirements and updates `.rope/CONTEXT.md`,
  `.rope/adr/`, `.rope/research/`, and `.rope/specs/`.
- `rope-shape` turns clarified requirements into `.rope/issues/<issue>/` with
  PRD, vertical slices, behavior matrix, and E2E classification.
- `rope-go` executes slices with TDD, review gates, commits, and classified E2E.
- `rope-finish` closes a Rope issue after implementation and validation.
- `rope-migrate-docs` migrates existing Matt Pocock-style docs and Trellis docs
  into `.rope/` without deleting originals.

## Install Skills

Install the bundled skills into the default Codex skills directory:

```bash
npx git+ssh://git@git.haizhi.com:10022/wufei/rope-skill.git add
```

Install to a project-local skills directory:

```bash
npx git+ssh://git@git.haizhi.com:10022/wufei/rope-skill.git add --target ./.codex/skills
```

Install to a custom directory:

```bash
npx git+ssh://git@git.haizhi.com:10022/wufei/rope-skill.git add --target /path/to/skills
```

## Typical Workflow

1. Run `rope-init` in a target repo.
2. Use `rope-grill` to clarify the requirement and update durable Rope docs.
3. Use `rope-shape` to create `.rope/issues/<issue>/prd.md`, `tasks.md`, and
   `e2e.md`.
4. Use `rope-go` to implement the issue slice by slice.
5. Use `rope-finish` to close the issue.

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
```

## E2E Classification

Rope does not default all E2E validation to manual user work. `rope-shape`
classifies each E2E item:

- `agent`: the agent must execute it.
- `agent-with-gate`: the agent asks before execution.
- `user`: human-only validation.
- `not-run`: intentionally skipped with a reason.

## Development

Validate a skill:

```bash
python3 /home/wufei/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rope-init
```

Run the CLI locally:

```bash
node bin/rope.js --help
```
