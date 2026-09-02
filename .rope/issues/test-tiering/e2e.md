# Test-Cost Tiering E2E

## E1 Installer real-entrypoint smoke

Architecture evidence: ADR 0013 (public skill texts reach installed copies unchanged); B8
Executor: agent
Risk: local-readonly (writes only to a disposable /tmp target)
Gate Decision: not-required
Scope: /tmp/rope-tier-smoke only; no other install targets (user directive)
Command or Steps:
- `node bin/rope.js add --target /tmp/rope-tier-smoke`
- installed `rope-go/SKILL.md` contains the baseline ladder wording; installed `rope-go/references/execution-rules.md` contains the Test tiers contract; installed `rope-shape/SKILL.md` contains the Test-tiers check
- `diff -r skills/rope-go .agents/skills/rope-go` and same for rope-shape → clean
Pass Criteria:
- installer exits 0; all three text greps hit; both diffs empty
Failure Report:
- paste installer output, grep misses, diff output
Forbidden Out-of-Scope Actions:
- installing to user-level or any other project skill directory
Result:
- pending
