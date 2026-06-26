---
name: rope-init
description: Initializes the .rope coding harness (context, routes, specs, research, ADR, issue dirs) in a repo. One-time setup; invoke by name.
disable-model-invocation: true
---

# Rope Init

Set up `.rope/` as a repo-local agent knowledge layer.

For output templates, read [references/templates.md](references/templates.md).

## Workflow

1. Inspect the repo before writing:
   - root agent docs: `AGENTS.md`, `CLAUDE.md`
   - root docs: `README*`, existing `CONTEXT.md`, `docs/adr/`
   - package/build markers: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Makefile`
   - likely source/test roots: `src/`, `app/`, `apps/`, `packages/`, `tests/`, `test/`, `spec/`
2. Create `.rope/` if missing using the template reference:
   ```text
   .rope/
     CONTEXT.md
     routes.md
     adr/
     research/
     specs/
       index.md
       guides/
         behavior-matrix.md
         integration-boundary.md
     issues/
   ```
3. Keep `.rope/CONTEXT.md` as an empty glossary template unless the user has already resolved project-specific terms.
4. Generate `.rope/routes.md` as conservative navigation:
   - repo shape
   - source roots
   - test roots and discovered test commands
   - common entrypoints discovered from files/scripts
   - mark unknowns as `Unknown`, not guesses
5. Generate `.rope/specs/` as a conservative skeleton:
   - include only stable generic guides during init
   - do not invent code contracts from filenames
   - draft code specs only when the user explicitly asks for deep bootstrap
6. Update the root agent doc in place using the `## Rope` block template:
   - prefer existing `AGENTS.md`; if only `CLAUDE.md` exists, edit that
   - add or update a `## Rope` block
   - tell agents to read `.rope/CONTEXT.md`, `.rope/routes.md`, relevant `.rope/specs/`, `.rope/adr/`, and `.rope/research/`

## Guardrails

- Do not decide whether `.rope/` should be committed or ignored; leave that to the user.
- Do not add GitHub/GitLab issue tracker defaults. Rope uses local markdown under `.rope/issues/` by default.
- Do not overwrite existing `.rope/` files without reading and preserving user content.
- Do not run destructive commands, install dependencies, push, deploy, or change root config.
