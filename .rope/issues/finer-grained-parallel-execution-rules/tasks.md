# 并行度与验收纪律规则修订 Tasks

## Behavior Matrix (issue behavior spec — BDD)

| Behavior (Given/When/Then where it helps) | Applies? | Verified at |
| --- | --- | --- |
| B1 Given 新 shape 产出的 tasks.md，When 检查任一 slice，Then 每张 slice 含 Demo path 且答案为可独立演示的行为（非层名） | yes | e2e E1 + review |
| B2 Given 变更整体估算装得进一个 fresh context window，When shape 完成，Then 给出"不切票/走 rope-quick"建议而非生成多票包 | yes | e2e E4 |
| B3 Given 切片图宽度 <2 或最长链 ≥4，When shape 定稿，Then 存在 seam-splitting 重切尝试记录或"为何不可"理由 | yes | e2e E1（案例A 链长5 触发） |
| B4 Given 切完的图，When 粒度 quiz 执行，Then 用户被问 太粗/太细/blocker 真实性/合或拆，批准后才定稿 | yes | ticket TDD(S2) + review |
| B5 Given 无文件重叠且非接缝消费的依赖边，When tasks.md 定稿，Then 该边标注 methodology-order 且 go 不因它阻塞派发 | yes | e2e E2 |
| B6 Given Kind=contract 的票含深度耐久化/并发语义，When shape 定稿，Then 呈现两段式（薄接口票+加固票）且加固票不被消费者 Blocked | yes | e2e E1 |
| B7 Given 叶子返回 summary，When join，Then 每条 Required evidence 对照到粘贴命令输出；缺项即 bounce 至对应条目（机械对照） | yes | ticket TDD(S3) + review |
| B8 Given correction brief 试图引入矩阵外验收行，When go 审查，Then 拒绝并要求回 shape 重切或显式降级为非阻塞 note | yes | ticket TDD(S3) + review |
| B9 Given 多个挂起 Human Gate，When go 呈现，Then 一次批量面板列出（受影响切片/授权内容/影响面） | yes | ticket TDD(S3) + review |
| B10 Given shape 执行持久化归属追踪，When tasks.md 定稿，Then 跨票热文件在图上标注且迁移归属唯一化 | yes | ticket TDD(S2) + review |
| B11 Given 需要外部调研并落盘的任务，When 派发，Then 存在合法 research 预设变体，且 type≠preset 的派发记录含一行声明 | yes | ticket TDD(S4) + review |
| B12 Given 待选型规划窗模型候选集，When 运行 bounce-rate 回放协议，Then 产出可对比的离线判定报告 | yes | ticket TDD(S4) + review |
| B13 Given 修订后的技能包，When `node bin/rope.js add` 安装，Then 安装成功且目标目录结构符合既有格式 | yes | ticket TDD(各切片) |
| Real-entrypoint behavior | yes | e2e.md E1–E4 + review probe |

## Slice Graph

- Wave 1: Slice 1
- Wave 2: Slice 2 | Slice 3 | Slice 4
- Serial total: 4 slices
- Longest dependency chain: 2 slices (`S1 → S2/S3/S4`)
- Rivers: one river（全部经 S1 连通）；无需拆分议题。
- Size check: 每张票 ≤4 owned 文件、~400 diff 行内；无 violations。
- Parallelism declaration: startup width 3（S2|S3|S4 同时就绪）；
  串行合并顺序建议 S2 → S3 → S4（无文件重叠，仅为 review 专注度排序）。
- Owned-files 持久化归属: 本 issue 无持久化/迁移文件（纯规则文本），
  归属追踪规则本身由 S2 定义、S3 消费——跨票"热文件"为
  `skills/rope-go/references/execution-rules.md`（S3 独占）与
  `skills/rope-shape/SKILL.md`（S2 独占），无共享。

## Slice 1: 定义层——CONTEXT 术语与 ADR 0011

- Status: done (2026-08-27, solo mode per user waiver; commit log S1–S4)
- Kind: contract
- Goal: 后续三张规则票引用的术语与决策先于实现存在并可独立评审
- Blocked by: none
- Scope: `.rope/CONTEXT.md` Language 区新增词条；新建 `.rope/adr/0011-*.md`
- Owned files: `.rope/CONTEXT.md`, `.rope/adr/0011-edge-classification-and-acceptance-gates.md`
- Size cap: ~400 diff lines（默认）
- Matrix rows: 全部术语一致性（B1–B12 的定义基础）
- Constraint IDs: D1 边界条款、D2 扩展语义、新决策候选正式化
- Required evidence: ADR 0011 含三 bundle 决策 + D1 边界（返回门≠评审）+
  D2 继承不变量（串行合并不变）；CONTEXT 新词条与 ADR 定义逐字一致
- Public behavior: 任何后续票/评审可引用同一套术语与决策依据
- Tests: 术语↔ADR 交叉引用一致性检查（脚本或人工对照表）
- Implementation notes: 词条格式遵循 CONTEXT.md 既有体例（粗体词 + 定义 +
  _Avoid_ 行）；ADR 遵循既有 0007/0008 体例
- Verification: diff 检查 + 交叉引用表
- Stop conditions: 若发现需要改动 ADR 0007/0008 正文才能自洽 → 停，回 grill

## Slice 2: shape 侧粒度与图规则

- Status: done (2026-08-27, solo mode per user waiver; commit log S1–S4)
- Kind: vertical
- Goal: 用新规则跑一次 shape，能在产出 artifact 中观察到 demo-path、
  上下限判定、边分类、两段式契约票与 evidence 投影
- Blocked by: Slice 1
- Scope: `skills/rope-shape/SKILL.md`、`skills/rope-shape/references/*.md`
  （issue-package.md 模板字段、gates-and-vocab.md 边分类表/反模式清单）
- Owned files: `skills/rope-shape/**`（独占，与 S3/S4 无重叠）
- Size cap: ~400 diff lines
- Matrix rows: B1、B2、B3、B4、B6、B10
- Constraint IDs: D2 扩展（边分类/两段式进 shape 产出）
- Required evidence: 规则文本含六项机制；对合成 mini-fixture 产出含全部新
  字段的 tasks.md 样例；"不切票→rope-quick"路由存在（ADR 0006 Quick Fix Path）
- Public behavior: shape 阶段即可机械发现"票太肥/边太软/粒度不 quiz"问题
- Tests: fixture dry-run（合成输入 → 期望字段）
- Implementation notes: 既有 fresh-window 默认（~400/4）保留，本票补的是
  demo-path 必答、下限规则、quiz、反模式清单、两段式、投影；粒度 quiz 并入
  既有 step 9 图确认，不新增独立的用户问答轮
- Verification: 结构校验 + fixture 输出对照
- Stop conditions: 若规则需要 CLI 行为变化 → 停（Non-goal）

## Slice 3: go 侧派发、返回门与预算规则

- Status: done (2026-08-27, solo mode per user waiver; commit log S1–S4)
- Kind: vertical
- Goal: 用新规则跑一次 go，能在派发判定、join 输出与 correction 审查中
  观察到软边降级、机械返回门与 Defense Budget 的机械行为
- Blocked by: Slice 1
- Scope: `skills/rope-go/SKILL.md`（Startup / Slice loop 节）、
  `skills/rope-go/references/execution-rules.md`（Merge queue / Leaf Brief
  Contract / 新增 Return Gate 对照表与 Defense Budget 节、Human Gate 批量面板）
- Owned files: `skills/rope-go/**`（独占）
- Size cap: ~400 diff lines
- Matrix rows: B5（go 半边）、B7、B8、B9
- Constraint IDs: D1 边界（返回门=证据核对）、D2 扩展（就绪判定）
- Required evidence: execution-rules.md 含对照表格式样例与 bounce 判定规则；
  越权 correction brief 样例被拒绝并输出降级记录；批量面板格式样例
- Public behavior: go 阶段 join 从自由裁量变为对照表，correction 不能扩验收
- Tests: 伪造叶子 summary（缺一条 evidence）→ bounce 判定；越权 brief → 拒绝
- Implementation notes: 返回门输出并入既有 Leaf Brief Contract 的 Return
  Shape 约定；不新增用户交互轮
- Verification: fixture dry-run 输出对照
- Stop conditions: 若实现需要父会话重读实现代码 → 违反 D1，停

## Slice 4: harness presets——调研变体、声明式派发与选型协议

- Status: done (2026-08-27, solo mode per user waiver; commit log S1–S4)
- Kind: vertical
- Goal: 需要 web+write 的调研任务有合法预设承载；偏离声明与 planner 选型
  协议可执行
- Blocked by: Slice 1
- Scope: `skills/rope-harness-presets/SKILL.md`、`references/role-schema.md`
  或新增 `references/research-variant.md`、`references/bounce-rate-replay.md`
- Owned files: `skills/rope-harness-presets/**`（独占）
- Size cap: ~400 diff lines
- Matrix rows: B11、B12
- Constraint IDs: 术语引用（S1）
- Required evidence: research 变体模板（只写 `.rope/research/`，不碰代码）；
  Dispatch Header 声明格式样例；bounce-rate 回放协议文本（输入=issue 包+
  叶子返回摘要集，输出=对比报告格式）
- Public behavior: 调研派发不再需要违规借用 general-purpose
- Tests: 变体模板通过既有 role-schema 校验逻辑；协议含最小可运行样例
- Implementation notes: offline ranking 主链（rank/manifest/degrade）不动
- Verification: 结构校验 + 样例走查
- Stop conditions: 若需要改 offline ranking 行为 → 停（Non-goal）

## Review record

- Mode: solo（用户指令"提交，进go，不派生子代理单独处理"，declared deviation）；
  ADR 0010 双叶 end-of-issue review 由用户免除，human 为验收门。
- Per-slice commits: S1 bd70feb, S2 61d3a7c, S3 3e3d8e6, S4 09a0a6a。
- Return Gate: n/a（solo 模式无叶子返回；e2e 判定 artifact 即证据映射）。
- E2E: E1–E4 全部 pass（见 e2e.md Result）。
- Defense Budget self-check: 实现期间未新增矩阵外验收行（B1–B13 即矩阵全集）。
