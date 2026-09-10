---
name: rope-quick
description: Solo single-session path for small tasks that fit one fresh context window — already-diagnosed fixes and small features. Grill-lite up front (fact self-check + one decision-question round), red→green/test-first at the nearest seam, commit, and sync .rope/ docs inline. Invoke by name on a small fix or a prepared briefing (often in a worktree).
disable-model-invocation: true
---

# Rope Quick

Solo session for a small task that fits **one fresh context window** (ADR
0006, Quick Fix Path): an already-diagnosed fix **or** a small feature. One
model start to finish: grill-lite direction → red→green / test-first change
→ local commit → inline `.rope/` doc sync. No issue package, no leaf
dispatch, no issue-level verify; the human is the accept gate.

The boundary is the window, not the kind of work: if the task needs
parallel slices, a new architecture decision, or more context than one
fresh window holds, it does not belong here — the stop lines below send it
back to the full pipeline.

## Startup

1. Input is a briefing file (e.g. `*-BRIEFING.md` at repo/worktree root) or
   an inline problem statement. Treat briefing content as verified clues,
   not conclusions.
2. Load `.rope/CONTEXT.md`, `.rope/routes.md`, and the specs / adr /
   research the routes or briefing name; respect repo agent docs
   (`AGENTS.md` / `CLAUDE.md`).
3. In a worktree, symlinked shared resources (`.env.local`, `node_modules`,
   venvs) are read-only — never modify.
4. No entry gate: the user declaring quick is the gate.

## Grill-lite (direction)

A compressed version of grilling, in this order, before touching code:

1. **Fact self-check.** Re-verify the key facts the brief relies on against
   the tree (open the named files; confirm the cited behavior exists).
   Briefing content is verified clues, not conclusions. A fact that fails
   the check goes to the user before any code.
2. **One round of decision questions.** Only the decisions that genuinely
   branch the work — each with a recommendation, a concrete example, and a
   tradeoff (prefer the host's structured question tool). Do not re-run
   rounds; a question that needs a second round is a stop-line symptom.
3. **Record.** Write the confirmed facts and the Q&A (question → chosen
   answer) into `quick.md` — they are the session's requirement alignment,
   and the input a future session reads first. Also confirm the chosen
   direction's scope: the files and layers it may touch.

## Stop lines

Abort to the full pipeline (grill/shape) on any of:

1. The fix now needs a **new architecture decision** (amending an existing
   ADR is allowed, but the user must confirm the disposition).
2. The same fix failed twice.
3. The change sprawls beyond the agreed scope across layers.
4. Schema, destructive, or production operation.

On trigger: stop changing code, write what is known (root cause, evidence,
open decision), record `status: stopped` in quick.md, and recommend the
full pipeline. Never absorb a new decision silently.

## Fix loop

1. **Bug fixes are red→green mandatory**: write a failing test reproducing
   the reported symptom at the nearest seam (UI seams bind role / accessible
   name / label, `data-testid` as fallback — never CSS selectors or DOM
   structure); run the focused command and confirm red before fixing.
   **Small features are test-first**: a test for the new behavior at the
   nearest seam comes before the implementation (red optional when the
   behavior is genuinely new, but the test lands with the change).
2. Minimal change to green; rerun the focused suite. Config/docs-only
   changes waive red with a stated reason. **Style-only UI changes**
   (colors, spacing, layout — no behavior claim touched) also waive red:
   verify with a screenshot artifact or human look instead, and state the
   waiver reason.
3. Commit per the repo's discipline (Conventional Commit when the repo uses
   it); keep commits inside the agreed scope.

## Doc sync (four homes)

Read [current documents](../rope-clear/references/current-docs.md) before
updating durable text; revise the current owner instead of appending a conflict.

Consider every changed file against `.rope/specs/`, `.rope/adr/`,
`.rope/research/`, and `.rope/CONTEXT.md`: each is updated or explicitly
skipped with a reason. Correct falsified research conclusions in this
session; do not defer to rope-summary.

## Record and closing report

1. Write `.rope/issues/<slug>/quick.md` (~30 lines): problem, root cause /
   feature ask, grill-lite record (confirmed facts + Q&A), chosen direction
   + the user's decision, red/green evidence (command + outcome), doc
   updates (files or skip reasons), human leftovers (deploy/notify),
   `status: done | stopped`.
2. Closing report: diff summary + commits, red→green evidence, doc updates,
   and a **risk-focus section** — required when the diff touches
   auth/secret/schema/adapter or another risk boundary: name up to three
   specific spots in the diff most worth human review and why, not a
   generic "please review". List human leftovers.

## Guardrails

- Solo session: no leaf/subagent spawning; no preset dependency.
- No green-test claim for a bug fix without cited red evidence or a stated
  waiver.
- Human gates unchanged: production deploy, destructive ops, schema.
- Do not upgrade quick into a full issue mid-session; stop and hand back
  instead.
