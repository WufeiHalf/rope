# Rope Verify Rules

## Verdict

- `PASS` — paperwork complete: review recorded, E2E terminal, tree clean.
  Says nothing about product truth — that claim lives in the end-of-issue
  reviewer's verdict (ADR 0007).
- `CHANGES_REQUESTED` — paperwork gaps for go's fix loop to close
  (unrecorded review, drifted E2E, missing commits).
- `BLOCKED` — a human decision is required (real-environment failure the
  reviewer logged, ambiguous PRD conflict, missing credential). List the
  blockers; do not fabricate a verdict.

## Finding severity

- `must-fix` — blocks finish: missing review record, drifted E2E, dirty tree.
- `nice-to-fix` — recorded, does not block.

## Document fixes (verify may edit issue docs only)

`tasks.md` verdict/status fields left blank, `e2e.md` Result fields left
blank, stale Open Questions — fix directly, record under Document Fixes
Applied with file + change + reason. Never touch code.

## Drift

The failure mode verify exists to catch: an `agent_failed` or `pending` E2E
item drifting into a completed slice with no re-verification. Hunt drift on
every such item. `agent_passed` items are evidence-checked (recorded command), never
re-run.

## `verify.md` format

Append a round per run; never overwrite prior rounds.

```md
# <Issue Title> Verify

## Round N — <date>

### Verdict
PASS | CHANGES_REQUESTED | BLOCKED

### Checks
- Review recorded: <verdict line + identity + fix rounds, or finding>
- E2E terminal / drift: <status sweep result>
- Commits / tree: <result>
- Architecture docs: <outcome routing>
- Matrix evidence: <spot-check pointers>

### Findings
- [must-fix|nice-to-fix] <finding> — evidence: <location>

### Document Fixes Applied
- <file>: <change> — reason: <why>
```

## Fix loop

`CHANGES_REQUESTED` → fix brief → parent spawns implementer leaf → re-verify
appends Round N+1 scoped to the must-fix items. Two unsuccessful rounds on
the same problem, or a design/requirements defect → Human Escalation Stop.
