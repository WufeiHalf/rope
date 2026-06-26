# Context

## Language

**Issue-Level Verify**:
The stage that checks whether a whole issue's completion state actually satisfies its PRD, Behavior Matrix, and E2E plan — after `rope-go` finishes all slices and before `rope-finish`. Distinct from per-slice review, which is owned by `rope-go`.
_Avoid_: review, check (too generic), acceptance test (wrong level)

**Per-Slice Review**:
The review that runs inside `rope-go` for each completed slice, typically via a read-only subagent. Owned by the go window, not the verify stage. Verify must not redo this; it only checks that per-slice review actually happened (not silently degraded).
_Avoid_: verify (wrong level), gate

**Planner Window (Window A)**:
The session that runs `rope-grill` and `rope-shape` using a strong, expensive model (e.g. GLM-5.2-max, GPT-5.5-xhigh, Opus-4.8). Also the session that runs issue-level verify and makes the final accept/reject verdict.
_Avoid_: main session, orchestrator (ambiguous)

**Implementer Window (Window B)**:
The session that runs `rope-go` using a cheaper, cost-efficient model (e.g. Composer 2.5, GPT-5.4). Produces the actual slices, commits, and E2E results.
_Avoid_: worker, agent (ambiguous)

**Self-Fix Loop**:
A check/verify pattern (from Trellis) where the verifying model finds a problem and fixes it directly, then reruns checks, looping until green. Not used at issue-level verify in Rope, because verify must not edit code (cross-model separation).
_Avoid_: auto-fix, retry (too generic)

**Escalation**:
The act of the verify model deciding on its own that a finding needs deeper inspection — either by reading more itself or by dispatching a read-only subagent. Driven by the model's judgment, not by mechanical trigger rules.
_Avoid_: upgrade, promote (mechanical connotation)
