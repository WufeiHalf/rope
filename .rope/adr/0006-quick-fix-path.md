# 0006 Quick Fix Path (rope-quick)

Rope gains a second, lightweight entry: `rope-quick`, a **solo session** for
small tasks that fit one fresh context window — already-diagnosed fixes and
small features. One model runs grill-lite → red→green / test-first change →
local commit → inline `.rope/` doc-sync, start to finish. No issue package,
no leaf dispatch, no issue-level verify.

> Amended 2026-09-08 (grill on quick charter): charter widened from
> already-diagnosed fixes to any single-window small task, and the old
> "Direction" step formalized as grill-lite. Stop lines unchanged.

## Context

- The full pipeline (grill → shape → go → verify) is heavy for fixes where
  the root cause is already located and the direction is resolvable with a
  couple of questions. Motivating case: `agent-workbench` LDAP DN-mismatch —
  briefing with verified facts (simple bind + `uid=` template fails for
  `cn=` DN accounts), three candidate directions, tests named.
- Post-ship usage (2026-09): one-window small **features** kept being routed
  into quick informally or forced through shape as a single-slice package —
  the window boundary, not the fix/feature distinction, is what quick
  actually gates on. Matt Pocock's grilling observation ("for single-session
  tasks, a simple Q&A can be just as good as a detailed spec") supports
  giving quick its own compressed alignment step instead of requiring the
  full grill gate.
- External comparison (`.rope/research/gsd-quick-comparison.md`): GSD
  `/gsd-quick` has no entry gate, no review by default, and a persistent
  per-task record — but no mid-run stop rules (it has no heavier per-task
  pipeline to fall back into).
- Rope-internal evidence (ADR 0004): review value concentrates at high-risk
  boundaries, and issue-level verify repeatedly caught what review missed.
  quick is the only Rope path without verify, so the gap must be closed
  explicitly rather than by silence.

## Decision

1. **No entry gate; boundary = one fresh context window.** The user declares
   quick; the skill does not second-guess scope at entry. Charter covers
   already-diagnosed fixes **and** small features that fit one fresh window;
   anything needing parallel slices, a new architecture decision, or more
   context than one window holds belongs to the full pipeline. Ballooning is
   not an entry-judgment failure but mid-run discovery, handled by stop
   lines (below).
2. **Grill-lite front segment.** Before code: fact self-check (re-verify the
   brief's key facts against the tree; a failed fact goes to the user), one
   round of decision questions (recommendation + example + tradeoff), and
   the Q&A recorded into `quick.md` as the session's requirement alignment.
   One round only — needing a second round is a stop-line symptom. This is
   quick's substitute for the grill gate, sized for a window-sized task.
3. **Four stop lines** (mid-run, unchanged): ① the change now needs a **new
   architecture decision** — amending an existing ADR is allowed but its
   disposition must be confirmed by the user; ② the same change failed
   twice; ③ the change sprawls beyond the agreed scope across layers;
   ④ schema / destructive / production operation. Triggering any line:
   stop, write what is known, recommend the full pipeline; `quick.md`
   records `status: stopped`. This is the solo-session replacement for
   "leaf conflict returns to the parent" — never silent absorption.
4. **Bug fixes are red→green mandatory**: a failing test reproducing the
   reported symptom at the nearest seam comes before the fix. Small
   features are test-first at the same seam. Config/docs changes waive with
   a stated reason.
5. **The human is the second eye, with a directed prompt.** No reviewer
   leaf. The closing report carries a **risk-focus section**: when the diff
   touches auth/secret/schema/adapter boundaries, it lists the specific
   spots most worth human attention. A stronger manual review can still be
   requested ad hoc.
6. **One-page record**: `.rope/issues/<slug>/quick.md` (~30 lines: problem,
   root cause / feature ask, grill-lite record (confirmed facts + Q&A),
   chosen direction + the user's decision, red/green evidence, doc updates,
   human leftovers, status).
7. **Inline doc-sync**: a lite version of rope-summary's four-homes check —
   every changed file is considered against specs / adr / research / CONTEXT;
   each is updated or explicitly skipped with a reason. Falsified research
   conclusions are corrected in the same session.

## Consequences

- quick is the only Rope path without model-side accept judgment;
  compensated by small scope, mandatory red evidence, the directed
  risk-focus handoff, and the stop lines.
- No preset or leaf dependency — quick runs on any host that can run skills.
- `quick.md` makes solo work auditable and gives escalation a handoff
  artifact; a stopped quick can seed a grill/shape session later.
- README / routes gain a quick-path entry point alongside the full workflow.

## Considered Options

- **Fix-only charter retained, features keep going through shape** —
  rejected (2026-09-08 amendment): the real boundary quick enforces is the
  single window, not the change type; forcing window-sized features into
  single-slice packages adds ceremony without review value, and shape's own
  iron rule already routes one-window changes here.
- **Risk-triggered automatic reviewer leaf** — rejected: strongest
  assurance, but adds preset dependency and latency, contradicts the
  one-model charter, and no surveyed upstream quick path ships one; the
  human already reviews the diff, so the marginal value went into directing
  that review instead.
- **Strict entry gate (high-risk domains excluded)** — rejected: would
  exclude the motivating LDAP case; entry friction does not prevent mid-run
  discovery.
- **Tests-only gate (GSD default, no risk-focus section)** — rejected for
  Rope: leaves the human reviewer without attention anchors, and the
  workbench evidence shows the missed-bug class lives exactly at risk
  boundaries.
