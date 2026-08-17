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

## Dynamic mode / parallel frontier

When `prd.md` carries `mode: dynamic`:

- **Frontier** = slices with no unresolved blockers.
- **Fan-out**: disjoint-scope frontier slices are spawned to **concurrent
  implementer leaves** — parent spawns one leaf per slice. Contract
  (`kind: contract`) and integration slices stay serial.
- **Overlap ⇒ serialize**: slices whose `Scope` / `owned_files` overlap are
  never parallel; run them serially (a core file owned by multiple slices is a
  shape defect, not a go problem).
- **Gates kept**: per-slice **review gates** and **commit rules** apply
  unchanged to parallel slices; do not skip or weaken them in dynamic mode.
- **No nested spawn**: a parallel implementer leaf must not spawn another
  leaf; the parent owns all dispatch.
- **Degradation**: if go cannot spawn concurrent workers, degrade to serial
  and record the reason in `tasks.md`.

Serial behavior is unchanged when `mode` is absent or `serial`.

In `review: batch` packages (R3): `required` slices keep their per-slice
review leaf; `batch` slices' reviews run once at end-of-issue via the batch
reviewer leaf; parallel implementer fan-out, commit rules, and no-nested-spawn
are unchanged.

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
5. **Architecture constraints (by reference):** the brief carries the
   Constraint Bundle **path**, this slice's **Constraint IDs**, and the short
   **global invariant list** inline. The leaf reads the bundle detail itself —
   source, status, disposition, scope, invariants, public seam, forbidden
   shortcuts, required evidence, and conflicts per ID — and returns a
   one-line confirmation per ID plus any conflicts. No bare “follow the ADR”
   instruction; no full inline bundle copy.
6. **TDD mode:** `required` (default for code) | `waived (docs-only)` + reason
7. When TDD required — hard fields:
   - Red command(s) the leaf must run before implementation
   - What failure signal counts as red
   - Green command(s) after minimal implementation
   - Commands must be **focused/incremental** — target the slice's tests at its seam, not a full-suite replay. A full suite run is needed only when the slice's change is not already covered by a recorded full-suite run; cite that prior evidence instead of re-running
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

The gate classifies `required` vs the rest: in `review: batch` packages the
non-gate code slices take `batch` (deferred to the end-of-issue batch review);
the gate trigger list itself is unchanged.

Use `Review: self-check` only for low-risk docs, fixture, or isolated behavior.

## Batch Review Execution (parent-owned)

In `review: batch` packages, when ≥1 slice is marked `Review: batch`:

1. After all slices complete and **before** verify, the parent spawns **one**
   `rope-reviewer` leaf over the **cumulative diff of all batch slices** — one
   leaf for the whole set, however many slices it covers. Prefer
   `rope-reviewer` from the harness manifest.
2. The brief carries the Behavior Contract, the covered slice list, and the
   Constraint IDs **by reference**: the Constraint Bundle path is given, and
   the leaf reads the bundle detail itself. Context stays fresh and clean —
   the diff + criteria only, no implementation transcripts.
3. The verdict is recorded **per covered slice** in `tasks.md` with run/agent
   identity, so verify can audit that the batch review really ran.
4. A batch finding routes to fix rounds like any review finding (≤2 automated
   rounds per problem, then Human Escalation Stop).
5. Zero `batch` slices ⇒ no batch leaf is spawned.
6. `batch` is **never** degraded to self-check: if the parent cannot spawn any
   worker at all, the `review_degraded` rules from Required Review Execution
   apply.

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

- `agent_passed`: agent ran the classified validation and it passed. Record command + evidence in `e2e.md` so verify can check the evidence without re-running.
- `agent_failed`: agent ran it and it failed; fix or record blocker.
- `covered_by_slice`: validation fully covered by slice-level runs already recorded (cite slice id + evidence location). Terminal status; no re-run required. Use this instead of duplicating a full-suite E2E item that slice runs already proved green.
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

## Handoff Checklist

Before handing off to rope-verify:

- Per-slice commits are present.
- Review verdict lines are recorded for every `required` AND `batch` slice
  (one batch verdict line covers its covered slice list).
- E2E statuses are recorded.
- No unrelated dirty files remain.

Assembled-diff judgment lives in the batch reviewer brief (Behavior Contract +
constraint IDs) and in rope-verify (ADR 0004) — not in a go parent pass.
