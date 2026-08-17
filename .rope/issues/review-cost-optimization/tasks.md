# Risk-Tiered Review Mode and Lean Leaf Briefs Tasks

## Batch Review (issue review: batch)

- Slices covered: 1, 2, 4, 5 (Slice 3 was `required` — independently
  reviewed: rope-reviewer leaf `approve`, commit de1852d)
- Executor: parent-spawned `rope-reviewer` leaf, fresh clean context, one
  leaf over cumulative diff of batch commits (07773f0, d81f241, cd7a9fe,
  b84f0b3, cc65191)
- Verdict: **approve** — per-slice pass (1: terms+spec ADR-consistent;
  2: shape question/guardrails/templates; 4: verify audit + guide transport;
  5: README/routes/resync + deferred matrix reword executed; diff -r clean)
- Assembled check: one vocabulary across shape↔go↔verify↔README↔CONTEXT/spec;
  no parent overall-review phrasing in active docs; gate list identical at
  all 4 sites; E1–E3 spot-checked accurate
- Findings: 1 minor (this file's stale Slice 4/5 statuses) — fixed by this
  commit


## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path | yes | Slice 2/3 seams + E1 dry-run |
| Alternate input or entrypoint (legacy package, no `review` field) | yes | Slice 3 wording + E2 |
| Empty or missing input (zero `batch` slices in a batch issue) | yes | Slice 3 execution-rules wording |
| Invalid or malformed input (`batch` marking on a Risk Gate slice) | yes | Slice 2 shape guardrail wording |
| Duplicate or idempotent case (re-entering go after a batch fix round) | yes | Slice 3 fix-round wording |
| Boundary or limit case (many batch slices → still one leaf) | yes | Slice 3 wording |
| Existing behavior compatibility (per-slice mode unchanged) | yes | E2 + Slice 3 seams |
| Real entrypoint or integration path (shape→go→verify doc walkthrough) | yes | Slice 5 + E1/E3 |

## Slice 1: CONTEXT terms and spec entry

- Status: done (commit 07773f0; seam red→green recorded; review: batch → deferred)
- Kind: vertical
- Goal: the shared vocabulary defines review mode and batch review so every
  later slice cites one language.
- Blocked by: none
- Scope: `.rope/CONTEXT.md`; `.rope/specs/review-cost-optimization.md` (new);
  `.rope/specs/index.md` (list entry)
- Owned files: those three only
- Size cap: ~120 diff lines / 3 files
- Matrix rows: Primary path
- Constraint IDs: R1, R4, R5 (terminology must match ADR 0004 exactly)
- Required evidence: CONTEXT has a Review Mode term and updated Per-Slice
  Review term (three-valued marking); Dynamic Workflow Mode term notes the
  interplay; spec file summarizes ADR 0004 contract; index lists it
- Public behavior: an agent reading `.rope/` finds one consistent definition
  of review modes and batch review semantics.
- Tests:
  - grep CONTEXT for the new/updated terms and the three review values
  - spec cross-references ADR 0004; index updated
- Implementation notes:
  - Rewrite `Per-Slice Review` entry: marking is `required | batch |
    self-check` (batch only in batch mode); batch slices get one end-of-issue
    review leaf. Add `Review Mode` term (per-slice | batch, shape-time
    opt-in, absent ⇒ per-slice). Extend `Issue-Level Verify` entry with the
    batch-verdict reality check sentence.
- Verification: seam greps pass
- Review: batch
- Review reason: docs-only language layer
- Stop conditions: ADR 0004 wording conflict that cannot be resolved by
  quoting it
## Slice 2: shape-side review-mode contract

- Status: done (commit d81f241; seam red→green recorded; review: batch → deferred)
- Kind: vertical
- Goal: rope-shape asks for review mode and produces packages that carry it,
  with the three-valued slice marking and its guardrail.
- Blocked by: Slice 1
- Scope: `skills/rope-shape/SKILL.md`;
  `skills/rope-shape/references/issue-package.md`
- Owned files: those two only
- Size cap: ~120 diff lines / 2 files
- Matrix rows: Primary path; Invalid or malformed input
- Constraint IDs: R1
- Required evidence: shape workflow asks review mode at step 1 (alongside
  dynamic mode); guardrail: Risk Gate slices must be `required`, `batch`
  valid only in batch mode; template frontmatter `review: per-slice |
  batch`; slice template `Review: required | batch | self-check` with the
  validity note
- Public behavior: a user running rope-shape is asked for review mode and
  the committed package records it.
- Tests:
  - grep template for `review:` frontmatter and three-valued Review field
  - read-through: shape step 1 question + guardrail present
- Implementation notes:
  - Keep the manual opt-in pattern (no auto-detect) mirroring `mode`.
- Verification: seam greps pass
- Review: batch
- Review reason: docs-only template contract; consistency is the risk and
  the batch reviewer checks it against CONTEXT/ADR
- Stop conditions: disagreement with ADR 0004 semantics

## Slice 3: go execution contract (review dispatch, batch execution, briefs, lean load)

- Status: done (commit de1852d; review: required → reviewer leaf approve; 1 minor deferred to Slice 5)
- Kind: vertical
- Goal: rope-go schedules reviews by mode, runs one parent-spawned batch
  reviewer leaf before verify, has no parent overall review, and uses
  by-reference briefs with a lean startup load.
- Blocked by: Slice 1
- Scope: `skills/rope-go/SKILL.md`;
  `skills/rope-go/references/execution-rules.md`
- Owned files: those two only
- Size cap: ~250 diff lines / 2 files
- Matrix rows: Primary path; Alternate input (legacy); Empty (zero batch
  slices); Duplicate/idempotent (batch fix rounds); Boundary (one leaf for
  many batch slices)
- Constraint IDs: R1, R2, R3, R4, R5; F1–F4
- Required evidence:
  - slice loop dispatch by review value (required → reviewer leaf; batch →
    deferred; self-check unchanged)
  - new "Batch Review Execution" section: parent-owned, one `rope-reviewer`
    leaf, cumulative diff of batch slices, brief carries Behavior Contract +
    constraint IDs by reference, verdict recorded per covered slice with
    run/agent identity, fix rounds ≤2 then Escalation Stop, zero batch slices
    ⇒ no leaf, `batch` never degrades to self-check
  - "Overall Review Checklist" section removed, replaced by a light handoff
    checklist (commits, verdict lines incl. batch, E2E statuses, clean tree);
    judgment items explicitly live in batch brief + verify
  - dynamic-mode interplay sentence (R3)
  - Leaf Brief Contract item 5 rewritten by-reference (path + IDs + global
    invariant list; leaf reads detail; returns per-ID confirmation +
    conflicts; no bare follow-the-ADR, no full inline copy)
  - lean startup wording in SKILL.md Startup step
- Public behavior: a batch-mode issue runs ~2 reviewer spawns instead of one
  per code slice, and verify remains the only parent-level final pass.
- Tests:
  - grep execution-rules for "Batch Review Execution" and absence of a
    parent "Overall Review" pass section
  - grep brief item 5 for by-reference wording
  - read-through of SKILL.md slice loop + Startup
- Implementation notes:
  - Review Risk Gate list itself unchanged — only its surrounding dispatch
    semantics change.
- Verification: seam greps pass
- Review: required
- Review reason: changes the public go execution contract (review gates and
  the go→verify boundary) — the highest-risk surface of this issue
- Review verdict: PASS — rope-reviewer leaf `approve` (all required-evidence
  bullets present; Risk Gate list verbatim; ADR 0001/0003/0004 continuity;
  F1–F4 guarded; seams independently re-run green)
- Deferred minor finding → Slice 5: reword go SKILL "After all slices" item 1
  ("Matrix still covered for the integrated change") from parent-judgment
  phrasing to evidence-bookkeeping phrasing; assembled matrix judgment is
  verify-owned per ADR 0004 D4.
- Stop conditions: any change that weakens ADR 0001 audit checks or commit
  rules

## Slice 4: verify-side contract and continuity guide

- Status: done (commit cd7a9fe; seam red→green recorded; review: batch → covered by batch review)
- Kind: vertical
- Goal: rope-verify audits batch verdicts as real reviews, and the
  architecture-continuity guide states the by-reference brief transport.
- Blocked by: Slice 1
- Scope: `skills/rope-verify/SKILL.md`;
  `skills/rope-verify/references/verify-rules.md`;
  `.rope/specs/guides/architecture-continuity.md`
- Owned files: those three only
- Size cap: ~150 diff lines / 3 files
- Matrix rows: Primary path; Existing behavior compatibility
- Constraint IDs: R2, R6; F1, F5
- Required evidence: verify SKILL minimum-check list includes batch verdicts
  real/auditable (extends "required reviews real"); verify-rules pending/
  blank-verdict check covers batch slices; guide's leaf-brief rule states
  path + IDs + global invariant list with full field set still required
- Public behavior: a batch issue cannot reach verify PASS with unauditable
  batch review records.
- Tests:
  - grep verify SKILL/verify-rules for batch verdict checks
  - grep guide for by-reference brief wording consistent with D4 disposition
- Implementation notes:
  - Keep "do not turn verify into a second full TDD pass" intact.
- Verification: seam greps pass
- Review: batch
- Review reason: docs-only accept-side wording tied closely to Slice 3
- Stop conditions: conflict with verify-rules `cannot_verify` classification

## Slice 5: Integration — README, routes, install resync, end-to-end dry-run

- Status: done (commits b84f0b3 + cc65191 + 7d840f6; E1–E3 agent_pass; review: batch → covered by batch review)
- Kind: vertical
- Goal: public docs mention the review mode, navigation points at ADR 0004,
  the installed copies match `skills/`, and the assembled document set reads
  coherently shape→go→verify.
- Blocked by: Slice 2, Slice 3, Slice 4
- Scope: `README.md`; `.rope/routes.md`; `skills/rope-go/SKILL.md` (one-line
  matrix reword — deferred Slice 3 review finding); resync
  `.agents/skills/rope-shape/`, `.agents/skills/rope-go/`,
  `.agents/skills/rope-verify/` from `skills/`
- Owned files: README.md, .rope/routes.md, skills/rope-go/SKILL.md (one line),
  .agents/skills/rope-{shape,go,verify}/** (copies)
- Size cap: ~150 diff lines / ≤10 files (mostly synced copies)
- Matrix rows: Real entrypoint or integration path; Existing behavior
  compatibility
- Constraint IDs: R1–R6 assembled consistency
- Required evidence: README workflow line reflects three-valued review and
  batch; routes.md workflow-change reading list includes ADR 0004;
  `diff -r skills/<skill> .agents/skills/<skill>` clean for the three
  touched skills; E1 dry-run recorded
- Public behavior: a user reading the repo sees the new review mode as a
  wired-in, documented capability.
- Tests:
  - diff -r the three skill dirs against installs
  - E1/E2/E3 dry-runs pass
- Implementation notes:
  - Resync copies only; do not hand-edit `.agents/skills/`.
- Verification: diffs clean + E2E recorded
- Review: batch
- Review reason: integration/docs slice; assembled consistency checked by
  batch review + verify
- Stop conditions: E1 dry-run exposes a semantic contradiction between
  shape and go texts
