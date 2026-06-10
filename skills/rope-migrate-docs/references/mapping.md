# Rope Document Migration Mapping

## Target Layout

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
  migration-report.md
```

## Source Mapping

| Source | Target | Strategy |
| --- | --- | --- |
| `CONTEXT.md` | `.rope/CONTEXT.md` | Copy or merge as glossary. Do not add implementation details. |
| `CONTEXT-MAP.md` | `.rope/research/context-map.md` | Preserve as migration reference unless multi-context Rope support is explicitly desired. |
| `docs/adr/*.md` | `.rope/adr/*.md` | Copy names when possible. Preserve numbering. |
| `docs/agents/issue-tracker.md` | `.rope/research/agent-workflow/issue-tracker.md` | Copy as historical workflow fact. |
| `docs/agents/triage-labels.md` | `.rope/research/agent-workflow/triage-labels.md` | Copy as historical workflow fact. |
| `docs/agents/domain.md` | `.rope/research/agent-workflow/domain-docs.md` | Copy as historical workflow fact. |
| `.trellis/spec/<area>/index.md` | `.rope/specs/<area>/index.md` | Copy, then remove Trellis-specific commands if obvious. |
| `.trellis/spec/<area>/*.md` | `.rope/specs/<area>/*.md` | Copy stable implementation contracts. |
| `.trellis/spec/guides/*.md` | `.rope/specs/guides/*.md` | Copy thinking guides. |
| `.scratch/<topic>/issue.md` | `.rope/issues/<topic>/tasks.md` | Copy only for active or selected topics. |
| `.scratch/<topic>/e2e-test-plan.md` | `.rope/issues/<topic>/e2e.md` | Copy and convert E2E executor classifications when possible. |
| `.trellis/tasks/<task>/prd.md` | `.rope/issues/<task>/prd.md` | Copy only active or selected task PRDs. |
| `.trellis/tasks/<task>/research/*.md` | `.rope/research/<topic>.md` or `.rope/issues/<task>/research/` | Prefer `.rope/research/` only for reusable external facts; otherwise skip or keep issue-local if selected. |

## Skip By Default

- `.trellis/workspace/`
- `.trellis/tasks/archive/`
- generated JSONL logs
- runtime reports
- local caches
- credentials or env files
- `.scratch/agent-runtime/`

## Conflict Policy

If target exists:

1. If content is identical, leave unchanged.
2. If target is empty/template and source has content, replace template.
3. If both have meaningful content, append a `## Migrated From <source>` section or ask the user.
4. Never silently overwrite user-authored `.rope/` content.

## Migration Report Template

```md
# Rope Migration Report

## Sources Found

- <source>

## Migrated

- `<source>` -> `<target>`: <strategy>

## Skipped

- `<source>`: <reason>

## Follow-up

- <cleanup or review item>
```

