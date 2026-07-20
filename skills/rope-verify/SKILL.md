---
name: rope-verify
description: Verifies assembled issue completion against PRD, matrix, and E2E after rope-go. Use when go finishes and before rope-finish.
---

# Rope Verify

Parent Orchestrator issue-level gate between `rope-go` and `rope-finish`.
**Read-only on code.** Judgment-primary; prefer assembled **behavior acceptance**
over replaying unit tests go already proved green.

Verdict rules and `verify.md` format: [references/verify-rules.md](references/verify-rules.md).

## Scope

- Issue-level — does not redo per-slice review; checks review actually happened.
- Code findings → **fix brief** for implementer leaf (parent spawns). Metadata
  fixes in issue docs only; record under Document Fixes Applied.

## Workflow

1. Load issue package + claimed completion (slices, reviews, E2E, commits).
2. Dispatch verify-inspector/explore for mechanical checks; keep judgment local.
3. At minimum check:
   - required reviews real (not silent `review_degraded`)
   - matrix/Contract hold for **integrated** change (spot-check units only if
     red/green evidence missing)
   - **E2E drift** (primary integration net)
   - PRD contract / non-goals
   - high-risk boundaries (go Review Risk Gate list)
4. Fix stale issue-doc metadata; classify findings must-fix / nice-to-fix.
5. Write/append `verify.md`; verdict PASS | CHANGES_REQUESTED | BLOCKED.
6. PASS → handoff rope-finish. CHANGES_REQUESTED → implementer leaf in-session
   (≤2 fix rounds). BLOCKED → user.

## Guardrails

- Do not trust tasks/e2e claims alone; do not invent PASS.
- Do not turn verify into a second full TDD pass.
- Do not edit code; do not recommend finish without PASS.
- Append verify rounds; Human Escalation Stop after two failed fix rounds.
