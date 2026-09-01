# mattpocock/skills：任务拆分粒度与多 agent 并行执行

## Question

对照上游灵感来源 `mattpocock/skills`（MIT），其真实做法是什么：

1. 完整 skill 目录列表；
2. 拆分类 skill（to-spec / to-tickets / grill* / triage 及 orchestration 相关 skill）把工作拆成什么单位、拆分粒度启发式是什么、如何表达依赖；
3. 是否支持多 agent 并行执行多个 task？隔离机制（worktree / 分支 / 目录）与合并方式？
4. 有没有明确的反模式清单；细拆后如何保证可验收（验收标准放哪、谁检查、每单位完成定义）？

## Verified Facts

### 一、仓库概况与 skill 清单

Fact: 本次审查 pin 在 HEAD `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76`（2026-08-24），版本 CHANGELOG 1.2.3。注意：**早期的 `to-prd` / `to-issues` 已重命名为 `to-spec` / `to-tickets`**——本仓库 `.rope/research/upstream-inspiration-sources.md` 与部分本地安装的 skill 名仍是旧名，harvest 对应关系需要更新。
Source: `git log -1` of local clone; `/tmp/mattpocock-skills` 全文阅读
Stability: high

Fact: promoted skill 全目录（按 bucket）：
- **engineering**: ask-matt, codebase-design, code-review, diagnosing-bugs, domain-modeling, grill-with-docs, implement, improve-codebase-architecture, prototype, research, resolving-merge-conflicts, setup-matt-pocock-skills, tdd, to-spec, to-tickets, triage, wayfinder, wizard
- **productivity**: grill-me, grilling, handoff, teach, to-questionnaire, wait-what, writing-for-agents
- **in-progress**（未 ship）: claude-handoff, implement-spec, loop-me, retro, setup-ts-deep-modules, writing-beats, writing-fragments, writing-shape
- **misc**: git-guardrails-claude-code, migrate-to-shoehorn, scaffold-exercises, setup-pre-commit
Source: `find . -name SKILL.md` of clone; README.md skill listing
Stability: medium（skill 集持续变动）

Fact: 主链路是 `grill-with-docs → to-spec → to-tickets → implement → code-review`。ask-matt 是整个集合的路由器。
Source: docs/engineering/to-tickets.md "Where it fits"
Stability: high

### 二、拆分粒度（to-tickets / to-spec / wayfinder / grilling）

Fact: `to-tickets` 把 spec/conversation 拆成 **tracer-bullet tickets**，拆分规则原文（`<vertical-slice-rules>`）：(1) 每个 slice 打穿所有层（schema、API、UI、tests）的一条窄而完整的路径，是 vertical 不是某一层的 horizontal slice；(2) 完成的 slice 可独立 demo 或验证；(3) 每个 slice 大小以"装进一个 fresh context window"为限；(4) prefactoring 先行（"make the change easy, then make the easy change"）。拆完会以编号列表向用户 **quiz**：粒度是否合适（too coarse / too fine）、blocking edges 是否真实、要不要 merge/split，用户批准后才发布到 tracker。
Source: skills/engineering/to-tickets/SKILL.md
Stability: high

Fact: ticket 的依赖用每张票的 **"Blocked by" 字段**显式声明（无 blocker 即可立即开始）；发布顺序为 dependency order（blockers 先发布，保证引用到的 id 已存在）。任何 blocker 全部完成的票构成 **frontier**（当前可领取的工作前沿）。工单模板正文是"What to build"（端到端行为，用户视角，非逐层实现清单）+ "Blocked by" + checkbox 形式的 acceptance criteria；明确禁止在 body 里写具体 file path 和代码片段（会过时），唯一例外是 prototype 产出的 decision-rich snippet（state machine/schema/type shape）。
Source: skills/engineering/to-tickets/SKILL.md（local-ticket-template / issue-template）
Stability: high

Fact: 明确的反模式——**horizontal slicing 是这个 skill 最常被打破、后果最重的规则**。docs 记录一个真实 field report：某团队把变更按层切成 26 张票（corpus / producer / aggregator / selector），结果每张关闭的票平均跑了约 20 次 agent、其中约四分之三是 rework，他们自己的 post-mortem 把每类失败都归因于 horizontal slicing。另一个高频反模式是 **over-decomposition**（三行改动拆出十二张票）：docs 称这是该 skill 被报告最多的摩擦，模型默认原子化拆分丢失有意义的分组；quiz 步骤就是用来合并的，且票数有一个下限——**如果整个变更装得进一个 context window，根本不该用 to-tickets，直接 `/implement`**。第三个反模式是验收标准失效（三种形态：base commit 上就已为真；只能靠别的 ticket 的工作才能满足；复述请求而非从 artifact 推导）。社区对策：给每张票加一行 "demo path"，逼模型垂直分解。
Source: docs/engineering/to-tickets.md（Tracer bullets, not layers / Common questions）
Stability: high

Fact: **wide refactor 是 vertical slicing 的唯一例外**：单一机械改动（rename column、retype shared symbol）blast radius 扫全库时没有垂直切片能落绿，改用 **expand–contract** 序列——expand（新旧并存）→ migrate（按 blast radius 定批次，每批一张票，全部 blocked by expand，CI 因旧形态仍在而逐批保持绿）→ contract（无调用方后删除，blocked by 所有 migrate 批次）；连批次都无法独立保绿时共享一条 integration branch，绿只在最后的 integrate-and-verify ticket 上承诺。
Source: skills/engineering/to-tickets/SKILL.md `<vertical-slice-rules>` 后段
Stability: high

Fact: 尺寸校准的另一证据：`/implement` 文档 FAQ 回答"一张票烧掉 150k tokens 是不是用错了"——不是 misuse，是票太大；杠杆在上游，回 to-tickets 把票重新 right-size 到一个 fresh window 装得下，宁可拆票也不要抬高 effort level。
Source: docs/engineering/implement.md（One ticket burned 150k tokens）
Stability: high

Fact: `wayfinder` 处理比一次 session 更大的雾中规划：map issue + child **decision tickets**（每张票是一个问题而非一段 build，size 以 "one 100K token agent session" 为限），票分 research(AFK)/prototype/grilling/task 四类；**claim 机制**是并发安全的骨架——开工前先把票 assign 给自己，open+unassigned 即 unclaimed；fog of war 部分不预切票（能精确表述问题的才成票）。frontier 同样定义为 open + unblocked + unclaimed。
Source: skills/engineering/wayfinder/SKILL.md
Stability: high

Fact: `grilling` 本身就用 frontier 概念做访谈：design tree 按 round 工作，每轮问出"prerequisite 已 settle 的全部问题"（即 frontier），答案落地后重算 frontier 进下一轮；需要查证的事实派 sub-agent 去找且不阻塞其余问题。
Source: skills/productivity/grilling/SKILL.md
Stability: high

### 三、多 agent 并行执行（implement-spec / docs 建议）

Fact: **直接对应 Rope 编排模式的是 `skills/in-progress/implement-spec`（未 graduate，仍在实验桶）**，其流程：(1) 读 spec 与 tickets，理解 task graph；(2) 可选派 **exploration subagent**，把笔记保存到 repo 外的目录供所有后续 subagent 共享（让 implementer 只专注实现）；(3) 建 branch + draft PR；(4) 为每张票跑 **implementer subagent，各自在自己的 worktree、自己的 branch**；(5) implementer 完成后由 **merger subagent** 把成果 merge 进 PR branch；(6) 合并改变了 frontier 就立即再派 implementer 到新就绪的票上——"maximum concurrency"；(7) 全部完成后对 PR branch 跑 code-review，review 发现的问题由**单个** implementer subagent 统一修；(9) 清理所有 implementer worktree。沟通原则："Communication to and from subagents should be sparse"，主要靠 **context pointers**（指向 spec、tickets、research notes、commits），不复述已有信息。票据被明确定义为 **task graph 而非步骤列表**。
Source: skills/in-progress/implement-spec/SKILL.md; skills/in-progress/README.md（"Works the tickets as a task graph rather than a list, running implementer subagents across the ready frontier for maximum concurrency, and lands the result as a single PR"）
Stability: high

Fact: 主线的 shipped 路径**不提供自动并行派发**：to-tickets 止步于 artifact，"Dispatch is manual: look at the board, count the tickets with no open blockers, and open that many agent sessions. One ticket per fresh context"；implement 也是 one invocation = one ticket，明确回答"能不能批量派发/subagent fan-out"——两者都被反复请求但都不存在。"If you want parallelism today, you are assembling it yourself." 这正解释了为什么 fan-out 版本（implement-spec）还停在 in-progress。
Source: docs/engineering/to-tickets.md（The tickets are published…）; docs/engineering/implement.md（Can I point it at all my tickets…）
Stability: high

Fact: 并行的隔离机制与已知坑：多 session 共享同一 working directory/index/HEAD 被记录为真实事故（`git commit --amend` 落到别的 session 的 commit、`refs/stash` 中 stash 消失、commit 落错分支，一个下午三个 issue）；**git worktree 是社区解法**，且文档特别提醒 `refs/stash` 在 worktree 之间也是共享的，worktree 不能修复 stash 场景。本地 tracker 也因此踩过坑：v1.1 的单一共享 tickets.md 会因并行 agent 写入产生竞争，现改为 `.scratch/<feature-slug>/issues/<NN>-<slug>.md` 一票一文件。
Source: docs/engineering/implement.md; docs/engineering/to-tickets.md（Where do the local tickets go…）
Stability: high

Fact: wayfinder docs 对并行给出审慎结论：frontier + blocking edges 让并行"on paper 安全"，但实际默认建议 one-at-a-time——两个 grilling 票并行时会互相问到对方刚问过的问题（session 之间无共享 context）；prototype 票有过 agent 自己造三个 UI 变体自己挑一个关单的报告；"If you do run in parallel, review the dependency graph yourself first." 实现/研究类 AFK 票适合并行，HITL 决策票不适合。
Source: docs/engineering/wayfinder.md（Can I work several tickets in parallel?）
Stability: high

Fact: 其它并行用法均为"同型任务分流而非流水线"：code-review 的两轴（Standards/Spec）跑两个 parallel sub-agents 以免互相污染 context，聚合时不合并不重排（防止单一 winner 抹掉两轴分工）；codebase-design 的 DESIGN-IT-TWICE 用 parallel sub-agents 对同一 interface 做 n 个 radically different 方案再比较。research skill 设计为 background agent 跑。wayfinder charting 时对全部 research 票并行 fire subagent，产物落在 throwaway `research/<name>` 分支。
Source: skills/engineering/code-review/SKILL.md; skills/engineering/codebase-design/DESIGN-IT-TWICE.md; docs/engineering/wayfinder.md; README.md
Stability: high

Fact: 配套安全网：`git-guardrails-claude-code` 用 PreToolUse hook 直接封禁 `git push`（含 --force）、`git reset --hard`、`git clean -f`、`branch -D` 等，降低多 agent 破坏 main 的风险。ask-matt 的 PHASE-BOUNDARIES 给出 phase 边界的五选一决策树（Continue → /clear → /handoff → Subagent → /compact），"AFK 且 scope 足够紧的任务派 subagent"是第四优先级，compact 是默认兜底而非首选。
Source: skills/misc/git-guardrails-claude-code/SKILL.md; skills/engineering/ask-matt/PHASE-BOUNDARIES.md
Stability: high

### 四、细拆后的可验收保证

Fact: 验收标准的归属和形态写在模板里：每张 ticket 带 checkbox 式 **acceptance criteria**（local 与 GitHub 两种模板均有专门 section）；triage 体系更严格的版本是 **Agent Brief**（issue 进入 `ready-for-agent` 时贴出的 authoritative specification），原则：durability over precision（写接口/类型/行为契约，禁 file path 与 line number）、behavioral not procedural（写 what 不写 how）、complete acceptance criteria（每条独立可验证，例如"运行 X 命令返回 Y"而非"Triage 应正常工作"）、explicit scope boundaries（列 out of scope 防 gold-plating）。
Source: skills/engineering/to-tickets/SKILL.md; skills/engineering/triage/AGENT-BRIEF.md
Stability: high

Fact: 验收的"谁检查"是分层的人工+机制组合：(1) to-tickets 发布前用户 quiz 把关拆分本身；(2) triage 在进入 ready-for-agent 前要求 agent 亲自动手 verify claim（bug 从 reporter 步骤复现、PR checkout 后跑测试），确认过的验证显著提升 brief 质量；(3) implement 内部在 spec 阶段 **pre-agreed 的 seam** 上跑 TDD（to-spec 第 2 步专门"Sketch out the seams"并与用户确认——seam 数越少越好，理想是一），结尾跑 code-review；(4) 验收标准的有效性检查落到人：docs 教你"对每条 criterion 说出能让它变假的那个 observation，并确认它在 implementer 起点的 commit 上确实失败"。
Source: skills/engineering/to-spec/SKILL.md; skills/engineering/triage/SKILL.md; docs/engineering/to-tickets.md（The acceptance criteria graded nothing）; docs/engineering/implement.md（Pre-agreed seams）
Stability: high

Fact: 单位完成定义的一个关键缺口：**implement 不关票、不勾 acceptance criteria、不处理 code-review 发现**（GitHub Issues 和本地 markdown tracker 均确认），docs 直言"Close the ticket and reconcile the criteria yourself"，并且这在依赖链上伤害最大——因为 frontier 的定义是"blockers 全部 closed"，没人关票 frontier 就永远不动。这是已知的、贯穿 #554/#513/#618 等多个 issue 的未修缺口。
Source: docs/engineering/implement.md（It finished, but my ticket is still open）; docs/engineering/to-tickets.md
Stability: high

## Assumptions

- 2026-09-01 复核（tip `6654f6b`，harvest 区间 9603c1c..6654f6b）：上述结论均未变——shipped `implement` 仍 one-ticket-per-session 且 FAQ 明确拒绝批量派发/subagent fan-out；`implement-spec` 仍停 in-progress。期间 to-tickets 删掉了一句「Work the frontier one ticket at a time with /implement」，但那是跨 skill 调用措辞清理，非并行化信号。
- implement-spec 仍处 in-progress 说明作者认可 task-graph+worktree+frontier-refill 这套编排方向，但其细节未经他大规模实战验证；借鉴时应视为"方向背书"而非成熟方案。
- docs/ 页面的 field reports（26 票横向拆分的 post-mortem、amend/stash 事故）来自社区反馈的转述，数字精度一般，但方向性结论（横切必败、共享 index 必乱）可信。
- Matt Pocock 公开内容（aihero.dev、X）与本仓库 docs 高度同源（docs 大量互链 aihero.dev/skills-*），本报告未再单独引入其博客/X 作为补充来源——仓库一手内容已覆盖问题 4 所需的全部信息。

## Implications for Rope

针对"slice 切得太粗、依赖链太长、并发度不高"，上游给出的机制级启示：

1. **切片单位改成 tracer-bullet 垂直切片，尺寸锚定 context window**。Rope 若出现粗粒度 ticket，多半是按层或按功能块横切。可直接采纳两条可检查的硬规则写入 rope-shape/go：(a) 每 slice 能回答"完成后我能 demo 什么？"且答案是行为不是层；(b) 一个 slice ≈ 一个 fresh context window（~100k tokens）装得下；反过来也有下限——整个 feature 装得进一个 window 就别拆，直接单 session。这同时治"太粗"和过度细拆两个方向的病。

2. **依赖表达升级为显式 per-slice blocked-by + frontier 重算**。把"父会话串行合并"升级为 implement-spec 式循环：合并一个 slice 后立即重算 frontier，frontier 非空就继续派 implementer，而不是回到队列头取下一张（链式等待正是依赖链显得长的原因之一）。blocker 先行编号发布，保证边可引用。

3. **隔离/合并照抄 implement-spec 的三角**：exploration subagent 笔记存 repo 外共享目录（省去每个 implementer 重复探索）、implementer 各自 worktree+branch、merger subagent 收口合入 PR 分支。配套引入本地"一票一文件"防写竞争，以及 git-guardrails 思路的 hook 拦截破坏性 git 操作；特别注意 `refs/stash` 跨 worktree 共享的坑。

4. **把上游反模式清单编进 Rope 规则**：horizontal slicing（附 quantified 后果）、共享 working-dir 多 session 并行、单共享文件多 agent 写、没有 demo 路径的票、base-commit 上已为真的验收标准、HITL/决策类任务并行（wayfinder 的告诫：决策票并行会互相重复提问，AFK 实现票才适合 fleet）。wide refactor 用 expand–contract 显式序列替代硬切垂直片。

5. **补齐"关票"自动化**。上游最大的已知缺口是实现者完成却不更新票状态导致 frontier 卡死——Rope 既然有父 orchestrator，应该让 orchestrator（而非实现者或人）负责验收勾选、关 slice、触发 frontier 重算，这正是相对上游可以做得更好的地方。

6. **沟通协议 sparse 化**：subagent 间只传 context pointers（spec/slice 文件/commit/research 笔记路径），不复述内容；这直接降低 orchestrator 的 token 开销，也让"验收者 ≠ 实现者"的 fresh-session review（code-review 两轴分离的理由）成为默认。
