---
name: rope-verify
description: Checks the paperwork of a finished .rope issue — review recorded, E2E terminal, tree clean — after rope-go's end-of-issue review. Use when go finishes and before rope-finish.
---

# Rope Verify

Thin paperwork gate between `rope-go` and `rope-finish`. Product truth and
assembled-diff judgment already happened in go's **end-of-issue review**;
verify never re-judges code. Read-only on everything.

Verdict rules and `verify.md` format: [references/verify-rules.md](references/verify-rules.md).

## Checks (these five, nothing more)

1. The end-of-issue review really ran: one verdict line with run/agent
   identity + fix rounds recorded; `review_degraded` carries its reason.
2. Every E2E item has a terminal status. Hunt drift: `agent_failed` /
   `pending` items that silently became completed — re-run or block, never
   absorb.
3. Per-slice commits present; no unrelated dirty files.
4. Architecture Impact: every entry has a terminal documentation outcome or
   a confirmed `pending-finish` routed to finish.
5. Matrix rows point at recorded evidence (spot-check pointers, never re-run).

Paperwork gaps verify fixes directly in issue docs (recorded under Document
Fixes Applied). Anything that is not paperwork → back to go's fix loop, or
BLOCKED for the user.

## Workflow

1. Load the issue package + completion claims; check the five items above
   directly (paperwork is one screen, no leaves needed).
2. Write/append `verify.md`: PASS | CHANGES_REQUESTED | BLOCKED.
3. PASS → rope-finish. CHANGES_REQUESTED → fix brief (≤2 rounds, then Human
   Escalation Stop). BLOCKED → user.

## Guardrails

- Do not read the diff to judge code quality — that was the reviewer's job.
- Do not invent PASS; a missing verdict line is a finding, not a formality.
- Do not re-run green E2E items; check recorded evidence instead.
