---
name: rope-go
description: Executes a .rope issue package slice by slice with TDD, verification, review gates, commit discipline, and classified E2E execution. Use after rope-shape has created a .rope issue directory with prd.md, tasks.md, and e2e.md.
---

# Rope Go

Execute one `.rope/issues/<issue-slug>/` package.

For review gates, E2E statuses, commit rules, and overall review checklist, read [references/execution-rules.md](references/execution-rules.md).

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

## Slice Loop

For each pending slice:

1. Set slice status to `in_progress`.
2. Use TDD:
   - write one public-interface behavior test
   - implement minimal code
   - repeat for assigned Behavior Matrix rows
3. Run slice verification.
4. Update `tasks.md` with status, verification result, and review verdict.
5. Commit the completed slice independently.
6. Review:
   - `Review: required` -> first discover and use an available read-only review subagent; if no subagent tool is available, record the degraded self-review reason in `tasks.md`
   - `Review: self-check` -> self-review unless actual diff touches a high-risk boundary
   - upgrade to required when public interface, external system, auth, persistence, routing, runtime wiring, or E2E-critical behavior is touched
7. If review fails, fix, verify, commit the review fix, and rerun review.

## Plan Adjustment

If the plan is incomplete or wrong:

1. Pause the current slice.
2. Resolve facts from code, tests, docs, or primary sources.
3. Update `.rope/issues/<issue>/prd.md`, `tasks.md`, `e2e.md`, or relevant `.rope/research/` / `.rope/specs/`.
4. Commit the plan/doc adjustment separately when it changes tracked docs.
5. Continue unless it triggers a human gate.

## Overall Verification

After all slices pass review:

1. Run full verification defined by the issue.
2. Check Behavior Matrix coverage: every applicable row has test, smoke, or explicit waiver.
3. Execute classified E2E items from `e2e.md`:
   - `agent`: execute now and record result
   - `agent-with-gate` with `Gate Decision: approved`: execute the approved action without asking again, choosing concrete commands as needed
   - `agent-with-gate` with `Gate Decision: skipped`: do not execute; record `skipped_by_user_at_shape`
   - `agent-with-gate` with missing or stale approval: stop and ask only if the action, scope, risk, environment, or target resource changed
   - `user`: leave clear user validation steps and wait for user-reported result
   - `not-run`: record accepted waiver reason
4. Run overall review against PRD, tasks, matrix coverage, E2E results, and refs.
5. Fix any findings with separate commits.
6. Stop with final status and pending user validations. Do not recommend `rope-finish` until the user explicitly reports acceptance or validation passed.
7. After the user explicitly reports acceptance or validation passed, provide `Next recommended step`:
   - recommended skill: `$rope-finish`
   - why the issue is ready to close
   - a copy-paste prompt that names the issue directory and asks `rope-finish` to close it

## Stop Conditions

- Issue directory missing or inconsistent.
- Required Behavior Matrix rows have no assigned verification.
- Missing shape-time gate decision for any non-agent validation.
- Human gate: schema/migration, dependency/root config, auth/security, deployment/production/shared write, destructive filesystem/git, cross-repo operation outside the approved action scope.
- Unrelated dirty files conflict with the task.
- Required environment or credential is unavailable.

## Final Response

Report:
- completed slices
- commits
- verification commands/results
- review verdicts
- E2E item statuses: `agent_passed`, `agent_failed`, `blocked_on_gate`, `blocked_on_user`, `skipped_by_user_at_shape`, `not_run_with_reason`
