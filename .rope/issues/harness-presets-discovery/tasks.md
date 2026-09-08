# harness-presets 发现在化重构 Tasks

Execution mode: shared — parent self-runs all slices（用户指令 2026-09-08：不派生子代理；worktree 能力已探得但被覆盖）

## Behavior Matrix (issue behavior spec — BDD)

| Behavior (Given/When/Then where it helps) | Applies? | Verified at |
| --- | --- | --- |
| Given 任意非 pi 宿主 When 调用 rope-harness-presets Then 不再被 `writer_not_implemented` 硬拒，进入发现流程 | yes | ticket TDD（fixtures 干检查） |
| Given codex 宿主 When skill 完成 Then 存在 codex 原生格式角色模板与 `~/.config/rope/harness/codex.json`，且 codex 能按其派生 subagent（或记录能力缺口） | yes | e2e + review |
| Given pi 宿主 When 重跑重构后 skill Then 产出与重构前等价（agent 文件 + manifest 内容等价） | yes | ticket TDD（等价对比） |
| Given 未知宿主或无 subagent 机制宿主 When 发现流程结束 Then 得到显式能力缺口报告或软降级记录，不硬阻塞 | yes | ticket TDD（fixtures） |
| Given 探测或写入失败 When 流程中任意步骤失败 Then 显式报错并停，无部分产物假装成功 | yes | ticket TDD（fixtures） |
| Given manifest 已生成 When rope-go/verify 消费 Then 消费接口与缺失软降级路径与重构前一致（无需改动） | yes | review |
| Given `node bin/rope.js add` When 安装 Then bundled 副本（`skills/`）与 `.agents/` 版本一致，安装行为不变 | yes | review |

## Slice 1: codex/agy 宿主机制调研

- Status: pending
- Kind: vertical（research 模式，ADR 0011）
- Goal: 摸清 codex 0.153+ 与 agy 1.1.23 的模型目录、agent/subagent 定义机制、用户级配置路径，产出发现流程可照抄的核对清单
- Demo path: `.rope/research/host-agent-mechanisms.md` 每条事实带来源与版本号；照清单能在干净机器上定位两家的 agent 定义文件与模型 catalog
- Blocked by: none
- Scope: 只写 research 文件；本地探测 + 官方文档检索（代理 `http://127.0.0.1:8118`）
- Owned files: `.rope/research/host-agent-mechanisms.md`
- Size cap: ~300 行
- Matrix rows: 行 1、2 的证据底座
- Constraint IDs: D3（research 产物只落 `.rope/research/**`）
- Required evidence: research 文件含 codex 与 agy 的机制、路径、版本、来源（证矩阵行 1/2 的事实前提）
- Public behavior: 发现式流程的事实底座可用
- Tests: N/A（调研）；结构检查
- Implementation notes: 本机已有 `codex 0.153.4`、`agy 1.1.23`；`~/.codex/`、agy 配置目录可直接探测；同事"codex 拒绝"案例可作行为参考（用户口述，未复现）
- Verification: 结构检查（quick tier）
- Stop conditions: 文档与探测均无法确认某家机制 → 在 research 文件记录能力缺口，E2E 对该宿主降级为"发现流程健壮性"验证

## Slice 2: skill 主体发现式重构

- Status: pending
- Kind: vertical
- Goal: SKILL.md 主流程改为"识别宿主 → 探测生态 → 按角色契约写宿主原生模板 → `<host>.json` manifest → 报告"，Host support 表动态化，软降级契约扩展（D4）
- Demo path: 在 pi 上重跑 skill，agent 文件与 manifest 与重构前等价；文本中不再存在"other: not implemented 硬拒"分支
- Blocked by: Slice 1（methodology-order：不阻塞派发；建议 S1 先合并，S2 吸收其核对清单）
- Scope: SKILL.md 主流程 + 新增 `references/host-discovery.md` + `references/manifest-schema.md` 泛化
- Owned files: `.agents/skills/rope-harness-presets/SKILL.md`、`references/host-discovery.md`、`references/manifest-schema.md`
- Size cap: ~400 diff 行
- Matrix rows: 行 1、3、4、5
- Constraint IDs: D1（不硬编码宿主分支/模型表）、D4（软降级扩展）、Invariant pi 零回归
- Required evidence: pi 重跑等价对比输出（证行 3）；fixtures 干检查更新——非 pi 主机走发现流程而非硬拒、失败显式报错（证行 1、4、5）
- Public behavior: 任意宿主可调用，产出该宿主原生预设与 manifest
- Tests: 结构检查；pi 等价重跑（对比 `~/.config/rope/harness/pi.json` 与 `~/.pi/agent/agents/rope-*.md` 前后快照）
- Implementation notes: 三角色契约（role-schema）内容不动；ranking/offline 逻辑沿用，仅输入源从 pi 专属改为宿主中立描述
- Verification: quick tier（结构检查 + `node bin/rope.js --help` smoke）
- Stop conditions: pi 重跑不等价 → 立即停修，不许"差不多"过关

## Slice 3: pi 知识示例化 + 消费端与发布面同步

- Status: pending
- Kind: vertical
- Goal: `pi-adapter.md` 降级为"已工作示例"（worked example）；`discovery-fixtures.md` 对齐新流程；rope-go/verify/README 措辞宿主中立；CONTEXT 词条 Harness Profile / Role Preset 增"发现式生成"；bundled 副本 `skills/rope-harness-presets/` 同步
- Demo path: 通读全套文本除"示例"标注外无 pi 硬编码残留；`node bin/rope.js add --target /tmp/rope-skills-smoke` 装出的副本与源一致
- Blocked by: Slice 2（file-overlap：SKILL.md 与 references 共文件）
- Scope: references 示例化、文档面、双副本同步
- Owned files: `references/pi-adapter.md`、`references/discovery-fixtures.md`、`references/agent-templates.md`（如需措辞中立化）、`README.md`、`.rope/CONTEXT.md`、`skills/rope-harness-presets/**`
- Size cap: ~400 diff 行
- Matrix rows: 行 6、7
- Constraint IDs: D1（CONTEXT 词条更新）、Invariant 双副本一致
- Required evidence: `rope add` 安装 smoke 输出（证行 7）；CONTEXT 词条 diff（证行 6 的文档面）
- Public behavior: 发布面、文档与消费端措辞与新机制一致
- Tests: `node bin/rope.js add --target /tmp/rope-skills-smoke` + diff 对比
- Verification: quick tier + add smoke（full tier 项）
- Stop conditions: 消费端措辞改动牵出接口变化 → 停，回 shape（Defense Budget）
