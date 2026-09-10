# 0013 Test-Cost Tiering — Impact Before Suite Size

**Status:** active — amends the original full-suite frequency policy by user
confirmation in `dynamic-docs-and-clear/quick.md`. Completes
[0009](0009-ticket-tdd-issue-bdd-layering.md), refines
[0011](0011-edge-classification-and-acceptance-gates.md), and preserves
[0007](0007-graph-driven-go-single-review.md)'s single review gate and
[0008](0008-slice-ready-worktree-execution.md)'s avoidance of merge rituals.

## Context

Agent-workbench MR 57 collected 18 per-slice full-suite verification entries.
Repeated full discovery, lost piped verdicts, and parallel CPU contention
amplified reruns. Later dynamic instructions turned the intended upper bound
into “exactly twice,” contradicting baseline reuse and running unrelated
suites by phase rather than impact. A phase is not evidence of a dependency.

## Decision

1. Select tests by affected behavior, shared consumers, and uncertainty.
   Slice TDD is focused; integration checks cover affected seams; final review
   walks issue behavior at the real entrypoint. Expand to broad suites when
   shared infrastructure, unknown impact, observed coupling, or explicit repo
   requirements justify it. Record the reason in Testing Decisions.
2. Full suites remain **issue-level evidence**, never per-slice requirements.
   Baseline and final review are selection points, not mandatory executions.
   Local backend changes do not automatically require all frontend tests;
   changed backend/UI contracts include their affected consumers.
3. Reuse applicable same-HEAD green baseline evidence; otherwise select quick
   or affected tests, escalating by impact. Preserve scope and environment
   limits: green for a subset is not green for the whole repo. Store output
   and exit status once, then parse stored evidence.
4. Keep the `routes.md` Test tiers contract and automatic quick-tier derivation.
   Operational criteria, budgets, and the baseline ladder live only in the
   shipped [execution rules](../../skills/rope-go/references/execution-rules.md).
5. Under parallel-load failures, diagnose/rerun the failing tests first.
   Broader reruns need a recorded impact reason. Missing evidence returns to
   the leaf, not a parent backfill or a silent substitute verification.

## Consequences

- Full-suite work no longer grows with slice count or runs to satisfy a quota.
- Focused evidence can discover unrelated failures later; acceptance remains
  honest about its scope. Uncertain impact expands coverage conservatively.
- Teams with explicit all-suite requirements retain them; Rope does not
  override repository policy to save time.
- No cache service or test-selection runtime is introduced. Repo commands and
  the accepted behavior remain the inputs to agent judgment.
