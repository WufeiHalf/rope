# GSD /gsd-quick Comparison

## Question

How does GSD's `/gsd-quick` handle ad-hoc small tasks, and which of its
guarantees (or absences) should `rope-quick` adopt or reject?

## Verified Facts

### /gsd-quick scope and quality stages

Fact: `/gsd-quick` is documented as "Execute ad-hoc task with GSD guarantees".
Its quality stages are composable opt-in flags: `--discuss` (lightweight
pre-planning discussion), `--research` (spawn focused researcher),
`--validate` (plan-checking, max 2 iterations, + post-execution verification),
and `--full` (all of the above). The default run is bare execution.
Source: https://github.com/gsd-build/get-shit-done/blob/main/docs/COMMANDS.md
Verified by: fetch_content of COMMANDS.md (2026-03)
Stability: medium (GSD iterates fast; v1.40+ namespace routing)
Implication: GSD's default answer for "who is the second eye" is the test
suite; stronger guarantees are manual opt-in.

### No code review inside quick

Fact: Code review is not part of `/gsd-quick` even with `--full`; review
lives in separate quality-gate commands (`/gsd-code-review`, UI review,
audits). `--validate` adds plan-checking and post-execution verification,
not an independent reviewer over the diff.
Source: same COMMANDS.md reference; USER-GUIDE.md quality-gates namespace
Verified by: fetch_content
Stability: medium
Implication: no surveyed quick path ships an automatic reviewer leaf.

### Persistent quick-task state

Fact: Quick tasks have slugs with `list` / `status <slug>` / `resume <slug>`
subcommands — ad-hoc work is tracked and resumable like mini-phases.
Source: same COMMANDS.md reference
Verified by: fetch_content
Stability: medium
Implication: persistent one-page state for small tasks is an upstream
pattern; Rope's equivalent is the single `quick.md` record.

### No entry gate, no mid-run stop rules

Fact: Nothing in the GSD docs restricts what may enter `/gsd-quick`, and no
documented rule stops a quick task mid-run when it outgrows the quick path
(GSD has no heavier per-task pipeline to escalate back into — phases are the
unit, and quick tasks are not phases).
Source: COMMANDS.md + USER-GUIDE.md walkthrough and flags tables
Verified by: fetch_content
Stability: medium
Implication: Rope needs its own stop lines because Rope *does* have a heavier
pipeline (grill → shape → go → verify) that quick must be able to hand back
to; GSD's silence here is structural, not a judgment that stops are unneeded.

## Summary for the decision

GSD validates: no entry gate, no review-by-default, persistent small-task
record. It cannot answer Rope's stop-line question (no fallback pipeline),
and Rope's own ADR 0004 evidence (verify caught security/concurrency misses
after review passed) makes a zero-signal handoff to the human unacceptable —
hence rope-quick's directed risk-focus section instead of GSD's bare default.
