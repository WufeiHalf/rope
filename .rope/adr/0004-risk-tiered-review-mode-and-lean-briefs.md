# 0004 Risk-Tiered Review Mode and Lean Leaf Briefs

Rope adds an **opt-in, per-issue review mode** decided at `rope-shape` time:
`review: per-slice | batch` in `prd.md` frontmatter (absent or `per-slice` ⇒
current behavior). In `batch` mode, high-risk slices keep a per-slice reviewer
leaf while other code slices defer to **one end-of-issue batch review**; `rope-go`
drops its parent-owned overall review pass, leaving `rope-verify` as the sole
parent-level assembled judgment. Leaf briefs carry the Constraint Bundle **by
path reference** (plus constraint IDs and the short global invariant list)
instead of inline copies, and the go parent loads the issue package **lean**
(frontmatter, Behavior Contract, slice statuses, bundle index) with deep reads
on demand.

## Context

Empirical evidence from `agent-workbench` (101 issues; see
`.rope/research/review-cost-token-efficiency.md`):

- 377 `Review: required` slices vs 67 `self-check`; ≥84 reviewer verdict lines
  and 46 `review_degraded` markers. Most required-slice reviews were
  low-finding; yield concentrated in genuinely high-risk slices (security,
  failure paths).
- Verify was the effective safety net: security vulnerabilities, concurrency
  correctness, and E2E drift were repeatedly caught **after** per-slice review
  and go's overall review had both passed (e.g. `pi-migration-toolset`,
  `agent-turn-concurrency-scheduler`, `webui-channel-integration`).
- The largest token sink was **fix-loop rounds at verify** (up to 13 rounds per
  issue), not review spawns: late-caught integration bugs are the expensive
  failure mode, so the batch pass must run **before** verify starts.
- Brief-copy overhead: a median 5-slice issue copies ~18KB of prd+tasks text
  into leaf briefs per go cycle.

External research (all first-party sources cited in the research file): no
surveyed system runs a fresh LLM reviewer per internal work unit — review
attaches to the delivery unit or end of an unattended run (Claude Code,
Devin, Codex, Copilot, Trellis, thrifty); nobody runs two same-scope LLM read
passes over one assembled diff; minimal clean reviewer context (diff +
criteria by reference) is both cheaper and higher-yield (Cognition).

## Decision

1. **Review mode field.** `review: per-slice | batch` in `prd.md` frontmatter.
   `rope-shape` asks the user at shape time (same manual opt-in pattern as
   `mode: dynamic`). Absent or `per-slice` ⇒ today's behavior.
2. **Three-valued slice review marking (batch mode).** `required` (slice hits
   the Review Risk Gate: public interface, external/adapter, auth/secret,
   persistence/schema, routing/runtime wiring, multi-layer, E2E-critical
   path) | `batch` (other code slices) | `self-check` (docs/fixture only).
   In per-slice mode the marking stays binary `required | self-check`.
3. **Batch review execution (parent-owned).** After all slices, if ≥1 slice is
   marked `batch`, the parent spawns **one** `rope-reviewer` leaf over the
   cumulative diff of all batch slices. Its brief includes the Behavior
   Contract and constraint IDs by reference (fresh, clean context — diff +
   criteria only, per Cognition). Verdict is recorded per covered slice in
   `tasks.md` with run/agent identity. A `batch` finding routes to fix rounds
   like any review finding (≤2 rounds, then Human Escalation Stop).
4. **Go overall review removed.** The parent no longer performs the
   "Overall Review" pass after slices. Judgment items move to the batch
   reviewer brief (Behavior Contract assembled check) and to `rope-verify`,
   which already owns them (ADR 0001: matrix/Contract for the integrated
   change, dispositions, invariant evidence, E2E drift, review reality). go
   keeps a light **handoff checklist** only: per-slice commits present, review
   verdicts recorded (incl. batch), E2E statuses recorded, no unrelated dirty
   files.
5. **Briefs by reference.** Implementer/reviewer briefs carry the bundle
   **path + slice Constraint IDs + the short global invariant list**; the leaf
   reads bundle detail itself and returns per-ID confirmation + conflicts.
   No bare "follow the ADR" (unchanged); no full inline bundle copy (new).
6. **Lean parent load.** go startup reads prd frontmatter, Behavior Contract,
   Testing Decisions, Architecture Impact, bundle index (IDs + paths), and
   slice statuses; bundle entries and references are deep-read when
   dispatching the slice that needs them.

## Why this split

- **Review value is concentrated at high-risk boundaries** (workbench data +
  GitHub risk-classified review depth); uniform per-slice frequency buys little
  elsewhere.
- **One clean-context reviewer over the assembled diff is the upstream
  pattern** (Claude Code end-of-run adversarial review; Devin per-PR) and
  catches the integration class (e.g. workbench `shutup` sync-await) that
  individual slice reviews miss — **before** the expensive verify loop starts.
- **Two same-scope parent passes were the waste**: go overall review and
  verify overlapped heavily; verify is the stronger, evidence-checking pass
  (ADR 0001) and stays the sole accept gate.
- **Implement/accept separation preserved** (ADR 0001): batch review is a
  real parent-spawned read-only leaf — never implementer self-review, never
  a silent degrade; verify still audits that it actually ran.

## Consequences

- Reviewer spawns per typical 6-slice batch issue drop from ~6 to ~2 (1
  required + 1 batch); brief copy overhead drops by the bundle detail per
  leaf; parent go context grows slower.
- `rope-verify` gains one check: batch-slice verdicts are real and auditable
  (extends its existing "required reviews real" check).
- Dynamic mode (ADR 0003) interplay: `required` slices still get per-slice
  review; `batch` slices' reviews run once at end-of-issue; parallel
  implementer fan-out, commit rules, and no-nested-spawn are unchanged.
- Legacy packages (no `review` field) behave exactly as today.
- Fix-round and Escalation Stop rules apply unchanged to batch findings.

## Considered Options

- **Shrink the global Review Risk Gate list.** Rejected: global and
  irreversible; the per-issue mode gives shape-time risk judgment instead.
- **Keep both parent passes (overall review + verify).** Rejected: two
  same-scope strong-model read passes over one diff is the exact duplication
  upstream avoids; workbench evidence shows verify subsumes it.
- **Batch review merged into verify.** Rejected: verify must stay read-only
  accept judgment; batch review is a review gate whose findings feed fix
  rounds *before* verify, keeping the verify loop cheap.
- **Frequency unchanged, cheaper reviewer model only.** Rejected as sole
  measure: spawn count and brief overhead dominate; model routing alone
  leaves wall-clock and parent tokens untouched.
