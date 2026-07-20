---
name: rope-go
description: Executes a .rope issue package slice by slice with TDD, verification, review gates, commit discipline, and classified E2E execution. Use after rope-shape has created a .rope issue directory with prd.md, tasks.md, and e2e.md.
---

# Rope Go

Execute one `.rope/issues/<issue-slug>/` package.

The session running `rope-go` is the **Parent Orchestrator** for this issue's
slice loop. It spawns **Leaf Workers** for implement and review. It never asks
a leaf to spawn another leaf.

For review gates, fix-round limits, leaf brief contract, E2E statuses, commit
rules, and overall review checklist, read
[references/execution-rules.md](references/execution-rules.md).

## Startup Checks

1. Confirm the target issue directory.
2. Read:
   - `.rope/CONTEXT.md`
   - `.rope/routes.md`
   - referenced `.rope/adr/`, `.rope/research/`, `.rope/specs/`
   - `.rope/issues/<issue>/prd.md`
   - `.rope/issues/<issue>/tasks.md`
   - `.rope/issues/<issue>/e2e.md`
3. Inspect git status and avoid unrelated dirty files.
4. Confirm every slice has status, behavior matrix coverage, verification, and review mode.
5. Confirm every `agent-with-gate`, `user`, and `not-run` validation has a shape-time gate decision.
6. Soft-load harness presets if present (`~/.config/rope/harness/<host>.json`). Prefer named `rope-*` agents. Missing presets → record `preset_missing` and continue (no hard block). See execution-rules.

## Slice Loop (parent owns)

Schedule from `tasks.md` **Blocked by** edges when present:

- **Default:** run one ready slice at a time in dependency order (blockers
  completed first). Safe on every host.
- **Optional frontier parallel:** if two or more pending slices have all blockers
  done (`Blocked by: none` or listed blockers `completed`), **and** their `Scope`
  paths/areas do not overlap, the parent **may** spawn multiple implementer
  leaves in parallel. Parent still owns review and **serializes commits** (no
  concurrent writers on the same branch without coordination). If Scope is vague
  or files may collide, stay serial. Never ask a leaf to spawn another leaf.

For each slice selected to run:

1. Set slice status to `in_progress`.
2. **Spawn implementer leaf** with a self-contained brief (slice goal, matrix rows, acceptance criteria, artifact paths, TDD expectation, Blocked by context). Prefer `rope-implementer` when available.
3. From the leaf **summary + paths/diff** (not full traces by default):
   - confirm tests/verification ran
   - confirm the slice committed independently (or commit if the leaf returned a ready diff and host policy requires parent commit — prefer leaf commits when the host allows)
4. Update `tasks.md` with status and verification result from leaf evidence.
5. **Review (parent dispatches):**
   - `Review: required` → parent spawns a **reviewer leaf** (prefer `rope-reviewer`, else generic read-only worker). Parent records the verdict in `tasks.md`.
   - `Review: self-check` → parent self-reviews unless the actual diff touches a high-risk boundary (then upgrade to required).
   - upgrade to required when public interface, external system, auth, persistence, routing, runtime wiring, or E2E-critical behavior is touched
   - **Do not** instruct the implementer leaf to spawn a review subagent. Nested spawn is forbidden.
   - Record `review_degraded` **only** if the parent cannot spawn any worker at all (no Agent/subagent tool). Self-review then, with the reason. Missing specialized review type while a generic worker exists is not total degradation — use the generic worker and note the type.
6. If review fails → **course correction** (see below), then re-verify and re-review.
7. Mark slice completed only after verification + review pass.

### Course correction

When a leaf fails, drifts, or review rejects:

1. Parent judges from **summary + artifacts** (not full leaf traces by default).
2. Classify the failure:
   - **Design / requirements / contract defect** → **Human Escalation Stop** immediately. Do not thrash with more implement rounds.
   - **Implementation miss** → rewrite a tighter brief (pin the missed decision) and re-spawn implementer leaf.
3. Count automated fix rounds **per problem**. Max **2**. On the third need → **Human Escalation Stop**: short precise problem statement to the user; wait.
4. If more facts are required before re-briefing, spawn an **explore** leaf first, then re-brief — do not dump large greps into parent context.

## Plan Adjustment

If the plan is incomplete or wrong:

1. Pause the current slice.
2. Resolve facts (prefer explore leaf for polluting investigation).
3. Update `.rope/issues/<issue>/prd.md`, `tasks.md`, `e2e.md`, or relevant `.rope/research/` / `.rope/specs/`.
4. Commit the plan/doc adjustment separately when it changes tracked docs.
5. Continue unless it triggers a human gate or Human Escalation Stop.

## Overall Verification

After all slices pass review:

1. Run full verification defined by the issue (prefer implementer/explore leaf for noisy test runs when helpful; parent may run short commands).
2. Check Behavior Matrix coverage: every applicable row has test, smoke, or explicit waiver.
3. Execute classified E2E items from `e2e.md`:
   - `agent`: execute now and record result
   - `agent-with-gate` with `Gate Decision: approved`: execute the approved action without asking again, choosing concrete commands as needed
   - `agent-with-gate` with `Gate Decision: skipped`: do not execute; record `skipped_by_user_at_shape`
   - `agent-with-gate` with missing or stale approval: stop and ask only if the action, scope, risk, environment, or target resource changed
   - `user`: leave clear user validation steps and wait for user-reported result
   - `not-run`: record accepted waiver reason
4. Run overall review against PRD, tasks, matrix coverage, E2E results, and refs.
5. Fix findings via course-correction (implementer leaf), not open-ended parent self-edit loops. Respect the 2-round Human Escalation Stop.
6. Stop with final status and pending user validations. Do **not** recommend `rope-finish`. Hand off to issue-level verify in the **same parent session**:
   - recommended skill: `$rope-verify`
   - why: go is done but issue completion state has not been verified against the PRD/E2E yet
   - one-line handoff naming the issue directory, e.g. `Run rope-verify on .rope/issues/<issue>.`
7. `rope-finish` only after `rope-verify` returns `Verdict: PASS` (or the user explicitly waives verify).

## Degraded host (no worker spawn)

If the host cannot spawn workers at all:

- Parent may run implement work in-session or direct the user to a top-level cheap session (historical Window B).
- Record the degrade mode in `tasks.md`.
- Still forbid fictional nested orchestration.
- Still apply Human Escalation Stop after 2 failed fix rounds / design defects.

## Stop Conditions

- Issue directory missing or inconsistent.
- Required Behavior Matrix rows have no assigned verification.
- Missing shape-time gate decision for any non-agent validation.
- Human gate: schema/migration, dependency/root config, auth/security, deployment/production/shared write, destructive filesystem/git, cross-repo operation outside the approved action scope.
- **Human Escalation Stop**: 2 failed automated fix rounds on the same problem, or design/requirements/contract defect.
- Unrelated dirty files conflict with the task.
- Required environment or credential is unavailable.

## Final Response

Report:
- completed slices
- commits
- verification commands/results
- review verdicts (and any `review_degraded` / `preset_missing`)
- E2E item statuses: `agent_passed`, `agent_failed`, `blocked_on_gate`, `blocked_on_user`, `skipped_by_user_at_shape`, `not_run_with_reason`
- any Human Escalation Stop raised
