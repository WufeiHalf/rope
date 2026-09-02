# Test-Cost Tiering Tasks

Execution mode: shared (solo)   # 用户指令 2026-09-02：不派生子代理，parent 单独执行全部切片；记录为 go 降级，非能力缺失

## Behavior Matrix (issue behavior spec — BDD)

| Behavior (Given/When/Then where it helps) | Applies? | Verified at |
| --- | --- | --- |
| B1 baseline 阶梯：go 启动时 Given routes/routes 无近期绿证据，When 走阶梯，Then 依序 采信证据→quick→全量一次，且输出写文件后从文件解析，禁止为解析重跑 | yes | ticket 结构清单（docs-only） |
| B2 Test tiers 契约：execution-rules 定义 `Test tiers:` 格式（quick/full），缺省合法并给出降级路径 | yes | ticket 结构清单 |
| B3 自动派生：shape 发现 routes.md 无 Test tiers 行时按固定标准派生、实测 ≤60s、写回并留派生依据，零人工环节 | yes | ticket 结构清单 |
| B4 Verification 粒度：issue-package 模板缺省 focused+守卫，逐 slice 全量被禁止（行为保持例外落 issue 级） | yes | ticket 结构清单 |
| B5 brief green 缺省 focused：全量证据不属于 brief 要求 | yes | ticket 结构清单 |
| B6 flake 纪律：并行负载失败先只重跑失败用例，全量干净重跑须记录理由 | yes | ticket 结构清单 |
| B7 Return Gate bounce：证据缺口回叶子，parent 不代跑测试证据 | yes | ticket 结构清单 |
| B8 安装副本一致：.agents/skills 与 skills/ 逐文件一致（diff -r 干净） | yes | e2e E1 + verify |
| B9 ADR 0013 入链：决策成文，0009/0011 状态行回指 | yes | ticket 结构清单 |

## Slice 1: ADR 0013 + go 启动 baseline 阶梯

- Status: pending
- Kind: vertical
- Goal: 测试成本分层的决策成文，go 启动从"cheap 断言"变为可执行的三级阶梯
- Demo path: 打开 rope-go SKILL.md，Startup 步 2 呈现阶梯与写文件解析纪律；.rope/adr/0013 存在且被 0009/0011 回指
- Blocked by: none
- Scope: `.rope/adr/0013-test-cost-tiering.md`（新）、`.rope/adr/0009*.md` 与 `0011*.md`（状态行各加一指针）、`skills/rope-go/SKILL.md`
- Owned files: 同上
- Size cap: ~150 行
- Matrix rows: B1, B9
- Constraint IDs: ADR 0013 全部不变量
- Required evidence: ADR 成文含五要点；SKILL.md 阶梯文本；0009/0011 指针
- Public behavior: 一次新 go 会话的 startup 不再无语义地全量
- Tests: TDD waived (docs-only) — 结构清单
- Implementation notes: 阶梯细节放 SKILL.md 就地三行内；契约细节引 execution-rules（S2 落）
- Verification: 结构清单——frontmatter 完好、阶梯关键词（evidence/quick/full、写文件）在场
- Stop conditions: SKILL.md 超 100 行预算且剪不出对冲行 → 回报用户

## Slice 2: execution-rules 纪律包

- Status: pending
- Kind: vertical
- Goal: Test tiers 契约单一事实源 + brief green 缺省 + flake 纪律 + Return Gate bounce
- Demo path: execution-rules 有 Test tiers 契约节（格式+降级+派生标准）；brief 行与 gate 节措辞闭合
- Blocked by: none
- Scope: `skills/rope-go/references/execution-rules.md`
- Owned files: 同上
- Size cap: ~120 行增量
- Matrix rows: B2, B5, B6, B7
- Constraint IDs: ADR 0013（契约格式为派生标准单一事实源）
- Required evidence: 契约节在场；三处措辞修改（brief 尾句、merge queue flake、gate bounce）
- Public behavior: 叶子 brief 构造与 gate 对账不再产生全量要求
- Tests: TDD waived (docs-only) — 结构清单
- Implementation notes: 派生标准只此一处；shape SKILL.md（S3）只指路不复制
- Verification: 结构清单 + 与 SKILL.md 阶梯措辞无矛盾
- Stop conditions: 无

## Slice 3: shape 粒度契约 + Test tiers 检查

- Status: pending
- Kind: vertical
- Goal: Verification 粒度契约入模板；shape 步 2 增 Test-tiers 检查（缺失→按 S2 契约自动派生）
- Demo path: issue-package.md 的 Verification 字段带粒度说明；shape SKILL.md 步 2 有 Test-tiers 检查且指向 execution-rules 契约
- Blocked by: Slice 1, Slice 2（seam-required：ADR 编号与契约格式需先存在）
- Scope: `skills/rope-shape/references/issue-package.md`、`skills/rope-shape/SKILL.md`
- Owned files: 同上
- Size cap: ~80 行增量
- Matrix rows: B3, B4
- Constraint IDs: ADR 0013（粒度契约、零人工派生）
- Required evidence: 模板字段改写 + 粒度段；SKILL.md 步 2 增检查步
- Public behavior: 新 issue 的 shape 产物不再出现逐 slice 全量
- Tests: TDD waived (docs-only) — 结构清单
- Implementation notes: 派生标准不复制（单一事实源）；用户 60s 预算上限写入契约（S2）此处仅引用
- Verification: 结构清单——模板字段、粒度段、检查步、指针可解析
- Stop conditions: 无

## Slice 4: 安装副本 resync + routes 收尾

- Status: pending
- Kind: vertical
- Goal: .agents/skills 与 skills/ 一致；routes.md 阅读清单加 ADR 0013
- Demo path: `diff -r skills/rope-go .agents/skills/rope-go` 等干净；routes 清单含 0013
- Blocked by: Slice 3（seam-required：resync 需前序全部落地）
- Scope: `.agents/skills/rope-go/`、`.agents/skills/rope-shape/`（复制）、`.rope/routes.md`（一行）
- Owned files: 同上
- Size cap: 机械复制 + 1 行
- Matrix rows: B8
- Constraint IDs: 无特定
- Required evidence: diff -r 干净；routes 行在场
- Public behavior: 当前目录安装副本可用且与源一致（其余安装目标待用户验证后指令）
- Tests: TDD waived (docs-only) — E2E E1
- Implementation notes: 仅装当前目录 .agents/skills（用户指令）；不触碰用户级目录
- Verification: e2e E1
- Stop conditions: 无
