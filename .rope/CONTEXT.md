# Context

## Language

**Parent Orchestrator**:
The main issue session that owns grill, shape, the slice loop, leaf-worker dispatch, issue-level verify, and finish handoff. It is the only agent allowed to spawn workers for an issue. Judgment-primary and context-protective: it decides, talks to the human, writes durable artifacts, and re-briefs/steers leaves — it does not bulk-load exploratory noise or run long implement/fix loops in its own context, because compaction discards earlier discussion. Course correction is done by rewriting the brief and re-spawning a leaf, not by the parent absorbing the full failure trace and fixing in-place.
_Avoid_: main session (ambiguous), god agent, multi-agent swarm, pure router, parent self-implements everything
_Historical alias_: Planner Window / Window A (optional deployment mode, not the architecture)

**Leaf Worker**:
A subagent (or equivalent host worker) that receives a self-contained brief, does one job, and returns a summary plus artifact paths. Implementer, reviewer, explore, and verify-inspector are leaf roles. Leaves also execute course-correction work after the parent rewrites the brief. A leaf worker must not spawn other workers.
_Avoid_: nested subagent, child orchestrator
_Historical alias_: Implementer Window / Window B when the host cannot spawn code-writing workers (degraded top-level session)

**Human Escalation Stop**:
When leaf fix loops fail twice on the same problem, or the parent judges the failure is a design/requirements/contract issue rather than an implementation miss, the parent stops automated repair and presents a short precise problem statement to the user for a decision. It does not keep re-spawning leaves hoping the third try works.
_Avoid_: infinite fix loop, silent retry, bury the design conflict in more patches

**Harness Profile / Role Preset**:
A binding of Rope leaf roles (implementer, reviewer, explore, verify-inspector) onto **harness-native** subagent/agent preset templates. Default write target is the host's **user-level** agents directory (machine-local model churn). Plus a thin **user-global** Rope manifest (not project `.rope/`) that maps role → preset name/model and generation metadata. Refresh is **manual only** (no TTL/stale timer). The host preset is the source of spawn configuration; Rope does not keep a second full prompt/tool database as primary.
_Avoid_: hard-coded model list in skills, provider lock-in, Rope-only shadow agent runtime, default project-committed model ids, project-committed private model catalogs, automatic preset refresh

**Issue-Level Verify**:
The stage that checks whether a whole issue's completion state actually satisfies its PRD, Behavior Matrix, and E2E plan — after `rope-go` finishes all slices and before `rope-finish`. Owned by the Parent Orchestrator (read-only on code). Distinct from per-slice review. It also audits that batch-slice review verdicts are real and auditable (extends the required-review reality check).
_Avoid_: review, check (too generic), acceptance test (wrong level)

**Review Mode**:
An **opt-in per-issue** field chosen at shape time: `rope-shape` asks the user for the review mode (same manual opt-in pattern as Dynamic Workflow Mode) and writes `review: per-slice | batch` into `prd.md` frontmatter. Absent or `per-slice` ⇒ per-slice review behavior unchanged. `batch` defers non-gate slices to one end-of-issue batch review.
_Avoid_: auto-detect, go-time flag, treating batch as review removal

**Per-Slice Review**:
The review that runs for each completed slice during `rope-go`. Slice review marking is three-valued `required | batch | self-check` — `batch` is valid only when the issue package is `review: batch`. The Parent Orchestrator dispatches a reviewer leaf for each `required` slice (Review Risk Gate); `batch` slices get one end-of-issue batch reviewer leaf over their cumulative diff, parent-spawned, with the verdict recorded per covered slice; `self-check` applies to docs/fixture-only slices. `batch` is never silent self-check. Not owned by the implementer leaf, and not re-done by issue-level verify. Verify only checks that per-slice review actually happened (not silently degraded).
_Avoid_: verify (wrong level), gate, batch as silent self-check

**Dynamic Workflow Mode**:
An **opt-in per-issue** mode chosen at shape time: `rope-shape` asks the user whether dynamic mode is wanted; if yes it writes `mode: dynamic` into the issue package and go reads the field. When on, shape must produce a **contract-first, disjoint file-ownership** slice set, and go concurrently spawns cheap implementer leaves for the **non-overlapping** slices. Shape discipline: a **contract slice** (interfaces/data-structures/call-boundaries only) is serial and first; implementation slices are cut by **disjoint file ownership** (one core file owned by multiple slices is a shape defect); a **per-slice size cap** is enforced. go fans out only non-overlapping slices; each slice still passes a review gate; a light serial **integration slice** wires the module slices and verifies contract alignment; issue-level verify stays parent-owned and read-only. Model routing **reuses existing role presets** (no new model mechanism). Parallelism is the weak case for coding agents (Cognition/Anthropic), so disjoint ownership + contract-first is the load-bearing safety rule — slices sharing a core file stay serial. Interplay with review mode: `required` slices keep per-slice review; `batch` slices' reviews run once at end-of-issue; fan-out and commit rules unchanged.
_Avoid_: blanket parallelization, treating the mode as a licence to fan out overlapping slices, spawning implementer leaves that themselves spawn leaves

**Self-Fix Loop**:
A check/verify pattern (from Trellis) where the verifying model finds a problem and fixes it directly, then reruns checks, looping until green. Not used at issue-level verify in Rope, because verify must not edit code (cross-role separation of implement vs accept).
_Avoid_: auto-fix, retry (too generic)

**Escalation**:
The act of the verify model deciding on its own that a finding needs deeper inspection — either by reading more itself or by dispatching a read-only leaf (prefer `verify-inspector` / `explore`). Driven by the model's judgment, not by mechanical trigger rules.
_Avoid_: upgrade, promote (mechanical connotation)

**Upstream Harvest**:
A maintenance workflow for this Rope repository that compares pinned external inspiration sources (initially Matt Pocock skills, optionally Trellis) against the last reviewed revision, produces a human-facing review brief of idea/reference changes, and only after human accept/adapt/ignore decisions lands changes into Rope-native skills or `.rope/` docs. Not a product skill shipped by `rope add`, and not automatic vendor merge.
_Avoid_: sync (ambiguous with file copy), submodule update (mechanism only), migrate-docs (one-time adoption)

**Acceptance Behavior**:
The user- or caller-visible outcome a slice or issue must make true (Public behavior, Behavior Matrix row, or E2E item). In go, each acceptance drives a red→green automated spec at a shape-confirmed seam; issue-level E2E/verify accept the **assembled** behavior and do not replace slice TDD with a second full unit-test ritual.
_Avoid_: TDD as “write many unit tests then code”, acceptance test as synonym for issue-level verify only, re-running every green unit test at verify by default

**Architecture Impact**:
The conditional shape-stage record of whether an issue touches an existing architecture decision, public seam, dependency direction, lifecycle, state, persistence, permission, concurrency, error semantics, adapter, runtime entrypoint, or duplicated responsibility. A `not-applicable` result is still an explicit lightweight check; an uncertain result is treated as requiring resolution.
_Avoid_: full architecture review for every task, inference from filenames or diff alone, architecture impact as an automatic ADR request

**Decision Disposition**:
The per-decision statement of how an issue handles a relevant existing architecture decision: `inherit`, `extend`, `supersede`, `exception`, or `not-applicable`. It is distinct from the source decision's status, which describes whether that source is active, superseded, deprecated, provisional, or unknown.
_Avoid_: one issue-level disposition for several decisions, silently choosing a disposition during implementation, treating exception as an undocumented shortcut

**Constraint Bundle**:
The portable architecture constraint set derived during shaping: decision sources and statuses, scope, invariants, public seams, forbidden shortcuts, acceptance evidence, and unresolved conflicts. The parent keeps the issue-level bundle; each leaf receives the global constraints plus the subset relevant to its slice.
_Avoid_: a bare instruction to “follow the ADR”, leaf-local reinterpretation, or a second canonical architecture document

**Contract Note**:
A shape-time, user-facing projection of the issue's Behavior Contract: 3–5 one-sentence bullets answering “when this issue is done, what can you observe?”, plus failure visibility where relevant. Written into `prd.md` as `## Contract Note`; step 11 of `rope-shape` asks the user to confirm the note instead of reading the full PRD. Confirming the note confirms the Behavior Contract because the note is a direct projection of it — not a separate wish list. Verify still accepts against the Behavior Contract, matrix, and E2E.
_Avoid_: a second contract that can drift from the PRD, asking the user to read the full PRD by default, treating the note as an acceptance artifact

**Minimal Leaf Brief**:
The hard budget for implementer/reviewer briefs: a content allowlist (slice Public behavior one sentence; Behavior Contract 6 fields at their thinnest; Constraint Bundle path + slice Constraint IDs + short global invariant list; test seam + one prior-art path) plus a required operational contract (relevant artifact paths for by-reference
reads, TDD red/green commands + red signal, expected return shape, no-nested-spawn
and commit rules). Everything else loads by reference; brief body ≤ 60 lines (paths and command blocks excluded). More enforceable than “be concise” because it can be checked before dispatch.
_Avoid_: full inline PRD paragraphs, inline bundle detail, speculative file-by-file plans, dropping TDD commands or return shape to save tokens

**Plan Artifact Reader Layering**:
The rule that plan artifacts name their reader: humans read the grill recap (3–6 bullets) and the Contract Note (3–5 bullets); machines read the Behavior Contract, Behavior Matrix, Constraint Bundle, and tasks records by reference. Unresolved questions are resolved at the grill gate before shape; a conflict discovered by a leaf during go is re-briefed back to the parent for disposition, never silently absorbed. This replaces the older “concise plan + list unresolved questions at the end” rule.
_Avoid_: one artifact trying to serve both readers with one format, unresolved questions shipped to execution, silent absorption of leaf conflicts
