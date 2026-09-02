# Test-Cost Tiering Map

- agent-workbench `.rope/issues/architecture-deepening-round2/tasks.md` carries 18 per-slice "全量测试绿" Verification entries; 10+ full-suite runs recorded (2026-09-02, external repo)
- agent-workbench go startup ran full discover twice — 277.5s then 89.3s, second run only to re-parse the verdict line (user-pasted session log, 2026-09-02)
- agent-workbench full suite includes benchmark-named tests but they run FauxJudge/mocked — no real model calls; slowness is volume + fixture-heavy integration (tests/test_prompt_behavior_judgment.py, scripts/benchmarks/judgment_judge.py, 2026-09-02)
- rope `skills/` mirrors `.agents/skills/` (diff SAME for rope-go SKILL.md at 4791d03); resync is the standing pattern (git log "chore: resync", 2026-09-02)
- worktree-setup contract format lives in skills/rope-go/references/execution-rules.md — Test tiers contract co-locates there (single source of truth decision, 2026-09-02)
