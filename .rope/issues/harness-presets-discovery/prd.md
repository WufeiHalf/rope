# harness-presets 发现在化重构：任意宿主可自适配生成角色预设

## Problem Statement

`rope-harness-presets` 把 pi 的路径与文件格式硬编码在 SKILL.md 与
references 里，Host support 表对其他宿主一律 `writer_not_implemented`
硬拒。同事在 codex 里调用该 skill，codex 回复"这是给 pi 配置的维护规则，
不适用于当前环境"。Rope 的 leaf 角色预设因此带不出 pi。用户决策
（2026-09-08 grill）：不做任何写死的适配器，让运行在对应 harness 里的
LLM 自己探测宿主生态、自己写宿主原生方案。

## Solution

把 skill 重构为**发现式、宿主中立**的生成流程：三角色契约
（implementer/reviewer/explore）与 manifest 消费接口不变，生成侧改为
"运行中的模型自己探测当前宿主"——识别宿主 → 探测其模型目录与原生
agent/subagent 机制（本地探测 + 官方文档检索，被墙走
`http://127.0.0.1:8118` 代理）→ 按角色契约写宿主原生模板 → 落
`~/.config/rope/harness/<host>.json` manifest（含来源与置信度）→ 报告。
pi 的现有知识降级为参考示例（worked example），不是硬编码分支。消费端
（rope-go/verify）接口不变；宿主无 subagent 机制时按既有软降级契约记录
能力缺口，不硬阻塞。

## Contract Note

- 在 codex 里调用 rope-harness-presets：不再被"pi 专属"拒绝，而是得到 codex 原生格式的 rope 角色 agent 模板与 `~/.config/rope/harness/codex.json`
- 在 pi 里重跑该 skill：产出与现状等价（pi 行为零回归）
- 探测失败或宿主无 agent 机制：显式能力缺口报告或软降级记录，绝不假装成功
- rope-go/verify 的 manifest 消费接口与缺失软降级路径不变（无需改动即可受益）

## Goals

- skill 文本宿主中立：发现流程可指导任意 harness 里的模型完成自适配
- pi 零回归（重跑产出等价）
- 真机验证：本机 agy 1.1.23（8118 代理）与 codex 0.153.4 实跑，tmux 隔离、最小仓库排除 AGENTS.md 等 confounder

## Non-goals

- 不为任何宿主写死 adapter 分支（用户明确决策）
- 不改 rope-go/verify 的 manifest 消费接口
- 不引入自动刷新（manual-only 既有决策不变）
- 不把同事环境验证作为交付门（smoke 可选）
- 不新增第四角色、不改三角色契约内容

## Public Interface / Behavior

- rope-harness-presets 在任意宿主可运行；产出物 = 宿主原生角色模板文件（路径/格式由宿主生态决定）+ 用户级 manifest `~/.config/rope/harness/<host>.json`
- manifest schema：`host` 字段泛化为实际宿主名；其余字段（role→agent/model/thinking、sources、confidence、generated_at、skill identity）沿用现有结构
- 失败路径：宿主识别失败 / 模型目录为空 / 写路径不可写 → 显式报错并停，不写部分产物假装成功

## Testing Decisions

- 本仓无测试树（routes Test roots: Unknown）；验证 = 结构检查（frontmatter/锚点/引用完整性，quick tier）+ pi 重跑等价对比 + 真机 E2E（e2e.md）
- Seams：①skill 文本结构 ②manifest/agent 产出内容（pi 等价）③宿主实跑行为（e2e）
- Prior art：`references/discovery-fixtures.md` 现有 dry 检查模式

## Behavior Contract

- System under test: rope-harness-presets skill 在不同宿主下的预设生成行为
- Trigger/input: 用户在宿主 X（pi / codex / agy / 未知宿主）里调用该 skill
- Collaborators: 宿主的模型目录与 agent/subagent 机制、role-schema 三角色契约、manifest 消费端（rope-go/verify）
- Observable result: 宿主原生角色模板文件 + `<host>.json` manifest + 含来源与置信度的报告
- Failure visibility: 探测/写入失败 → 显式报错并停；宿主无 subagent 机制 → 能力缺口记录 + 软降级提示
- Forbidden shortcuts: 只把报错措辞改友好但不产出文件；"宿主中立"文本里残留 `~/.pi/` 硬路径（示例标注除外）；把 pi 分支换个宿主名复制充当适配；只更新 `.agents/` 副本不同步 `skills/` bundled 副本

## Architecture Impact

- Impact: required
- Trigger check: 改动物是 CONTEXT 术语 Harness Profile / Role Preset 的落地机制（宿主预设生成），触及公共 skill 行为与消费端契约
- Relevant decisions:
  - ID: D1
    Source: `.rope/CONTEXT.md`（术语 Harness Profile / Role Preset）
    Decision status: active
    Scope: leaf 角色→宿主原生预设的绑定、用户级 manifest、manual-only 刷新
    Decision disposition: extend（生成机制从 pi 硬编码扩为发现式；绑定物/manifest/manual-only 不变量不动）
    Inherited invariants: 宿主原生模板是 spawn 配置的唯一源；写用户级目录；manual 刷新；skill 不硬编码持久模型清单
    Affected public interfaces: rope-harness-presets 产出物；manifest `host` 字段
    Forbidden shortcuts: skill 内出现宿主专属硬分支/模型表
    Required evidence: pi 等价重跑 + codex/agy 真机 E2E
    Applies to: issue
    Documentation update: updated-existing（CONTEXT 词条在收尾同步"发现式生成"）
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/adr/0007-graph-driven-go-single-review.md`
    Decision status: active
    Scope: end-of-issue review 两叶经 preset 派生
    Decision disposition: inherit（消费接口不变，无文本改动需求）
    Inherited invariants: preset 缺失软降级继续可用
    Affected public interfaces: none
    Forbidden shortcuts: 借机改 review 派发逻辑
    Required evidence: review（通读确认无接口漂移）
    Applies to: issue
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D3
    Source: `.rope/adr/0011-edge-classification-and-acceptance-gates.md`
    Decision status: active
    Scope: research 模式 explore 叶、declared dispatch deviation
    Decision disposition: inherit（S1 调研切片按 research 模式派发）
    Inherited invariants: research 产物只落 `.rope/research/**`
    Affected public interfaces: none
    Forbidden shortcuts: 调研叶改代码
    Required evidence: S1 产物路径合规
    Applies to: Slice 1
    Documentation update: no-new-decision
    Unresolved conflicts: none
  - ID: D4
    Source: `.agents/skills/rope-harness-presets/SKILL.md` Soft-degrade contract 段
    Decision status: active
    Scope: manifest/agents 缺失时 go/verify 软降级（generic worker + preset_missing，不硬阻塞）
    Decision disposition: extend（扩到"宿主无 subagent 机制"场景：能力缺口记录同走软降级）
    Inherited invariants: 不硬阻塞、不自动刷新、显式记录
    Affected public interfaces: SKILL.md 消费者契约段
    Forbidden shortcuts: 无机制宿主直接硬拒（回到现状）
    Required evidence: fixtures 干检查 + review
    Applies to: issue
    Documentation update: updated-existing
    Unresolved conflicts: none
- New decision candidate: none（生成机制变化按 extend 处理；若 end-of-issue 评审认定"发现式生成"属范式级变化，再升级为新 ADR 讨论）
- Constraint Bundle:
  - Decision sources: D1 `.rope/CONTEXT.md`；D2 `.rope/adr/0007`；D3 `.rope/adr/0011`；D4 skill 内 soft-degrade contract
  - Decision statuses: active / active / active / active
  - Scope: issue-wide（D3 限 Slice 1）
  - Invariants: 三角色契约内容不变；manifest 消费接口不变；manual-only 刷新；pi 零回归；宿主原生模板是 spawn 配置源
  - Public seams: skill 文本结构；manifest 产出；宿主实跑行为
  - Forbidden shortcuts: 见各决策与 Behavior Contract
  - Acceptance evidence: pi 等价对比输出、结构检查（quick tier）、codex/agy 实跑记录（e2e.md）、review 通读
  - Open conflicts: none

## References

- Research: `.rope/issues/harness-presets-discovery/map.md`（S1 产物 `.rope/research/host-agent-mechanisms.md`）
- Grill 共识记录：本会话 2026-09-08（同事 codex 案例、v3 发现式决策、验证方案）
- 现状文本：`.agents/skills/rope-harness-presets/SKILL.md` 及 `references/`

## Open Questions / Human Gates

- E2E 实跑需写入本机 codex/agy 用户级配置目录（local-write）→ gate，见 e2e.md E1/E2
- codex 版本较旧（0.153.4），是否先升级由执行时决定（升级本身是用户环境变更，gate 范围内）

## Gate Decisions

（见 e2e.md E1/E2，shape 时请求批准）
