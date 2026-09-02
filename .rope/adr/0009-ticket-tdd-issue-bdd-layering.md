# 0009 Ticket-TDD / Issue-BDD Layering and Tracer-Bullet Slicing

**Status:** active — refines ADR 0008's dispatch model (unchanged) and
supersedes the vertical-slice iron rule and the e2e duplication regime.
Test-cost tiering completed by [0013](0013-test-cost-tiering.md).

Date: 2026-08-24

## Decision

1. **Slicing aligns with to-ticket (tracer bullets)**: the hard rules are
   blocking edges, fresh-context fit, and shared-mode file disjointness —
   not "complete user-visible path per slice". **Component slices** (parts
   of one user story) are legal; their briefs cite the story's Matrix row
   plus their own completion criteria (interface signature / tests green).
   Shape actively looks for a **prefactor** slice first ("make the change
   easy, then make the easy change") — often the first source of wide
   parallelism.
2. **Ticket-TDD / Issue-BDD layering**: the Behavior Matrix becomes the
   issue's behavior spec (Given/When/Then where helpful) and no longer
   points at slices. Ticket-level units are proved by leaf TDD (red/green
   evidence in brief returns); the **end-of-issue reviewer walks the
   Matrix behaviors at the real entrypoint** — issue-level BDD acceptance.
3. **e2e.md carries real-environment behaviors only** — real external
   systems, real entrypoints, real data that mocks cannot prove (a
   behavior unit-tested against fakes whose truth depends on a real API's
   semantics belongs here). Ticket-level test reruns never appear;
   `covered_by_slice` is deleted — anything that would have earned it does
   not belong in e2e.md at all.
4. rope-go's main path compresses to the concurrency loop; degrade paths
   move to a **fault manual** section read on failure, not upfront.

## Context

First real field run after 0008 (agent-web-search-tool, 2026-08-24)
serialized its only parallel pair: the mode-selection text read as "find
reasons to degrade" and the slicing iron rule (vertical, complete path)
kept graph width at 2. Meanwhile e2e.md items were dominated by
`covered_by_slice` bookkeeping — re-asserting validations TDD evidence
already proved — a triple-insurance layer left over from when slices were
not trusted. Upstream (mattpocock/skills to-tickets, implement-spec)
demonstrates: blocking-edge slicing + background concurrency + one
end-of-issue review is sufficient without per-slice demo-ability.

## Consequences

- Shape produces wider graphs (component slices, prefactor slices);
  go's concurrency default (0008 refinement) gets fed.
- Reviewer's contract-axis becomes explicit BDD acceptance: Matrix rows
  walked at the real entrypoint.
- e2e.md shrinks to 3–5 real-behavior scenarios per issue; verify's E2E
  check thins accordingly.
- Vertical path-per-slice remains a habit, not a rule — a slice that can
  demo alone still should.

## Alternatives considered

- Keep vertical iron rule + e2e duplication: field run showed it caps
  parallelism and doubles verification bookkeeping; rejected.
- Full to-ticket replacement (drop Matrix/Contract Note/bundle): loses
  rope's acceptance anchors and architecture continuity; rejected — align
  the slicing philosophy, keep the rope assets.
