# 0012 Worktree-Verified Full Demotion of file-overlap Edges

**Status:** active — refines [0011](0011-edge-classification-and-acceptance-gates.md)
decision 1 (dispatch semantics of edge labels); extends [0008](0008-slice-ready-worktree-execution.md)
worktree-mode scheduling.

Date: 2026-09-01

## Decision

1. **Shape-time execution-mode probe.** Shape verifies whether the harness
   can spawn an isolated (worktree) subagent and records the result in the
   `tasks.md` header as `Execution mode: worktree` | `shared` (with how it
   was verified). `rope-go` consumes the recorded mode instead of re-deriving
   it; a go-time capability mismatch degrades to shared with a recorded
   reason. A legacy package without the record keeps the old derivation
   (host capability + the repo's `worktree-setup:` line).
2. **Full demotion in verified worktree mode.** With `Execution mode:
   worktree`, a `file-overlap` edge **never blocks dispatch**: both slices
   dispatch concurrently, the edge is a merge-order preference, the serial
   merge queue orders landing, and a conflict costs exactly one re-dispatch.
   `seam-required` edges still block dispatch in both modes — the seam does
   not exist yet, which is unavailability, not conflict. Shared mode is
   unchanged (file-overlap blocks; same-wave owned files stay disjoint).
3. **Wide-refactor discipline unchanged.** Prefactor-first and
   expand–contract still sequence wide mechanical change. A slice whose
   owned files are wholesale renamed/retyped by another is a
   prefactor/expand-contract shape question, resolved at shape — never
   papered over by demotion.
4. **Author-intent conflict resolution.** On a merge-queue conflict, the
   re-dispatched leaf resolves **on the unmerged branch** by merging/rebasing
   the landed sibling: the unmerged slice's brief and commits are the
   primary intent sources, matching the upstream field report that the
   authoring side is the cheapest resolver.

## Context

- Worktree isolation already removes concurrent-write corruption
  (per-worktree index/HEAD); what remained under ADR 0011 was dispatch
  gating by file-overlap edges in every mode, capping startup width below
  the antichain whenever slices shared files.
- Upstream evidence (`.rope/research/mattpocock-skills-slicing-and-parallelism.md`):
  `implement-spec`'s model has no file-overlap gating at all (maximum
  concurrency over a task graph); `resolving-merge-conflicts` FAQ — "Should
  I keep parallel agents off the same files? Mostly no… The one piece of
  discipline worth keeping is to do large refactors first"; merge-back is
  best done by the authoring session.
- Worktree setup as unconditional step 0 (2026-09-01, same batch) removed
  the environment dimension of "can a fresh worktree run the green command".
- Human decision 2026-09-01: full demotion chosen over small-overlap-only
  demotion — maximal antichain preferred; Rope keeps the owned-files facts
  so a misjudged edge costs one conflict re-dispatch, not a wrong schedule.

## Consequences

- Worktree-mode startup width = antichain of the seam-required-only graph
  (maximal); file-overlap cost moves from scheduling to merge time, bounded
  at one re-dispatch per conflicted pair.
- Heavily overlapping graphs trade dispatch concurrency for merge-queue
  serialization and re-dispatch rounds; shape counters with prefactors,
  expand-contract, and honest seam-required labels.
- Edge labels keep their names and tests; only the dispatch effect of
  `file-overlap` is mode-dependent.
- `Owned files` remains per-slice fact (edge labeling depends on it); the
  "no file owned by more than one slice" uniqueness now applies within a
  shared-mode wave only.
