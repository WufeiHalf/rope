# 0001 Issue-Level Verify Separated From Go

Rope adds a `rope-verify` stage between `rope-go` and `rope-finish`. Verify runs in the planner window (strong model) and checks whether an issue's completion state actually satisfies its PRD, Behavior Matrix, and E2E plan. It does not edit code; it only produces findings and, when needed, a fix prompt routed back to the implementer window.

## Context

Empirical evidence from the agent-workbench experiment showed two gaps:

1. Per-slice review inside `rope-go` was silently degraded. Every slice in `deepen-core-modules` recorded `review_degraded: no_subagent_tool_available` — the read-only review subagent never actually ran.
2. Failed E2E items leaked into "completed" status. In `human-intake-tool-loop-guard`, E5/E6 were `agent_failed` with a slice review verdict of `pending E6 real repro`, yet the slice Status was set to `completed` with no re-verification before the issue drifted toward finish.

Most issues stopped after `rope-go` with no structured check that the finished work met the PRD before closing.

## Decision

Introduce `rope-verify` as a separate stage with a cross-model split:

- **Verify runs in the planner window** (strong model: GLM-5.2-max, GPT-5.5-xhigh, Opus-4.8). It owns the final accept/reject verdict on issue completion state.
- **Verify does not edit code.** It produces findings and, for `CHANGES_REQUESTED`, a fix prompt routed back to the implementer window (cheap model: Composer 2.5, GPT-5.4). The implementer window remains the sole place code changes.
- **Verify may edit issue-document metadata only** (tasks.md/e2e.md/prd.md status records) — not code. This corrects stale status without a round-trip.
- **Escalation is model-driven, not rule-driven.** The verify model decides autonomously what to read and whether to dispatch read-only subagents for deeper inspection. The skill nudges it to use subagents to save its own tokens, but does not prescribe mechanical trigger rules.

## Why this split

- **Budget allocation.** The strong model's tokens should buy judgment ("is this completion state trustworthy"), not code writing. Letting verify self-fix (the Trellis pattern) would sink strong-model tokens into edit loops, the scarcest part of the budget. Trellis is single-model and does not face this tradeoff; Rope is cross-model and must.
- **Window-boundary consistency.** The implementer window is the sole code-writing surface, so git history and working context stay co-located. If verify edited code, the next `rope-go` continuation would not know which changes were its own versus the verifier's.
- **Model-driven escalation over mechanical triggers.** The user rejected rule-based escalation ("mechanical trigger is not my style"). Escalation is left to the verify model's judgment, matching the Trellis mind of "AI escalates instead of guessing," extended with cross-model subagent dispatch.

## Consequences

- A failed verify produces a round-trip: planner window → fix prompt → implementer window fixes → planner window re-verifies. `verify.md` appends a new round each time rather than overwriting.
- `rope-finish` gains a precondition: `verify.md` with `Verdict: PASS`, or an explicit user waiver.
- `rope-go` no longer recommends `rope-finish` directly; it prompts the user to run `rope-verify` in the planner window.

## Considered Options

- **Trellis-style self-fix loop at verify.** Rejected: burns strong-model tokens on edits and breaks the single code-writing-window boundary.
- **Mechanical escalation rules** (cheap subagent coarse-pass, strong model only on flagged findings). Rejected by the user: too rigid, not the desired judgment style.
- **Strong model reads the full diff every time.** Rejected: max cost, no budget scaling for low-risk issues.
