# Architecture Continuity

Use this reference from shape, go, verify, and finish. The issue package is the transport; `.rope/adr/` and `.rope/specs/` remain the decision sources.

## Trigger check

Shape performs a targeted lookup through `.rope/CONTEXT.md`, routes, the confirmed seams, task references, and relevant ADR/spec paths. It does not scan every architecture document.

Set `Impact: required` when any trigger applies:

- an existing public interface changes;
- a dependency direction or seam changes;
- state, lifecycle, persistence, permission, concurrency, or error semantics change;
- a caller, entrypoint, adapter, or runtime is added;
- an existing responsibility may be duplicated;
- the task cites or depends on an ADR, spec, or architecture issue.

Set `Impact: not-applicable` only after recording a lightweight check showing why none applies. Uncertainty is `required` with an unresolved question, not `not-applicable`.

## Decision record

For every relevant source, record one entry in `prd.md`:

```md
- ID: D1
  Source: .rope/adr/NNNN-slug.md or .rope/specs/area/topic.md
  Decision status: active | superseded | deprecated | provisional | unknown
  Scope: <behavior and boundary covered>
  Decision disposition: inherit | extend | supersede | exception | not-applicable
  Inherited invariants:
    - <behavior or dependency invariant>
  Affected public interfaces: <seams or none>
  Forbidden shortcuts:
    - <lazy path that could pass shallow tests but violate the decision>
  Required evidence: <test, integration check, review judgment, or doc>
  Applies to: issue | Slice N | e2e | verify
  Documentation update: pending-finish | updated-existing | added-new | no-new-decision | exception-recorded
  Unresolved conflicts: <none or sources and affected behavior>
```

`Decision status` describes the source. `Decision disposition` describes this issue. Keep them separate. An `unknown` source status blocks only when the uncertainty could change the applicable rule or disposition; otherwise carry the uncertainty explicitly.

Use dispositions this way:

- `inherit`: preserve the decision and its invariants.
- `extend`: preserve the core invariants while expanding scope or compatibility.
- `supersede`: replace the source decision with an explicitly accepted alternative.
- `exception`: violate a named invariant only within a bounded, documented scope.
- `not-applicable`: the source has no bearing on this issue's behavior.

If two sources conflict and no source explicitly supersedes the other, list both, explain the affected behavior, and block shape until the conflict is resolved. A leaf never resolves it silently.

When triggers apply but targeted lookup finds no source, write:

```md
- Relevant decisions: none found
- New decision candidate:
  - Scope: <new boundary or responsibility>
  - Risk: low | high
  - Decision needed: <parent/user decision or explicit no-new-decision rationale>
```

High-risk candidates (hard to reverse, public-contract changing, or involving a real tradeoff) block shape. A low-risk candidate may proceed only with an explicit parent conclusion.

For an older package without Architecture Impact, record `legacy package — architecture continuity not assessed`. Verify revisits that assessment when the final work touches a trigger; new packages always include the section.

## Constraint Bundle

`prd.md` is the canonical full bundle. Include:

- decision sources and source statuses;
- scope;
- invariants;
- public seams;
- forbidden shortcuts;
- acceptance evidence;
- open conflicts and new candidates.

Map every decision and invariant to `issue`, one or more slices, `e2e`, or `verify`, and name the evidence that proves it. `tasks.md` references these IDs and records slice applicability; it does not copy the full bundle.

The parent keeps the full bundle. A leaf receives the global constraints plus its slice subset, source paths, disposition, invariant, forbidden shortcut, required evidence, and open conflict status.

## Continuity checks

Review and verify judge behavior, invariants, dependency direction, responsibility ownership, public compatibility, and evidence. They do not require a particular function, class, or internal implementation shape.

For `not-applicable`, record the lightweight trigger check. For `inherit`, every invariant needs evidence. For `extend`, `supersede`, or `exception`, evidence must cover the changed boundary and the documentation outcome. Confirmed documentation that is still unwritten is `pending-finish`, not a code finding.

Finish changes `pending-finish` to one terminal outcome:

- `updated-existing`
- `added-new`
- `no-new-decision`
- `exception-recorded`

If finish discovers an unconfirmed architecture change, pause for a disposition decision. Do not invent an exception or close with a documentation todo.
