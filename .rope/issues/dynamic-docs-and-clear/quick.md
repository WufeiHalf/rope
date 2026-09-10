# Dynamic docs and document cleanup

status: done

## Problem / verified facts
- Installer ships only `skills/`; old go instructions required an unshipped `.rope/specs/` runtime contract.
- Historical session read config before grill (JSONL:19–20); historical stale skill bytes remain unproven.
- Active rules conflicted on full-suite frequency and worktree overlap.

## Grill-lite decisions / scope
- Coverage-driven research and ready work, not agent/slice quotas; challenge coarse slices and false dependencies.
- Impact-based testing, not fixed twice-per-issue full suites; retain evidence and escalation reasons.
- No new model-plan UI; user is satisfied with routing evidence.
- `rope-clear`: evidence-backed batch → approval → edits; unresolved semantic conflicts ask the human.
- Ordinary current docs revised in place with Git history; formal ADR history retained with status/scope links.
- User chose quick after grill, then explicitly waived skill TDD: direct text edits, no test files.
- Scope: shipped skill text/references, docs and matching tracked `.agents/skills` mirrors; no product code or new ADR.
- No agent-workbench cleanup, global installation, model/preset change, or automatic installed-copy migration.
- Mirrors matched pre-change source before synchronization; legacy execution-rules alias now points to its owner.

## Affected ADRs (confirmed disposition)
- 0002 extend: current-document maintenance/history handling and explicit cleanup approval; conflict gates preserved.
- 0012 inherit: worktree overlap orders merging, not dispatch; contradictory skill text corrected; ADR unchanged.
- 0013 amend: impact-based issue-level broad tests replace mandatory frequency; focused TDD/evidence preserved.
- 0014 extend: shipped operational source/startup pointers, coverage-driven fan and honest gate failures.

## Verification (docs-only; TDD waived by user)
- Disposable payload smoke: copied only `bin/`, `skills/`, package marker; `node <copy>/bin/rope.js add` under fake HOME and `add --target <consumer>/.agents/skills` both passed without a consumer `.rope/`.
- All shipped relative Markdown file links resolved inside each installation; all three startup links reached the same dynamic reference; reinstall preserved `settings.json`.
- Smoke artifacts: `/tmp/rope-docs-smoke-wydk2ppe`; final mirror/link/diff checks also passed.
- Manual contract walk: 3 independent questions → 3 lanes, not quota 20; overlap-only worktree slices start while missing seams wait; backend-local vs shared UI-contract test impact distinguished.
- Manual cleanup walk: explicit replacement → approved in-place edit; unknown truth → held row; dirty/untracked content → preservation choice; ADR grep hit → status/replacement check, not zero-hit promise.
- Failed/missing gate evidence stays blocked; no silent substitute validation or partial-merge pass. These are instruction checks, not proof of future agent compliance.

## Doc sync / leftovers
- ADRs 0002/0013/0014 updated; specs route to shipped owners rather than copy runtime text; CONTEXT startup wording corrected.
- README/routes expose clear and distribution boundaries. Research consolidated into `../../research/dynamic-workflow-session-audit.md`; 12 intermediate notes preserved at `/tmp/rope-grill-raw-audit-sk2ob1x_` outside current knowledge.
- Human review focus: broad-test escalation preserves repo requirements; clear protects undecided/uncommitted content; installation references require the complete skill set.
- Human leftovers: accept wording and explicitly refresh external/global installations when desired. No push performed.
