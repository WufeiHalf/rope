---
name: rope-migrate-docs
description: Migrates existing Matt Pocock-style docs and Trellis docs into the .rope document layout without deleting originals. Use when a repo already has CONTEXT.md, docs/adr, docs/agents, .scratch, or .trellis/spec and the user wants to adopt Rope.
---

# Rope Migrate Docs

Move an existing repo's agent-facing documentation into the `.rope/` layout. Default to non-destructive migration: copy, merge, or summarize into `.rope/`, but do not delete or move original files unless the user explicitly asks.

For source-to-target mappings and templates, read [references/mapping.md](references/mapping.md).

## Workflow

1. Discover existing docs:
   - Matt Pocock style: `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/`, `docs/agents/`, `.scratch/`
   - Trellis style: `.trellis/spec/`, `.trellis/tasks/`, `.trellis/workflow.md`
   - existing Rope: `.rope/`
   - root agent docs: `AGENTS.md`, `CLAUDE.md`
2. Present a migration plan before writing:
   - source files found
   - target `.rope/` files to create or update
   - merge strategy for conflicts
   - files intentionally left in place
3. Ask only if there is a real conflict:
   - target exists with different content
   - source maps ambiguously to multiple targets
   - source is task/archive/history content that may be too noisy
4. Create `.rope/` skeleton if missing.
5. Migrate using conservative rules:
   - root `CONTEXT.md` -> `.rope/CONTEXT.md`
   - `docs/adr/*.md` -> `.rope/adr/*.md`
   - `docs/agents/*.md` -> `.rope/research/agent-workflow/` or `.rope/specs/guides/` depending on content
   - `.trellis/spec/<area>/*.md` -> `.rope/specs/<area>/*.md`
   - `.trellis/spec/guides/*.md` -> `.rope/specs/guides/*.md`
   - `.scratch/<topic>/` -> `.rope/issues/<topic>/` only when it represents active planning or executable issues
6. Update root agent doc with `## Rope` block if needed.
7. Write `.rope/migration-report.md`:
   - what was copied or merged
   - what was skipped and why
   - follow-up cleanup suggestions

## Guardrails

- Do not delete, move, archive, or rewrite original Matt/Trellis docs by default.
- Do not force-add ignored files or change `.gitignore`.
- Do not migrate runtime caches, task archives, journals, generated reports, or local credentials.
- Do not flatten all historical tasks into `.rope/issues/`; migrate only active or explicitly selected work.
- Keep project language in `.rope/CONTEXT.md`, stable implementation contracts in `.rope/specs/`, external/platform facts in `.rope/research/`, and durable decisions in `.rope/adr/`.
