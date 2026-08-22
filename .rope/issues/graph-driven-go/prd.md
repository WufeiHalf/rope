# Graph-Driven Go — waves, rivers, one honest gate

## Problem Statement

A 9-slice issue ran serially for 7.5 hours although its slice graph held two
zero-dependency rivers; 16 per-slice reviews plus 7 fix rounds (≈2.6 h) caught
no cross-slice defect, while both fatal gaps (no real profiles in the real
registry, admin 403 on session creation) were only visible from the assembled
diff and the real entrypoint — discovered by the user 19 minutes after
`verify PASS`. Every implementer leaf re-explored the same code (56–71% of
tool calls in the oversized slices were wayfinding).

Research: `.rope/research/session-01a01ece-postmortem.md`.

## Solution

Read the slice graph instead of guessing: shape derives waves and rivers from
`Blocked by`, enforces a fresh-context size iron rule (misalignment found
while re-cutting ⇒ back to grill), and offers river splits. Go executes waves
with background implementer leaves and shares an investigation `map.md`.
Review collapses to **one end-of-issue reviewer with new eyes**: two axes
(standards / contract) over the assembled diff plus a real-entrypoint probe
of the primary paths. Verify degenerates to a thin paperwork gate.

## Contract Note

- After shape cuts slices, it shows the graph (waves, rivers, size
  violations) and asks one execution question with numbers — never a blind
  serial/dynamic question before slicing.
- A slice that cannot fit a fresh context window is re-cut at shape; if
  re-cutting breaks the requirement, shape returns to grill with the specific
  misalignment.
- Go dispatches each wave's non-overlapping slices as background leaves; the
  parent is not blocked waiting on one leaf at a time.
- Implementer briefs point at `<issue>/map.md`; leaves update the lines they
  falsify before committing.
- One review at the end: a reviewer leaf that never watched the build reads
  the whole diff against the Contract Note and walks the real entrypoint;
  PASS requires zero findings after ≤2 fix rounds.
- rope-verify checks paperwork only (review recorded, E2E statuses terminal,
  tree clean).

## Goals

- Graph-derived execution: waves, rivers, frontier parallelism by default.
- Fresh-context size iron rule at shape with back-to-grill escape.
- Investigation map written once, updated in place.
- Single end-of-issue two-axis review with real-entrypoint probe.
- Thin verify; Matt-style skill prose throughout.

## Non-goals

- Dispatch preflight / retry budgets (user's own harness work).
- Optional worktree isolation for spawns (user builds it in pi himself).
- Any change to rope-quick, rope-grill interview content, or E2E executor
  classification (agent / user / agent-with-gate / not-run).
- TDD discipline inside implementer leaves (unchanged, `tdd.md`).

## Public Interface / Behavior

- `skills/rope-shape` workflow: slicing is followed by a graph read and one
  user question (split rivers / run waves); no mode or review frontmatter is
  written.
- `skills/rope-go`: wave loop with background dispatch; investigation map
  seeding/updating; single end-of-issue review; fix rounds ≤2 then stop.
- `skills/rope-verify`: paperwork-only checklist.
- `prd.md` frontmatter `mode:` / `review:` fields are gone from templates;
  legacy packages ignore gracefully (no consumer reads them).

## Testing Decisions

- Good test: mechanical grep sweep proving no stale per-slice-review or
  mode-frontmatter instructions remain in `skills/` or README; sync diff
  proving `.agents/skills` matches `skills/`; read-through checklist per
  changed SKILL.md (description intact, single source of truth, no no-ops).
- Seams under test: skill texts and installed copies (docs-only issue).
- Prior art: `.rope/issues/review-cost-optimization/` doc-sweep pattern.

## Behavior Contract

- System under test: the rope skill texts and their installed copies.
- Trigger/input: running shape/go/verify on a future issue after this change.
- Collaborators: pi Agent tool (background spawn), harness presets.
- Observable result: shape asks the graph question after slicing; go runs
  waves in background and ends with one review; verify is thin. Failure
  visibility: E1 grep sweep and sync diff fail loudly on any stale text.
- Failure visibility: `verify` of this issue reports the sweep result.
- Forbidden shortcuts: deleting review entirely without replacing it with the
  end-of-issue gate; keeping per-slice text anywhere; project-specific
  (agent-workbench) phrasing in skills.

## Architecture Impact

- Impact: required
- Trigger check: changes the workflow architecture recorded in ADR 0003
  (dynamic mode opt-in) and ADR 0004 (review modes) — supersede in part.
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/0003-dynamic-workflow-mode.md`
    Decision status: active → superseded (by ADR 0007)
    Scope: opt-in parallel slice execution
    Decision disposition: supersede
    Inherited invariants: disjoint owned files for parallel slices; contract
    and integration slices serial; no nested spawn.
    Affected public interfaces: `prd.md` mode frontmatter (removed).
    Forbidden shortcuts: blanket parallelization of overlapping slices.
    Required evidence: execution-rules wave section; ADR 0007.
    Applies to: issue
    Documentation update: added-new (ADR 0007)
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/adr/0004-risk-tiered-review-mode-and-lean-briefs.md`
    Decision status: active → superseded in part (by ADR 0007)
    Scope: per-slice / batch review modes
    Decision disposition: supersede
    Inherited invariants: review must be parent-spawned and auditable; risk
    focus on high-risk boundaries; ≤2 fix rounds then Human Escalation Stop.
    Affected public interfaces: slice `Review:` marking (removed); review
    verdict recording (now one issue-level verdict).
    Forbidden shortcuts: review degraded to silent self-check.
    Required evidence: end-of-issue review execution text; ADR 0007.
    Applies to: issue
    Documentation update: added-new (ADR 0007)
    Unresolved conflicts: none
  - ID: D3
    Source: `.rope/adr/0005-plan-artifact-reader-layering.md`
    Decision status: active
    Scope: minimal leaf briefs
    Decision disposition: extend
    Inherited invariants: brief ≤60 lines, allowlist, by-reference loading.
    Affected public interfaces: operational contract gains the map path.
    Forbidden shortcuts: inlining the map into briefs.
    Required evidence: execution-rules brief contract edit.
    Applies to: Slice 2
    Documentation update: updated-existing
    Unresolved conflicts: none
- New decision candidate: none
- Constraint Bundle:
  - Decision sources: D1 (adr/0003), D2 (adr/0004), D3 (adr/0005)
  - Decision statuses: superseded, superseded-in-part, active
  - Scope: shape/go/verify/presets/readme/CONTEXT/ADR
  - Invariants: no nested spawn; disjoint ownership for parallel slices;
    review parent-spawned and auditable; ≤2 fix rounds; map is one fact per
    line with path + date.
  - Public seams: skill texts; `.agents/skills` install.
  - Forbidden shortcuts: D1/D2 lists above.
  - Acceptance evidence: E1 sweep + sync diff + read-through checklist.
  - Open conflicts: none.

## References

- Research: `.rope/research/session-01a01ece-postmortem.md`
- Upstream: mattpocock/skills `implement-spec`, `to-tickets`, `code-review`,
  `triage/AGENT-BRIEF.md` (clone at `~/.cache/rope-upstream/mattpocock-skills`)

## Open Questions / Human Gates

- none (all resolved at grill 2026-08-22)

## Gate Decisions

- Gate: repo-local skill edits + `rope add` sync
- Decision: not-required (local docs only)
- Scope: this repository
- Risk: none beyond ordinary git history
- Pass criteria: E1 sweep green
- Failure report: sweep output in e2e.md
- Forbidden out-of-scope Actions: publishing, remote writes
