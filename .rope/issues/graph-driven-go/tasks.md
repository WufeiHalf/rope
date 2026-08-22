# Graph-Driven Go Tasks

## Behavior Matrix

| Row | Applies? | Verification |
| --- | --- | --- |
| Primary path（shape 出图→提问；go 跑波次；期末一次评审；verify 薄） | yes | E1 grep + read-through |
| Alternate input or entrypoint（旧包带 mode/review frontmatter） | yes | E1 grep：无消费者，go 启动步骤不再读取 |
| Empty or missing input（无探索产出→不建 map.md；单链图→波次=串行，仍提问） | yes | read-through |
| Invalid or malformed input（超尺寸切片→当场重拆；重拆暴露需求错位→回 grill） | yes | read-through S1 |
| Unavailable or not-ready dependency（宿主无后台派生→降级串行并记录） | yes | read-through S2 |
| Duplicate or idempotent case（两条河拆两个 issue，各自完整流程） | yes | read-through S1 |
| Boundary or limit case（brief ≤60 行含 map 指针不加长） | yes | read-through S2 |
| Existing behavior compatibility（TDD 纪律、no-nested-spawn、修正轮上限不变） | yes | E1 grep |
| Real entrypoint or integration path（rope add 同步 .agents/skills 可用） | yes | E1 sync diff |

## Slice 1: shape 读图（wave/river/尺寸铁律/回炉 grill）

- Status: done（2026-08-22，本 issue 按 docs-only TDD 豁免，由主会话顺序实现）
- Kind: vertical
- Goal: shape 在切片成形后读图提问，而不是切片前盲问模式。
- Blocked by: none
- Scope: `skills/rope-shape/SKILL.md`、`references/gates-and-vocab.md`、
  `references/issue-package.md`。
- Owned files: 上述三文件。
- Size cap: ~250 diff lines / 3 files
- Matrix rows: Primary、Invalid、Duplicate
- Constraint IDs: D1、D2
- Required evidence: guardrails 不再含 mode/review 问题；模板无 frontmatter
  与 Review 行；gates-and-vocab 有 River/Wave/Map 词条。
- Public behavior: shape 用户在切片后看到一个带数字的执行问题（拆河/跑波次）。
- Tests: E1 grep sweep。
- Implementation notes: 尺寸铁律=「装进一个全新 context window」；重拆破坏
  需求形状 ⇒ 带着具体错位回 grill。
- Verification: read-through checklist。
- Stop conditions: 模板与 SKILL.md 语义冲突无法两全。

## Slice 2: go 波次执行 + 调查地图

- Status: done（2026-08-22，本 issue 按 docs-only TDD 豁免，由主会话顺序实现）
- Kind: vertical
- Goal: go 按波次后台派生不阻塞；叶子共享并维护 map.md。
- Blocked by: Slice 1
- Scope: `skills/rope-go/SKILL.md`（Startup/Slice loop/新 Investigation map
  节）、`references/execution-rules.md`（Graph-driven execution 节、brief
  operational contract 加 map 路径）。
- Owned files: 上述两文件。
- Size cap: ~200 diff lines / 2 files
- Matrix rows: Primary、Unavailable、Boundary、Empty
- Constraint IDs: D1、D3
- Required evidence: 波次循环文本；降级路径；brief 契约含 map 指针且 ≤60 行
  语义不变。
- Public behavior: 同波次不相交切片并发派生，父会话收集摘要不阻塞。
- Tests: E1 grep。
- Implementation notes: 重叠 ⇒ 串行（既有规则保留）；map 一行一事实带路径
  +日期，叶子提交前更新自己证伪的行。
- Verification: read-through checklist。

## Slice 3: 期末一次评审（新眼睛 + 真实入口）

- Status: done（2026-08-22，本 issue 按 docs-only TDD 豁免，由主会话顺序实现）
- Kind: vertical
- Goal: 用单一 end-of-issue 评审取代 per-slice/batch 评审，含两轴与
  real-entrypoint 探针。
- Blocked by: Slice 1
- Scope: `skills/rope-go/SKILL.md`（After all slices）、
  `references/execution-rules.md`（End-of-Issue Review Execution 取代
  Required/Batch Review 与 Review Risk Gate 节；Handoff Checklist）。
- Owned files: 与 Slice 2 同文件不同节（串行依赖 Slice 2 完成后执行）。
- Size cap: ~250 diff lines / 2 files
- Matrix rows: Primary、Existing behavior compatibility
- Constraint IDs: D2、D3
- Required evidence: 评审 brief 契约（diff 基点、Contract Note、bundle 引用、
  map、E2E 证据、真实入口指令）；verdict 记录格式；≤2 修正轮。
- Public behavior: 干完活一次评审：全量 diff+承诺清单+真实入口走查。
- Tests: E1 grep（无残留 per-slice 指令）。
- Implementation notes: 高风险边界清单保留为评审深看区，不再是片级 gate；
  评审员「从未看过施工过程」写进 brief。
- Verification: read-through checklist。

## Slice 4: verify 变薄

- Status: done（2026-08-22，本 issue 按 docs-only TDD 豁免，由主会话顺序实现）
- Kind: vertical
- Goal: rope-verify 只查文书：评审真实发生、E2E 终态、树净、提交在。
- Blocked by: Slice 3
- Scope: `skills/rope-verify/SKILL.md`、`references/verify-rules.md`。
- Owned files: 上述两文件。
- Size cap: ~150 diff lines / 2 files
- Matrix rows: Primary、Alternate（旧包兼容）
- Constraint IDs: D2
- Required evidence: verify 不再做代码判断/产品探针（移至评审）；架构仅查
  文档终态路由。
- Public behavior: verify PASS 只证明手续齐，不再宣称产品真值。
- Tests: E1 grep。
- Implementation notes: 保留 PASS/CHANGES_REQUESTED/BLOCKED 三态与
  verify.md 追加式格式。
- Verification: read-through checklist。

## Slice 5: 预设种子与 README 同步

- Status: done（2026-08-22，本 issue 按 docs-only TDD 豁免，由主会话顺序实现）
- Kind: vertical
- Goal: leaf 预设种子与新语义一致；README 动态模式段落改写。
- Blocked by: Slice 3
- Scope: `skills/rope-harness-presets/references/agent-templates.md`
  （reviewer→新眼睛期末评审种子；implementer→map 维护习惯）、
  `skills/rope-harness-presets/SKILL.md`（dynamic-mode 节改写）、
  `README.md`（95-110 行段落）。
- Owned files: 上述三文件。
- Size cap: ~150 diff lines / 3 files
- Matrix rows: Primary、Real entrypoint
- Constraint IDs: D1、D2
- Required evidence: reviewer 种子含两轴+真实入口+只读代码可跑进程；无
  nested spawn 文本保留。
- Public behavior: `rope-harness-presets` 生成的 agent 与新流程对齐。
- Tests: E1 grep。
- Implementation notes: 评审员可启动/停止本地进程与浏览器，但不改代码。
- Verification: read-through checklist。

## Slice 6: 术语、ADR、安装同步

- Status: done（2026-08-22，本 issue 按 docs-only TDD 豁免，由主会话顺序实现）
- Kind: vertical
- Goal: CONTEXT.md 词条更新、ADR 0007 落档、`rope add` 同步并全量扫尾。
- Blocked by: Slice 2, Slice 3, Slice 4, Slice 5
- Scope: `.rope/CONTEXT.md`、`.rope/adr/0007-*.md`（新）、
  `node bin/rope.js add --target .agents/skills`。
- Owned files: 上述。
- Size cap: ~300 diff lines / 3 处
- Matrix rows: Primary、Real entrypoint、Existing behavior compatibility
- Constraint IDs: D1、D2、D3
- Required evidence: ADR 0007 三问过（决策可逆性/代价/替代）；词条无旧
  Review Mode/Dynamic Workflow Mode 残留；`.agents/skills` 与 `skills/`
  一致。
- Public behavior: 新会话读到的是新词汇与新 ADR。
- Tests: E1 全量。
- Implementation notes: ADR 记录 supersede 关系与 session 证据引用。
- Verification: read-through checklist。

## End-of-Issue Review

- Verdict: approve（自审 + E1 机械扫尾，2026-08-22）
- Reviewer: 主会话（本 issue 无派生评审员；docs-only，用户走查 E2 待确认）
- Fix rounds: 1（README 遗留 per-slice 段落，E1 扫出后修正）
- 证据：E1 grep 零残留 + rope add 同步零差异；E2 用户走查 pending
