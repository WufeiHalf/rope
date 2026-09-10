# Dynamic workflow session audit

## Scope / evidence

Historical pi session: `01a084fa-6712-72b3-9f89-5f0e6cafaa6e`.
Source: `/home/wufei/.pi/agent/sessions/--home-wufei-herdr-agent-workbench-fix-role-profile-version-friction--/2026-09-09T07-03-18-035Z_01a084fa-6712-72b3-9f89-5f0e6cafaa6e.jsonl`.
Historical observations below are evidence, not current operational rules.
Current rules: `skills/rope-go/references/dynamic-workflow.md` and
`skills/rope-clear/references/current-docs.md`.

## Findings retained

- **Config was read before grill research.** Parent verification of JSONL:19
  finds `cat ~/.rope/config.toml 2>/dev/null || echo "NO_CONFIG"`;
  JSONL:20 returns `default = "dynamic"`. “Config was not read” is refuted.
- **Initial skill came from the worktree.** JSONL:15 carries the inline
  `.agents/skills/rope-grill/SKILL.md` path. Current-copy equality cannot prove
  historical freshness; stale installation remains unproven.
- **Runtime documentation was not distributed.** Before this fix, go linked
  to the Rope repo's `.rope/specs/`, while `bin/rope.js` installs only `skills/`
  and `package.json` ships `bin/` plus `skills/`. Source inspection established
  the bug independently of whether the historical agent read that file.
- **Research was parallel.** Investigation of JSONL:27–30 found three explore
  calls in one fan. Agent count alone does not establish missing coverage.
- **Frontend impact was present in the shaped scope.** JSONL:101,110 includes
  settings UI version/message changes; JSONL:241 requests `npm test` in review.
  The investigation did not establish a complete frontend full-suite result.
  Reported 4,133-test totals belong to Python, not Vitest.
- **Model evidence is bounded.** Child-session inspection reported six
  implementer sessions recording `openai-codex/gpt-5.6-luna`. Per-workflow-call
  mapping was not established; current presets do not prove historical calls.
  User declined further model-display work.
- **Error classes differ.** Workflow investigators reported missing test
  modules, stale snapshot/version assertions, and three WebUI regressions
  caught at final review and followed by a fix. These are not all harness
  bugs. Exact-match edit rejection alone also does not prove a harness defect.

## Limits / disposition

Reports disagreed about historical worktree availability; current-tree shape
claims and broad root-cause conclusions are therefore not retained as proof.
No specific Matt tweet was identified. External documentation links from the
first research pass lacked sufficient captured passages; no external-source
claim is used to justify this change. Cleanup policy is a user decision, not
an allegedly proven automatic retrieval solution.

Confirmed choices and affected ADR dispositions live in
`../issues/dynamic-docs-and-clear/quick.md`. Intermediate investigator notes
were removed from the knowledge corpus and preserved as temporary audit
artifacts; they are not additional current-rule sources.
