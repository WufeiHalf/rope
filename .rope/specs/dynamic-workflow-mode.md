# Workflow Execution Mode — Maintainer Route

The canonical operational contract is shipped with Rope:
[dynamic-workflow.md](../../skills/rope-go/references/dynamic-workflow.md) for
startup resolution, research coverage, graph width and failure handling, and
[execution-template.md](../../skills/rope-go/references/execution-template.md)
for the kernel's plan schema, run record, staged preconditions and stub
fidelity. Edit those files when runtime behavior changes; this maintainer route
deliberately does not copy their rules.

The kernel ships as code, not as instructions:
`skills/rope-go/workflows/go-execute.js` plus `skills/rope-go/scripts/`. Its
offline suite is `node --test tests/*.test.mjs`.

Architecture rationale: [ADR 0014](../adr/0014-workflow-execution-mode.md).
Test-scope rationale: [ADR 0013](../adr/0013-test-cost-tiering.md).

## Distribution acceptance

- A disposable install containing only the npm payload (`bin/`, `skills/`)
  resolves the dynamic reference from grill, shape, and go without `.rope/`.
- Both default user-global and explicit project targets preserve those links.
- Runtime references resolve relative to installed skill files, not cwd.
- `rope add` installs `skills/rope-go/workflows/` and `skills/rope-go/scripts/`
  with the skill (the installer copies subdirectories recursively), and an
  installed `go-execute.js` is byte-identical to the source copy.
- Reinstall preserves destination `settings.json`; real installed copies are
  changed only by an explicitly requested installation.
