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
The stage that checks whether a whole issue's completion state actually satisfies its PRD, Behavior Matrix, and E2E plan — after `rope-go` finishes all slices and before `rope-finish`. Owned by the Parent Orchestrator (read-only on code). Distinct from per-slice review.
_Avoid_: review, check (too generic), acceptance test (wrong level)

**Per-Slice Review**:
The review that runs for each completed slice during `rope-go`. The Parent Orchestrator dispatches a reviewer leaf (or self-checks when allowed). Not owned by the implementer leaf, and not re-done by issue-level verify. Verify only checks that per-slice review actually happened (not silently degraded).
_Avoid_: verify (wrong level), gate

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
