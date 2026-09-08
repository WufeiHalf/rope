# 确定性编排 vs LLM Agent 编排——业界立场、证据与验收协议

> 研究日期：2026-09-05。网络来源均经代理一手抓取/验证（fetch 或 twitter-cli /
> rdt），验证日期标注在各 Fact。本文不重复
> `.rope/research/mattpocock-skills-slicing-and-parallelism.md` 已验证的拆分粒度
> 结论，只补"编排者形态"（orchestrator form）维度。

## 1. Question

"确定性编排（脚本/固定循环当总指挥派发子 agent）vs LLM agent 当编排者"——
业界各方真实评价、证据和适用边界，尤其：**效果如何判断、验收协议怎么设计**。
决策背景：Rope 是 Parent Orchestrator 工作流系统，目前由父 LLM 会话按 slice
graph 逐波派发 implementer/reviewer 子 agent（ADR 0007/0008）。要不要引入
确定性编排层。

## 2. Verified Facts

### 2.1 Matt Pocock（@mattpocockuk）

Fact: Matt 的立场有一条清晰演进线，三周内从"刻意选 agent 编排"翻到
"确定性编排永远更好"：
- 2026-08-18（2089685052015673604）："Going to try bitter lesson-ing myself
  this week. Instead of hand-rolling a deterministic loop to tackle tickets from
  /to-tickets I'll just get an agent to delegate to subagents. **Probably more
  expensive, less reliable, but may have emergent benefits**"——他当时清楚知道
  代价，把 agent 编排当作赌涌现收益的实验。
- 2026-08-21（2090761149268533710）实验结果："This just ran for 1hr 20, built
  6 tickets, **120K context in the main orchestrator (with some inefficiencies
  I can cull)**. Overall, I like it."——agent 编排者的实测病根是**编排者自身
  context 膨胀**：6 张票就烧掉 120K。
- 2026-08-21（2090747462973571302）tier list："S:（空）A: **Deterministic
  orchestrator** B: /implement-spec C:（空）F: /goal"——确定性编排者排在他
  自己 agent 编排 skill 之上。
- 2026-08-30（2094156122441625770 + 回复 2094162049177674125）："Most
  folks don't have an AFK agent workflow set up yet. You should. **It's better
  than /implement-spec.** BUT running /implement-spec is good, especially
  **while tokens are cheap**, and very simple to set up."；被问 AFK setup
  相比 implement-spec 多了什么时，原话回答："**If you can get the orchestrator
  to run deterministically (instead of using an agent as orchestrator) it's
  always better. Means it can run faster, for cheaper, and more reliably.**"
Source: https://x.com/mattpocockuk/status/2089685052015673604 ;
https://x.com/mattpocockuk/status/2090761149268533710 ;
https://x.com/mattpocockuk/status/2090747462973571302 ;
https://x.com/mattpocockuk/status/2094156122441625770 ;
https://x.com/mattpocockuk/status/2094162049177674125
Stability: high（twitter-cli 一手，2026-09-05）

Fact: 他的 AFK workflow（确定性版）尚未公开：截至 origin/main `3cca18b`
（2026-09-04），`implement-spec` 仍在 `skills/in-progress/`，仓库里没有 AFK
skill——推文说 "I'll be graduating this into my public skill set once I'm back
from holiday"。**即"确定性更好"是他自己的一手实验结论 + 即将产品化的方向，
但确定性版的实现细节外界还看不到**；能看到的只有 agent 编排版
（implement-spec：读图→exploration subagent→逐票 implementer（各 own
worktree/branch）→merger subagent 合入 PR 分支→frontier 变化即补派→末尾
单次 /code-review→清理 worktree）。其已知缺陷：编排者 120K context 且自称
有可砍的低效；无 fix-round 预算；不关票（frontier 卡死缺口，见
mattpocock-skills 研究第 3 节）。
Source: `~/.cache/rope-upstream/mattpocock-skills`（origin/main 2026-09-04，
`skills/in-progress/implement-spec/SKILL.md`、`skills/in-progress/README.md`）
Stability: high（clone git 对象一手）

Fact: Matt 的 AFK 词条给出确定性/无人值守形态的**验收协议骨架**：跑前消除
歧义（grilling、书面 spec），跑中靠 automated checks + automated review
"stand in for the attention you're not giving, failing fast on what can be
caught mechanically"，跑后产物必须 reviewable（"a PR, not changes already
merged... AFK doesn't remove human review; it defers all of it to the end"）。
并点名特征失败："coming back to hours of finished, confident work built on a
wrong call made in the first ten minutes. The work isn't sloppy — it's
**coherent, just coherent about the wrong thing**."（确定性编排会可靠地执行
一个错误的开局决策——这是他对自家立场的内置警告。）
Source: https://www.aihero.dev/ai-coding-dictionary/afk （fetch 2026-09-05）
Stability: high

Fact: 配套词条把"验收手段"按确定性分层——**automated check**："A
deterministic verification that runs in the environment — tests, type checks,
lints, build, pre-commit hooks. Pass/fail, no judgement... Determinism is what
makes the loop trustworthy: the same code always produces the same verdict, so
a pass means something"；**automated review**："An agent reviewing another
agent's work, often with a different model or system prompt.
Non-deterministic: it forms a judgement... treat it as a filter that raises
the floor before a human looks, not a gate that replaces one"。判断型验收
（review）与机械型验收（check）的分界被明确词汇化。
Source: https://www.aihero.dev/ai-coding-dictionary/automated-check ;
https://www.aihero.dev/ai-coding-dictionary/automated-review （fetch 2026-09-05）
Stability: high

### 2.2 固定图流派（LangGraph / Microsoft Conductor）

Fact: LangGraph 原始宣言（2024-01）的论证：复杂 LLM 应用普遍引入 cycle、用
LLM 推理下一步，但落地经验是 "often times more control is needed"（强制先调
某工具、按状态换 prompt 等），把受控流称作 state machine——"These state
machines have the power of being able to loop - allowing for handling of more
ambiguous inputs than simple chains. However, there is still an element of
**human guidance in terms of how that loop is constructed**."
Source: https://blog.langchain.com/langgraph/ （fetch 2026-09-05）
Stability: high

Fact: LangChain 官方对比文（Deep Agents vs LangChain vs LangGraph）给出
runtime/framework/harness 三层光谱与选择规则："LangGraph offers maximal
determinism: it lets you **encode domain knowledge directly into the graph's
topology instead of leaving that judgment to a model**"；"Reach for LangGraph
when your agent doesn't fit a standard loop, **or you need to mix
deterministic and agentic steps in the same workflow**"；规则是"Start with
Deep Agents（agent harness）. When you need to model a complex workflow or
want complete control of every step, reach for LangChain and LangGraph"；对
"approval step, a compliance check, a business rule that shouldn't be left to
the model"，官方答案是 middleware 在 agent loop 周围注入确定性步骤。
Source: https://www.langchain.com/blog/deep-agents-vs-langchain-vs-langgraph
（fetch 2026-09-05）
Stability: high（官方、但带产品激励）

Fact: Microsoft Conductor（开源 CLI，2026-05-14）是目前最直白的确定性派
官方声明："Most frameworks approach this by making the orchestrator itself an
LLM — an agent that dynamically plans which agents to call... That works when
the task is exploratory. But for workflows with **known structure** (and in
practice, many of the most useful workflows do have known structure), dynamic
orchestration adds **cost, latency, and unpredictability**"；"We'd rather have
**predictability, cost control, and auditability than replanning
flexibility**"；"**The orchestration layer consumes zero tokens.** The
structure is fixed at definition time — and that's the point."；同时给出
反方边界："**If your task needs to restructure itself based on what it
discovers, let the LLM decide what comes next.**" 形态：YAML workflow + 隔离
agent + 可视 DAG（"a routing graph you can see before anything runs"），
human gate 是图内一等步骤，条件路由/回环用 Jinja2 表达式。
Source:
https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows
（fetch 2026-09-05）
Stability: high（官方一手；产品动机需折扣）

### 2.3 Anthropic 官方工程观点

Fact: 《Building Effective Agents》（2024-12）把谱系词汇化："**Workflows**
are systems where LLMs and tools are orchestrated through **predefined code
paths**. **Agents**... are systems where LLMs **dynamically direct their own
processes and tool usage**"；选择规则："workflows offer predictability and
consistency for well-defined tasks, whereas agents are the better option when
**flexibility and model-driven decision-making are needed at scale**"；
"Agents can be used for open-ended problems where it is difficult or
impossible to predict the required number of steps"；代价警告："The autonomous
nature of agents means higher costs, and the potential for compounding
errors"；总纲："find the simplest solution possible... consider adding
complexity only when it demonstrably improves outcomes."
Source: https://www.anthropic.com/engineering/building-effective-agents
（fetch 2026-09-05）
Stability: high

Fact: 《How we built our multi-agent research system》（2025-06）——Anthropic
旗舰系统选择 **LLM 当编排者**（lead agent + worker subagents），理由是任务
形态而非能力偏好："Research work involves open-ended problems where it is
very difficult to predict the required steps in advance. **You can't hardcode
a fixed path** for exploring complex topics, as the process is inherently
dynamic and path-dependent." 数据：multi-agent（Opus 4 lead + Sonnet 4
workers）比单 agent Opus 4 在内部研究 eval 高 **90.2%**；"token usage by
itself explains **80% of the performance variance**"；"agents typically use
about 4× more tokens than chat interactions, and multi-agent systems use
about **15×** more tokens than chats"。失败边界说得直白："most coding tasks
involve **fewer truly parallelizable tasks** than research, and **LLM agents
are not yet great at coordinating and delegating to other agents in real
time**"；早期翻车形态包括 "spawning 50 subagents for simple queries"。
即 Anthropic 对编码场景的多 agent 编排持保留态度，对开放研究场景力挺 LLM
编排者——分界是任务可预测性，不是意识形态。
Source: https://www.anthropic.com/engineering/built-multi-agent-research-system
（fetch 2026-09-05）
Stability: high

Fact: （复用本地已验证一手结论）《Effective harnesses for long-running
agents》给出验收协议核心件：generator/evaluator 分离（self-evaluation
skews positive；"out of the box, Claude is a poor QA agent... talks itself
into deciding they weren't a big deal and approve the work anyway"→需要
单独调校的怀疑型 evaluator + 硬性 per-criterion 阈值）；evaluator 用
Playwright 像用户一样点真实运行的应用；跑前谈好 sprint contract（一次
27 条 granular criteria）。
Source: https://www.anthropic.com/engineering/harness-design-long-running-apps
（本地 2026-08-22 验证，见 session-01a01ece-postmortem.md）
Stability: high

### 2.4 Claude Code / pi 生态

Fact: Claude Code `/workflows`（2.1.147，后被撤）社区宣言直接命中本题：
"/workflows **replaces the LLM orchestrator with code**"；痛点定量描述：
"Every sub-agent result re-enters the orchestrator's context. Spin up 10
agents and your main session pays a **'token tax'** each time"；新形态：
"Sub-agent outputs flow from one phase to the next directly **never touching
[the orchestrator]**... use code for what code is good at (control flow), and
models for what models are good at (judgment inside each step)"。
Source: https://www.reddit.com/r/ClaudeCode/comments/1tkjy4u/ （rdt 一手
复核 2026-09-05；273 评论）
Stability: medium（社区帖；功能本身已被 Anthropic 撤回重做）

Fact: Anthropic 曾给 Claude Code 的 Opus 5 硬编码系统提示："**Do not call
the AgentTool unless the user requested it**"（二进制逆向发现）。社区实测：
例行化 subagent 委派让产出变差，包括一次自审计因无法 spawn 独立 auditor
而变成非盲审——厂商自己认定其旗舰模型**默认不该自主当编排者**，委派需按
任务逐次论证（context 保护 / blast radius / 并行收益）。
Source: https://www.reddit.com/r/ClaudeCode/comments/1v6y5q2/ （rdt 一手
复核 2026-09-05；156 评论）
Stability: medium（社区逆向，方向多源一致）

Fact: Claude Code "dynamic workflows"（2026-05-28 发布，catwu 推文 +
官方 Cookbook）是当前最有参照价值的**混合形态**：LLM 只在开工时写一次
JS 编排脚本，运行时确定性执行。"Instead of orchestrating turn by turn,
Claude writes a JavaScript orchestration script for the task and passes it
to the `Workflow` tool, whose runtime executes it in the background." 与
subagent 模式的官方对比："With subagents… **Claude is the orchestrator. It
decides turn by turn what to delegate, and nothing guarantees that it
delegates every piece, combines the results at the end, or verifies
anything**"；"'Double-check your findings' is also just an instruction, and
**under context pressure it gets skipped**. The workflow below makes
verification **structural**"；"The plan is enforced by code... **Nothing
depends on Claude remembering an instruction.**" 工程参数：并发上限 16、
单 run 1000 agents、停止可恢复（已完成 agent 返回缓存结果）；编排脚本本身
无文件系统/shell 权限，只有它 spawn 的 agent 有。
Source: https://x.com/_catwu/status/2060054180379689074 （twitter-cli 一手
2026-09-05）；
https://platform.claude.com/cookbook/claude-agent-sdk-08-dynamic-workflows
（fetch 2026-09-05）
Stability: high

Fact: pi 的确定性编排机制**公开文档缺失**：`docs/*.md` 全文无
SubagentWorkflow 条目；存在的证据是 CLI flag `--subagents-workflow-file`
（`pi --help`：以 workflow script 启动）与运行时工具契约——"Use
SubagentWorkflow when **the number of agents depends on something discovered
at runtime**, when **work flows through stages**, or when **findings should
be independently verified**. Use Agent for one delegated task or a handful
you can name up front." 设计哲学可读出：确定性 runner 用于"数量运行时才知
道 / 分阶段 / 需独立验证"的 fan-out，把少量可命名任务留给 Agent 工具。
workflow 文件格式、是否支持 worktree 隔离与审批 gate——**未验证**。
Source: `pi --help`（本机 pi 4.x）+ 会话运行时工具契约；docs grep 为空
Stability: medium（一手观察，非公开文档；版本相关）

### 2.5 HumanLayer / dexhorthy

Fact: dexhorthy 对 catwu dynamic workflows 发布的直接回应（2026-05-28）：
"someone hit me up about the new 'claude dynamic workflows' feature,
claiming 'see, multi-agent works'. But really, the launch of this feature
proves the exact point that I made back in June of 2025... **Deterministic
workflows orchestrating small agent loops beats non-deterministic
multi-agent or 'agent soup' systems every dang time. everything is context
engineering**"。注意他连 dynamic workflows 也算作自己论点的证明——LLM 只
写计划、代码执行，正是"deterministic workflow orchestrating small agent
loops"。Tobi Lutke 在同线程："There is so much alpha still left in **harness
engineering**... Codemode DSL for orchestration is brilliant."
Source: https://x.com/dexhorthy/status/2060144982372340155 （twitter-cli
一手 2026-09-05，含被引 catwu 原推与 tobi 回复）
Stability: high

Fact: HumanLayer 12-factor agents 把 HITL 编排进确定性结构：Factor 7
"Contact Humans with Tool Calls"（人审 = 结构化 tool call，不是自然语言
拦截）、Factor 8 "Own Your Control Flow"。文中同时保留 LLM 的位置：
"deterministic code might run one micro agent responsible for handling the
human-in-the-loop steps"；"**having language models managing well-scoped
sets of tasks makes it easy to incorporate live human feedback, translating
it into workflow steps without spinning out into context error loops**"
——他们的确定性立场是"确定性骨架 + well-scoped 小 LLM 环节"，不是全代码。
Source: https://www.humanlayer.dev/blog/12-factor-agents （fetch 2026-09-05）
Stability: high

Fact: HumanLayer《A Brief History of Ralph》总结确定性 while-loop 流派的
边界与验收纪律：ralph 的要点 "not 'run forever' but in **'carve off small
bits of work into independent context windows'**"；"**overbaking**"
（跑太久涌现怪行为，如给项目加后量子密码支持）；specs 质量决定产出
（"if the specs are bad, the results will be meh"）；"**if you are
iterating/exploring, you probably don't want ralph in the first place**"；
门控节奏："we have since set up any ralph-ish desired state loops to run
**ONCE on a cron overnight**... Waking up to one small refactor every
morning is better than both a) waking up to none and b) waking up to 50."
Source: https://www.humanlayer.dev/blog/brief-history-of-ralph （fetch
2026-09-05）
Stability: high

Fact: dexhorthy 的 "trajectory" 概念（Matt 转述并认同，2026-08-05 推文
2085063640470974489）：agent 在 session 内积累习惯（"If it verifies the
app by cURL once, it'll probably do it when you request the next change"），
换轨迹需要清 context。这对"长驻父 LLM 会话当编排者"是结构性批评——编排者
session 越长，轨迹偏移风险越大；确定性编排层没有这个问题。
Source: https://x.com/mattpocockuk/status/2085063640470974489 （twitter-cli
2026-09-05；原访谈为 Gergely Orosz 对 dexhorthy 的访谈）
Stability: medium（转述）

### 2.6 反方证据：agent 编排的灵活性何时不可替代

Fact: Anthropic 研究系统是 agent 编排者的正面成功案例，且其胜利条件被
明确定义为**不可预先硬编码路径**的任务："You can't hardcode a fixed path...
the process is inherently dynamic and path-dependent"；LLM lead 还承担
**缩放决策**（简单事实查证 1 agent / 3-10 工具调用，复杂研究 >10
subagents）——编排者按中间发现调整 fan-out 规模，这是固定图做不到的。
Source: 同 2.3 multi-agent research system 文（fetch 2026-09-05）
Stability: high

Fact: Cognition《Don't Build Multi-Agents》（Walden Yan，被 dexhorthy 列为
2025-06 同阵营者）提供了**横切两派的第三方批评**：问题不在"谁当编排者"，
在 context 分散。两原则："Share context, and share full agent traces"；
"Actions carry implicit decisions, and conflicting decisions carry bad
results"；"The simplest way to follow the principles is to just use a
**single-threaded linear agent**"；对 Claude Code subagents 的观察：它"never
does work in parallel with the subtask agent, and the subtask agent is
usually only tasked with **answering a well-defined question**, not
writing any code"，subagent 的正当价值是"context 保护"而非并行产能。含义：
把编排换成脚本并不会自动修复 context 分散；反过来，agent 编排的"灵活性"
如果表现为让无共享 context 的并行 agent 互相踩踏，也不值钱。
Source: https://www.cognition.ai/blog/dont-build-multi-agents （fetch
2026-09-05）
Stability: high（论述型一手，无量化数据）

Fact: 判断型收尾无法 gate 化的社区一手证据：mattpocock skills docs 记录
/code-review 的非收敛性——"/code-review and /improve-code-architecture
**always find new stuff every time**... **There is no convergence
guarantee**... do not run it in a loop until it comes back clean, because
**it will not**"。即评审（判断型验收）天然不满足确定性 loop 的"同输入同
输出"前提，验收协议必须给它预算和停止规则，而不是期望它变绿。
Source: `~/.cache/rope-upstream/mattpocock-skills` origin/main
`docs/engineering/code-review.md`（git 一手 2026-09-05）
Stability: high

Fact: Matt 自己的 AFK 词条承认确定性形态的特有失败模式（见 2.1：coherent
about the wrong thing）；Microsoft Conductor 也承认边界（"If your task needs
to **restructure itself** based on what it discovers, let the LLM decide"）。
两端官方都把"重规划/按发现重构任务"划给 LLM 编排。

### 2.7 Rope 内部基线（本地数据提炼）

Fact: 父 LLM 会话在派发循环里做的事可二分（以 01a03d5d 9 切片 31 叶子
session 为证）：
- **机械可脚硫化**（占父会话消息大头）：按 wave/frontier 取下一批 slice、
  写 spawn header、等叶子和收集 summary、merge 后重算 frontier、派
  reviewer、tasks.md 勾选记账、worktree 清理、失败 spawn 重试。ADR 0007/0008
  之后这些已经有确定算法（graph-driven waves / slice-ready worktree
  scheduling），父会话只是在"手工执行"这个算法。
- **真判断力**（fix-round 分类学的 B/D/E 类 + 降级）：B 类跨切片接缝晚发现
  （carry-forward × ordering guard 交互——本质是需要**重切图**的信号）；
  D 类规格→brief 投影缺口由父会话在 join 时补救（shape 缺陷的运行时吸收）；
  E 类父会话亲自验证吸收（通读 mark_completed 实现 + detached worktree
  复跑 suite + 每次 merge 后亲自跑 assembled regression——验收判断没有
  机械返回门时的代偿）；外加 S7 派发风暴后降级为父自实现、冲突转 merge
  leaf 的临场决策。
Source: `.rope/research/session-01a03d5d-dispatch-metrics.md`（fix-round
taxonomy 表；21 spawns / 13 fix rounds / 1570 messages / 4 compactions /
active 3h20m / 并发峰值 3 / Human Gate 停摆 8.4h）
Stability: high（session 一手）

Fact: 墙钟数据说明**父编排者不是当前瓶颈**：01a01ece go 阶段 7.45h wall
中 leaf busy 占 87%，父会话仅 ~13%；瓶颈是串行前台叶子与管线形态
（serial + per-slice review），ADR 0007/0010 已用图驱动并行 + 单 gate 修。
另一面：13 个 fix round 中 A+B+C ≈ 12/13 指向票据粒度与返回门缺失
（shape 问题），只有 D/E 是父会话判断力的真实用途——即**当前返工主因
也不是"agent 当编排者"**。
Source: `.rope/research/session-01a01ece-postmortem.md` Round 2；
`.rope/research/session-01a03d5d-dispatch-metrics.md`
Stability: high

Fact: ADR 历史上的确定性层决策链：ADR 0003 non-goal 明确"**不采用
pi-dynamic-workflows 当 go 引擎**：prototype、无 worktree 隔离、无审批/
并发控制、会与 review/commit/verify gates 打架"，但保留"可手动用于一次性
只读 fan-out"；ADR 0007 Alternatives 里"deterministic code orchestrator
replacing the LLM parent（社区 /workflows 方向）：**deferred — worth
revisiting once worktree-isolated spawns land in the host**"。该 deferral
条件现已满足：ADR 0008 已落地 worktree 隔离执行，pi 已有
`--subagents-workflow-file`。**即按 Rope 自己的 ADR 条款，这个 revisit 已
经到期。**
Source: `.rope/adr/0003-dynamic-workflow-mode.md`；
`.rope/adr/0007-graph-driven-go-single-review.md`（本地一手）
Stability: high

## 3. 立场矩阵

| 方 | 主张 | 适用场景 | 关键证据 | 强度 |
| --- | --- | --- | --- | --- |
| Matt Pocock | 确定性编排者"always better（faster/cheaper/more reliable）"，tier A；agent 编排是"tokens 还便宜时"的简易选项 | 结构已知的 ticket/spec 执行 | 自家 6 票/1h20/120K orchestrator context 实测 + 即将 ship 的 AFK skill；AFK 词条内置"coherent about the wrong thing"警告 | 中高：一手实践，无对照实验 |
| LangChain/LangGraph | 图拓扑承载领域知识，"mix deterministic and agentic steps"；默认从 agent harness 起步，要控制再降层 | 需要 approval/compliance/业务规则等"不该交给模型"的步骤 | 官方文档+博客一贯论述 | 高（官方，产品激励需折扣） |
| Microsoft Conductor | 编排层零 token、定义时固定结构；"predictability, cost control, auditability > replanning flexibility" | known-structure 工作流（review pipeline、plan-then-implement 循环） | 官方 OSS 博客，直白对比 LLM orchestrator | 高（官方；同理折扣） |
| Anthropic（工程博客） | 谱系论：workflows（代码路径）给可预测性，agents（LLM 自主）给规模化灵活性；编码任务"not yet great at coordinating in real time" | 研究类开放任务→LLM 编排者；well-defined 任务→workflow | 90.2% 提升 + token 方差 80% 的量化；Claude Code 又硬编码抑制 AgentTool、又 ship /workflows 与 dynamic workflows | 高：两端都有官方一手，立场是"按任务形态分界" |
| dexhorthy / HumanLayer | "Deterministic workflows orchestrating small agent loops beats agent soup **every dang time**"；但确定性骨架内保留 well-scoped LLM 环节承载 live human feedback | 一切可 spec 化的循环；探索期例外（"don't want ralph"） | 12-factor（Factor 7/8）+ Ralph 复盘 + 持续推文 | 中高：理念+实践，无公开量化 |
| Tobi Lutke | harness engineering 是 alpha；看好 Codemode DSL 编排 | 同上 | 推特附议 | 低（单条推文） |
| Cognition (Walden Yan) | 默认单线程线性 agent；并行多 agent 脆弱——**横切批评：关键在 context 共享，不在编排者形态** | 一切；subagent 仅限"well-defined question" | 两原则论述 + 对 Claude Code 的观察 | 中高：论述一手无量化 |
| 社区（r/ClaudeCode） | /workflows"biggest shift"欢迎 token tax 消除；AgentTool 硬编码引发争议（例行委派降质） | - | 两个高热帖（273/156 评论） | 中：社区样本偏差 |
| Anthropic harness 文 / Matt 词条（共识） | 验收分层：deterministic check（机械门）+ fresh-context skeptical evaluator（判断门）+ human（终审）；判断型 review 无收敛保证，须给预算 | 所有 AFK/批量形态 | 官方博客 + 词典 | 高 |

## 4. 验收协议选项（确定性编排下怎么判断"跑完的效果"）

三套可直接抄的设计（均已被上述来源实战使用）：

### A. 分层 gate 栈（AFK 协议 + sprint contract + 机械返回门）
- **跑前**（人在场，判断最便宜时）：grill/shape 消歧；产出 spec + acceptance
  criteria 投影表（每条 criterion 绑定"什么观测能让它为假"，且在 base commit
  上确实为假——mattpocock docs 的有效性检查）；预谈 sprint contract（Anthropic
  harness：一次 27 条 granular criteria， evaluator 引用 file:line）。
- **跑中**（无人）：deterministic automated checks（type/test/lint/build +
  Required-evidence 机械返回门：叶子 summary 必须逐条映射 evidence 到命令
  输出，缺映射即 fail）；不可机械化的交给 fresh-context automated review
  （不同模型或 review-specific prompt；定位是"raises the floor"的 filter，
  非 gate）。
- **跑后**：产物必须是 reviewable artifact（单 PR）；单独调校的怀疑型
  evaluator 用真实入口（browser/CLI/API）点一遍 + 硬性 per-criterion 阈值，
  任何 must-fail 项命中即 fail（对抗"Claude talks itself into approving"）。
- **升级路径**：gate fail → 模板化 fix brief → 修复预算 ≤2 轮 → Human
  Escalation Stop（批量面板：哪个切片、要什么授权、影响面——01a03d5d 的
  8.4h 停摆教训）。
- 判断型 review 的停止规则：不追"跑回绿"（无收敛保证），按预算停。

### B. 图先审后跑（Conductor / workflows 式）
- workflow 以 YAML/JS 定义，**DAG 在跑之前可见可审**——"审计划"本身就是第
  一道验收（"a routing graph you can see before anything runs"）；human
  gate 是图内一等节点（Factor 7：审批=结构化 tool call，带超时与默认路径）；
  预算、条件路由、回环写在代码里（"budgets in real JS"）；每个 stage 的输出
  过 structured schema 校验。
- 效果判断 = 可审计性：重放 run、看每步输入输出与 gate 判定记录；
  orchestration 层零 token，成本与延迟只来自 agent 节点。
- 升级路径：条件路由不覆盖的意外 → 显式 fail-fast 节点 → 人或 LLM 裁决后
  改图重跑（已完成的 agent 结果可缓存复用，dynamic workflows 的 resumability）。

### C. 混合：plan-once, execute-deterministically（dynamic workflows 式；Rope 兼容度最高）
- **LLM 只做一次计划**：shape/grill 阶段（人还在场）产出 slice graph——Rope
  已有；把图编译为确定性执行脚本（wave 派发、worktree 隔离、merge、review
  dispatch、fix 循环全部代码化）。
- **确定性引擎执行**："The plan is enforced by code... Nothing depends on
  Claude remembering an instruction"——context 压力下被跳过的不再是"叮嘱"，
  因为 verification 是 structural 的。
- **LLM judgment 只在预定义 seam 返回**（Rope 的 B/D/E 类时刻）：join 裁决、
  重切触发（back-to-grill）、defense-budget 违例判定、gate 升级解释。每个
  裁决点记录 verdict 进 issue package，保持可审计。
- 效果判断指标（spike 用）：父会话 token 消耗、go wall-clock、fix
  rounds/slice、gate 首过率、replan 次数、人工干预次数与停摆时长。

## 5. Assumptions（未验证部分）

- **pi SubagentWorkflow 无公开文档**：仅 CLI flag + 运行时工具契约可证；
  workflow 文件格式、是否支持 worktree 隔离/审批 gate/失败预算均未验证。
  ADR 0003 当年拒绝 pi-dynamic-workflows 的三条理由（prototype、无隔离、
  与 gates 打架）对如今 ship 的版本是否仍成立，需要 spike 实测。
- Matt 的 AFK workflow skill 截至 2026-09-04 未公开（"back from holiday"
  后 graduate），其确定性程度（纯脚本 vs 脚本+小 agent 环节）不可见；
  "人离开键盘时批量出货的脚本"是从推文+词典推断的形态，非一手实现。
- tier list 推文里 S 档为空、/goal 为 F 档的背景未深挖；/goal 是何 skill
  未验证。
- dexhorthy "June 2025" 的原帖未直接抓取（现引 2026-05-28 推文的转述）。
- Conductor/LangChain/Anthropic 均为产品方一手，立场与产品利益一致，量化
  数字（如 90.2%）无独立复现。
- Reddit 两个线程为社区样本（逆向二进制 + 个人实测），有选择偏差。
- Anthropic harness 文（2.3 第三条）未于今日重抓，复用本地 2026-08-22 的
  验证记录。
- LangGraph 宣言为 2024-01 文本，与当前版本（v1.x）措辞可能有漂移。

## 6. 对 Rope 的启示

1. **Rope 已经是"半个混合形态"**：ADR 0007/0008 把派发顺序算法化
   （graph-driven waves / slice-ready），父会话只是在手工执行算法 + 在 seam
   上做判断。业界共识（Anthropic 谱系论、LangChain middleware、dynamic
   workflows、12-factor Factor 8）指向的不是二选一，而是**把机械部分下沉
   为代码、把判断保为显式 seam**——Rope 的 B/D/E 类时刻就是天然的 seam 清单。
2. **当前不要为墙钟引入确定性层**：本地数据两期一致——瓶颈是票据形态与
   串行前台叶子（87% leaf busy；12/13 fix round 指向粒度与返回门），不是
   父会话延迟。确定性层的真实收益在：编排 token 成本（01a03d5d 1570
   messages / 4 compactions）、gate 执行的结构性保证（cookbook："under
   context pressure it gets skipped"——01a03d5d 的 E 类父代偿验证就是 Rope
   版的"叮嘱被跳过后人工代偿"）、审计与重放。
3. **先吃已有的机械验收药方再评估**：01a03d5d grill 已确认的三件套
   （evidence 投影 + 机械返回门 + Defense Budget）正是协议 A 的核心件；
   落地后 B/D/E 类判断事件若显著减少，剩余判断密度才是"还需要多少 LLM
   编排者"的真分母。
4. **升级为 spike 对照实验的具体触发判据**（可观察、按 ADR 0007 的
   deferral 条款本就已到期）：
   - **T1 编排 token 占比**：go 阶段父会话消息中机械性消息（spawn header/
     状态收集/tasks.md 记账/merge 排序）占比 > 50%，或单 issue go 阶段
     compaction ≥ 3（01a03d5d 实测 4 次）。
   - **T2 correction 轮数**：fix rounds/slice > 1.4（当前 1.44）持续 ≥ 3
     个 issue，且 A+B+C 类占比已降至 < 50%（票据药方已吃够，返工仍高——
     说明派发/验收循环自身在制造轮次）。
   - **T3 gate 失信**：每 issue 出现 ≥ 1 次 E 类父代偿验证（父会话亲自跑
     suite/通读实现才能验收），或 Human Gate 停摆 > 1h（对照 8.4h 极值）。
   - **T4 host 条件**：pi `--subagents-workflow-file` 或等价 SDK runner 能
     承载 worktree 隔离 spawn + 失败预算（需先做 capability spike 验证
     Assumption 第 1 条）。
   - 满足 T1+T3 或 T2+T4 时启动双跑实验：同一 issue 包，父 LLM 编排 vs
     脚本编排（同图同 gate），比父会话 token / wall-clock / fix rounds /
     gate 首过率 / replan 次数 / 人工干预。
5. **边界提醒**（防过冲）：确定性层不得吞掉判断 seam——B 类接缝发现必须
   保留 back-to-grill 重切逃逸（Cognition 的 context 论也提醒：换编排者不
   修复共享 context 问题，Rope 的 owned-files + merge-leaf 纪律仍是并行安全
   的承重墙）；判断型 review（reviewer leaf）永远给预算而非追绿（无收敛
   保证）；AFK 形态的特征失败（coherent about the wrong thing）意味着
   shape/grill 的质量在确定性层引入后**更**重要，不是更不重要。
