---
name: rope-verify
description: Verifies assembled issue completion against PRD, matrix, E2E, and architecture continuity after rope-go. Use when go finishes and before rope-finish.
---

# Rope Verify

Parent Orchestrator issue-level gate between `rope-go` and `rope-finish`.
**Read-only on code.** Judgment-primary; prefer assembled **behavior acceptance**
over replaying unit tests go already proved green.

Verdict rules and `verify.md` format: [references/verify-rules.md](references/verify-rules.md).
Architecture continuity fields: [../rope-shape/references/architecture-continuity.md](../rope-shape/references/architecture-continuity.md).

## Scope

- Issue-level — does not redo per-slice review; checks review actually happened.
- Code findings → **fix brief** for implementer leaf (parent spawns). Metadata
  fixes in issue docs only; record under Document Fixes Applied.

## Workflow

1. Load issue package + claimed completion (slices, reviews, E2E, commits).
2. Dispatch verify-inspector/explore for mechanical checks; give each leaf the
   global Constraint Bundle plus the relevant decision IDs and evidence mapping;
   keep architecture judgment local.
3. At minimum check:
   - required reviews real (not silent `review_degraded`)
   - matrix/Contract hold for **integrated** change (spot-check units only if
     red/green evidence missing)
   - **E2E drift** (primary integration net)
   - PRD contract / non-goals
   - high-risk boundaries (go Review Risk Gate list)
   - Architecture Impact has a disposition for every relevant decision, or an
     explicit `not-applicable`/New decision candidate outcome
   - inherited invariants have evidence; exceptions have bounded scope,
     documentation, and tests/evidence
   - public behavior and dependency direction preserve the recorded invariants;
     no second state, persistence, permission, or error owner appeared silently
   - unresolved conflicts and unconfirmed architecture changes are visible
4. Fix stale issue-doc metadata; classify findings must-fix / nice-to-fix. A
   confirmed documentation update marked `pending-finish` is not a code finding;
   finish completes it.
5. Write/append `verify.md`; verdict PASS | CHANGES_REQUESTED | BLOCKED.
6. PASS → handoff rope-finish. CHANGES_REQUESTED → implementer leaf in-session
   (≤2 fix rounds). BLOCKED → user.

## Guardrails

- Do not trust tasks/e2e or Architecture Impact claims alone; do not invent PASS.
- Do not turn verify into a second full TDD pass.
- Do not require a particular function, class, or internal implementation shape;
  verify behavior, invariants, and dependency direction.
- Do not edit code; do not recommend finish without PASS.
- Append verify rounds; Human Escalation Stop after two failed fix rounds.
