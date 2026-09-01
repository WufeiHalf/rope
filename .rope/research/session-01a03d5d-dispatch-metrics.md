# Session 01a03d5d Dispatch Metrics — 并发、fix round 与模型归属

> Grill 结论（2026-08-27，全部确认）：(1) 以一个规则修订 issue 包落地；
> (2) 粒度硬规则采纳 Matt 全套；(3) 并发结构三件套全采（软边降级 +
> contract-first 重切轮 + contract 票两段式）；(4) 验收机械化三件套全采
> （evidence 投影 + 机械返回门 + Defense Budget）。随包默认附带四小项
> （Human Gate 批量面板、Dispatch Header 显式声明、owned-files 持久化归属
> 追踪、planner bounce-rate 选型实验协议）。证据见本文件与
> mattpocock-skills-slicing-and-parallelism.md。

## Question

Issue `optimize-turn-tool-token-usage`（agent-workbench，9 slices，worktree
mode，ADR 0007–0010 规则下的第二次真实运行）。用户观察到：(a) 切片本可更细、
并发更高；(b) 大量 fix round 疑似规划窗模型 gpt-5.6-sol 过度思考导致"过度兜底"
的修改；(c) 只读子代理应使用 explore 类 preset。本笔记以 session 一手记录核对。

Source: session jsonl
`~/.pi/agent/sessions/--home-wufei-orca-workspaces-agent-workbench-feat-optimize-turn-tool-token-usage--/2026-08-26T09-19-03-*.jsonl`
（主会话 1570 messages，4 次 compaction）+ 31 个 worktree 叶子 session
（`--tmp-pi-agent-*` 目录，2026-08-26/27 时间窗）。

## Verified Facts

### execution-timeline-go-phase

Fact: go 阶段（13:27 用户下令 → 次日 01:35 S9 完成，中间含 ~8.4h 授权等待）
共 21 个 implementer spawn（9 主切片 + 11 个 fix round + 1 merge leaf +
1 resume），活跃执行约 3h20m。实测并发峰值 3（14:13–15:25，S3‖S7‖S8），
多数时段 2（S2‖S6、S4‖S5）。启动报告声明 planned = max = 3，实际达到过 3。
Slice-ready 无 wave barrier 生效：S3 在 S6 fix 未完成时已提前派发（14:05），
冲突按规则转为专门 merge leaf（14:07 `sqlite_runtime.py` 冲突，14:12 合并）。

### leaf-model-attribution

Fact: 全部 31 个 worktree 实现叶子 session 的 model_change 记录均为
`opencode-go/muse-spark-1.2-contributor`（rope-implementer preset 声明的模型，
thinking: medium）。没有任何实现叶子跑在 gpt-5.6-sol 上。
规划窗本身：09:19 起 aio/gpt-5.6-sol；次日 02:08 compaction 后切 enterprise/glm-5.3。
Source: 每个 `--tmp-pi-agent-*` session 首个 model_change 条目；主会话 model_change。
Stability: high（session 文件一手记录）。
Implication: fix round 的代码由 muse-spark 叶子编写；"sol 过度思考直接产生兜底代码"
不成立。sol 的影响路径只有两条：brief 内容 + join 时验收判断。

### fix-round-taxonomy

Fact: 对 13 个 fix round 的触发原因逐条归类（以父会话原文为证）：

| 类 | 轮次 | 例证 | 根因 |
| --- | --- | --- | --- |
| A 票据内部深语义多轮收敛 | S2×1, S6×2, S7×2, S9×2 | S6 staging/digest 晋升/并发 loser 三轮才闭合；S9 基准算术两轮 | 单票承载分布式语义（状态机、原子发布、并发协议），超出单叶一次收敛能力 |
| B 跨切片接缝晚发现 | S3×2 | carry-forward 与 S2 ordering guard 的交互；role/toolset 兼容横跨 S3+S7+S8 | 接缝契约未前置成独立小票 |
| C 集成接线漏检 | S8×3(+resume) | "修正原生工具真实接线""收口原生工具接线"——形态正确但未接入真实 factory 路径 | 垂直票跨 schema/factory/executor 三层，叶子自检无法证明接线 |
| D 规格→brief 投影缺口 | S1×1 | "PRD 明确要求 model-facing size 与最近 tool name"，但 tasks.md S1 的 Required evidence 未列出 | 票据字段不是从 PRD 行逐条投影的 |
| E 规划窗亲自验证吸收 | （非 spawn，串行时段）| 14:03 父会话通读 `mark_completed` 实现 + 临时 detached worktree 复跑 suite；每次 merge 后父会话亲自跑 assembled focused regression | 验收判断没有机械化的返回门，父会话代偿 |

Implication: A+B+C ≈ 12/13 轮指向**票据粒度与返回门缺失**，不是叶子推理质量问题。
D 是 shape 缺陷被父会话在 join 时补救。E 是真实的 sol 成本，但它消耗的是规划窗
token 和 merge 队列时延，并未制造多余代码轮次。

### fix-diff-volume-defense-injected-at-correction

Fact: 各轮 fix 的实际 diff 体量普遍 ≥ 基础实现，且防御性语义关键词
（fail-closed、durable staging/ready publication、crash-recoverable、
stale/ordering guards、sanitized errors、canonical digest、bounded degraded）
只出现在 fix commit 标题，不出现在对应 feat commit：

| 切片 | 基础实现 | fix 轮体量 |
| --- | --- | --- |
| S1 | 360+ | 563+/104− |
| S2 | 550+ | 919+/124− |
| S6 | 768+ | 463+/228−、1177+/174− |
| S8 | 517+ | +874/−609、+147/−604（fix2 删除 fix1 新建的 shared module 结构）|
| S5 | 674+ | +765/−178 |

Source: `git log --since='2026-08-26 13:00'` 本地仓提交短统计
（feat/fix 对：7cbbad59/7512a9b7、a9682cc5/1b9ab3ab、cf6334d2/ee4a3f51/7e748cc9、
cd6eb383/1d002e0a、dbb01f25/a6ebb4f9/5de4b751、5d05e76c/9f9425da/c4fbe422、
aeaa20cb/b62be075、63b820e8/1f662f7f/dd2a1053）。
Stability: high。
Implication: 防御性验收是在 correction 轮由规划窗注入并放大的；叶子（muse-spark）
忠实执行不断变化的验收标准，并为跨轮设计约束漂移买单（S8 fix1 建 shared module、
fix2 改为 composition-owned 并删除）。用户假设「sol 过度 defended 导致 fix 轮过多」
与该证据相容。但注意其中约半数 durable 语义确属 Behavior Matrix 要求的崩溃恢复/
并发幂等行为——真正的问题是这些语义被整体塞进过肥单票、再以无预算的验收加码逐轮
逼近，而非叶子自作主张加码。

### soft-blocking-edge

Fact: 依赖图 S1→{S2,S6} 两条边无文件重叠（S1 owns telemetry/report；
S2 owns sqlite_runtime/session_summary_*；S6 owns 新 artifact 模块 + catalog），
属方法论排序（先装计量再动实现）而非构建依赖。若拆除，启动并发从 1 → 3。
最宽 antichain 为 3（S3‖S7‖S8 已受 S3↔S2 构建依赖约束，是真依赖）；
最长链 5 深度由"接口消费按整票实现就绪排队"造成：S3 需要 S2 的 store 公共面，
但 S2 把 schema、service 状态机、原子发布打包为一票。
Source: tasks.md owned-files 对照实现期实际触碰文件（冲突出现在未列入 S6 owned
files 的 `sqlite_runtime.py`）。
Implication: 可提升并发的三个结构杠杆：软边降级、contract-first 细分、owned-files
静态追踪缺口。

### hidden-hotspot-file

Fact: S6 声明的 owned files 不含 `sqlite_runtime.py`，但实现必须落 DB migration，
与 S2 在该文件相撞，触发一次 merge-conflict leaf（14:07–14:12）。shape 阶段
对持久化流向没有做静态追踪。
Implication: owned-files 声明需要一个"持久化写入归属"检查，热文件要么标注串行独占，
要么用 adapter 让消费者不碰 owner。

### human-gate-stall

Fact: 16:44 → 次日 01:03 管线停在一个修复授权 gate 上约 8.4h（"我授权你修复"
"s5是干什么？为什么需要授权"）。gate 描述未让用户快速理解范围与选项。
Implication: Human Gate 应批量呈现 + 说明具体切片名与影响面，避免静默停摆。

### explore-dispatch-deviation

Fact: 会话中两次出现非预期 agent type：主会话内父代理曾用 general-purpose 做
调研被用户纠正（09:33 "你派生的不是rope-explore!"）；本研究任务同样因需要
web+write 能力而没有走 rope-explore preset。CONTEXT.md Harness Profile 尚无
"type≠preset 必须声明理由"的条款。（rope-explore preset 工具集无 web search 与
write，需要外部调研并落盘的任务无法用它承载。）
Implication: 偏离 preset 的派发应有显式声明格式，或者为"需要写文件的调研"定义
合法角色变体。

### cross-issue-finer-cut-candidates

Fact: 周二（08-25）以来新规则共推进 4 个 issue
（git add 时间为准）：jenkins-admin-cross-owner、optimize-turn-tool-token-usage、
fix-summary-turn-streaming、human-intake-native-vision-direct-image。逐个评估
「基建票可再拆细以解锁并行」：

| issue | 图结构 | 可更细的基建票 |
| --- | --- | --- |
| optimize-turn-tool-token-usage | 宽度3、链长5 | S2/S6 存储状态机各含 ~900-1200 行耐久化重构；若拆为 thin-seam 版先行 + hardening 后行，hardening 可与消费者并行跑 |
| fix-summary-turn-streaming | 宽度2、链长2，F1→{F2,F3} | 缺一张流事件形状薄契约票（SSE 协议+卡片事件词表）；若有则三道从 t0 并行 |
| jenkins-admin-cross-owner | 2 票串行 | 无意义：整变更装得进一个 context window，按上游下限规则甚至不该用票据 |
| human-intake-native-vision-direct-image | S3/S4 本就 blocked=none，启动宽度 3 | 已达标 |

Source: 各 issue tasks.md Slice Graph 与 Kind/Blocked-by 字段。
Stability: high。
Implication: 用户直觉成立且有边界——病灶集中在 storage/stream 类 contract 票
「一票包干」：接口就绪与深度耐久化挤在同一票里，后者数轮返工把消费者关键路径拖長
（S2+S6 的 fix 体量 2096+ vs 基础 1318）。修法是把 contract 票强制分为
[薄接口] 与 [加固] 两张，加固票不阻塞消费者；配 owned-files 迁移归属唯一化
避免 sqlite_runtime.py 类二次冲突。另注意反向边界：过小变更（jenkins-admin）
按 context-window 下限规则根本不该切票。

## Assumptions

- 用户假设（部分证实）：规划窗模型影响 orchestration 行为质量——sol 在 grill/shape
  选定深存储契约、在 join 验收注入防御性加码并伴随设计约束漂移；同 session
  02:08 切换 glm-5.3 后的 F-issue 阶段并行纪律更好，但样本小未做对照，不下因果结论。
  廉价对照实验：同一 issue 包向多个候选 planner 回放调度/验收决策（离线 bounce-rate
  评测），作为 harness preset 规划窗选型依据。
- d6b0985a（pi-agent: 单文件 +3183）疑似状态/生成物异常入库，来源未逐一核对。

## Implications for Rope（候选优化，未确认决策）

1. **Edge Classification**：shape 对每条 blocking 边标注类型
   {file-overlap, seam-required, methodology-order}；methodology-order 不阻塞
   派发，只在 merge 优先级里表达。
2. **Contract-first 细分杠杆**：宽度 < 2 或最长链 ≥ 4 时强制做一轮
   seam-splitting 重切尝试（把"公共接口"提前为薄票，实现细节平行跟进）。
3. **Return Gate 机械校验**：叶子 summary 必须把 Required evidence 每条映射到
   粘贴的命令输出；join 验收退化为对照表而非重新审读实现（消解类 D/E）。
3b. **Defense Budget**：durable/并发类深语义要么独立成小票，要么在票据上标注为
   非阻塞 note——禁止规划窗在 correction 轮首次引入矩阵没有的行为要求；加码必须
   回 shape 重切或显式降级（防"验收标准中途膨胀"）。
4. **Owned-files 持久化归属追踪**：shape 时追持久化/config 写入流，预判跨票
   热文件并在图上标注高冲突边。
5. **Human Gate 批量面板**：gate 一次性列全（哪个切片、要授权什么、影响面），
   其余 lane 是否继续要显式说明。
6. **Dispatch Header 显式声明**：type/model ≠ preset 时必须在派发记录里给一行
   理由（host 能力缺什么）；或增设可写 `.rope/research` 的调研类预设。
