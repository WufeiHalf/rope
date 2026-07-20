---
name: rope-verify
description: Verifies an issue's completion state against its PRD, Behavior Matrix, and E2E plan after rope-go finishes all slices. Runs as Parent Orchestrator with strong judgment. Does not edit code; produces findings, may fix issue-document metadata, and produces a fix brief for the parent to spawn an implementer leaf when needed. Use after rope-go reports final status and before rope-finish.
---

# Rope Verify

Verify whether a finished issue's completion state actually satisfies its PRD,
Behavior Matrix, and E2E plan. This is the issue-level gate between `rope-go`
and `rope-finish`, owned by the **Parent Orchestrator**.

For verdict rules, finding severity, document-fix scope, and the verify.md
format, read [references/verify-rules.md](references/verify-rules.md).

## Scope Boundary

- **Issue-level, not slice-level.** Verify does not redo per-slice review (that is parent-owned during `rope-go`). Verify checks that per-slice review actually happened rather than being silently degraded, and that the issue as a whole meets its PRD/E2E.
- **Read-only on code.** Code findings become a **fix brief** for the parent to spawn an **implementer leaf** — never a verify-side code edit. Verify may edit issue-document metadata only (stale status records in `tasks.md`/`e2e.md`/`prd.md`); record each such fix in `verify.md` under Document Fixes Applied.

## Inputs

Read these when present. Decide for yourself how much to read — you are the judge of whether the completion state is trustworthy. Use read-only leaves to do mechanical inspection and save your own tokens.

- `.rope/issues/<issue>/prd.md`
- `.rope/issues/<issue>/tasks.md`
- `.rope/issues/<issue>/e2e.md`
- `.rope/CONTEXT.md`
- referenced `.rope/adr/`, `.rope/research/`, `.rope/specs/`
- the final diff and commit list since the issue package was committed at shape time

## Workflow

1. Load the issue package and form an initial picture of the claimed completion state: slice statuses, review verdicts, E2E results, commits.
2. Decide what to verify and how deeply. **Be token-conscious: dispatch a verify-inspector leaf for mechanical checks** (e.g. "does row X of the Behavior Matrix actually have a corresponding test in the diff?", "was E2E item E5, marked `agent_failed`, ever re-run?") rather than reading every changed file yourself. Prefer `rope-verify-inspector` / `rope-explore` when harness presets exist. Reserve your own reading for judgment calls.
3. Verify, at minimum, against these dimensions — escalate depth autonomously when something looks off. **Prefer behavior acceptance of the assembled issue** over re-running every slice unit test go already proved green:
   - **Per-slice review reality:** were `Review: required` slices actually reviewed by a parent-spawned reviewer leaf, or all `review_degraded`? Flag silently degraded required reviews.
   - **Acceptance / Matrix truth:** for each applicable row and PRD Behavior Contract item, does a real test/smoke/E2E/waiver exist and still hold for the **integrated** change — not only a claim in `tasks.md`? Spot-check unit evidence only when red/green records are missing or suspicious; do not ritualistically replay the full unit suite.
   - **E2E drift (primary integration net):** every `agent_failed` or `pending` E2E item — was it actually re-run and resolved, or did it drift into a `completed` slice with no re-verification? Drift is the highest-risk leak; hunt it. Assembled “all slices green, product broken” failures show up here.
   - **PRD contract intact:** public interface / Behavior Contract / user-visible behaviors not broken by the diff; Non-goals not violated.
   - **High-risk boundary touch:** if the diff touches a high-risk boundary (the list in `rope-go`'s Review Risk Gate — auth, persistence/schema, public interface, routing, runtime wiring, E2E-critical path), inspect more deeply. Do not re-list them here; read `execution-rules.md`.
4. Fix stale or wrong issue-document metadata directly (status records, blank Result fields, mislabeled verdicts). Record each fix in `verify.md`.
5. Classify each code-level finding:
   - `must-fix`: blocks finish. Goes into the fix brief.
   - `nice-to-fix`: recorded, does not block. Parent may schedule later; not a finish blocker.
6. Write or append `verify.md` in the issue directory with the structure in the reference. Set `Verdict`:
   - `PASS` — no must-fix findings; issue completion state is trustworthy. May proceed to `rope-finish`.
   - `CHANGES_REQUESTED` — one or more must-fix findings. Produce a **fix brief** for the parent to spawn an implementer leaf.
   - `BLOCKED` — needs a human decision (e.g. a real-environment E2E failure the user must adjudicate, an ambiguous PRD conflict). List the blockers.
7. Hand off:
   - `PASS`: tell the user the issue is ready to close and give a one-line handoff to `rope-finish` naming the issue directory.
   - `CHANGES_REQUESTED`: keep the fix loop in the **parent session** — spawn implementer leaf with the fix brief (do not treat "paste to another window" as the primary path). After the leaf fixes and commits, re-run verify in this parent session; append a new round to `verify.md` (do not overwrite history). Respect **Human Escalation Stop**: max two automated fix rounds on the same problem; design/requirements/contract defects stop for the user immediately.
   - `BLOCKED`: surface the blockers and wait for the user.
   - **Degraded host (optional):** if the parent cannot spawn an implementer leaf, emit the fix brief for a top-level implement session (historical Window B handoff). Record the degrade mode.

## Subagent / Leaf Preset Policy

When verify dispatches read-only workers for mechanical checks:

1. If `~/.config/rope/harness/<host>.json` exists and maps `verify-inspector` (and optionally `explore`), spawn the named `rope-*` agent so model/thinking defaults come from the harness-native preset.
2. If the manifest or agent is missing, soft-degrade: use a generic read-only worker without a forced model pin, record `preset_missing` in `verify.md` under Scope Reviewed, and continue. Do not hard-block verify.
3. Skill-local `settings.json` model pins are **retired** — not a supported pin path. If an old `settings.json` is found next to this skill, treat it as a one-shot migrate hint only (tell the user to run `rope-harness-presets` and delete the old file); do not read it as the API.
4. Leaves must not spawn other workers. Nested spawn is forbidden.

Parent/session may still override model or thinking at spawn when the host allows. Choose effort by **the complexity of the check itself**, not by the importance of the issue.

## Guardrails

- Do not skip verify by trusting `tasks.md`/`e2e.md` claims. Verify against the actual diff, E2E evidence, and commits.
- Do not turn verify into a second full TDD pass; focus on **assembled behavior acceptance** and gaps in evidence.
- Do not invent a PASS. If you cannot verify something, mark it `cannot_verify` and treat it as a finding.
- Do not edit code. Do not recommend `rope-finish` unless `Verdict: PASS`.
- Do not delete or overwrite prior verify rounds in `verify.md`; append.
- Do not open-ended thrash: after two failed automated fix rounds on the same problem, Human Escalation Stop.
