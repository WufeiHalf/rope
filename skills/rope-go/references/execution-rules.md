# Rope Go Execution Rules

## Parent / Leaf Contract

The go session is the **Parent Orchestrator**. Leaf workers:

| Role | Typical preset | Job |
| --- | --- | --- |
| implementer | `rope-implementer` | TDD, implement one slice unit, commit, return summary + paths |
| reviewer | `rope-reviewer` | End-of-issue new-eyes review: assembled diff, contract, real-entrypoint probe; return verdict |
| explore | `rope-explore` | Read-only facts when re-brief needs more context |
| verify-inspector | `rope-verify-inspector` | Not used mid-go; reserved for issue-level verify |

Rules:

- Parent spawns leaves with **self-contained briefs** (goal, paths, acceptance, constraints).
- Leaves return **summary + artifact paths/status** only. Parent reads those + diffs, not full traces by default.
- **No nested spawn.** Leaves must not be asked to spawn workers. Parent owns all dispatch.
- Correction = rewrite brief + re-spawn implementer (or explore then re-brief). Max **2** automated fix rounds per problem → **Human Escalation Stop**.
- Design / requirements / contract defect → immediate Human Escalation Stop (no thrash).

## Graph-driven execution (waves)

No mode flag — shape already read the slice graph; go runs it:

- **Frontier** = slices with no unresolved blockers.
- **Fan-out**: frontier slices whose `Scope` / `owned_files` do not overlap
  are spawned as **background implementer leaves** — one per slice, results
  collected as they land. Overlapping frontier slices serialize (a core file
  owned by multiple slices is a shape defect; go works around it, shape
  should have caught it).
- **Waves**: wave N+1 starts when wave N clears. Rivers — zero-dependency
  clusters — run concurrently throughout.
- **No nested spawn**: an implementer leaf must not spawn another leaf; the
  parent owns all dispatch.
- **Degradation**: if the host cannot spawn background workers, run the wave
  foreground one slice at a time and record the reason in `tasks.md`.

## Harness Leaf Presets

If `~/.config/rope/harness/<host>.json` exists (pi: `~/.config/rope/harness/pi.json`):

- Prefer named `rope-*` agents so model/thinking defaults come from harness-native presets written by `rope-harness-presets`.
- Parent may still override model/thinking at spawn when the host allows.

If the manifest or a needed `rope-*` agent is missing:

- Soft-degrade: use a generic host worker without a forced model pin.
- Record `preset_missing` in `tasks.md` (review notes or final status).
- Continue. Do **not** hard-block go. Do **not** auto-run `rope-harness-presets`.

## Leaf Brief Contract (hard budget)

Per ADR 0005, every implementer/reviewer spawn brief is a **minimal brief**:
an allowlist plus a line cap. The parent checks the budget before dispatch.

**Content payload (allowed inline):**

1. Issue path + slice id/title
2. **Public behavior:** one user-visible sentence
3. **Behavior Contract:** the 6 fields cut to their thinnest form
4. **Architecture constraints (by reference):** Constraint Bundle **path** +
   slice **Constraint IDs** + short **global invariant list**. The leaf reads
   the bundle detail itself — source, status, disposition, scope, invariants,
   public seam, forbidden shortcuts, required evidence, conflicts per ID — and
   returns a one-line confirmation per ID plus any conflicts. No bare “follow
   the ADR”; no full inline bundle copy.
5. **Test seam + prior art:** the seam from PRD Testing Decisions (copy the
   list; do not invent) + one prior-art path

**Operational contract (required, not counted as content):**

- TDD mode: `required` (default for code) | `waived (docs-only)` + reason; when
  required — red command(s) before implementation, what failure signal counts
  as red, green command(s) after minimal implementation. Commands are
  **focused/incremental** — target the slice's tests at its seam; cite a prior
  full-suite run instead of re-running when already recorded
- Expected return shape: summary, paths changed, commit hash, acceptance text
  exercised, red evidence (command + failure) unless waived, green evidence
  (command + pass), architecture constraints checked + disposition conflicts,
  blockers
- Relevant artifact paths (prd/tasks/e2e, bundle, map, specs, files) — the
  locators that make by-reference reads possible
- Investigation map path — orient by it, update falsified lines before commit
- No nested spawn; commit rules; Blocked by / Scope
- Anti-pattern pointer to `references/tdd.md` is enough

**Line cap:** brief body ≤ 60 lines (paths and command blocks excluded).
Everything else — slice notes, PRD paragraphs, bundle detail, implementation
notes, speculative file-by-file plans — is **by reference only**, never inline.

Reviewer briefs (end-of-issue) must require checking acceptance alignment,
`tdd.md` anti-patterns, and architecture continuity: inherited invariants,
responsibility ownership, dependency direction, public compatibility,
exception scope, and the required evidence — plus the Contract axis and the
real-entrypoint instruction (End-of-Issue Review Execution below). Their
return includes the checked constraint IDs, evidence, final disposition, and
conflicts. Review behavior and boundaries, not a required function or class
name.

If a leaf discovers that the recorded disposition cannot hold, it returns the
conflict and evidence to the parent. The parent updates the package/brief and
re-dispatches; the leaf does not invent `exception`, `extend`, or `supersede`.

## End-of-Issue Review Execution (parent-owned)

After all slices and before verify, the parent spawns exactly **one**
reviewer leaf — new eyes that never watched the build:

1. Prefer `rope-reviewer` from the harness manifest. If no specialized type
   exists but a generic worker does, use it with explicit review
   instructions; record the type used. `review_degraded` only when the parent
   cannot spawn any worker at all — then self-review and record
   `review_degraded: no_subagent_tool_available`, what discovery was
   attempted, and why self-review was used.
2. Brief (minimal-brief allowlist + ≤60-line cap still applies):
   - diff base..HEAD with commit list (base = pre-issue merge point)
   - Contract Note bullets + Behavior Contract by reference
   - Constraint Bundle path + constraint IDs by reference
   - map path + e2e evidence paths
   - the two axes + real-entrypoint instruction + high-risk focus list
   - expected return: verdict `approve | changes_requested | blocked`,
     findings with file:line evidence, per-axis notes, probe log path
3. The reviewer is read-only on code; it may start/stop local processes and
   drive a browser to probe the real entrypoint. It must not edit code or
   spawn workers.
4. Record the verdict + run/agent identity + fix rounds in `tasks.md` (one
   issue-level verdict; per-slice review no longer exists).
5. Findings → one fix brief → implementer leaf; ≤2 automated rounds per
   problem, then Human Escalation Stop.

Do **not**:

- instruct an implementer leaf to spawn a review subagent
- treat nested Agent inside a leaf as the review path
- silently skip the review when a worker can be spawned

## High-risk boundaries (the reviewer's deepest look)

Probe these hardest when the diff touches them:

- public interface or user-visible behavior
- external system or adapter behavior
- auth, permission, secret, or data leak risk
- persistence, schema, migration, stored format
- routing, app entrypoint, runtime wiring, background worker
- multi-layer behavior
- E2E critical path

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
- The end-of-issue review verdict (+ fix rounds) is recorded with run/agent
  identity.
- E2E statuses are recorded.
- No unrelated dirty files remain.

Assembled-diff and product-truth judgment live in the end-of-issue reviewer
(ADR 0007) — not in a go parent pass.
