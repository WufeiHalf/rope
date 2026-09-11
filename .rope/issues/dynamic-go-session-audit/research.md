# Research follow-up: mature dynamic execution + token-for-time

Date: 2026-09-11
Status: research complete; no implementation authorized or performed

## User questions / priorities

1. Prefer a mature fixed dynamic-workflow template with issue-specific task/flow data; investigate sensible workflow scope and task volume before designing it.
2. Rope spans harnesses, but prioritize making pi work well; identical-script portability is secondary.
3. More aggressive useful parallelism: with a capable implementer, spend more tokens to reduce wall-clock duration. Do not replace this goal with a low-cost/low-agent default.

## Evidence plan / owners

| Question | Evidence target | Owner / artifact |
| --- | --- | --- |
| Token vs latency/quality; research vs coding; aggressive decomposition | Anthropic and other first-party engineering experiments, exact measured claims | research-speed → `.rope/research/dynamic-go-token-latency-primary-sources.md` |
| Whole-workflow scope, durable/checkpoint boundaries, fixed vs generated control flow | Official agent orchestration examples and selective durable-engine references | research-template → `.rope/research/dynamic-go-template-scope-primary-sources.md` |
| Actual pi capabilities/limits/schema/worktrees/resume; minimal cross-harness contract | Installed runner source plus official alternative harness docs | research-harness → `.rope/research/dynamic-go-harness-contract-research.md` |
| Why current graphs cannot exploit more workers | Original target shape at commit `20464234`, existing Rope ADRs, offline DAG calculation | Parent → synthesis |

Three independent leaves dispatched concurrently via Agent; no workflow machinery needed for this research pass. No product runs, installations, target-workflow modifications, or external write operations.

## Parent findings so far

- Original target graph has 8 slices, initial ready count 1, maximum antichain 3, critical chain S1→S2→P1→P2→P3 (5 nodes).
- Exact offline unit-duration scheduling (all tasks one time unit; zero merge/setup/test overhead) gives serial 8, optimal makespan 5 with either 2, 3, 4, 8, or 14 workers. Ideal speedup cap is 8/5=1.6. This is an illustrative mathematical model, NOT measured real-world latency.
- Original S1 owns backend schema/admin and complete frontend form; backend consumers block on the whole slice. Candidate: put the minimum working backend contract on the critical path, not all UI work. This is a shape proposal, not an approved recut.
- P1's recorded S2 dependency is justified by acceptance on the settings construction path; adapter constructors and direct fake-transport tests already exist at the original commit. Candidate: separate implementation dependency from final integration acceptance dependency, preserving the real L3 gate. Requires shape validation, never silent go-time edge removal.
- P2 explicitly says `contract (thin-interface + hardening 可拆)` but retains both the new state interface and capacity/eviction semantics on the P3 critical path. Candidate: evaluate a minimal working state contract before independent cursor/seen-policy work; do not create non-working stubs or weaken acceptance.
- OpenCilk primary work/span model supports `T(P) >= max(W/P, S)`, ideal parallelism `W/S`: https://www.opencilk.org/doc/tutorials/opencilk-concepts/ (fetched 2026-09-11). Agent tasks add merge, startup, API quotas and stochastic rework; the arithmetic alone is not a performance promise.

## Deliverable

Completed: `.rope/research/dynamic-go-template-and-parallelism.md`.

Parent follow-up added the direct Anthropic Dynamic Workflows article/docs and official migration kit, correcting two initially overbroad interpretations: current Claude Code has native JS workflows, not only an SDK alternative; a mature fixed kernel must still allow task-specific dynamic plans/patterns. Official size advice is `<5 / <15 / <50 / unrestricted` agents, not an optimal coding task count. The migration kit's default 100-item batch is a configurable migration parameter, not a general workflow sizing rule.

Recommended direction: one approved issue-go closure per workflow; tested mechanics for scheduling/integration/completeness/fixes; pi-first host bindings with verified commit identity; maximize useful ready work and remove unnecessary critical-path work at shape; centralize expensive tests without losing real-entrypoint acceptance. Validate the kernel offline before live comparative performance runs.

Only research/diagnosis artifacts were written. No skill/runtime/config/ADR changes, target product runs, or target workflow restarts were performed.
