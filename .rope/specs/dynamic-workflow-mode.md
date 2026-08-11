# Dynamic Workflow Mode — Spec

Contract for the opt-in `mode: dynamic` issue flow. Companion to
`.rope/adr/0003-dynamic-workflow-mode.md`.

## `mode` field

- Location: `prd.md` frontmatter.
- Values: `serial` (default) | `dynamic`.
- Absent or `serial` ⇒ current serial behavior. `dynamic` ⇒ the discipline below.

## Dynamic-mode `tasks.md` structure

Must contain, in order:

1. **Contract slice** — `kind: contract`, `Blocked by: none`, first.
   Defines interfaces / data structures / call boundaries only. No feature
   implementation.
2. **Implementation slices** — each declares a disjoint
   `Scope` / `owned_files`. No file may be owned by more than one
   implementation slice. A core file owned by multiple slices is a **shape
   defect** (must be split or those slices serialized), not a go problem.
3. **Per-slice size cap** — default ≤ ~400 diff lines or ≤ 4 owned files per
   implementation slice. Exceeding ⇒ shape must split the slice.
4. **Integration slice** — trailing, serial. Wires the module slices into the
   main entrypoint and verifies contract alignment.

## go fan-out (when `mode: dynamic`)

- Frontier = slices with no unresolved blockers.
- **Disjoint-scope** frontier slices → concurrent implementer leaves (parent
  spawns one per slice).
- **Overlapping** slices → serialize.
- Contract and integration slices are always serial.
- Per-slice **review gates** and **commit rules** still apply.
- **Issue-level verify** stays parent-owned and read-only; no nested spawn from
  leaves.
- If go cannot spawn concurrent workers → degrade to serial, record the reason
  in `tasks.md`.

## Forbidden shortcuts

- Parallelize overlapping slices.
- Skip review gates in dynamic mode.
- A parallel implementer leaf spawning another leaf.
- go fanning out slices that share a core file.
- Auto-detecting dynamic mode (it is a manual, shape-time user decision).
- Hard-coding a model list instead of reusing harness presets.