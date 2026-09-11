# Dynamic Go：模板边界、workflow 规模与 token 换时间

Date: 2026-09-11
Status: research synthesis / proposed direction，尚未修改 skill、运行时、ADR 或已批准任务图。

## 结论

1. **一个已批准 issue 的 go，默认由一个 workflow 负责开发到真实入口验收的闭环。** 切分依据是验收/授权边界，不是固定切片数；workflow 内可以有多批任务、不同 fan-out 和修复循环。宿主限制或真正的人类决策才构成暂停/拆分理由。
2. **固定经过测试的执行内核，动态生成 issue 的工作计划。** 不让模型每次重写状态、合并、完成条件和恢复逻辑；也不把所有任务冻结成同一组阶段或同一个 agent 配额。
3. **pi 优先；Claude Code 当前已有相近的原生 Dynamic Workflows。** 不是“只能走 Claude Agent SDK”。但函数名字相似不等于同一脚本已可无修改运行；先稳定任务/结果契约，再验证其他宿主的薄适配。
4. **不人为把并行度压在 2–3；填满有用的 ready frontier。** 本机 inspected pi runtime 的默认上限为 14 个同时执行的 agent。当前 issue 的主要瓶颈却是 shape 生成的关键路径，以及重复大测试和集成等待；只改并发数字不够。
5. **额外 token 优先买独立实现、独立诊断、真实验收，而不是层层协调和重复全量测试。** 普通切片不照搬迁移项目的每文件多 reviewer；保持 Rope 单次双轴 end-of-issue review。

## 一、补齐最直接的一手来源

### Anthropic 的正式 Dynamic Workflows，而不只是旧 Research 产品

官方文章明确描述 JS 编排 `agent` / `pipeline` / `parallel`，可组合 fan-out、对抗验证、tournament、loop-until-done；支持把 workflow JS 放进 skill，并建议将它视为可调整的 **template**，不要求永远原样执行。[C1]

官方文档确认：script 无文件系统或 shell，**由 agents 读写文件和执行命令**；同一 workflow 可以组织修复、验证、重复搜索。这里没有“因为 script 没有 shell，所以必须把每次合并交回父会话”的推论。[C2]

官方同时提醒：普通 coding task 未必需要更多 compute，例如多数传统编码任务不需要五人 reviewer panel。额外并行需要付得起协调成本。[C1]

这与用户方向不冲突：**固定可靠性机制，保留任务级动态组合能力。** OpenAI/LangGraph 的 code-orchestration / 显式输入输出契约提供旁证，但不应据此把 Dynamic Workflows 改成全静态大框架。详见 `dynamic-go-template-scope-primary-sources.md`。

### 代码迁移：更贴近 coding 的 token-for-time 证据

Anthropic 的大型代码迁移文章报告：[C3]

- 一个案例用 12 个 Sonnet implementers fan-out；并行实现之外仍有独立 adversarial review / fix loops。
- TypeScript 检查只需几秒时，可以每轮跑；Cargo 需要几分钟时，从叶子循环移出，集中构建。
- 大构建由唯一 build daemon 批量执行；fixers 并行修补，不分别触发昂贵构建。
- 有案例让 Claude 自建 E2E，连续四晚自主运行、修复和复测；这是案例报告，不是受控加速倍率。
- 先验证 judge：在正确原始代码上通过，在故意破坏的代码上失败。

官方 migration kit 确有机械队列和模板，但 README 明确说是 **generalized reconstruction / reference code / not actively maintained**，不是 Bun 原始执行脚本，也不是可直接安装到 Rope 的成熟 go runtime。[C4]

检查其 `queue_runner.mjs`：从 manifest 与输出文件存在性重建 pending queue；`next --batch 100` 默认最多取 100 条；`verify` 只检查已经存在的文件非空。[C5] 因而“100”是这套迁移模板的批量参数，不是最佳 workflow 大小；文件存在只是翻译进度，不是编译通过或行为验收。

`04-translation-kickoff.md` 也把 `[100]` 明列为占位参数，并给每文件安排 implementer + 双 reviewer + fixer，分歧另交裁判。[C6] **不能把该迁移专用审查倍率移植成 Rope 每切片强制 review**，那会撤销 ADR 0007 的教训。

## 二、一个 workflow 放多少工作？

先区分四个量：

| 量 | 含义 | 决策依据 |
| --- | --- | --- |
| 验收范围 | workflow 要把什么问题做完 | issue 的 Behavior Contract / Matrix 与授权范围 |
| 任务总数 | 实现、集成、验收、修复等工作单元 | 工作图、上下文大小、失败隔离 |
| agent 调用总数 | 包括 merge/gate/review/fix，不等于切片数 | 模板策略、实际失败、宿主 lifetime cap |
| 同时运行数 | 某时刻占用的 worker 数 | ready frontier、CPU/内存、API 吞吐、共享资源 |

Claude Code 当前官方规模建议：[C2]

| 设置 | agent 调用规模建议 |
| --- | --- |
| `small` | 少于 5 |
| `medium` | 少于 15；v2.1.219 起默认 |
| `large` | 少于 50 |
| `unrestricted` | 由任务决定，不给建议数 |

这些是传给模型的 **advice，不是 cap，更不是编码最佳值**。官方硬限制另列：最多 16 个并发 agent（CPU 少时更低）、一次 parallel/pipeline 最多 4096 项、每 run 总共 1000 次 agent。pi 本机的对应限制见 harness 研究；不可把 Claude 的 `/config` 设置当成 pi 配置项。

### Rope 的建议边界

- **默认一个 issue 的 go = 一个 workflow 闭环**：ready 实现 → 持续串行集成 → 必要集成/组合入口 gates → freeze → 双轴 review（行为 reviewer 负责真实入口与 E2E）→ 有界修复/重验。
- 一个 workflow 内有 8、20、几十个工作单元都不自动构成拆分理由；数量必须把 merge/gate/fix 调用一起核算，不是只数实现切片。
- 真正的新需求/架构决定、权限边界、必须现场人工操作、测得的宿主 run 限制，才是暂停/重新规划理由。文档明确不支持 workflow 中途任意人类问答；需要 sign-off 的阶段在宿主能力不足时必须结束并交回决策。[C2]
- `blocked-human` 可以是诚实的执行终态，但不能把它标为“E2E 已通过”。普通失败则在已授权范围内继续脚本修复，不能借故回父会话手工接管。
- 大迁移若有独立验收包或确实接近 agent cap，可在完成并核对持久状态后分段；不要借 Temporal 的 Continue-As-New 概念给普通 issue 平添运行时。

**研究没有找到普适的“每 workflow 最适合 N 个问题”。** 官方存在的规模建议和批大小，不能伪装成实验得出的最优值。

## 三、成熟模板到底固定什么？

### 固定、必须能离线回归测试的部分

- 图校验：唯一 task ID、合法依赖/边种类、无未解释环、必需证据可定位。
- 状态推进：`planned → ready → running → returned → integrated`，失败/阻塞及其下游必须显式登记。
- frontier refill：按真正依赖补位；worktree 模式的 file-overlap 只影响 merge order，不重新变回 dispatch 锁。
- structured return + Mechanical Return Gate；验证 schema 只验证数据形状，不证明完成。
- 串行 integration：专职执行 agent 或宿主适配器操作 Git，工作流负责决策；不要每次 merge 都做一次开放式架构/代码审查。
- **完成断言**：所有必需工作已集成，才允许整体 L2/验收；“没有 running task”不等于“已完成”。
- 同一个集成 HEAD 上的 gates / E2E / review 证据对齐。修复改变 HEAD 后，按影响重验，不能复用不适用的旧绿灯。
- 失败分类、现有 ≤2 次 fix 约束、人类 escalation stop；不扩大既定验收范围。
- replay 的幂等核对：已合并 commit 不重复合并，外部输入/版本改变不得误用缓存。

### 按 issue 动态填入或组合的部分

- 批准后的 task graph、brief 引用、Constraint IDs、seams、L1/L2/L3 命令。
- 哪些真实独立实现同时做、如何分组诊断；高风险时是否开多个不同候选。
- 各角色与宿主可用 preset 的绑定；不写死模型品牌，不以便宜模型为默认目标。
- E2E 资源/入口/授权、review 的风险重点、当前 findings 导出的修复队列。

不是另建手工 JS 任务账本：`tasks.md` 保持批准范围的来源，execution input 是可核对的派生产物。

### pi-now 的关键现实

`agent(..., {schema})` 返回的 JSON **不含自动附加的 worktree branch**。源码 `toSpawnResult()` 使用 `record.structuredJson ?? record.result`，且 WorkflowSpawnResult 没有 branch/baseSha 字段。不能继续解析结果中的第一个 `branch`。[P1]

近期可行路线：叶子先显式 commit 并留下 clean tree，以 schema 返回 commit SHA；integrator 用 Git 核对对象、预期基线/可达关系、实际集成结果。后置 gate 不得暗中修改产品代码导致报告 SHA 落后。若未来修改 pi extension，可暴露 host-verified commit/branch/base envelope；**这是可选小增强，不是当前 API 已有能力**。

pi script 没有 import/fs/shell，因此最小分发可以是 skill 中的可复制模板 / 可参数化 saved workflow；不要规划一个需要 Node imports 才能执行的沙盒模板。具体分发与执行能力仍需 smoke probe，不在本次研究中实现。

### 模板首先要过的故障样例

1. 返回文本含 `branch: HEAD`，schema 缺失，或返回 null：不能错误认作已集成。
2. 任一上游失败，下游没有启动：所有受阻任务都有状态，不能从完成集合中消失。
3. 一条分支未合并但旧主树 tests 全绿：L2/整体验收必须拒绝。
4. 工作已合并后重放：不得重复副作用；旧 evidence / 新 HEAD 不得错配。
5. 两条分支冲突：串行解决，保留双方意图；不阻塞无关的安全运行 lane。
6. E2E/review 失败：在脚本中进入既定 fix/delta-review，达到上限才 escalation。
7. 慢 agent、gate timeout、无可运行任务：明确非成功原因，不能提前宣布完成。

## 四、并行提速应该改哪里？

### 先去掉 shape 关键路径上的非必要工作

目标 issue `legal-retrieval-pagination` 在原始 commit `20464234` 的图是 **8 个切片**：

- 初始 ready：只有 S1。
- 最大 antichain：3。
- 关键链：`S1 → S2 → P1 → P2 → P3`。
- 假设切片等长、启动/merge/check 成本为零，最优耗时为 5 单位；2 个 worker 已达到这个下界，3/4/8/14 个相同。理想速度上限 `8/5 = 1.6×`。

这是离线调度模型，不是实测耗时；任务实际长短可能使第 3 个 worker 有益。但足以反驳“只加 agent 就能解决此图”。理论下界是 `T(P) ≥ max(W/P, S)`，S 是关键路径。[W1]

需要 shape 验证的候选，而不是 go 擅自删除依赖：

1. S1 把 backend schema/admin 与完整 frontend form 捆在一起；让消费者等待最小可工作的 backend seam，而不是全部 UI。
2. P1 的 S2 依赖包含最终 settings 装配验收；检查哪些工作已可在现存 adapter/fake transport seam 独立实现，把实现阻塞与最终集成验证区分开。
3. P2 已提示 thin-interface/hardening 可拆，却仍让 P3 等待全部状态语义；应用既有 two-stage contract 规则，最小接口必须真实可用，不能靠空 stub 假并行。

### 并行策略应积极，但不是刷数量

- 对所有真正 ready 的 slice 持续补位；没有理由不预设 2–3 上限。本机默认 host cap 为 `max(1,min(16,16-2)) = 14`。[P1]
- 不要把所有 pending calls 无界塞进宿主队列，导致解锁下游的 merge 排在大批无关实现后面；有界 in-flight 调度要给 integration 及时运行的机会。
- 实现在隔离 worktree 内并行；串行的是共享 integration tree 的写入，不是整个开发阶段。
- 诊断按不同假设或不同失败簇并行；有清晰 judge 的高风险点可做候选竞争，而不是每个小改动都加 5 个 reviewer。
- tests 的并行取决于资源与状态：只读/独立测试可并行，端口/数据库/同一构建输出有冲突的真实产品验收不能盲目并行。Rope 的产品启动仍归行为 reviewer。
- 按 ADR 0013 让 L1 留在叶子，昂贵 full/build 集中且按影响触发。历史 field report 中全量测试约占总时长 38/73 分钟；这是比多派两个 agent 更直接的提速面。[P2]

### 保留证据边界

Anthropic Research 的“最多减少 90% 时间”“15× chat tokens”“内评高 90.2%”是 research/browsing 场景；不是 coding 的已验证倍率。C compiler 的 16 agents 与 Cursor 大规模 coding 是一手案例，但都没有控制变量证明 16 最优。更直接可借鉴的是独立队列、可靠 judge、贵操作集中、自动修复，而不是照抄 worker 数。详见 `dynamic-go-token-latency-primary-sources.md`。

## 五、跨 harness：比最初估计接近，但仍需验收

| 宿主 | 已查到什么 | 没证明什么 |
| --- | --- | --- |
| 本机 pi + pi-subagents 0.19.0 inspected checkout | JS、agent/pipeline/parallel、schema、worktree、gate、prefix replay；无 script shell | 当前 JSON return 自动含 branch；durable engine / exactly-once |
| 当前 Claude Code Dynamic Workflows | 同类 JS 函数、纯 literal meta、args、schema、无 script shell、相近 caps 与 prefix replay；skill 可分发模板 [C1][C2] | pi 的所有 agent options、preset 名、worktree metadata、gate 时序可原样用 |
| Codex 等 | 官方 native task/session/SDK 能力，见 harness 研究 | 原生接受同一 JS workflow 文件 |

所以优先顺序应是：**先稳定 pi 的执行内核与回归样例，再用同一任务契约做 Claude Code smoke probe；其他宿主保持显式 native adaptation/fallback。** 当前仍遵循 ADR 0014 的探测/降级规则，研究本身不新增 runtime 或修改配置。

## 六、未解参数与建议验证次序

研究能给边界，不能替本机测最佳并发数。下一步若用户批准实施：

1. 离线测试执行内核，先复现本次 branch/缺任务/假 L2 故障并转绿；无需为此花大量 live agent tokens。
2. 在一次性分支/环境对同一验收范围做对照：现有图 + 修好 executor；经 shape 批准的减关键路径图；资源允许时更宽的运行窗口。分开改变变量，不能把图改善误归因于 agent 数。
3. 覆盖窄链 feature、宽图 feature、失败簇修复三类；不要只拿批量文件迁移证明所有业务需求都快。
4. 比较完整 go 至真实 E2E 的 wall-clock、关键路径、ready-wait/merge-wait、有效 active agents、full-test 时间、API 限流、冲突/返工、token 与验收逃逸。多次配对运行再判断，不以一次跑得快证明胜出。
5. 接受标准先是相同验收完整性和无假成功，再是在用户偏好的 token 换时间目标下缩短端到端耗时。未知阈值通过测量决定，不臆造 SLA。

## 来源

- [C1] Anthropic, *A harness for every task: dynamic workflows in Claude Code*: https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code （本轮读取全文）。
- [C2] Claude Code, *Orchestrate subagents at scale with dynamic workflows*: https://code.claude.com/docs/en/workflows （重点：saved script、behavior and limits、resume、size guideline；在线文档随版本变化）。
- [C3] Anthropic, *How Anthropic runs large-scale code migrations with Claude Code*: https://claude.com/blog/ai-code-migration （全文读取）。
- [C4] Anthropic migration kit README: https://github.com/anthropics/code-migration-kit-with-claude-code （读取 provenance/status 与队列/阶段说明；不是本机运行验证）。
- [C5] Kit mechanical queue: https://github.com/anthropics/code-migration-kit-with-claude-code/blob/main/scripts/queue_runner.mjs （fetch_content 返回完整源码；没有执行）。
- [C6] Kit kickoff: https://github.com/anthropics/code-migration-kit-with-claude-code/blob/main/prompts/04-translation-kickoff.md （fetch_content 返回全文）。
- [P1] `.rope/research/dynamic-go-harness-contract-research.md`；parent 再核对 `pi-custom-subagent/src/workflow/runtime.ts:48-50`、`host.ts:121-151`，本机 `node:os.cpus().length = 16`。源码 checkout 有既有未提交修改，不声称等同目标历史进程加载版本。
- [P2] `.rope/research/session-01a0840a-dynamic-field-report.md`，F5；本轮阶段审计 `.rope/issues/dynamic-go-session-audit/diagnosis.md`。
- [W1] OpenCilk concepts: https://www.opencilk.org/doc/tutorials/opencilk-concepts/ 。

Supporting reports: `dynamic-go-template-scope-primary-sources.md`、`dynamic-go-token-latency-primary-sources.md`、`dynamic-go-harness-contract-research.md`。本报告对较早辅助报告的纯静态/SDK-only解读作明确收紧：固定的是正确性机制，不是所有任务拓扑；Claude Code 已有原生 Dynamic Workflows。
