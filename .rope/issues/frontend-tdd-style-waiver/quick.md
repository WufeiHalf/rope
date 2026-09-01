# Quick: frontend TDD style waiver + UI seam contract

status: done

## Problem

agent-workbench applied rope TDD to frontend changes; tests bound to specific
DOM, forcing pure style changes through red→green.

## Root cause

Rope's TDD rules defined seams but (a) no "worth-the-loop" triage — the only
waiver was docs-only, style had no lane (same hole as upstream Pocock #746);
(b) no UI locator contract, so "public interface" of a UI seam was undefined
and agents bound DOM structure.

## Direction (user decision implied by request)

Adopt the two-layer split from research (behavior = red→green; style-only =
waive red, screenshot/human verify). No per-commit visual-regression baseline.

## Changes (docs-only, red waived)

- `skills/rope-go/references/tdd.md`: Seams gains UI accessibility-contract
  bullet; anti-pattern table gains Aesthetic-coupled row and DOM-binding tell
  on Implementation-coupled; "Docs-only" section generalized to "Waived
  slices (no red required)" with style-only kind + Public-behavior
  tie-breaker.
- `skills/rope-quick/SKILL.md`: fix loop carries the locator contract and the
  style-only waiver (screenshot/human verify, stated reason).
- Synced installed copy via `node bin/rope.js add --target .agents/skills`
  (also picked up previously unsynced ADR 0011 content); `diff -rq` both
  skills IDENTICAL.

## Evidence

- Verification: structural read-through + sync diff clean (repo has no test
  suite; routes.md worktree-setup line).
- Research captured: `.rope/research/frontend-tdd-style-decoupling.md`.

## Human leftovers

- agent-workbench product rules can lift the same two rules verbatim: change
  triage (style-only waiver) + role/label/testid locator contract.
