---
mode: dynamic
---

# Dynamic Workflow Mode

## Problem Statement

Rope's `rope-go` runs slices serially by default; the existing `optional
parallel frontier` (Scope-disjoint slices may parallelize) is rarely exercised
because slices are usually shaped by function logic, so several slices append
to the same core file. Result: long wall-clock times. Example issue
`code-change-session-repo-management` ran ~6h (11:55→17:57) across 7 serial
slices, where `code_change_session_service.py` was touched by 5/8 slices and
one slice was ~7000 lines. The user wants a manually toggled **dynamic workflow
mode**: shape an issue into a **contract-first, disjoint file-ownership** slice
set, then concurrently spawn cheap subagents to implement the disjoint slices.

## Solution

Add an **opt-in per-issue dynamic workflow mode**. When the user enables it at
`rope-shape` time, shape (a) asks the user, (b) enforces a three-piece slice
discipline — contract slice first, implementation slices with disjoint file
ownership, and a per-slice size cap — and (c) writes `mode: dynamic` into the
issue package. `rope-go` reads `mode: dynamic`, fans out disjoint non-blocked
frontier slices to concurrent cheap implementer leaves, keeps per-slice review
gates and issue-level verify, and stays serial for any overlapping slices.
Model routing reuses existing `rope-harness-presets` role templates; no new
model mechanism.

## Goals

- A user can turn dynamic mode on or off per issue, decided at shape time.
- When on, shape reliably produces a contract slice + disjoint file-ownership
  implementation slices + a size cap + a light integration slice.
- When on, go fans out disjoint implementation slices in parallel to cheap
  implementer leaves, without weakening review gates or issue-level verify.
- Serial behavior is unchanged when dynamic mode is off or absent.
- No new model mechanism; reuse existing harness role presets.

## Non-goals

- Not a blanket licence to parallelize overlapping slices.
- Not a change to implement/accept separation (ADR 0001 held).
- Not adopting `pi-dynamic-workflows` as the go engine.
- Not auto-detecting dynamic mode; it is a manual, shape-time user decision.

## Public Interface / Behavior

- `rope-shape`: at start, asks the user whether dynamic mode is wanted. If yes,
  enforces the three-piece slice discipline and records `mode: dynamic` in the
  issue package (prd.md).
- Issue package `mode` field: `serial` (default) | `dynamic`.
- Dynamic-mode `tasks.md` must contain: one contract slice (`kind: contract`,
  `Blocked by: none`, first), implementation slices with a declared disjoint
  `Scope`/`owned_files`, a per-slice size cap, and a trailing integration slice.
- `rope-go`: when `mode: dynamic`, the frontier is the set of slices with no
  unresolved blockers; disjoint-scope frontier slices are spawned to concurrent
  implementer leaves; overlapping slices serialize; review gates and commit
  rules still apply per slice; issue-level verify is unchanged.

## Testing Decisions

- Good test: observe the **skill behavior contract** at its seam — a dry-run of
  shape/go over a sample issue package — not skill internal wording.
- Seams under test (confirmed during shape):
  1. `issue-package.md` template — the `mode` field and slice `kind` /
     `Scope` / `owned_files` / `size_cap` fields.
  2. `rope-shape` flow — asks the user at start; dynamic mode yields the
     three-piece slice set.
  3. `rope-go` / `execution-rules.md` — reads `mode: dynamic`; disjoint frontier
     slices fan out concurrently; overlapping stay serial; review gates kept.
  4. `rope-harness-presets` — worker pool documents concurrent multi-spawn
     reuse; no schema change.
- Prior art: `skills/rope-shape/references/issue-package.md`,
  `skills/rope-go/references/execution-rules.md`,
  `skills/rope-harness-presets/references/manifest-schema.md`.
- Note: these are markdown skill docs; automation is limited to structure checks
  + a dry-run demonstration. Optional `quick_validate.py` (rope-init skill
  validation) if skill-creator is available; otherwise read-through.

## Behavior Contract

- System under test: Dynamic Workflow Mode — the shape-time toggle, slice
  discipline, and go parallel fan-out.
- Trigger/input: User starts `rope-shape` and confirms dynamic mode; issue
  package carries `mode: dynamic`; `rope-go` runs on that package.
- Collaborators: `rope-shape`, `rope-go`, `rope-harness-presets` (worker pool),
  issue package schema, parent-orchestrator.
- Observable result: a dynamic-mode package is shaped with contract slice +
  disjoint file-ownership slices + size cap + integration slice; go fans out
  disjoint frontier slices to concurrent implementer leaves; review gates run
  per slice; issue-level verify stays parent-owned and read-only.
- Failure visibility: overlapping slice ownership is flagged at shape (or go
  stays serial for overlapping slices); if go cannot spawn concurrent workers it
  degrades to serial and records the reason in `tasks.md`.
- Forbidden shortcuts: parallelizing overlapping slices; skipping review gates
  in dynamic mode; a parallel implementer leaf spawning another leaf; go fanning
  out slices that share a core file; treating dynamic mode as auto-detect.

## Architecture Impact

- Impact: required
- Trigger check: matches triggers — existing public interface changes (issue
  package `mode` field), concurrency semantics change (go fan-out), a runtime /
  entrypoint behavior changes (go slice loop), and the task cites ADR/research
  (single-window-go-orchestration, harness-presets).
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/0001-issue-level-verify-separated-from-go.md`
    Decision status: active
    Scope: issue-level verify is parent-owned and read-only; implement/accept
      separated.
    Decision disposition: inherit
    Inherited invariants:
      - implement vs accept are separate roles; verify does not edit code
      - parent owns issue-level verify
    Affected public interfaces: none (verify unchanged)
    Forbidden shortcuts:
      - issue-level verify editing code in dynamic mode
    Required evidence: verify remains parent-owned in the assembled dynamic flow
    Applies to: issue | verify
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/research/single-window-go-orchestration.md` (direction 3:
      no nested subagent spawning)
    Decision status: active
    Scope: parent is the only orchestrator; leaves do not spawn leaves.
    Decision disposition: inherit
    Inherited invariants:
      - no nested spawn, even for parallel implementer leaves
      - parent owns all dispatch
    Affected public interfaces: none
    Forbidden shortcuts:
      - a parallel implementer leaf spawning a review/other leaf
    Required evidence: dynamic-mode parallel leaves do not spawn
    Applies to: issue | Slice B | go
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D3
    Source: `.rope/research/single-window-go-orchestration.md` (direction 13:
      W1 parent-orchestrator workflow)
    Decision status: active
    Scope: parent-orchestrator owns the slice loop; skill wording for
      no-nested-spawn, context-protective parent, leaf correction.
    Decision disposition: extend
      - dynamic mode is a W1 variant adding parallel fan-out for disjoint slices
    Inherited invariants:
      - parent judgment-primary and context-protective
      - artifacts remain the bus
    Affected public interfaces: `execution-rules.md` parallel frontier wording
    Forbidden shortcuts:
      - turning the parent into a pure router
    Required evidence: parent still judges block/parallel; artifacts are the bus
    Applies to: issue | Slice B
    Documentation update: updated-existing
    Unresolved conflicts: none
  - ID: D4
    Source: `.rope/research/single-window-go-orchestration.md` (Cognition /
      Anthropic: parallel multi-writer is the weak case)
    Decision status: active
    Scope: parallel multi-writer is safe only for isolated / independently
      verifiable work; "interface is the contract".
    Decision disposition: extend
      - parallel allowed only for disjoint + independently testable slices
    Inherited invariants:
      - a shared boundary must be governed by an explicit contract
    Affected public interfaces: slice `Scope` / `owned_files` semantics
    Forbidden shortcuts:
      - fanning out slices whose files overlap
    Required evidence: go serializes overlapping slices; contract slice governs
      shared boundaries
    Applies to: issue | Slice B
    Documentation update: updated-existing
    Unresolved conflicts: none
  - ID: D5
    Source: `skills/rope-harness-presets` + `.rope/research/single-window-go-orchestration.md`
      (role presets / model routing)
    Decision status: active
    Scope: model routing via harness-native role presets + user-global manifest;
      parent may override per spawn.
    Decision disposition: inherit
    Inherited invariants:
      - no Rope-owned second prompt DB; presets are harness-native
      - missing preset → soft degrade, record `preset_missing`
    Affected public interfaces: none
    Forbidden shortcuts:
      - hard-coding a model list into a skill
    Required evidence: dynamic mode spawns via existing presets; no model schema
      change
    Applies to: issue | Slice C
    Documentation update: updated-existing
    Unresolved conflicts: none
- New decision candidate:
  - Scope: the dynamic-mode parallel orchestration itself (issue `mode` field,
    three-piece slice discipline, go fan-out contract).
  - Risk: high (introduces concurrency into go; changes the issue package
    interface and slice-loop behavior).
  - Decision needed: recorded as ADR 0003 in Slice 0 (already decided by user in
    this grill: opt-in, shape-time toggle, gates preserved).
- Constraint Bundle:
  - Decision sources: D1 (ADR 0001), D2/D3/D4 (single-window-go-orchestration
    research), D5 (harness-presets), ADR 0003 (new).
  - Decision statuses: D1 active; D2/D3/D4 active; D5 active; ADR 0003 new.
  - Scope: issue-wide — shape (mode field + discipline), go (fan-out), presets
    (worker pool), verify (unchanged).
  - Invariants:
    - I1 implement/accept separated; verify read-only (D1)
    - I2 no nested spawn; parent only orchestrator (D2)
    - I3 parallel only for disjoint + independently testable slices (D4)
    - I4 shared boundaries governed by contract slice (D4)
    - I5 model routing via harness presets, no new mechanism (D5)
    - I6 serial behavior unchanged when mode off/absent (D3)
  - Public seams: issue `mode` field; slice `kind` / `Scope` / `owned_files` /
    `size_cap`; go frontier fan-out.
  - Forbidden shortcuts:
    - F1 parallelize overlapping slices
    - F2 skip review gates in dynamic mode
    - F3 leaf spawns a leaf
    - F4 go fans out slices sharing a core file
    - F5 auto-detect dynamic mode
    - F6 hard-code a model list rather than reuse presets
  - Acceptance evidence: dry-run shape produces three-piece set; go plan fans
    out disjoint slice and serializes overlapping; serial mode unchanged.
  - Open conflicts: none

## References

- Research: `.rope/research/dynamic-workflow-mode.md`
- Research: `.rope/research/single-window-go-orchestration.md`
- ADR: `.rope/adr/0001-issue-level-verify-separated-from-go.md`
- ADR: `.rope/adr/0003-dynamic-workflow-mode.md` (created in Slice 0)
- Spec: `.rope/specs/dynamic-workflow-mode.md` (created in Slice 0)
- Skills: `skills/rope-shape/**`, `skills/rope-go/**`,
  `skills/rope-harness-presets/**`

## Open Questions / Human Gates

- Exact default size cap value (proposed: implementation slice ≤ ~400 diff
  lines or ≤ 4 owned files; exceeded → shape must split). Confirm at shape/go.
- `mode` field location finalized as prd.md frontmatter; confirm no tasks.md
  duplication needed.

## Gate Decisions

- Gate: shape dry-run of a dynamic-mode sample
- Decision: approved
- Approved action: run a dry-run of rope-shape on a sample feature to confirm
  the three-piece slice set is produced
- Scope: `.rope/issues/` dry-run fixture only; no code changes
- Risk: low (local, read-only)
- Pass criteria: dynamic-mode sample yields contract slice + disjoint
  implementation slices + size cap + integration slice, with `mode: dynamic`
- Failure report: any missing slice kind or overlapping ownership
- Forbidden out-of-scope actions: no edits to shipped skills during shape dry-run