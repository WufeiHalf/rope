# quick: 固定 go 执行内核（模板化 dynamic go）

status: done（内核 + 契约 + 离线回归 + 文档/ADR，2026-09-11）

## 问题 / 根因

session `01a08edb`（agent-workbench `legal-retrieval-pagination`）把一次 go
拆成两个 workflow，中间由父会话手工合并 S1。理由被记成"脚本没有 shell，
所以串行合并只能在父会话做"。代价可复现：第二个脚本的分支解析取到了简报里
引用的 `branch: HEAD`，而不是宿主追加的交付脚注，两个并发实现者都被判 blocked
且无合并；随后 L2 与 E2E 照常运行——`l2`/`e2ePass` 只是被当作返回字段，
从未用作前置条件；S3b/S4/P1–P3 在结果里完全不存在。

真正的根因不是"模型不听话"：**一份要求每个新会话重新实现成代码的散文契约，
必然被以不同方式实现错。** 修法是不要再要求重写。

## Grill-lite 记录（确认事实 + 决策）

已核实：脚本沙箱无 shell/fs/import；`agent()` 返回体无 branch 字段；`text` 是
`structuredJson ?? result`，且 worktree 子进程的散文带宿主分支脚注；gate 只在
worktree 清理前跑，**通过时被剥掉、失败时并进 `null` 返回**；`Date.now()`/
`Math.random()` 抛错。旧规则（SKILL/dynamic-workflow/execution-rules/ADR 0014）
本来就要求 go 在**单个脚本**内完成派发、合并、门禁、修复与终审。

用户决策：一步到位，不分版本；pi-first（先不管其它 harness）；只改 Rope，
不动 pi-subagents 扩展；不做 schema 版本闸；证据落盘；每次合并后跑便宜检查；
加 shape 关键路径评审 + routes 测试政策字段。

## 选定方向

固定内核 = `skills/rope-go/workflows/go-execute.js`（单文件，按绝对
`scriptPath` 调用）+ `scripts/verify-delivery.sh`、`scripts/run-check.sh`。
父会话只编译**任务数据**、读回**运行记录**，不再写编排代码，也不再复述交付契约。

对照审计缺陷的实现决定：

1. **交付身份由 git 裁定**，不解析 agent 散文。叶子提交完毕→清空树→把预声明
   分支指向最终 commit；宿主在清理前把它作为 spawn 的 gate 运行
   `verify-delivery.sh`，退出码即判定。忘了建分支会被自动补（`moved`），
   忘了提交会被自动补一个 commit（`recovered`）——一次疏漏只花一个标记。
   SHA 由合并 agent 从 `git rev-parse` 取得，叶子的 claim 只用于记 `claimMismatch`。
2. **前置条件是结构性的**。L2 = "每个计划任务都已集成 **且** 受影响套件绿"，
   在此之前 L3/E2E/终审不会启动；跑不了的阶段报 `{ran:false,ok:false}` 或显式
   `skipped:true`，绝不报 passed。`delivered` 还要求终审返回 `approve`。
3. **完成 ≠ 没有在跑**。"每个计划任务已集成"是唯一判据；永远不会就绪的任务
   按 id 报进 `neverReady`。
4. **检查复用是机制**：`run-check.sh` 以 `<scope>@<集成 commit 集>` 为键，
   未变状态直接复用证据，不会意外重跑昂贵命令。检查按阶段串行，所以不需要
   独占通道调度器。
5. **内核自带失败史回归**：`tests/` 用桩宿主复现四类缺陷，桩的每条行为都
   标注宿主源码出处——固定内核 + 变动宿主之间，这是唯一的栅栏。

## 红→绿证据

- `node --test tests/*.test.mjs` → 26 用例全绿（~1.1s），无外部依赖
- 契约与实现一致性由测试反查：`stage` 枚举、`evidenceDir` 必填、`skipped` 语义、
  `explain` 计划编译、修复轮上限与 delta 复评、空阶段不阻塞
- `verify-delivery.sh`：分支补建 / 脏树拒绝与恢复 / `--commit` 可达性三态
- `run-check.sh`：首次执行→同键复用→换键重跑（计数器文件断言）
- `node bin/rope.js --help` + `add --target` 安装冒烟（含 workflows/ 与 scripts/）

## Doc 同步

- specs ✓ `dynamic-workflow-mode.md` 指向新契约
- adr ✓ 0014 附录（固定内核与"散文契约必然是 bug 源"）+ 0013 附录（时刻表、
  证据复用、`Test policy:` 字段）
- CONTEXT ✓ 新增 Execution Kernel / Delivery Branch / Check Timetable，
  改写 Graph-Driven Execution 与 End-of-Issue Review
- routes ✓ Test roots 改为 `tests/`、Test tiers 重写、新增 `Test policy: fast-iteration`
- skills ✓ rope-go SKILL/execution-rules/dynamic-workflow、rope-shape SKILL/issue-package

## 人类遗留

- 内核首次真实 go 实战仍是唯一能证伪"更快"的检验；E2/E3 保留在
  `.rope/issues/go-execution-template/` 作为待办验收项
- 该 issue 包按 6 切片设计，但本次按用户指示走 rope-quick 一次性落地；
  切片包保留为验收与后续演进的参照
