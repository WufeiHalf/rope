# Dynamic go: what first-party evidence says about parallel agents

Research date: 2026-09-11. Scope: primary engineering reports and first-party coding experiments; this is evidence for workflow design, not a claim that any fixed fan-out is optimal.

## Parent follow-up: direct Dynamic Workflows coding evidence

The primary-source coverage below predates the parent follow-up in `dynamic-go-template-and-parallelism.md`. Add the current official [Dynamic Workflows article](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code) and [large-scale code migrations](https://claude.com/blog/ai-code-migration): JS templates may live in skills and be adapted; a coding example used 12 Sonnet implementers; cheap TypeScript checks stayed in loops while expensive Cargo builds moved out; a single build daemon batches rebuilds for parallel fixers. Another case autonomously ran/fixed E2E for four nights. These are more directly relevant coding practices, but still not a controlled token-to-latency curve or proof of an ideal agent count. The companion migration kit is generalized, unmaintained reference code, not the original Bun harness or a drop-in Rope template. Its per-file reviewer multiplier must not silently replace Rope's single end-of-issue review.

## Executive answer

- “More tokens buy time” is operationalizable only when extra calls cover independent work, useful diversity, or independent verification. Parallelism reduces wall-clock toward the slowest branch, while token/API spend rises roughly with the number and duration of branches.
- The strongest direct evidence for large speedups is Anthropic’s **Research** product, not coding: 3–5 parallel subagents plus parallel tool calls cut complex research time “by up to 90%.” That benchmark/task is breadth-first web research, not repository mutation.
- Anthropic reports multi-agent Research beating single-agent Opus 4 by 90.2% on its internal research evaluation; it also reports ~15× chat token usage for multi-agent systems. These are not latency-normalized coding results and should not be projected to go.
- Anthropic’s own Research report explicitly says most coding tasks have fewer truly parallelizable tasks than research and that shared context/dependencies are a poor fit.
- First-party coding stress tests nevertheless show concurrency can create substantial throughput: Anthropic’s C compiler used 16 agents, nearly 2,000 sessions, ~$20,000, and produced a 100k-line compiler; this is a capability experiment, not a controlled A/B speed or quality study.
- Cursor’s long-running browser experiment reports hundreds of concurrent workers, >1M LoC over ~one week, with minimal conflicts; it also reports an early flat-lock design making 20 agents behave like 2–3. These are operational anecdotes, not controlled measurements.
- Therefore dynamic go should widen only the ready frontier and independent diagnosis/review, use redundant candidates selectively, keep seams explicit, and preserve serial integration/gates. No source supports a universal ideal agent count.

## Measured or explicitly reported facts

### Anthropic: Building effective agents

Source: https://www.anthropic.com/engineering/building-effective-agents (published 2024-12-19, page’s original post; current page notes tooling has changed).

- Anthropic distinguishes workflows (predefined code paths) from agents (LLM-directed process/tool use).
- It recommends the simplest system first because agentic systems trade latency and cost for performance.
- Prompt chaining is recommended when subtasks are fixed and cleanly decomposable; the stated trade is higher accuracy in exchange for latency.
- Parallelization has two forms: **sectioning** (independent subtasks) and **voting** (repeated attempts aggregated programmatically).
- Anthropic says parallelization fits speed or confidence needs, especially when separate calls can focus on separate considerations.
- Orchestrator-workers fit complex coding where file count and change nature cannot be predicted in advance; the orchestrator dynamically decomposes.
- Evaluator-optimizer fits cases with clear criteria where feedback measurably improves output.
- Coding agents are a good fit when tests provide objective feedback, but human review remains important for broader requirements.
- The recommendation is to add complexity only when it demonstrably improves outcomes; this is a design constraint against “fan out by default” without evaluation.

### Anthropic: Multi-agent Research system

Source: https://www.anthropic.com/engineering/multi-agent-research-system (2025-06-13; verify date against page metadata if republishing).

- Internal evaluation: lead Opus 4 + Sonnet 4 subagents “outperformed single-agent Claude Opus 4 by 90.2%” on Anthropic’s internal research eval. The post does not present this as a coding benchmark.
- On BrowseComp, Anthropic says token usage alone explained 80% of variance; token usage, tool calls, and model choice explained 95%. This is a browsing-agent evaluation, not software engineering.
- Cost signal: agents typically use ~4× chat tokens; multi-agent systems ~15× chat tokens. The comparison baseline is chat interaction, not a matched single coding agent or equal-latency run.
- Speed signal: introducing 3–5 subagents in parallel, and 3+ parallel tools per subagent, cut complex research time “by up to 90%.” No task count, p50/p95, or controlled baseline is supplied in the post.
- The system’s reason for working is context multiplication: subagents explore with separate contexts and compress findings for a lead. That maps to independent investigation, not shared mutable code.
- Early failure: vague delegation caused duplicated searches and gaps; explicit objective, output format, tool/source guidance, and boundaries were required.
- Anthropic’s effort guidance is complexity-based: simple fact finding 1 agent/3–10 tool calls; comparisons 2–4 subagents/10–15 calls each; complex research >10 with clearly divided responsibilities. This is a heuristic for research, not an agent-count rule for coding.
- Production coordination is synchronous: the lead waits for each set, so one slow subagent blocks progress. Anthropic names asynchronous execution as a possible speed improvement but warns of coordination, state-consistency, and error-propagation complexity.
- Anthropic explicitly qualifies transfer: domains requiring shared context or many dependencies are poor multi-agent fits; “most coding tasks involve fewer truly parallelizable tasks than research.”
- Artifact handoff through a filesystem reduces “game of telephone,” preserves fidelity, and avoids copying large outputs through coordinator context. This supports thin, structured seams.
- Agents are stateful and errors compound; checkpoints, retries, resumability, tracing, and end-state evaluation are described as reliability requirements.

### Anthropic: long-running coding harness

Source: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents (2025-11-26; page currently links the Claude Agent SDK).

- The report is an internal web-app coding experiment, not a multi-agent speed comparison. It found a single long-running agent often one-shotted too much, exhausted context mid-feature, or later declared the project complete prematurely.
- The remedy was an initializer agent plus incremental coding sessions, a structured feature list, progress file, git history, clean-state commits, and an initialization script.
- Agents were told to implement one feature at a time and only mark it passing after end-to-end verification.
- Explicit browser automation and human-style end-to-end testing “dramatically improved performance” by exposing bugs not obvious from code/unit tests.
- The report says it remains unclear whether one general coding agent or specialized testing/QA/cleanup agents perform best. This is an important unknown, not evidence for a preferred topology.
- Operational implication: wider go must not replace incremental scope, durable progress artifacts, or real-entrypoint checks.

### Anthropic: C compiler agent-team experiment

Source: https://www.anthropic.com/engineering/building-c-compiler (2026-02-05; Nicholas Carlini; exact publication date should be rechecked if page metadata changes).

- Capability experiment: 16 agents wrote a Rust C compiler from scratch; nearly 2,000 Claude Code sessions over two weeks; reported cost just under $20,000.
- Output: ~100,000 lines; builds Linux 6.9 on x86/ARM/RISC-V, plus several projects; reports ~99% pass rates on most compiler suites.
- The report does **not** provide a single-agent control, wall-clock reduction, per-agent cost curve, or causal quality comparison. Do not call this proof that 16 is optimal.
- Harness: containers/local clones, task locks, pull/merge/push cycle, and fresh sessions. Merge conflicts were frequent but agents resolved them.
- Parallelism worked when many distinct failing tests or projects existed. It failed when all agents encountered the same kernel bug: 16 agents repeatedly attacked/overwrote the same issue.
- A GCC oracle plus random mixed compilation partitioned failures, enabling agents to work on different bugs. Delta debugging was still needed for interacting file pairs.
- Specialization included duplicate-code cleanup, compiler performance, generated-code efficiency, design critique, and documentation.
- Quality ceiling remained: generated code was less efficient than GCC -O0, Rust quality below an expert, features/fixes often regressed existing behavior, and some toolchain pieces remained buggy.
- This is direct evidence for independent failing-test lanes, oracle-based diagnosis, role specialization, and strong CI—not for unconstrained shared-file concurrency.

### Cursor: scaling long-running agents

Source: https://cursor.com/blog/scaling-agents (2026-01-14; parent verified the page's JSON-LD `datePublished` and visible `<time>` in the raw HTTP body).

- Cursor reports hundreds of concurrent agents on one browser project, >1M lines across 1,000 files in close to a week, with minimal conflicts; this is an anecdotal production-style experiment, not a controlled trial.
- A flat shared-file locking design failed: agents held/forgot locks, and “twenty agents would slow down to the effective throughput of two or three,” mostly waiting.
- Optimistic concurrency was more robust, but flat peers became risk-averse and avoided hard tasks, causing churn.
- A planner/worker separation improved coordination: planners create tasks; workers focus on assigned tasks; a judge decides whether to continue.
- Cursor reports hundreds of workers concurrently pushing to one branch and minimal conflicts, but does not report baseline speed, tokens/agent, defect rate, or review effort.
- An integrator role for quality/conflict control created more bottlenecks than it solved; Cursor says workers could handle conflicts themselves. This cautions against a heavyweight model-mediated integration stage. It does not establish that concurrent Git writes to Rope's single integration worktree are safe; a cheap serial mechanical merge queue is a different mechanism.
- Cursor reports model-role differences (planner vs coding specialist) and says periodic fresh starts are still needed to combat drift/tunnel vision.
- Their conclusion is optimistic but explicitly non-optimal: the system works, yet coordination remains hard and agents sometimes run too long.

## Operational recommendations for dynamic go

1. Compile the graph into a ready-frontier scheduler, not fixed broad waves. Dispatch every seam-ready slice within actual resources; refill after each merge. Under Rope worktree isolation, file overlap orders merging, not dispatch; do not reintroduce a disjoint-files-only rule.
2. Spend extra tokens on independent lanes: implementation (isolated when files overlap), independent diagnosis hypotheses, parallel test/QA/review where product-resource ownership allows it, and selective candidate voting where a clear judge exists.
3. Require each leaf brief to state objective, owned files/seam, allowed writes, output schema, and stopping condition. This directly addresses duplication and lock pathologies.
4. Use thin seams: return structured evidence/artifact references rather than copying long narratives through the parent. Persist large outputs in files; integrate through mechanical gates.
5. Treat redundant candidates as an option for high-risk, ambiguous changes—not a default multiplier. Select or merge with deterministic tests and a fresh reviewer.
6. Parallel diagnosis should use distinct hypotheses or partitions (e.g., failing-test clusters), not several agents rerunning the same investigation.
7. Speculative work is safe only when isolated and cheap to discard: candidate tests, probes, docs, or independent patches. Do not speculate against mutable shared files or an unknown API contract.
8. Keep merge and integration serial where state is shared. A serial merge queue is a critical path, but parallel lanes can continue while a merge is unresolved.
9. Gates must assert integration invariants, not merely each leaf’s green tests. Use focused leaf checks, then impact-selected integration/composition-root checks and fresh-eyes review.
10. Budget by measured value: record wall time, total/input/output tokens, queue/wait time, retries, conflicts, gate failures, defect escapes, and reviewer effort per issue. Compare against a matched narrower run.
11. Use stop rules for idle, duplicated, or long-running agents; synchronous “wait for every branch” behavior makes the slowest branch a bottleneck.
12. Keep durable progress, checkpoints, clean commits, and resumability. More parallel contexts do not remove long-horizon drift or context-loss failure modes.

## What is measured, recommended, and hypothesized

### Measured/reported (with qualifications)

- Research: +90.2% internal eval vs single Opus 4; up to 90% complex-research time reduction; ~15× chat token usage (Anthropic report).
- C compiler: 16 agents, ~2,000 sessions, <$20k, 100k LoC, Linux 6.9 capability (Anthropic experiment; no control).
- Cursor: 20-locking agents effectively 2–3; later hundreds concurrent, >1M LoC/week-scale browser experiment (Cursor report; no controlled metrics).

### Recommendations (engineering extrapolation)

- Maximize independent ready work; partition by behavior/seams/failure clusters (not artificial file-only slices); use role specialization and independent reviewers; maintain serial shared-tree mutation and strong artifacts. Tests/analysis need not serialize merely because merging does.

### Hypotheses to validate locally

- Wider independent frontier will lower wall time until merge/gate/API contention dominates.
- Two or more independent diagnosis candidates may improve defect discovery on ambiguous failures, but expected value depends on judge/gate quality.
- Thin filesystem/artifact seams will preserve parent context and reduce coordination overhead.
- Fresh-context review may catch defects missed by implementers, but added tokens may not repay themselves on low-risk slices.

## Unknowns and non-transferable claims

- No primary source here establishes an ideal coding-agent count, universal speedup curve, or token-to-latency exchange rate.
- Anthropic Research metrics concern browsing/research populations and must not be labeled coding evidence.
- The coding experiments do not isolate decomposition quality from model capability, harness quality, task duration, or raw spend.
- No source quantifies API rate-limit contention, repository I/O contention, merge-queue critical-path share, or review-hours as concurrency scales.
- Quality claims are end-state/capability reports, not randomized quality-at-equal-cost comparisons.
- Current host limits, Rope graph width, and issue-specific dependency structure require local measurement.
