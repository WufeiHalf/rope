# Planner Bounce-rate Replay Protocol (ADR 0011)

Offline evaluation for **planner-window model selection**: measure how often a
candidate planner bounces leaf returns, without running a live issue.

## Inputs

- One committed issue package (`prd/tasks/e2e.md`) with a Behavior Matrix and
  per-slice Required evidence.
- A set of leaf-return summaries for that package (real, from a past run, or
  synthesized with known defects: missing evidence item, wrong seam, scope
  drift).
- Candidate planner models (≥2) + the evaluation rubric below.

## Procedure

1. For each candidate planner: present the same briefs (slice + Required
   evidence + matrix rows) and each leaf-return summary, in separate fresh
   sessions.
2. The planner outputs a judgment per return: `accept` | `bounce:<evidence
   ids>` | `escalate`, plus a one-line reason.
3. Score against the answer key: correct accept, correct bounce (right items),
   false bounce (rejected valid work), missed defect (accepted invalid work).

## Output report (per candidate)

| Metric | Meaning |
| --- | --- |
| bounce precision | bounced returns that truly failed |
| bounce recall | true failures actually bounced |
| false-bounce rate | valid work rejected (wasted fix rounds) |
| missed-defect rate | invalid work accepted (rework lands later) |

Decision rule: prefer the candidate with the lowest false-bounce + missed-
defect sum at equal precision; record the full table in
`.rope/research/` next to the issue evidence.

## Guardrails

- Fully offline: no product runs, no worktrees, no code execution.
- Same inputs for every candidate; order effects are not controlled — note
  them if judging interactively.
- A candidate that cannot produce structured judgments scores as
  `not-usable` for the planner window, not as zero-bounce.
