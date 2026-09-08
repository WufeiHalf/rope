# Dynamic Workflow 复跑实验：legal-finance-ai-employees（T4 实证）

- 日期：2026-09-08
- 性质：deterministic-vs-agent-orchestration 研究的 T4 spike 实测（预注册对照）
- 状态：完成，数据完整

## 1. 实验设计

- **基点**：agent-workbench `06297a49`（go 前夜票包修订提交；S1/S2 已在树上）
- **复现范围**：原 go 的 9 个 worktree 实现叶（Wave2 {S3,S4,S5,S6,S11} → Wave3 {S8,S9,S10}）+ 机械集成 + gate + EOI 评审
- **编排**：`.pi/workflows/legal-dw-replay.js`（SubagentWorkflow，确定性 JS 派发，编排层零 LLM）
- **叶子**：`rope-implementer` preset（gpt-5.6-luna, worktree 隔离）+ `rope-reviewer` EOI；brief 由脚本从 tasks.md 模板化生成（叶子自读票包，与原 run 信息起点对齐）
- **不变边界**：全 fake seam 不触真实外网（与原 run 的 E2/E3 blocked 口径一致）；E4 浏览器走查不在本实验范围
- **运行形态**：tmux 内交互式 pi（保活宿主进程，`/agents → Workflows` 实时监控）

## 2. 结果

| 指标 | 原 run（手工 rope-go, 01a079f3） | 复跑（dynamic workflow） |
|---|---|---|
| 9 切片实现 | ✅ 11 切片全生命周期 2 天（shape→E4） | ✅ go 段约 40 min 全部完成（含 2 次中断修复） |
| go 段编排开销 | 父会话 385 tool 回合、4 compactions（全程） | **父上下文 27-57k/1.0M，0 compaction**；编排 token ≈ 0（脚本） |
| Wave2 并发 | 宽度 5，父逐个 spawn/收拢 | 同宽度 5，`parallel()` 一语句；5 叶 334k tokens、约 5 min 墙钟 |
| fix 轮 | 3 轮（原 run） | 0 轮（gate 一次过——但见 §4 gate 不变量缺陷） |
| EOI/评审 | approve-with-note | **needs-fix：2 blocking + 4 note**（blocking 由父模型修复后全绿） |
| 端到端质量 | E4 浏览器走查抓 3+1 组合缺陷（事后） | EOI 静态评审抓 2 个跨切片契约缺陷（读侧 ACL 绕过、join 超时死等），gate 54 tests OK 终态 |
| 中断恢复 | 17h 人工空窗 | resume 前缀缓存：Wave2 五叶 0 token 秒级重放 |

EOI verdict 摘录：finding 1（blocking）fetch_evidence_dispatcher 岗位隔离门依赖调用方自报 domain，读侧可绕过——建议过滤下沉到 LegalQueryAdapter 读结果侧白名单裁剪；finding 2（blocking）admin_sync_service.join 的 timeout 参数被静默忽略。两条均在修复 commit `927205f9` 落地，`python3 gate_legal.py` 54 tests exit 0（本会话独立复验）。

## 3. 消耗

- Wave2 五叶合计 334k tokens（62.8-71.4k/叶，177-267s/叶，并行墙钟 ≈ 5 min）
- 集成叶 + Wave3 三叶 + 评审叶：约 +400k（面板读数 183.2k@8/9 agents，加尾段）
- 实验总成本（含 spike、首次崩溃 run、debug）：约 1M tokens、约 1.5h 墙钟
- 对照：原 run 同 9 叶估算同量级（叶实现成本不可压缩），差额主要在父会话——原父全程 385 回合 vs 复跑父几乎挂机

## 4. 机制性发现（本实验最大产出）

1. **无头模式致命 bug**：`pi -p` 下后台 workflow 用 stale ctx 写 progress 事件 → `assertActive` 抛错 → 宿主进程崩溃，10 叶齐断（pi-custom-subagent `index.ts:2708`；修复方向：事件写入走 run 作用域活动 ctx / `withSession`）。无人值守（AFK）形态当前不可用，必须交互式宿主。
2. **resume 不能携带 gate**（文档明文，实测踩中）：fix 轮必须是全新 agent + 重新挂 gate，不能 `resume` 续上下文兼带门。
3. **gate 必须断言真不变量**：本实验 gate 只查"legal 测试绿"，集成叶在 map.md 冲突后按 brief 字面 `merge --abort` 只合 3/5 切片，gate 在残树上照样绿 → Wave3 从缺 S6/S11 的基点开跑。正确不变量 = `git branch --merged` 覆盖全部输入分支 AND 测试绿。gate 脚本应落仓库文件（gate_legal.py 模式），杜绝多层引号转义静默损坏（首次 gate 的 sed 管道 bug 即此）。
4. **共享账本文件是并发切片的隐性冲突点**：5 叶同时追加 map.md → 必然冲突。shape 规则待补：共享 evidence/账本文件由叶子"返回 evidence 行"而非直接写文件，集成叶统一追记（与 ADR 0011 evidence 投影方向一致）。
5. **集成叶 brief 的停止条件写法**：'冲突则停止'被字面服从导致部分集成逃逸。应写成'机械冲突自行解（分段追加），解不了才上报后继续'，或由 gate 兜底（见 3）。
6. **Wave3 依赖破坏未被编排层拦截**：S10 依赖 S3-S6+S11，但波内 gate 放行了不完整集成，叶子在缺依赖基点实现（EOI 虽未将其列为 finding——叶子用 fake seam 自洽——但契约一致性风险真实存在）。波间 gate 应包含"依赖切片的 owned files 已在树"断言。
7. **LLM 手动发起 resume 易传错参**（产生零痕迹空壳 failed run）：go 的 workflow 化长期应走编译器（graph2workflow），不该由模型现场拼调用参数。
8. **监控形态分级成立**：交互式 TUI `/agents → Workflows` 进度树完全够用（phase 分组/逐叶 token/duration/结果预览）；无头模式事件不落盘（待 bug 1 修复后评估）。

## 5. 结论与建议

- **速度/上下文经济性**：结论明确——编排开销从"父会话数百回合+4 compactions"降到"父挂机+约 700-800k 纯叶子 token"，父上下文全程 <6%。Wave 级并发的实际宽度收益与手工派发持平（瓶颈在叶实现本身），主要收益是**父窗口解放 + 无人值守潜力 + 中断续跑**。
- **质量**：EOI 新眼睛评审在同一票包上给出 2 blocking+4 note（原 run 是 approve-with-note）——评审深度不降反升，且全部可机械验证。组合层缺陷（原 E4 的痛点）本实验未覆盖（无 S0 拼装冒烟，用户决策不做）；EOI 静态评审证明可作为部分替代。
- **Rope 落地路径**（按侵入性递增）：
  1. rope-go 增 5-10 行 "dynamic workflow 模式"段：宿主探测（SubagentWorkflow 存在且用户指定）→ 图编译为脚本 → gate 不量断言双条件 → 跑后父按返回值补记 tasks.md/map.md/verify。
  2. gate_legal.py 模式固化：每 issue 附机械 gate 脚本（分支全合 + 聚焦测试双断言）。
  3. `graph2workflow` 编译器进 bin/rope.js（tasks.md 图 → .pi/workflows/<issue>.js），消除 LLM 手写脚本/手拼 resume。
  4. pi-custom-subagent stale-ctx bug 修复前，workflow 只在交互式宿主跑；修复后解锁真 AFK。
- **对 ADR 0007**：deferral 条件（worktree 隔离落地）已满足 + 本实验数据支持"确定性 runner 作为 go 的可选执行形态"——建议在 ADR 0007 追加修订注记（不推翻 graph-driven 决策本体：图仍是 tasks.md 的真相源，workflow 只是执行器）。

## 6. 工件

- 实验分支：agent-workbench `exp/dynamic-workflow-replay`（`06297a49..927205f9`，17 commits，含 9 切片+集成+EOI 修复；未 push、未合回 main）
- 脚本：`/tmp/legal-dw-replay/.pi/workflows/legal-dw-replay.js`（已随分支提交）；gate：`gate_legal.py`
- run journal：`/tmp/pi-subagents-1000/tmp-legal-dw-replay/01a0800d-1358-731f-b04a-4a8f63c3cf94/tasks/wf_{abb79479baa9,4bb9c5698c01}.workflow.jsonl`
- tmux 会话 `dw`（交互宿主，实验后可关）
- 基线 session：`01a079f3`（原 run）；前置研究：`.rope/research/deterministic-vs-agent-orchestration.md`
