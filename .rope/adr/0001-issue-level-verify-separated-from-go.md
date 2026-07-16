# 0001 Issue-Level Verify Separated From Go

Rope adds a `rope-verify` stage between `rope-go` and `rope-finish`. Verify is owned by the **Parent Orchestrator** (strong judgment role) and checks whether an issue's completion state actually satisfies its PRD, Behavior Matrix, and E2E plan. It does not edit code; it only produces findings and, when needed, a fix brief for the parent to spawn an **implementer leaf**.

## Context

Empirical evidence from the agent-workbench experiment showed two gaps:

1. Per-slice review inside `rope-go` was silently degraded. Every slice in `deepen-core-modules` recorded `review_degraded: no_subagent_tool_available` — the read-only review subagent never actually ran.
2. Failed E2E items leaked into "completed" status. In `human-intake-tool-loop-guard`, E5/E6 were `agent_failed` with a slice review verdict of `pending E6 real repro`, yet the slice Status was set to `completed` with no re-verification before the issue drifted toward finish.

Most issues stopped after `rope-go` with no structured check that the finished work met the PRD before closing.

## Decision

Introduce `rope-verify` as a separate stage with a **cross-role** split of implement vs accept:

- **Verify is owned by the Parent Orchestrator** (session/strong judgment model). It owns the final accept/reject verdict on issue completion state.
- **Verify does not edit code.** It produces findings and, for `CHANGES_REQUESTED`, a fix brief. The parent spawns an implementer leaf to apply code fixes. The implementer leaf (or degraded top-level implement session) remains the sole code-writing surface.
- **Verify may edit issue-document metadata only** (tasks.md/e2e.md/prd.md status records) — not code. This corrects stale status without a round-trip.
- **Escalation is model-driven, not rule-driven.** The verify model decides autonomously what to read and whether to dispatch read-only leaves (prefer `rope-verify-inspector` / `rope-explore`) for deeper inspection. The skill nudges it to use leaves to save its own tokens, but does not prescribe mechanical trigger rules.

### Amendment (roles, not windows)

The durable property is **cross-role separation of implement vs accept**, not two human windows.

- **Parent Orchestrator** judges (grill/shape/verify accept-reject) and dispatches leaves.
- **Implementer leaf** writes code and commits.
- **Reviewer / explore / verify-inspector leaves** are read-only (or otherwise tool-bounded) workers.

Two human windows (historical "Planner Window A" / "Implementer Window B") remain an **optional host deployment** when the harness cannot spawn code-writing workers. They are not the architecture. See `.rope/CONTEXT.md` and `.rope/research/single-window-go-orchestration.md` (crystallized decisions 1–16).

## Why this split

- **Budget allocation.** The strong model's tokens should buy judgment ("is this completion state trustworthy"), not code writing. Letting verify self-fix (the Trellis pattern) would sink strong-model tokens into edit loops, the scarcest part of the budget. Trellis is single-model and does not face this tradeoff; Rope is cross-role and must.
- **Single code-writing surface.** The implementer leaf (or one degraded implement session) is the sole code-writing surface, so git history and working context stay co-located. If verify edited code, the next implement continuation would not know which changes were its own versus the verifier's.
- **Model-driven escalation over mechanical triggers.** The user rejected rule-based escalation ("mechanical trigger is not my style"). Escalation is left to the verify model's judgment, matching the Trellis mind of "AI escalates instead of guessing," extended with cross-role leaf dispatch.

## Consequences

- A failed verify produces a round-trip: parent verify → fix brief → parent spawns implementer leaf → parent re-verifies. `verify.md` appends a new round each time rather than overwriting.
- After two unsuccessful automated fix rounds on the same problem, or when the parent judges a design/requirements/contract defect, stop at a **Human Escalation Stop** (see CONTEXT).
- `rope-finish` gains a precondition: `verify.md` with `Verdict: PASS`, or an explicit user waiver.
- `rope-go` no longer recommends `rope-finish` directly; it hands off to issue-level `rope-verify` in the parent session.

## Considered Options

- **Trellis-style self-fix loop at verify.** Rejected: burns strong-model tokens on edits and breaks the single code-writing-surface boundary.
- **Mechanical escalation rules** (cheap subagent coarse-pass, strong model only on flagged findings). Rejected by the user: too rigid, not the desired judgment style.
- **Strong model reads the full diff every time.** Rejected: max cost, no budget scaling for low-risk issues.
- **Window-based architecture as the durable split.** Superseded by role language: windows are optional deployment, not the product contract.
