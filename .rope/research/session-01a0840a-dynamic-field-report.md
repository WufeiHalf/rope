# Session 01a0840a 现场报告：dynamic 首次全流程实战（法务 AI 能力集）

> 调研日期：2026-09-10。来源：pi session
> `01a0840a-4744-77d7-9dbc-d9a9cea9e446`（agent-workbench，feat/legal-agent-capabilities，
> 2026-09-09 10:41–15:10），三个 workflow journal
> （wf_4a25aeef831c=W1 / wf_9505adc3b568=W2 / wf_cf7893f9145c=W3-W5+终审），
> 以及 worktree 简报 `.rope/issues/legal-finance-ai-employees/wayfinder-map.md`。
> 本文是 rope 侧普适调优的证据底座；配套决策见 grill 会话与后续 issue 包。

## Question

dynamic 模式（ADR 0014）落地后的第一次真实全流程（grill→shape→go→终审→E2E），
哪些问题出在 rope 规范/技能层，哪些出在仓库侧？各自普适修法是什么？

## Verified Facts

### F1 研究叶子降级成 general-purpose twin

- grill 阶段 3 个研究叶子（L41×2、L73）全部 `subagent_type: general-purpose`；
  shape 阶段考察叶子才用 `rope-explore`（L93）。
- 本机 `rope-explore` preset 工具面 = `read, bash, grep, find, ls`（无 web、无
  write），而 grill 研究需要联网 + 写 `.rope/research/**`。
- explore-research-mode（ADR 0011）规定的降级路径（generic worker + **记录
  deviation**）走了前半段，deviation 未记录；且在 pi 上降级是常态，mode 设计
  从未真正生效。

### F2 “完成 1 切片即可推 MR”出自仓库侧简报，非 rope 规则

- 来源：wayfinder worktree 简报（session L16）“完成一个完整切片（建议
  SearXNG 评估+替换）即可推 MR”——其“切片”指五项工作项之一（≈issue 级）。
- rope 技能全量 grep：零 MR-push 规则；rope-finish 明确 "Do not … push, merge,
  rebase … unless the user explicitly asks"。
- 实际执行正确：17 切片本地分支合并到 feat 分支，按 issue 单 MR 收口。
- 风险仅是术语撞车：上游简报的“切片”≠ rope 的 slice，模型在 shape 记录里
  做过一次术语换算（L100 “每个 issue 独立推 MR（符合简报…）”）。

### F3 grill/shape 对 dynamic 不感知

- fans 表（research fan ceiling 20 = "grill/shape fact-gathering leaves"）只存在于
  `.rope/specs/dynamic-workflow-mode.md`，grill/shape 两个 SKILL.md 均未引用。
- 本次 grill 的 2+1 并行研究是模型自发 + 用户明确要求，不是规则驱动；
  shape 只派了 1 个 explore 叶子。

### F4 dynamic 路径丢掉 setup step-0（W1 三叶环境性红灯）

- W1（wf_4a25aeef831c）：5 叶中 3 叶 blocked——harness worktree 只复制 tracked
  文件，node_modules/软链依赖缺失；叶子 branch 字段返回 "(detached HEAD)"
  （未建分支）。
- execution-rules 对 Agent 派发路径有硬规则“worktree-setup = 叶子 brief 第 0 步
  无条件”，但 dynamic-workflow-mode spec 与 rope-go SKILL 的 dynamic 段均未继承。
- 用户要求后重写脚本：第 0 步 `git checkout -b <切片号>` + `bash herdr-setup.sh
  "$PWD"`（routes.md worktree-setup 契约的 check-first 软链策略）→ W2-W5 全部
  `setup: ran` 一次通过。IMPL_SCHEMA 的 `setup` 字段实战可用。

### F5 4200s 的耗时结构：全量测试 ×10-11 + 波次 barrier

- W3-W5（wf_cf7893f9145c）≈73 min（12:56→14:09），7 叶 + 3 合并器 + 1 终审。
- 叶子收尾门槛被写成全量回归：S16 证据原话 “全量 4173/4173…Ran 4173 tests in
  213.098s”；每波合并器再跑全量；终审再跑全量 + npm。全量 ≈10-11 次 ≈38 min
  纯测试时间。
- 三重违反既有规则：① ADR 0013 “全量是 issue 级证据，never a brief
  requirement”；② ADR 0007/0008 “graph is the scheduler, no wave barrier”——
  dynamic spec 写的是 "compiles waves"，波次 barrier 让 S14/S15/S16（只依赖
  S11/S13）干等整波合并+全量；mattpocock 切片研究结论 #2（合并即重算 frontier）
  也与波次编译矛盾；③ W1 主检出合并后验踩管道假绿（退出码被管道吞）。
- 另：W2 三叶 blocked 于 architecture guard 白名单（切片测试触碰私有属性需
  登记白名单）——叶子全量本可提前暴露，主模型手改白名单收场（又一次主模型
  下场）。

### F6 终审 fail 后脚本直接 return，主模型自己修

- reviewer（rope-reviewer，单叶子）按 schema 返回完美结构化结果：
  `verdict:"fail", failures:[{path:line + 一句修复}]`（R22：legal_agent
  role_tools 未声明 fetch_evidence）。
- 脚本结尾仅 `report.review = review; return`；spec 的 fix-round 规则只覆盖
  L1/L2/L3 门禁红，终审 fail 的脚本内修复环不存在。
- 主模型在主会话直接改 registry/tests 并跑全量收场（违反 Parent Orchestrator
  不亲自跑修复环的纪律；修复本身 2 轮内全绿）。
- 本次终审只有单 reviewer，无 scanner（ADR 0010 双叶子在 dynamic 路径未落地）。

### F7 E2E“user”项实际全部 agent 可跑

- shape 时 E1-E6 全标 user-run；终审被明确排除在 E2E 之外。
- 用户口头下放后主模型跑通：E1=curl 断言（body 层错误码）；E2/E4=agent_browser
  驱动真实测试栈 WebUI（登录→会话→上传→下载 artifact）；E3=下载 docx 解包验
  w:ins/w:del/comments.xml + pdftotext 渲染 + analyze_image 视觉确认。
- rope-finish 已有 "Do not force user validation when all required E2E was
  agent-executable and passed"，但 gates-and-vocab 的 executor 分类是静态判断
  （user = visual/business judgment…），不探测本机 harness 工具面。

## Assumptions

- 时间线由 session 消息序、journal mtime（12:25/12:46/14:09）与叶子证据内的
  测试耗时数字推得，误差 <5 min。
- “4200s” 对应 W3-W5 workflow（≈73 min）；W1/W2 的阻塞与人工恢复不在该数内。
- scanner 在本次缺失是脚本编写选择，非能力不可用（rope-explore preset 存在）。

## Implications for Rope（已确认决策，2026-09-10 grill）

1. **explore preset 不做工具限制**（用户定）：工具面放开，默认只读/research
   写 .rope/research/** 的纪律留在 preset 正文与 brief 层；harness-presets
   生成指引同步；pi preset 再生成。
2. **dynamic 规范四项修订全采纳**：setup 第 0 步注入（编译器读 routes.md
   worktree-setup）；图调度替代波次（frontier 重算，波次只留 shared 模式）；
   门禁分层硬规则（L1 聚焦/L2 双断言/全量仅 baseline+终审）；门禁防假绿
   （输出落文件再解析，禁管道退出码）。
3. **E2E 机制相对分类+探测**：shape 标机制（browser-walk/CLI/API/文件检验/
   纯判断/2FA/不可达），go/verify 探测 harness 工具面，机制被覆盖即 agent 跑。
4. **终审双叶子+冻结点修复环**（用户定）：终审只在全部合并完成、树干净、
   无叶子在跑的串行点启动；scanner+reviewer 对同一冻结 HEAD 并行只读；
   fail ⇒ 脚本解析 findings 派 fresh fix agent（原文转录 brief）→ delta 复审
   （scanner 只扫 fix diff，reviewer 只探受影响路径）→ ≤2 轮 → 仍 fail 返回
   结构化 Human Escalation Stop。
5. **阶段感知**（用户定）：dynamic 感知从 grill 开始、维持到 shape/go；
   机制 = 每阶段启动时机械解析一次（config + host probe，不问用户、不进
   issue 包，同会话内不重复解析）。grill：research fan 并行派研究叶子；
   shape：dynamic/worktree 可用时按宽度优先切片。
6. MR 单元/上游简报术语撞车：用户决定不处理（纯仓库侧措辞）。
