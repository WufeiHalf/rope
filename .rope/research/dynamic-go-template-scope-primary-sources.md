# Dynamic go: small fixed skeleton, issue-filled task data

Date: 2026-09-11

Parent synthesis: `dynamic-go-template-and-parallelism.md` adds the more direct Anthropic Dynamic Workflows docs and coding-migration kit. **Fixed control plane means tested correctness mechanics, not a ban on task-specific dynamic topology/pattern selection.** Claude Code publishes agent-size advice (`small <5`, `medium <15`, `large <50`, `unrestricted`), not a proven optimal workflow count. Its official blog explicitly recommends adaptable templates distributed in skills.

## Executive findings

1. The strongest common pattern is **code-orchestrated control with structured task data**, not an LLM-generated scheduler. OpenAI’s official Agents SDK says code orchestration is more deterministic/predictable for speed, cost, and performance, and explicitly lists chains, evaluator loops, and parallel independent agents. [O1]
2. OpenAI’s examples support a small control plane: a loop, a dependency/decision function, structured outputs, and parallel execution for independent work. They do not establish a universal number of tasks, agents, or parallel leaves. [O1]
3. LangGraph’s official subgraph guidance supports a reusable workflow component with an explicit input/output schema. This maps well to a fixed Rope skeleton plus issue-specific task records; parent/child state must have a deliberate mapping or shared schema. [L1]
4. LangGraph distinguishes per-invocation persistence (fresh independent subagent state; recommended for most independent multi-agent requests), per-thread state, and stateless execution. Rope leaves should normally be fresh contexts; persist only the compact workflow ledger and durable return artifacts. [L1]
5. Temporal’s durable-engine guidance is relevant as semantics, not as a recommendation to ship Temporal. Retries can execute work more than once; writes should be idempotent, and activity granularity trades retry isolation against event-history growth. [T1]
6. Temporal Continue-As-New resets event history while passing minimal state forward, and is intended for long-running/unbounded workflows—not short-lived workflows under 1,000 events or naturally completing one-time batches. Rope should borrow the bounded-history principle, not add a durable runtime. [T2]
7. No primary source found evidence for a universal task/workflow count. Counts must be derived from scope, dependency critical path, context budget, active-leaf ceiling, host limits, and evidence gates.

## Recommended vocabulary and sizing

- **Issue scope:** the fixed Behavior Contract/Matrix and allowed acceptance evidence. It determines what must become true, not how many tasks are generated.
- **Total task count:** all planned records, including blocked downstream records. Every record ends integrated, blocked with reason, or stopped; exhaustion of the running set is never completion.
- **Simultaneously active leaves:** ready records whose dependencies and owned-file rules permit dispatch, capped by host/fan limits. This is a resource/concurrency setting, not a target quota.
- **Leaf context:** one focused demo path, relevant constraints, seam, tests, and return schema. Split when a leaf no longer fits a fresh context or when independent work can proceed after a seam; do not split merely to increase count.
- **Critical path:** the longest dependency chain through implementation, integration, gates, E2E, review, and bounded fixes. Reducing critical-path stages is usually more valuable than maximizing fan-out.
- **History/budget:** pi sandbox context and workflow journal are finite. Keep records/artifacts compact; checkpoint only after durable transitions. Unlike Temporal, pi has no proven service-level event-history guarantee here; measurements remain needed.

## Fixed control plane (mature reusable skeleton)

The shipped template should own deterministic mechanics:

1. Load/validate issue task data and compute IDs, dependencies, owned files, test commands, and acceptance evidence.
2. Maintain a finite state machine: `planned -> ready -> running -> returned -> integrated`, with terminal `blocked|stopped|failed`.
3. Admit only records whose dependency states and edge kinds permit execution; explicitly propagate blocked status to dependents.
4. Dispatch ready leaves in bounded parallelism; leaves never spawn workers.
5. Normalize host returns through a verified adapter contract. Prefer verified commit identity today; a future host envelope may expose authoritative cleanup branch metadata. A schema alone cannot manufacture post-cleanup metadata, and a prose footer is not a stable machine interface.
6. Require durable identity (`sliceId`, `status`, commit/branch, evidence rows, paths, commands, errors). Reject malformed returns; do not silently treat them as done.
7. Integrate serially through a dedicated mechanical adapter/agent. Record the resulting commit/HEAD and input branch for every intended task.
8. Recompute frontier after each integration. A zero-running state is successful only if all required records are integrated. Reconciled blocked/stopped records make an honest non-success terminal result, not approval; include their dependent consumers.
9. Gate L2 on both complete intended-input reconciliation and affected integration tests. Green tests on an unmerged checkout are not L2.
10. Gate L3 on real composition-root assembly and one event/result path.
11. Freeze only when all required records are integrated, gates pass, tree is clean, and no leaf runs.
12. Run behavior E2E and standards/behavior review only after freeze; collect structured findings; allow at most two bounded fix rounds and delta review.
13. Keep compact durable state/evidence at meaningful transitions and use the host's verified resume semantics. Pi currently offers prefix-cached agent-call replay, not a durable engine that restores arbitrary scheduler/side-effect state. Reconcile commits and evidence idempotently; do not claim exactly-once execution or invent unsupported recovery APIs.

This directly addresses the observed failures in `diagnosis.md`: host-appended branch footer parsing, missing consumers after blocked roots, false L2, and premature E2E.

## Issue-filled task specification

A compiled execution input, not newly invented JavaScript control flow, should contain the following. Derive task/acceptance facts from the approved `tasks.md`; resolve host capabilities and budgets separately from session config. This is not a proposal for host fields in the canonical issue package or a second manually maintained task ledger:

- stable task ID and kind (`implement|integrate|gate|e2e|review|fix`);
- one-sentence demo path and acceptance evidence IDs;
- dependency IDs with edge classification (`seam-required|file-overlap|methodology-order`);
- owned paths/seams and expected branch/commit envelope;
- exact red/green/L1/L2/L3 commands or artifact paths;
- context brief path, constraint IDs, and return schema version;
- retry/fix budget and terminal policy;
- host adapter capabilities required (worktree, merge, browser/CLI, resume).

The compiler should validate this data and reuse the tested scheduling/integration/termination kernel. Issue-specific fan-out, diagnosis partitions, and optional candidate strategies may vary within the approved contract; the model must not re-invent correctness-critical mechanics each run. A task record is not permission to invent new acceptance requirements during a fix round.

## Host adapter boundary

Keep pi-specific behavior in a narrow adapter: spawn/resume calls, structured return validation, verified commit identity, merge invocation, filesystem/artifact paths, and E2E capability probing. Do not make prose/footer normalization the authoritative branch interface. The control plane should consume normalized events, not pi prose or regex conventions. If a host cannot perform a required operation, return a typed environment/host stop; do not reinterpret it as a product failure.

## Checkpoint and split policy

Split a workflow/task when any of these holds: the leaf exceeds a measured fresh-context budget; it owns unrelated demo paths; a seam can be delivered and consumed independently; retries would repeat unrelated side effects; or its critical path is needlessly serial. Keep one task when the work is one coherent demo path, one owner, and one context window.

For a future template, persist evidence at durable boundaries (leaf return accepted, merge committed, gate result, review result), not after arbitrary model thoughts. Actual restart behavior must follow the installed runner, and changing external inputs must invalidate or version cached calls explicitly. Carry minimal state: task statuses, dependency frontier, commit identities, evidence references, and bounded findings. A continue-as-new-like reset is future work only if real histories approach a measured limit.

## Proven/reusable vs unsuitable overhead

**Reusable now:** OpenAI’s code orchestration, structured outputs, parallel independent calls, and evaluator loop; LangGraph’s explicit subgraph interfaces and per-invocation fresh state; Temporal’s idempotency, durable identity, retry-boundary, and history-budget lessons.

**Unsuitable for the shipped MVP:** importing a general graph runtime, distributed durable service, arbitrary LLM-generated control flow, child-workflow lifecycle policies, event-sourced replay infrastructure, or universal auto-splitting. These add runtime and operational surface without evidence pi needs them.

## Evidence limits and measurements still needed

The sources describe principles and APIs, not Rope’s optimal numbers. They do not prove that 2/3/5 leaves, a specific context-token limit, or a fixed task count is best. Measure representative issues: return/merge failure rate, context truncation, critical-path time, active-leaf throughput, checkpoint size, retry duplication, and real E2E escape rate. Add offline scheduler fixtures for malformed footer, blocked roots/consumers, partial merge with green tests, resume after checkpoint, and premature-gate attempts.

## Primary sources (accessed 2026-09-11)

- [O1] OpenAI Agents SDK, “Multi-agent orchestration”: https://openai.github.io/openai-agents-python/multi_agent/ (official docs; says code orchestration is deterministic/predictable and gives chain/loop/parallel patterns).
- [L1] LangChain, “Subgraphs”: https://docs.langchain.com/oss/python/langgraph/use-subgraphs (official docs; input/output schemas, persistence modes, namespace isolation, per-invocation recommendation).
- [L2] LangChain, “Persistence”: https://docs.langchain.com/oss/python/langgraph/persistence (official docs; checkpoints, thread scope, restart limits, pruning/retention).
- [T1] Temporal, “Activity Definition”: https://docs.temporal.io/activity-definition (official docs; idempotency, retries may execute repeatedly, granularity/history tradeoff).
- [T2] Temporal, “Continue-As-New Pattern”: https://docs.temporal.io/design-patterns/continue-as-new (official docs; history reset, minimal state, 51,200 event limit, suitability boundaries).

## Local context consulted

- `.rope/CONTEXT.md`
- `skills/rope-go/references/dynamic-workflow.md`
- `.rope/issues/dynamic-go-session-audit/diagnosis.md`

Unknown: pi’s exact SubagentWorkflow API, host footer guarantees, and measured context/history limits were intentionally not investigated; other agents own those harness-specific questions.
