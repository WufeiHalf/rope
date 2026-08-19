# Plan Artifact Reader Layering — Spec

Contract for human vs machine plan-artifact readers, the Contract Note, and
the Minimal Leaf Brief budget. Source of truth:
`.rope/adr/0005-plan-artifact-reader-layering.md`.

## Readers

- **Human reads:** `rope-grill` recap (3–6 bullets) and the shape-time
  **Contract Note** (3–5 bullets). Plain language, scanable, grammar may be
  sacrificed.
- **Machine reads:** PRD Behavior Contract, Behavior Matrix, Constraint Bundle,
  tasks records, E2E plan — structured and loaded **by reference**, never
  bulk-copied into chat or leaf briefs.

## Contract Note

- Location: `## Contract Note` in `prd.md`, between Solution and Public
  Interface / Behavior.
- Content: 3–5 one-sentence bullets answering "when this issue is done, what
  can you observe?" plus failure visibility where relevant.
- Projection rule: every bullet derives from a Behavior Contract field
  (Observable result, Failure visibility, or a permitted/shortcut boundary).
  The note is not a separate wish list.
- Confirmation: `rope-shape` step 11 asks the user to confirm the Contract Note
  instead of asking them to read the full PRD. Confirming the note confirms the
  Behavior Contract.
- Acceptance: verify accepts against the Behavior Contract / matrix / E2E — the
  note itself is never an acceptance artifact.
- Compatibility: older packages without a note remain valid; shape writes the
  note for new packages.

## Minimal Leaf Brief

Implementer/reviewer briefs follow an allowlist plus a line cap:

- **Content payload (allowed inline):**
  1. slice `Public behavior` — one user-visible sentence;
  2. Behavior Contract 6 fields — thinnest form;
  3. Constraint Bundle **path + slice Constraint IDs** + short global invariant
     list (ADR 0004);
  4. test seam + one prior-art path.
- **Operational contract (required, not counted as content):**
  - TDD red/green commands + what failure signal counts as red;
  - expected return shape (summary, paths, commit);
  - no-nested-spawn and commit rules;
  - relevant artifact paths (prd/tasks/e2e, bundle, specs, files) — the
    locators that make by-reference reads possible.
- **By reference only (never inline):** slice notes, PRD paragraphs, bundle
  detail, implementation notes, speculative file-by-file plans.
- **Line cap:** brief body ≤ 60 lines; paths and command blocks excluded.

## Unresolved questions

- Answerable questions are resolved at the **grill gate** before shape; no
  answerable uncertainty ships as an implementation branch.
- A conflict discovered by a leaf during `rope-go` returns to the parent for
  re-brief and disposition — never silently absorbed, never resolved by a leaf
  inventing `exception` / `extend` / `supersede`.

## Forbidden shortcuts

- Full inline PRD / bundle copies in leaf briefs.
- Dropping TDD commands, return shape, or leaf discipline to save tokens.
- Confirming a chat recap that never lands in `prd.md` (drift risk).
- Treating the Contract Note as the acceptance contract.
- Silent absorption of leaf-discovered conflicts.
- "Concise plan + list unresolved questions at the end" as the standing rule.