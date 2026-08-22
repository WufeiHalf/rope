# Graph-Driven Go E2E

## E1 语义扫尾 + 安装同步（agent）

Architecture evidence: D1/D2/D3 —— 旧指令清零、新指令落位、安装面一致。
Executor: agent
Risk: local-write（本仓库文件 + .agents/skills 安装）
Gate Decision: not-required
Approved Action: n/a
Scope: 本仓库
Command or Steps:
- `grep -rn "Review: required|review: batch|mode: dynamic|per-slice review|Batch Review" skills/ README.md`
  —— 除 ADR/研究文档的历史引用外零命中。
- `node bin/rope.js add --target .agents/skills` 后
  `diff -r skills/rope-go .agents/skills/rope-go`（shape/verify/harness-presets
  同理）—— 零差异。
- 每个 `git diff --stat` 中的 SKILL.md 人工过 read-through checklist：
  description 完整、单一真源、无 no-op 句。
Pass Criteria:
- 三项全绿；无未预期脏文件。
Failure Report:
- grep 命中清单 / diff 输出记录于此。
Forbidden Out-of-Scope Actions:
- 发布、远端写。
Result:
- agent_passed（2026-08-22）：grep 终扫零残留（rope-go 两处命中均为
  "no longer exists" 说明性文本）；`rope add` 同步后 skills/ 与
  .agents/skills/ 四个改动 skill diff 为零；README 遗留段在扫尾轮修正。

## E2 终稿走查（用户）

Architecture evidence: Matt-like 文风与普世表述（不绑定 agent-workbench）。
Executor: user
Risk: human-judgment
Gate Decision: user-run
Approved Action: 用户翻阅最终 diff 与 ADR 0007
Scope: 本地
Command or Steps:
- 通读 skills 四个 SKILL.md 的 diff 与 ADR 0007；确认文风与语义。
Pass Criteria:
- 用户认可。
Failure Report:
- 用户提修改点，回 issue 修整。
Forbidden Out-of-Scope Actions:
- n/a
Result:
- pending
