# Rope Go Execution Rules

## Parent / Leaf Contract

The go session is the **Parent Orchestrator**. Leaf workers:

| Role | Typical preset | Job |
| --- | --- | --- |
| implementer | `rope-implementer` | TDD, implement one slice unit, commit, return summary + paths |
| reviewer | `rope-reviewer` | Read-only critique of a finished unit; return verdict |
| explore | `rope-explore` | Read-only facts when re-brief needs more context |
| verify-inspector | `rope-verify-inspector` | Not used mid-go; reserved for issue-level verify |

Rules:

- Parent spawns leaves with **self-contained briefs** (goal, paths, acceptance, constraints).
- Leaves return **summary + artifact paths/status** only. Parent reads those + diffs, not full traces by default.
- **No nested spawn.** Leaves must not be asked to spawn workers. Parent owns all dispatch.
- Correction = rewrite brief + re-spawn implementer (or explore then re-brief). Max **2** automated fix rounds per problem → **Human Escalation Stop**.
- Design / requirements / contract defect → immediate Human Escalation Stop (no thrash).

## Harness Leaf Presets

If `~/.config/rope/harness/<host>.json` exists (pi: `~/.config/rope/harness/pi.json`):

- Prefer named `rope-*` agents so model/thinking defaults come from harness-native presets written by `rope-harness-presets`.
- Parent may still override model/thinking at spawn when the host allows.

If the manifest or a needed `rope-*` agent is missing:

- Soft-degrade: use a generic host worker without a forced model pin.
- Record `preset_missing` in `tasks.md` (review notes or final status).
- Continue. Do **not** hard-block go. Do **not** auto-run `rope-harness-presets`.

## Leaf Brief Contract (minimum)

Every implementer/reviewer spawn brief should include:

1. Issue path and slice id/title
2. Goal and out-of-scope
3. **Acceptance (user-visible):** slice `Public behavior` + owned Matrix rows
4. **Seams:** only those listed in PRD Testing Decisions (copy the list; do not invent)
5. **Architecture constraints:** copy the global constraints and this slice's
   Constraint IDs from the PRD bundle, including source, status, disposition,
   scope, invariants, public seam, forbidden shortcuts, required evidence, and
   open conflicts. Do not substitute a bare “follow the ADR” instruction.
6. **TDD mode:** `required` (default for code) | `waived (docs-only)` + reason
7. When TDD required — hard fields:
   - Red command(s) the leaf must run before implementation
   - What failure signal counts as red
   - Green command(s) after minimal implementation
   - Anti-patterns to avoid (pointer to `references/tdd.md` is enough)
8. Relevant artifact paths (prd/tasks/e2e, specs, files)
9. Constraints (no nested spawn; commit rules; Blocked by / Scope)
10. Expected return shape:
   - summary, paths changed, commit hash
   - acceptance text exercised
   - red evidence (command + failure) unless waived
   - green evidence (command + pass)
   - architecture constraints checked, evidence, and disposition conflicts
   - blockers

Reviewer briefs must require checking acceptance alignment, `tdd.md`
anti-patterns, and architecture continuity: inherited invariants, responsibility
ownership, dependency direction, public compatibility, exception scope, and the
required evidence. Their return includes the checked constraint IDs, evidence,
final disposition, and conflicts. Review behavior and boundaries, not a required
function or class name.

If a leaf discovers that the recorded disposition cannot hold, it returns the
conflict and evidence to the parent. The parent updates the package/brief and
re-dispatches; the leaf does not invent `exception`, `extend`, or `supersede`.

## Review Risk Gate

Use `Review: required` when the slice touches:
- public interface or user-visible behavior
- external system or adapter behavior
- auth, permission, secret, or data leak risk
- persistence, schema, migration, stored format
- routing, app entrypoint, runtime wiring, background worker
- multi-layer behavior
- E2E critical path

Use `Review: self-check` only for low-risk docs, fixture, or isolated behavior.

## Required Review Execution (parent-owned)

For every `Review: required` slice, **after** the implementer leaf finishes:

1. Parent spawns a reviewer leaf. Prefer `rope-reviewer` from the harness manifest.
2. If no specialized review type exists but a generic worker does, use the generic type with explicit read-only review instructions; record the type used.
3. If a named review type is rejected but generic subagents exist, note `no_specialized_review_subagent_available` and still use the generic worker — this is **not** total degradation.
4. Record the review verdict in `tasks.md`.
5. **`review_degraded` only when the parent cannot spawn any worker at all** (no Agent/subagent tool). Then self-review and record:
   - `review_degraded: no_subagent_tool_available`
   - what discovery was attempted
   - why self-review was used

Do **not**:

- instruct the implementer leaf to spawn a review subagent
- treat nested Agent inside a leaf as the required review path
- silently treat `Review: required` as ordinary self-check when a worker can be spawned

## Fix Rounds and Human Escalation Stop

| Situation | Action |
| --- | --- |
| Implement miss, round 1–2 | Re-brief + re-spawn implementer leaf |
| Same problem needs round 3 | Human Escalation Stop — explain and wait |
| Design / requirements / contract defect | Human Escalation Stop immediately |
| Need more facts to re-brief | Spawn explore leaf, then re-brief |

Record stop reason in `tasks.md` when escalating.

## E2E Execution Statuses

- `agent_passed`: agent ran the classified validation and it passed.
- `agent_failed`: agent ran it and it failed; fix or record blocker.
- `blocked_on_gate`: missing, stale, or changed shape-time approval prevents execution.
- `blocked_on_user`: requires human judgment or unavailable user-only access.
- `skipped_by_user_at_shape`: user skipped an agent-with-gate action during shaping.
- `not_run_with_reason`: intentionally not run; reason recorded.

## Commit Rules

- Commit each completed slice independently.
- Commit review fixes independently.
- Commit plan/doc adjustments independently when they change tracked docs.
- Do not combine unrelated slices.
- Do not push, merge, rebase, or delete branches unless the user explicitly asks.

## Overall Review Checklist

- PRD goals and non-goals still match the final diff.
- Behavior Contract / public behaviors hold for the **assembled** change.
- Architecture Impact has a disposition for every relevant decision, or an
  explicit `not-applicable`/New decision candidate outcome.
- Every inherited invariant and exception has the required evidence; no second
  state, persistence, permission, or error strategy silently duplicates an
  existing owner.
- Each applicable Behavior Matrix row has test, smoke, or explicit waiver.
- Code slices show red-before-green evidence (or docs-only waiver); do not require
  replaying every unit test if evidence is already recorded.
- E2E `agent` items were actually executed (primary integration acceptance).
- E2E `agent-with-gate` items have shape-time decisions and are executed, skipped, or blocked according to that decision.
- Existing behavior compatibility was tested or explicitly waived.
- No unrelated dirty files were included.
- Per-slice `Review: required` used parent-spawned reviewer (or recorded true `review_degraded`).
- No new test seams appeared outside PRD Testing Decisions without plan adjustment.
- `tasks.md` constraint IDs and evidence remain mapped to the canonical PRD bundle.
