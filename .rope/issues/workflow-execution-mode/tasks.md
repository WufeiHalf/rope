# Workflow Execution Mode Tasks

Execution mode: shared — parent self-runs（延续用户 2026-09-08 指令；本包以文档/skill/spec 为主，无并行文件冲突风险）

## Behavior Matrix

| Behavior | Applies? | Verified at |
| --- | --- | --- |
| Given `~/.rope/config.toml` 存在 `execution.default = dynamic` When rope-go 执行 Then 以 workflow 形态执行，票包内无任何执行形态字段 | yes | 结构校验（spec 契约文本）+ read-through |
| Given 配置缺失或 `= agent` When rope-go 执行 Then 走 Agent 派发，与现状行为一致 | yes | 结构校验 |
| Given 配置要求 dynamic When 宿主无 SubagentWorkflow Then 软降级 Agent 派发，票包不变、扇窄化，降级记录进 map.md | yes | 结构校验（spec + rope-go 段一致） |
| Given 切片迁移共享 seam（owned files 含契约变更）When shape Then 票包含"消费者清扫"验收行（旧符号 grep/import 断言） | yes | 结构校验（shape 规则文本 + 模板） |
| Given issue 触及 ≥1 组合根 When shape Then 生成 L3 验收行；harness 缺失才长成切片 | yes | 结构校验 + read-through |
| Given 波级集成 gate When 执行 Then 断言"输入分支全 merged AND 聚焦测试绿"双条件（复跑实验 §4.3 教训） | yes | 结构校验（rope-go gate 菜单） |
| Given 共享账本文件（map.md 类）When 多叶并发 Then 叶子只返回 evidence 行，集成方统一追记 | yes | 结构校验（shape 规则） |
| Given L3 冒烟 When 写测试 Then mock 只许放组合根外边界，禁止 mock 被迁移的缝 | yes | 结构校验（mock 边界规则） |
| Given 安装 When `node bin/rope.js add --target` Then bundled 副本与 `.agents/` 一致 | yes | 安装冒烟 |

## Slice 1: ADR 0014 + spec 契约重写

- Status: done（2026-09-08，3be8fcd + 0003 状态指针 c9f9602 系；ADR 0014 + spec 重写 + specs/index 登记）
- Kind: vertical
- Goal: 确立"配置驱动执行形态"决策与机器可读契约：ADR 0014 显式 supersede ADR 0003 的机制部分（**旧"模型驱动并行"语义与 prd frontmatter `mode:` 字段约定整体废弃、从 spec 移除；执行形态唯一来源为配置 + 宿主探测**）；`~/.rope/config.toml`（`[execution] default`、`[execution.fans]` 预算上限）、宿主探测软降级规则、fan 类型语义（research/panel/fix-storm/array，执行器侧概念不进票包）
- Demo path: 按 spec 在干净机器上写一份 `~/.rope/config.toml` 并口推三档解析结果（issue 覆盖/全局默认/降级）无歧义
- Blocked by: none
- Scope: 新 ADR 0014（执行形态与图解耦：图仍是真相源，workflow 是执行器；引用复跑实验三案例）；`.rope/specs/dynamic-workflow-mode.md` 重写为 workflow-execution-mode 契约（保留 `mode` 字段在 prd.md frontmatter 的既有约定；修订旧 non-goal"不配置化"）；`~/.rope/config.toml` 示例落 ADR 附录或 spec
- Owned files: `.rope/adr/0014-workflow-execution-mode.md`、`.rope/specs/dynamic-workflow-mode.md`、`.rope/specs/index.md`（若需登记）
- Size cap: ~300 行
- Matrix rows: 行 1/2/3
- Required evidence: ADR 决策记录含三证据案例指针 + 新旧 dynamic 语义对照（模型驱动 vs 脚本驱动）及"基建决定编排胆量"论据；spec 含完整 config 示例与解析顺序伪码
- Stop conditions: 不改任何 SKILL.md（S2/S3 的事）；不写编译器

## Slice 2: shape 侧规则与模板

- Status: done（2026-09-08，3c3ebf3；SKILL.md 三规则 + 模板 Composition roots 块 + bundled 同步）
- Kind: vertical
- Goal: rope-shape 产出物补齐工作结构信息：组合根枚举规则、L3 验收行生成、seam 迁移消费者清扫行、共享账本 evidence 行返回规则、mock 边界规则。**不新增 fan/mode 声明块**（依赖图已描述并行可能性）
- Demo path: 拿钉钉 1.6.2 场景反推——按新 shape 规则走一遍，产出物必含：组合根清单（dingtalk_stream_assembly + intake facade）、S2 清扫行（grep `channel.reply_queue`）、L3 行（假 transport 灌 `/clear` 断言回复投递）
- Blocked by: Slice 1（fan/config 契约语义）
- Scope: `.agents/skills/rope-shape/SKILL.md` 增量段落 + shape 模板校对（移除若有 mode 相关残留）；规则以钉钉/legal 双案例为内嵌示例
- Owned files: `.agents/skills/rope-shape/SKILL.md`、shape 相关模板文件
- Size cap: ~250 行
- Matrix rows: 行 4/5/7/8
- Required evidence: 规则文本含双案例反推演示；`skills/` bundled 副本同步
- Stop conditions: 不动 rope-go；不改已有票包

## Slice 3: go 侧 workflow 模式段与 gate 菜单

- Status: done（2026-09-08，f676c21；workflow 执行段 + README/CONTEXT + 安装/入口冒烟 INSTALL-OK/HELP-OK）
- Kind: vertical
- Goal: rope-go 支持按解析后的 mode 执行：宿主探测（SubagentWorkflow 在且 mode=dynamic → workflow 形态；否则 Agent 派发软降级并记录）；L1/L2/L3 gate 菜单（L2 双断言模板；L3 引用票包 L3 行；gate 脚本落仓库文件免引号地狱）；修复风暴/评审面板为可选 fan 用法；跑后父按返回值补记 tasks.md/map.md/verify 记录；E4 定位降级为终审抽检的表述
- Demo path: 口推：同一票包在 pi（workflow 形态，波级 L2+L3 gate）与 codex（软降级，逐叶派发，gate 不变量相同）两条路径行为一致、记录完整
- Blocked by: Slice 1（契约）、Slice 2（L3 行来源）
- Scope: `.agents/skills/rope-go/SKILL.md` 增量段落；README/CONTEXT.md 术语（workflow 执行形态、组合根、消费者清扫）按需
- Owned files: `.agents/skills/rope-go/SKILL.md`、`README.md`、`.rope/CONTEXT.md`（仅术语行）
- Size cap: ~300 行
- Matrix rows: 行 3/6/9
- Required evidence: skill 文本含探测伪码与 gate 菜单表；bundled 副本同步；`node bin/rope.js add --target` + `--help` 冒烟
- Stop conditions: 不写 graph2workflow 编译器；不改 grill

## Dependency Graph

- Wave 1: S1
- Wave 2: S2、S3（S3 依赖 S1+S2 的产物语义；S2 依赖 S1；文档型无文件冲突）
- Serial total: 2 waves（S1 → {S2, S3}）

## 变更历史

- 2026-09-08 shaped：基于 workflow 复跑实验（`.rope/research/dynamic-workflow-replay-legal-finance.md`）+ 钉钉 v1.6.2 生产缺陷定论 + legal E4 案例三方讨论共识。
