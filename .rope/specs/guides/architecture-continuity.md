# Architecture Decision Continuity Contract

## Scope

This contract applies to newly shaped Rope issue packages and to the parent/leaf stages that execute, verify, and finish them.

## Contract

- Every new `prd.md` contains `Architecture Impact` with `Impact: required | not-applicable` and a trigger-check explanation.
- A relevant source decision has a source path, source status, issue disposition, scope, invariants, public seams, forbidden shortcuts, required evidence, applicability mapping, documentation outcome, and conflict state.
- Source status and issue disposition are separate fields.
- `prd.md` owns the complete Constraint Bundle. `tasks.md` references decision/constraint IDs and maps them to slice evidence.
- Implementer and reviewer briefs carry the Constraint Bundle by reference:
  bundle path + the slice's Constraint IDs + the short global invariant list
  inline; the leaf reads the bundle detail itself, so the full field set
  (source, status, disposition, invariant, forbidden shortcut, evidence,
  conflict) still reaches the leaf — via reference, not inline copy. Leaves
  report a changed disposition or conflict to the parent.
- Verify checks behavior, invariants, ownership, dependency direction, public compatibility, exception bounds, and evidence. It does not enforce a concrete implementation shape.
- Confirmed documentation work may be `pending-finish` during verify. Finish changes it to `updated-existing`, `added-new`, `no-new-decision`, or `exception-recorded`.
- Finish pauses when it discovers an unconfirmed architecture change.

## Tests Required

- Package-template read-through confirms the Architecture Impact and Constraint Bundle fields.
- Slice-template read-through confirms constraint IDs and evidence mapping.
- Leaf-brief rules require source, status, disposition, invariant, forbidden shortcut, evidence, and conflict fields.
- Verify format includes an architecture continuity section and distinguishes pending documentation from code findings.
- Finish checklist includes all four terminal documentation outcomes and the unconfirmed-change pause.
- Installer smoke confirms bundled skills and references are installed to the target without overwriting settings.

## Wrong vs Correct

### Wrong

```text
Implement Slice 2. Follow the ADR. Add tests.
```

The leaf must infer which decision applies, what invariant matters, and what proves it.

### Correct

```text
Slice 2 constraints:
- Bundle path: .rope/issues/<issue>/prd.md (Constraint Bundle section)
- Constraint IDs: D1
- Global invariant list (short, inline): verify is the sole parent-level
  accept gate; prd.md is the canonical full bundle

The leaf reads the constraint detail for each ID from the bundle itself —
source, status, disposition, invariant, forbidden shortcut, evidence,
conflict — and returns a one-line confirmation per ID plus any conflicts.
```
