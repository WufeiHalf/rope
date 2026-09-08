---
mode: agent
---

# Workflow Execution Mode（配置驱动的 dynamic 执行形态）

## Problem Statement

历史背景：旧 `mode: dynamic`（ADR 0003 时代）语义是**模型驱动并行派发**——父 LLM 读图逐叶 spawn、自己收拢。无脚本 runner、无机械 gate、无 resume，宽度全靠父会话承担，因此 shape 只能保守拆、并行语义从未真正落地。**真 dynamic 是脚本驱动而非模型驱动**：确定性 JS 编排 + gate 结构化验证 + worktree 隔离 + 前缀缓存 resume，模型只存在于叶子与评审。本包确立新语义并显式废弃旧语义（shape 的胆量是基建的函数：模型驱动基建配不上扇形宽度，脚本驱动才配得上）。

三类同构缺陷证明 rope 的执行层有两个结构性盲区：

1. **组合根只验生命周期不验行为**：legal-finance-ai-employees E4（组合从未拼起，浏览器人工走查才发现 3+1 批）；dingtalk v1.6.2（`reply_queue` seam 迁移后 `dingtalk_stream_assembly` / `workbench_intake_facade` 两处残留旧接线，E1"真实 bootstrap"跑到连接初始化即停 + grep 的不变量选错，AttributeError 逃逸线上 6 天 82 次）。
2. **seam 迁移的爆炸半径跨文件，vertical 切片按文件分界**：拥有缝的切片不拥有消费者，残留清扫无人负责（钉钉案例中两个断裂文件不在任何切片 owned files）。
3. **共享账本并发写冲突**：workflow 复跑实验中 5 叶同写 map.md 必然冲突（`.rope/research/dynamic-workflow-replay-legal-finance.md` §4）。

同时，dynamic workflow 复跑实验已证明确定性 JS 编排可行且收益明确（父上下文 <6% vs 385 回合 4 compaction；resume 前缀缓存 0 token 重放；EOI 新眼睛抓到原 run 漏网的 ACL 读侧绕过）。当前缺一个统一入口让全流程按配置切换执行形态，并解锁扇形 fan-out。

## Goals

- `~/.rope/config.toml` 用户级配置：`execution.default = dynamic | agent`，及 fan 预算上限
- 模式解析顺序：**issue prd.md frontmatter `mode:` > ~/.rope/config.toml > 默认 agent**
- 宿主探测软降级：mode=dynamic 但宿主无 SubagentWorkflow（如 codex）→ 软降级 Agent 派发，票包结构不变、扇窄化执行
- 扇形 fan 声明进票包：`fan: research width≤N | panel ×N | fix-storm ×N`，仅 dynamic 模式全量开扇
- L1/L2/L3 gate 菜单：L1 切片聚焦测试；L2 集成不变量（**分支全合 AND 测试绿**双断言）；L3 组合根冒烟（真装配 + 事件进/可观察行为出，mock 只许放外边界）
- shape 规则：组合根枚举（触及 ≥1 个组合根 → 生成 L3 验收行，无 harness 才长成切片）；seam 迁移切片强制"消费者清扫"行（旧符号 grep/import 图断言）；共享账本（map.md 类）叶子返回 evidence 行、集成方统一追记
- E4/人工走查从"发现层"降级为"终审抽检"

## Non-goals

- graph2workflow 编译器（tasks.md 图 → .js 脚本，数据稳后另立 issue）
- pi-custom-subagent 无头 stale-ctx 修复（用户明确只用有头模式）
- codex/agy 原生 workflow runner 适配（靠软降级覆盖）
- 修改 grill/shape 的判断回路（对话层保持父会话；只有执行层扇叶化）

## Evidence Cases（预注册验证用）

| 案例 | 缺陷类 | 规则命中 |
| --- | --- | --- |
| legal E4 | 组合从未拼起 | L3 真装配冒烟当波抓 |
| dingtalk 1.6.2 | seam 迁移残留 + E1 不变量选错 | 消费者清扫 grep `channel.reply_queue` 直接抓；L3 灌 `/clear` 假 transport 事件直接抓 |
| workflow 复跑 map.md | 共享账本并发冲突 | evidence 行返回规则 |

## Architecture Impact

- D1 added-new：ADR 0014 workflow-execution-mode（**脚本驱动确定性编排取代 ADR 0003 模型驱动并行语义**：图仍是 tasks.md 真相源，workflow 脚本是执行器；shape 大胆度的解锁依据是基建而非判断力）
- D2 updated-existing：`.rope/specs/dynamic-workflow-mode.md` 重写为 workflow-execution-mode 契约（`mode: dynamic` 字段位置沿用，**语义重定义为脚本驱动**；旧“模型驱动并行”语义显式废弃，含旧 non-goal"不配置化"的修订）
- D3 updated-existing：`.agents/skills/rope-shape/SKILL.md`（组合根/fan/L3/清扫/mock 边界规则）
- D4 updated-existing：`.agents/skills/rope-go/SKILL.md`（workflow 模式段 + gate 菜单）
