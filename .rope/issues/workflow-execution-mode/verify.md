# workflow-execution-mode — Issue Verify

2026-09-08 · lean 档 EOI（ADR 0004 风险分层：全 docs issue——4 个文档提交、零运行时代码；E2E 全部 agent 可执行且已过 + 1 项 user-confirmed；父自走查，未派双叶）

## Matrix 走查（真实入口 = 技能文本 / spec / ADR / 配置 / 安装副本）

| 行 | 证据 | 结果 |
| --- | --- | --- |
| R1 dynamic→workflow，票包零形态字段 | rope-go §Workflow execution 解析三分支；模板唯一 `mode:` 命中是 ADR 0012 `Execution mode: worktree\|shared`（宿主能力记录，非形态字段） | PASS |
| R2 缺失/agent→父派发现状 | rope-go "Absent or `agent` ⇒ parent dispatch as above" | PASS |
| R3 无 runner 软降级 + map.md 记录 | rope-go L105 "soft-degrade to parent dispatch…record in `map.md`"；spec 解析伪码同 | PASS |
| R4 seam 迁移消费者清扫行 | shape SKILL "Seam-migration sweep" 规则（consumer-sweep ×2） | PASS |
| R5 组合根 + L3 行 + harness 缺失才成片 | shape SKILL "Composition roots (ADR 0014)" + 模板 "### Composition roots block" | PASS |
| R6 L2 双断言 | rope-go "all input branches merged AND …green"；spec L2 节；ADR 0014 Decision 3 | PASS |
| R7 共享账本 evidence 行 | shape "Shared ledgers" 规则 + spec Shared ledgers 节 | PASS |
| R8 mock 只放外边界 | shape ×3 / go ×1 / spec ×2 处"outer boundary"；守卫含 "fiction validation" | PASS |
| R9 安装一致性 | rope 仓库 bundled↔.agents diff 空；agent-workbench 三 worktree 安装副本 diff 空（c5fb3277/fbdbbd70/f9b18354） | PASS |

## 结构与状态

- 树干净；本 issue 提交链 `724ae65`→`c4d41a9`（shape 2 + go 3 + 文书 2 + verify 1）。
- E2E 终态：E1 agent_passed（13 断言）· E2 agent_passed（安装冒烟）· E3 user_passed（用户确认钉钉 1.6.2 反推成立）。
- Architecture Impact：D1 added-new / D2-D4 updated-existing，无 pending-finish。

## 备注（如实记录，不回填）

- `prd.md` 无 Contract Note 段——shape 阶段以 Behavior Matrix + 执行问句确认替代了该节；此处记录，不伪造回填。
- 采纳即生效：`~/.rope/config.toml` `default = "dynamic"` 当日注册；技能已部署 agent-workbench 三 worktree。下一次任一该仓库 go 将首次真实走 dynamic 解析——首个真实 dynamic run 建议回记 `.rope/research/` 作为 ADR 0014 的运行数据。

## Verdict

PASS
