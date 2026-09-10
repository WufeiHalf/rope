# Workflow Execution Mode — Maintainer Route

The canonical operational contract is shipped with Rope:
[dynamic-workflow.md](../../skills/rope-go/references/dynamic-workflow.md).
Read it for startup resolution, research coverage, graph width, scheduling,
gates, failures, and in-script review. Edit that file when runtime behavior
changes; this maintainer route deliberately does not copy its rules.

Architecture rationale: [ADR 0014](../adr/0014-workflow-execution-mode.md).
Test-scope rationale: [ADR 0013](../adr/0013-test-cost-tiering.md).

## Distribution acceptance

- A disposable install containing only the npm payload (`bin/`, `skills/`)
  resolves the dynamic reference from grill, shape, and go without `.rope/`.
- Both default user-global and explicit project targets preserve those links.
- Runtime references resolve relative to installed skill files, not cwd.
- Reinstall preserves destination `settings.json`; real installed copies are
  changed only by an explicitly requested installation.
