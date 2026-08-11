# Dynamic Workflow Mode Tasks

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes | Slice A (shape asks + three-piece), Slice B (go fans out disjoint), E2E E1/E2 |
| Alternate input or entrypoint | no | single entry: shape → go; no alternate entrypoint |
| Empty or missing input | yes | `mode` absent/`serial` → go stays serial (existing behavior). Slice B |
| Invalid or malformed input | yes | overlapping slice ownership in a dynamic package → shape flags / go serializes overlap. Slice A + Slice B |
| Unavailable or not-ready dependency | yes | go cannot spawn concurrent workers → degrade serial + record. Slice B |
| Duplicate or idempotent case | yes | re-running go on the same `mode: dynamic` package recomputes the same frontier (idempotent). Slice B |
| Boundary or limit case | yes | per-slice size cap enforcement at boundary. Slice A |
| Existing behavior compatibility | yes | serial mode unchanged when mode off/absent. Slice A + Slice B |
| Real entrypoint or integration path | yes | end-to-end shape → go on a dynamic issue. E2E E1/E2 |

## Slice 0: Dynamic-Mode Contract

- Status: done
- Kind: contract
- Goal: Define the `mode: dynamic` field schema, the three-piece dynamic slice
  discipline (contract slice first, disjoint file ownership, per-slice size
  cap, integration slice), and the go fan-out contract, as a durable ADR +
  spec. This is the serial contract that A/B/C build against.
- Blocked by: none
- Scope: `.rope/adr/0003-dynamic-workflow-mode.md`, `.rope/specs/dynamic-workflow-mode.md`.
  Owns these files only.
- Matrix rows: none directly (contract; feeds others)
- Constraint IDs: I1–I6, ADR 0003
- Required evidence: ADR 0003 + spec written and consistent with PRD
- Public behavior: Rope has a written, durable definition of dynamic mode,
  its slice discipline, and its go fan-out contract.
- Tests:
  - read-through: ADR 0003 and spec define the `mode` field, slice kinds
    (contract / implementation / integration), `owned_files` disjointness rule,
    size cap, and go fan-out contract
- Implementation notes:
  - ADR 0003 records the decision (opt-in, shape-time toggle, gates preserved,
    reuse presets). Spec details the schema and rules.
  - Canonical layout: `mode: serial | dynamic` in prd.md; dynamic `tasks.md`
    has contract slice (kind: contract, first), implementation slices with
    disjoint `Scope`/`owned_files`, per-slice `size_cap`, trailing integration
    slice.
- Verification:
  - ADR 0003 + spec present; rule set matches PRD Constraint Bundle
- Review: required
- Review reason: defines the public contract every other slice depends on
- Stop conditions: ADR + spec committed and internally consistent

## Slice A: rope-shape dynamic mode

- Status: done
- Kind: vertical
- Goal: When a user shapes an issue, rope-shape asks at the start whether
  dynamic mode is wanted; if yes, it enforces the three-piece slice discipline
  and writes `mode: dynamic` into the issue package. Serial shaping is
  unchanged when the user declines.
- Blocked by: Slice 0
- Scope: `skills/rope-shape/SKILL.md`, `skills/rope-shape/references/issue-package.md`.
  Owns these files only (disjoint from Slice B/C).
- Matrix rows: Primary path; Invalid or malformed input; Boundary or limit case;
  Existing behavior compatibility
- Constraint IDs: I3, I4, I6, F1, F5
- Required evidence: shape dry-run yields three-piece set; serial unchanged
- Public behavior: a user can choose dynamic mode at shape time and get a
  contract-first, disjoint file-ownership slice set.
- Tests:
  - dry-run: shape a sample in dynamic mode → output has `mode: dynamic`, a
    contract slice first, disjoint implementation slices with `owned_files`, a
    size cap, and an integration slice
  - dry-run: shape the same sample in serial mode → no `mode: dynamic`, slice
    set unchanged
  - malformed: overlapping `owned_files` → shape flags it (or asks to split)
- Implementation notes:
  - Add the `mode` field to `issue-package.md` template.
  - Add the asking step at the start of `rope-shape` SKILL workflow.
  - Enforce three-piece discipline in dynamic mode; document the size cap
    default (~400 diff lines / 4 owned files) and the "overlap is a shape
    defect" rule.
- Verification:
  - Both dry-runs above pass; overlap flagged
- Review: required
- Review reason: changes the public issue-package interface and shape flow
- Stop conditions: dynamic and serial shape dry-runs both correct

## Slice B: rope-go dynamic mode

- Status: done
- Kind: vertical
- Goal: When go runs on a `mode: dynamic` package, it fans out disjoint
  non-blocked frontier slices to concurrent cheap implementer leaves, keeps
  per-slice review gates and commit rules, and stays serial for overlapping
  slices. Absent/`serial` mode behaves exactly as today.
- Blocked by: Slice 0
- Scope: `skills/rope-go/SKILL.md`, `skills/rope-go/references/execution-rules.md`.
  Owns these files only (disjoint from Slice A/C).
- Matrix rows: Primary path; Empty or missing input; Invalid or malformed input;
  Unavailable or not-ready dependency; Duplicate or idempotent case; Existing
  behavior compatibility
- Constraint IDs: I1, I2, I3, I6, F1, F2, F3, F4
- Required evidence: go plan fans out disjoint and serializes overlap; serial
  mode unchanged
- Public behavior: a dynamic-mode issue's disjoint implementation slices run in
  parallel, while overlapping ones run serially and review/verify stay intact.
- Tests:
  - dry-run: go plan on a `mode: dynamic` sample → disjoint frontier slices in
    one parallel batch; overlapping slices serialized
  - absent/serial: go plan unchanged (serial)
  - no-workers: parent cannot spawn concurrent workers → degrades to serial and
    records the reason in `tasks.md`
  - idempotent: re-planning the same package yields the same frontier
- Implementation notes:
  - Read `mode` from prd.md; interpret `dynamic`.
  - Frontier = slices with no unresolved blockers; fan out disjoint-scope ones
    concurrently (parent spawns one implementer leaf per slice); overlapping
    ones serialize.
  - Keep parent-owned review dispatch and commit rules per slice; no nested
    spawn from leaves.
- Verification:
  - go dry-runs above pass; no-workers degradation recorded
- Review: required
- Review reason: changes go concurrency semantics and the review/verify contract
- Stop conditions: fan-out and serialization dry-runs both correct

## Slice C: rope-harness-presets worker pool

- Status: done
- Kind: vertical
- Goal: Document in the harness-presets skill that dynamic mode may spawn
  multiple concurrent implementer leaves from the existing role presets, and
  confirm the manifest/naming supports concurrent multi-spawn. No model or
  schema mechanism changes (reuse as-is).
- Blocked by: Slice 0
- Scope: `skills/rope-harness-presets/SKILL.md`.
  Owns this file only (disjoint from Slice A/B).
- Matrix rows: Primary path; Existing behavior compatibility
- Constraint IDs: I5, F6
- Required evidence: presets doc covers concurrent multi-spawn; no schema change
- Public behavior: the worker pool is ready for dynamic mode's concurrent
  implementer spawns.
- Tests:
  - read-through: harness-presets SKILL documents concurrent multi-spawn reuse;
    role presets unchanged
- Implementation notes:
  - Add a note: dynamic mode may spawn multiple `rope-implementer` leaves
    concurrently; the manifest/naming already supports this; no schema change.
- Verification:
  - doc note present; presets unchanged
- Review: self-check
- Review reason: low-risk documentation-only slice
- Stop conditions: doc note added, presets unchanged

## Slice E: Integration

- Status: in_progress
- Kind: vertical
- Goal: Wire the assembled dynamic mode end to end: CONTEXT term consistency,
  README typical-workflow mention, and a dry-run confirming `mode: dynamic`
  flows shape → go with review gates and verify intact.
- Blocked by: Slice A, Slice B, Slice C
- Scope: `.rope/CONTEXT.md` (already has the term; verify consistency),
  `README.md`. Owns these files.
- Matrix rows: Real entrypoint or integration path
- Constraint IDs: I1–I6, F1–F6
- Required evidence: end-to-end dry-run; README/CONTEXT consistent
- Public behavior: a user reading Rope docs sees dynamic mode as a first-class,
  wired-in capability.
- Tests:
  - dry-run: shape a sample in dynamic mode, then go-plan it → mode respected,
    review gates present, verify parent-owned
  - read-through: CONTEXT term and README mention match ADR 0003
- Implementation notes:
  - Add a README typical-workflow note for dynamic mode; verify CONTEXT term.
- Verification:
  - end-to-end dry-run passes; docs consistent
- Review: required
- Review reason: touches public docs and exercises the assembled flow
- Stop conditions: end-to-end dry-run green; docs consistent with ADR 0003