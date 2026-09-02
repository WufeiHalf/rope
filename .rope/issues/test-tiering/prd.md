# Test-Cost Tiering — Baseline Ladder, Quick Tier, Focused Verification

## Problem Statement

Real rope-go runs after the ADR 0009/0010/0012 adjustments over-execute the
full suite:

- shape's bare `Verification:` field invites per-slice "全量测试绿" — 18
  occurrences in agent-workbench MR 57 (architecture-deepening-round2),
  driving 10+ full-suite runs (~4000+ cases each);
- go's startup baseline check asserts "cheap" with no operational
  semantics — observed full discover twice (277.5s + 89.3s), the second
  run only to re-parse the verdict line lost to `| tail`;
- parallel worktree leaves each run the full suite → CPU contention →
  flaky failures (recorded 1F/1E, 5s timeouts) → full "clean rerun"
  rituals amplify the cost;
- the parent back-fills missing full-suite evidence itself instead of
  bouncing the leaf.

## Solution

Complete ADR 0009's layering downward into test **cost** tiering: the full
suite is an **issue-level gate**, never slice-level evidence.

1. **Baseline ladder** (go startup): same-HEAD green evidence → declared
   quick tier → full suite once (fallback). Any run writes output to a
   file and parses the file — rerunning to re-parse is forbidden.
2. **`Test tiers:` repo contract** (worktree-setup pattern, in routes.md);
   missing at shape → auto-derived by a fixed-criteria scan, timed ≤60s,
   written back with derivation note. Zero human involvement.
3. **Slice `Verification:` granularity**: default focused seam tests +
   guards; per-slice full-suite verification is forbidden.
4. **Flake discipline**: rerun only failing tests to classify; full clean
   rerun needs a recorded reason.
5. **Return Gate bounce**: evidence gaps return to the leaf; the parent
   never runs tests to back-fill.

## Contract Note

- rope-go 启动呈现三级 baseline 阶梯（近期绿证据 → quick tier → 全量一次兜底），输出写文件后从文件解析——不再出现为拿 OK 行重跑整套
- repo 的 routes.md 可带 `Test tiers:` 行；缺失时 shape 按固定标准（守卫+入口 smoke 必进、集成/benchmark 排除）自动派生、实测 ≤60s、写回并留派生依据——全程零人工
- 切片 `Verification:` 缺省 = focused seam 测试 + 守卫；"全量测试绿"只出现在 issue 级门（baseline 兜底 / review 前），逐 slice 全量被禁止
- 并行负载下的失败先只重跑失败用例判 flake，全量"干净重跑"须记录理由；Return Gate 的证据缺口 bounce 回叶子，parent 不代跑测试证据
- 安装副本与 `skills/` 逐文件一致，ADR 0013 进入决策链

## Goals

- Full-suite runs per issue drop from 10+ to ≤2 (baseline fallback +
  end-of-issue when Testing Decisions call for it)
- Zero-human quick-tier provisioning in any repo
- All changes cross-repo generic; no repo-specific knowledge in skills

## Non-goals

- No test-runner integration, caching infra, or parallel-test tooling
- No changes to grill/verify/finish skills beyond what cites ADR 0013
- No per-repo curation work (agent-workbench's own routes.md is that
  repo's follow-up, out of scope here)

## Public Interface / Behavior

- `skills/rope-go/SKILL.md` Startup step 2 → baseline ladder
- `skills/rope-go/references/execution-rules.md` → Test tiers contract
  (single source of truth), brief green-default, flake discipline,
  Return Gate bounce rule
- `skills/rope-shape/SKILL.md` step 2 → Test-tiers check (auto-derive)
- `skills/rope-shape/references/issue-package.md` → `Verification:`
  granularity contract
- `.rope/adr/0013-test-cost-tiering.md` → the decision
- `.agents/skills/` install copies resynced to match

## Testing Decisions

- Docs-only repo (skill text + ADR); no executable test suite exists
- Seams: skill text structure (frontmatter intact, sections present,
  cross-reference targets resolve) and the installer CLI
  (`node bin/rope.js add --target <tmp>`) as the real entrypoint
- TDD: waived (docs-only) for all slices — verified by structural
  checklist + installer E2E (e2e.md E1)

## Behavior Contract

- System under test: the rope skill texts and ADR chain governing
  baseline checks, test-tier vocabulary, and slice verification wording
- Trigger/input: a fresh rope-go startup; a shape session in a repo
  without `Test tiers:`; a leaf brief construction; a Return Gate
  reconciliation with a missing evidence item
- Collaborators: routes.md repo contracts, leaf briefs, merge queue
- Observable result: startup runs the ladder (reusing evidence or quick,
  full at most once, parsed from file); shape writes back a derived
  `Test tiers:` line; slice templates and briefs carry focused commands;
  gate gaps bounce
- Failure visibility: a skill-text grep miss (ladder/contract/granularity
  wording absent), installer diff mismatch, broken cross-reference
- Forbidden shortcuts: duplicating derivation criteria in two files;
  permissive wording ("may cite full-suite evidence") that leaves the
  old behavior legal

## Architecture Impact

- Impact: required
- Trigger check: the task extends ADR 0009's layering semantics and
  ADR 0011's gate mechanics; no existing source covers test-cost tiering.
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/0009-ticket-tdd-issue-bdd-layering.md`
    Decision status: active
    Scope: ticket-TDD / issue-BDD layering, Matrix as issue behavior spec
    Decision disposition: extend
    Inherited invariants:
      - ticket units proved by leaf TDD; issue behaviors proved at
        end-of-issue review
      - e2e.md carries real-environment behaviors only
    Affected public interfaces: slice `Verification:` field semantics
    Forbidden shortcuts:
      - redefining the Matrix or e2e regime (untouched)
    Required evidence: structural checklist on issue-package.md + SKILL.md
    Applies to: issue
    Documentation update: updated-existing (status pointer to 0013)
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/adr/0011-edge-classification-and-acceptance-gates.md`
    Decision status: active
    Scope: Mechanical Return Gate = evidence reconciliation, never review
    Decision disposition: extend
    Inherited invariants:
      - gate never re-reads implementations, never reruns tests, never
        issues verdicts
    Affected public interfaces: gate bounce target
    Forbidden shortcuts:
      - turning bounce into a parent-side verdict or parent-run evidence
    Required evidence: structural checklist on execution-rules.md
    Applies to: Slice 2
    Documentation update: updated-existing (status pointer to 0013)
    Unresolved conflicts: none
  - ID: D3
    Source: `.rope/adr/0007-graph-driven-go-single-review.md`
    Decision status: active
    Scope: single end-of-issue review gate
    Decision disposition: inherit
    Inherited invariants:
      - one review gate; no per-slice verdicts
    Affected public interfaces: none
    Forbidden shortcuts:
      - adding a per-slice full-suite review step (would re-add gates)
    Required evidence: read-through of changed go texts
    Applies to: issue
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D4
    Source: `.rope/adr/0008-slice-ready-worktree-execution.md`
    Decision status: active (demotions by 0012)
    Scope: worktree scheduling, merge queue
    Decision disposition: inherit
    Inherited invariants:
      - serial merge queue; no per-merge test ritual
    Affected public interfaces: merge queue flake handling (additive)
    Forbidden shortcuts:
      - per-merge full-suite ritual reintroduced via flake wording
    Required evidence: structural checklist on execution-rules.md
    Applies to: Slice 2
    Documentation update: no-new-decision
    Unresolved conflicts: none
- New decision candidate:
  - Scope: test-cost tiering across shape/go (baseline ladder, Test tiers
    contract + auto-derivation, focused verification granularity, flake
    discipline, gate bounce)
  - Risk: low (text rules; failure mode is late discovery, not wrong
    conclusions)
  - Decision: write ADR 0013 in this issue (S1)
- Constraint Bundle:
  - Decision sources: D1–D4 + new ADR 0013
  - Decision statuses: active
  - Scope: issue-wide; S1 ADR+ladder, S2 execution-rules, S3 shape texts,
    S4 resync
  - Invariants: full suite = issue-level gate only; quick ≤60s measured;
    derivation criteria fixed in execution-rules (single source);
    zero-human provisioning; parent never back-fills test evidence
  - Public seams: rope-go SKILL.md startup; execution-rules contracts;
    rope-shape SKILL.md step 2; issue-package.md Verification field
  - Forbidden shortcuts: duplicated criteria; permissive full-suite
    wording; human-gated derivation
  - Acceptance evidence: structural checklist; installer E2E; diff -r
  - Open conflicts: none

## References

- Incident evidence: agent-workbench MR 57
  (`.rope/issues/test-tiering/map.md` lines 1–4, external repo paths)
- ADR: `.rope/adr/0013-test-cost-tiering.md` (written by S1)

## Open Questions / Human Gates

- none

## Gate Decisions

- Gate: installer E2E (`rope add --target` into /tmp)
- Decision: approved
- Approved action: run the installer into a disposable /tmp target and
  verify installed copies carry the new texts
- Scope: /tmp only; no other install targets touched (user directive:
  install elsewhere only after verification)
- Risk: none (disposable target)
- Pass criteria: installed rope-go/rope-shape texts contain ladder /
  Test tiers wording; diff -r vs skills/ clean
- Failure report: paste installer output + diff
- Forbidden out-of-scope actions: installing to user-level or other
  project skill directories
