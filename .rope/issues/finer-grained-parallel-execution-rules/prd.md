# 并行度与验收纪律规则修订（对齐 mattpocock/skills）

## Problem Statement

对 session 01a03d5d（optimize-turn-tool-token-usage，9 切片 31 叶子）的实证分析
（`.rope/research/session-01a03d5d-dispatch-metrics.md`）发现四个规则层缺陷：

1. **软边压扁启动并发**：S1→S2、S1→S6 两条边无任何文件重叠（方法论排序），
   却按构建依赖处理，启动宽度被压到 1（本可 3）。
2. **契约票一票包干**：S2/S6 把"接口就绪"与 ~900–1200 行深度耐久化挤在同一票，
   加固返工把消费者关键路径拖长；fix 轮 diff 普遍 ≥ 原实现（2096+ vs 1318）。
3. **验收无机械门**：叶子返回的证据不全，父会话通读实现代偿（烧规划窗
   token）；规划窗在 correction 轮注入矩阵外防御性要求（防御关键词只出现在
   fix commit 标题），且跨轮设计漂移（S8 两轮互删共享模块）。
4. **粒度规则不成体系**：有 ~400 行上限但缺 demo-path 必答、下限规则
   （整体一窗装得下不该切票）与切完粒度 quiz；preset 偏离无声明要求。

上游 mattpocock/skills（pin 6654f6b6，对齐研究见
`.rope/research/mattpocock-skills-slicing-and-parallelism.md`）对上述各点均
有可抄的硬规则与量化反模式证据（横切 26 票 × 平均 20 次 agent、3/4 rework）。

## Solution

把四个已确认的决策 bundle 落进技能文本：**粒度硬规则全套**（demo-path +
fresh-context-window 上下限 + 粒度 quiz + 反模式清单）、**并发结构三件套**
（边分类软边降级 + contract-first 重切轮 + 契约票两段式）、**验收机械化三件套**
（evidence 逐行投影 + 机械返回门 + Defense Budget）、**四小项**（Human Gate
批量面板、Dispatch Header 显式声明 + research 预设变体、owned-files 持久化
归属追踪、planner bounce-rate 选型协议）。术语进 CONTEXT.md，决策记 ADR 0011。
E2E 用两个真实历史案例回放断言新规则产出。

## Contract Note

- 修订后的 rope-shape / rope-go / rope-harness-presets 技能文本含全部新硬规则，
  且 `node bin/rope.js add` 安装行为不变。
- 用历史案例回放可观察：新 shape 规则把 optimize-turn-token 的 S2/S6 判为
  两段式契约票、把 S1→S2/S6 标为 methodology-order 软边、对
  jenkins-admin-cross-owner 给出"不切票"建议；判定以 artifact 形式可核对。
- CONTEXT.md 语言区新增术语且与 ADR 0011 定义一致；ADR 0011 记录决策与
  ADR 0007 边界（返回门是证据核对，不是评审）。
- 失败可见性：回放断言失败以"期望 vs 实际判定"逐条暴露，不静默通过。

## Goals

- shape 产出的每张 slice：有行为式 Demo path、尺寸满足上下限、依赖边分类、
  契约票两段式、Required evidence 逐行引用矩阵行。
- go 派发只被 file-overlap / seam-required 边阻塞；join 是机械对照表；
  correction brief 新增验收行 = 0。
- 偏离 preset 的派发必须有一行声明；存在可落盘调研的合法预设变体。
- 用规则修订本身 dogfood：本 issue 图宽度 3 起步、链长 2。

## Non-goals

- 不改 end-of-issue review 双叶结构与 ADR 0007/0010 语义（返回门在前，评审
  仍在最后，二者不合并）。
- 不引入 merger 子角色、不改 rope.js CLI 与安装格式。
- 不做自动关票之外的新自动化（父会话已管 slice 状态）。
- 不改 harness-presets 的 offline ranking 主链（只加变体与协议）。

## Public Interface / Behavior

- `skills/rope-shape/SKILL.md` + `references/`：新增粒度硬规则、边分类表、
  两段式契约票规则、evidence 投影规则、粒度 quiz 步骤、反模式清单、
  "不切票走 rope-quick"下限路由。
- `skills/rope-go/SKILL.md` + `references/execution-rules.md`：派发就绪判定
  排除 methodology-order 边；join 机械返回门对照表格式；Defense Budget 约束
  correction brief；owned-files 持久化归属标注的使用；Human Gate 批量面板格式。
- `skills/rope-harness-presets/`：research 预设变体（可写 `.rope/research/`）、
  Dispatch Header 显式声明格式、planner bounce-rate 回放评测协议。
- `.rope/CONTEXT.md`：新增术语（Edge Classification、Two-stage Contract
  Slice、Mechanical Return Gate、Defense Budget、Granularity Quiz、
  Human Gate Panel）。
- `.rope/adr/0011-*.md`：决策记录。

## Testing Decisions

- Good test：本仓库的产品是规则文本——在约定 seam 上观察外部行为，seam 即
  "用新规则对真实输入产出的判定 artifact"（tasks.md 字段、派发判定、对照表），
  不测文本措辞本身。
- Seams under test：(1) 历史案例输入喂新 shape 规则的判定输出；(2) 伪造叶子
  summary 喂新 join 规则的 bounce 判定；(3) 越权 correction brief 喂 Defense
  Budget 的拒绝输出。
- Prior art：`skills/*/references/*-fixture.md` 的 fixture 模式；
  `optimize-turn-tool-token-usage` 与 `jenkins-admin-cross-owner` 两个真实
  issue 包作为回放语料。

## Behavior Contract

- System under test：修订后的 rope 工作流规则文本在 dry-run 中对真实/构造
  输入产出的判定行为。
- Trigger/input：shape 收到切片图与矩阵（案例 A/B 回放）；go 收到叶子返回与
  correction brief（构造样例）；harness 派发调研任务。
- Collaborators：rope.js 安装器（只验证不改动）、`.rope/upstream/` 对应记录、
  `.rope/research/` 两份证据文件。
- Observable result：切片字段齐备且判定符合新规则的 tasks.md；join 对照表与
  bounce 结论；Defense Budget 拒绝与降级记录；批量面板格式；声明式派发记录。
- Failure visibility：回放断言逐条给出"期望 vs 实际"；技能结构校验脚本失败
  即失败。
- Forbidden shortcuts：返回门写成"父会话再读一遍实现"；Defense Budget 写成
  "建议"而非硬约束；把 methodology-order 边保留为阻塞；在 Non-goals 区域
  塞入 review 结构改动。

## Architecture Impact

- Impact: required
- Trigger check：任务直接修订 ADR 0008 管辖的派发/图语义与 ADR 0007 管辖的
  验收边界；新增术语进 CONTEXT.md Language——命中"cites or depends on an
  ADR"与"seam semantics change"。
- Relevant decisions:
  - ID: D1
    Source: `.rope/adr/0007-graph-driven-go-single-review.md`
    Decision status: active
    Scope: 全issue唯一评审门；per-slice review 不存在
    Decision disposition: inherit
    Inherited invariants:
      - 机械返回门是**证据核对**（evidence reconciliation），不是代码评审；
        不得在 join 引入第二个评审点
    Affected public interfaces: go 阶段 join 输出格式（新增对照表）
    Forbidden shortcuts:
      - 把返回门实现为父会话重读实现或 rerun 测试
    Required evidence: execution-rules.md 文本 + ADR 0011 边界条款
    Applies to: Slice 3 | issue
    Documentation update: added-new（边界写入 0011）
    Unresolved conflicts: none
  - ID: D2
    Source: `.rope/adr/0008-slice-ready-worktree-execution.md`
    Decision status: active
    Scope: slice-ready 调度、串行合并、worktree 模式
    Decision disposition: extend
    Inherited invariants:
      - 串行合并队列不变；overlap 票允许、成本推迟到 merge queue
      - 派发就绪 = 无未解决 blocker 的 frontier
    Affected public interfaces: 就绪判定（blocker 边分类后 methodology-order
    不计入阻塞）；merge 顺序提示
    Forbidden shortcuts:
      - 用它跳过 file-overlap / seam-required 边
    Required evidence: execution-rules.md 派发规则 diff
    Applies to: Slice 3
    Documentation update: added-new（0011 承载扩展语义）
    Unresolved conflicts: none
  - ID: D3
    Source: `.rope/adr/0010-parallel-two-leaf-end-of-issue-review.md`
    Decision status: active
    Scope: scanner/reviewer 双叶、verdict 聚合
    Decision disposition: inherit
    Inherited invariants:
      - 双叶角色、aggregation 机械性不因返回门改变
    Affected public interfaces: none
    Forbidden shortcuts:
      - 用返回门对照表替代 end-of-issue review
    Required evidence: 文档一致性检查
    Applies to: issue | verify
    Documentation update: no-new-decision
    Unresolved conflicts: none
- New decision candidate: **ADR 0011「Edge Classification & Acceptance
  Gates」**——单一 ADR 承载：边分类三类语义与软边降级、契约票两段式、
  Required evidence 投影、机械返回门、Defense Budget。风险：低（规则文本
  层，可回滚）；rationale：四机制共享同一动机（并行度与返工治理），拆开
  会碎片化且互相引用循环。
- Constraint Bundle:
  - Decision sources: D1–D3（路径见上）+ 上游对齐研究
    `.rope/research/mattpocock-skills-slicing-and-parallelism.md` +
    会话实证 `.rope/research/session-01a03d5d-dispatch-metrics.md` +
    上游 harvest 政策 `.rope/upstream/mattpocock-skills/`（human-gated，
    本 issue 即该 gate 的批准产物）
  - Decision statuses: active × 3
  - Scope: S1→D1/D2/D3 定义；S2→粒度/边分类/两段式/投影（D2 扩展）；
    S3→返回门/Defense Budget/面板（D1 边界 + D2 扩展）；S4→预设变体与协议
  - Invariants: ADR 0007 评审唯一性；ADR 0008 串行合并；上位矩阵是验收
    行的唯一来源
  - Public seams: 判定 artifact（tasks.md 字段 / join 对照表 / 拒绝记录）
  - Forbidden shortcuts: 见各 D 条目
  - Acceptance evidence: e2e 回放断言 + 票级 fixture 检查 + end-of-issue
    review
  - Open conflicts: none

## References

- Research: `.rope/research/session-01a03d5d-dispatch-metrics.md`
- Research: `.rope/research/mattpocock-skills-slicing-and-parallelism.md`
- Upstream: `.rope/upstream/mattpocock-skills/`（pin 6654f6b6）
- ADR: `.rope/adr/0007-graph-driven-go-single-review.md`、`.rope/adr/0008-slice-ready-worktree-execution.md`、`.rope/adr/0010-parallel-two-leaf-end-of-issue-review.md`

## Open Questions / Human Gates

- none（四 bundle 决策、单一 ADR、worktree setup 免构建校验、双案例回放
  均已在 shape 会话确认）

## Gate Decisions

- Gate: 无 agent-with-gate 项
- Decision: not-required
- Scope: 全部 E 项为本地只读 dry-run（案例回放、fixture 检查）
- Risk: 无重启/部署/共享写/生产操作
- Pass criteria: —
- Failure report: —
- Forbidden out-of-scope actions: —
