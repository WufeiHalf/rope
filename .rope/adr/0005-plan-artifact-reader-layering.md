# 0005 Plan Artifact Reader Layering

Rope's plan artifacts are read by two very different readers with different
budgets: **humans** confirm intent in a few sentences, **machines** (the parent
orchestrator and leaf workers) consume structured contracts by reference. Rope
makes this split explicit: human-facing artifacts stay minimal (grill recap,
Contract Note), machine-facing artifacts stay structured (Behavior Contract,
Constraint Bundle), and unresolved questions are resolved before execution —
never absorbed silently by a leaf.

This ADR extends ADR 0004 (briefs by reference, lean parent load). It does not
change review modes; it makes the *what-goes-in-a-brief* and *what-the-human-
confirms* rules explicit and measurable.

## Context

- The user rarely reads a full PRD, but `rope-verify` accepts against the PRD's
  Behavior Contract. If the human confirms a grill recap and the PRD drifts,
  verify may accept something the user never wanted.
- Leaf briefs already load architecture constraints by reference (ADR 0004),
  but there was no explicit budget for *what may appear inline* in an
  implementer brief, so "concise" was a matter of taste, not a rule.
- Upstream advice ("keep plans concise", "list unresolved questions at the
  end") is directionally right but not Rope-native: it has no reader model, no
  measurable budget, and no rule for what happens to a question discovered
  mid-execution.

## Decision

1. **Reader layering.** Every plan artifact names its primary reader:
   - **Human reads:** `rope-grill` recap (3–6 bullets) and the shape-time
     **Contract Note** (3–5 observable-outcome sentences). Minimal, plain
     language, grammar can be sacrificed for scanability.
   - **Machine reads:** PRD Behavior Contract, Behavior Matrix, Constraint
     Bundle, tasks slice records — structured, loaded by reference, never
     bulk-copied into chat or leaf briefs.
2. **Contract Note.** `rope-shape` writes a `## Contract Note` section in
   `prd.md` (3–5 one-sentence bullets answering "when this issue is done, what
   can you observe?" plus failure visibility where relevant). Step 11 of shape
   asks the user to confirm the Contract Note **instead of** reading the full
   PRD. Confirming the note confirms the PRD's Behavior Contract, because the
   note is a direct human projection of that contract — not a separate wish
   list. Verify still accepts against the Behavior Contract, not the note.
3. **Leaf brief budget (minimal brief).** Implementer/reviewer briefs are
   limited by an **allowlist** plus a measurable line cap:
   - **Content payload (allowed inline):** slice `Public behavior` (one
     sentence); the 6 Behavior Contract fields cut to their thinnest form;
     Constraint Bundle **path + slice Constraint IDs** (+ the short global
     invariant list, unchanged from ADR 0004); the test seam and one prior-art
     path.
   - **Operational contract (required, not "content"):** artifact paths for
     by-reference reads; TDD red/green commands + what counts as red; expected
     return shape (summary, paths, commit); no-nested-spawn and commit rules.
   - **Everything else by reference.** No inline slice notes, PRD paragraphs,
     bundle detail, implementation notes, or speculative file-by-file plans.
   - **Line cap:** brief body ≤ 60 lines (paths and command blocks do not
     count). This is the measurable token budget guardrail.
4. **Unresolved questions.**
   - Questions that can be answered are resolved at the **grill gate** before
     shape; no answerable uncertainty ships as an "implementation branch".
   - A conflict discovered by a leaf during `rope-go` is **re-briefed back to
     the parent** for disposition — never silently absorbed, never resolved by
     inventing `exception` / `extend` / `supersede`.
   - This replaces the older "concise plan + list unresolved questions at the
     end" rule: Rope's rule is *resolve before shape, re-brief on discovery*.

## Why this split

- **Humans and machines have different attention budgets.** Anthropic's context
  engineering guidance treats tokens as a finite attention budget — smallest
  high-signal set wins; Addy Osmani's spec guidance recommends a summary/TOC in
  the prompt with details loaded by reference. The Contract Note is the human
  analog of that summary.
- **Confirmation must bind to the acceptance artifact.** Confirming a recap
  that never reaches the PRD creates drift; a Contract Note stored in `prd.md`
  makes the human confirmation auditable and the projection traceable to the
  Behavior Contract.
- **A concrete allowlist is more enforceable than "be concise".** "Concise"
  has no test; "only these sections, body ≤ 60 lines" can be checked by the
  parent before dispatch and by review when judging brief quality.
- **Silent absorption is the expensive failure mode.** A leaf inventing a
  disposition or swallowing an unresolved question produces code that passes
  slice tests but violates intent; re-briefing to the parent keeps the decision
  at the layer that owns it.

## Consequences

- `rope-shape` step 11 becomes: output Contract Note → user confirms → commit
  package. Full-PRD reading is no longer the default confirmation ask.
- `rope-go` implementer/reviewer briefs follow the allowlist + ≤60-line cap;
  parent dispatches leaner payloads and the leaf loads detail by reference.
- `rope-verify` continues to accept against the Behavior Contract / matrix /
  E2E — the Contract Note is a confirmation aid, not an acceptance artifact.
- Existing issue packages without a Contract Note remain compatible; shape
  writes it for new packages.
- ADR 0004's by-reference constraint loading and lean parent load are
  unchanged; this ADR tightens what may be inline in a leaf brief.

## Considered Options

- **Strict 4-item brief (content only).** Rejected: dropping TDD red/green
  commands, return shape, and no-nested-spawn/commit rules saves few tokens but
  breaks the acceptance loop and parent verifiability.
- **Contract Note as a separate file.** Rejected: an extra file must be kept in
  sync with the Behavior Contract; embedding in `prd.md` keeps one canonical
  source with a human-readable projection.
- **Fold this into ADR 0004.** Rejected: 0004 is about review frequency and
  cost; reader layering is a distinct, independently referenceable decision.
- **No numeric budget.** Rejected: without a measurable cap the allowlist is
  still softer than the user's requirement for an explicit token budget.
