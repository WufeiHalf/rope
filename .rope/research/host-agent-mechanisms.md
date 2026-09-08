# 宿主 Agent 机制调研：codex 与 agy（harness-presets-discovery S1）

## Question

codex（0.153.4，本机）与 agy（Antigravity CLI 1.1.23，本机）的模型目录、
自定义 agent/subagent 定义机制、用户级配置路径是什么？发现式
harness-presets 流程需要哪些探测点？

## Verified Facts

### codex（本机 0.153.4 + 官方/社区文档）

Fact: 自定义 agent 以 **TOML 文件**落 `~/.codex/agents/*.toml`，字段：
`name`、`description`、`model`、`model_reasoning_effort`、
`developer_instructions`（多行字符串正文）。本机已有 oh-my-codex 全套
20 个 agent（analyst/architect/executor/verifier/explore…）按此格式工作，
agent 正文含 role 契约、tool bounds（如 "Read-only: Write/Edit blocked"）、
leader 路由语言——与 Rope 的 role-schema + no-nested-spawn 结构同构。
Source: `ls ~/.codex/agents/`；`~/.codex/agents/{analyst,architect,team-executor}.toml` 全文
Stability: high（本机一手）；派生机制见下述版本漂移警告

Fact: 模型目录发现：`~/.codex/config.toml` 的 `model`（当前 gpt-5.5）、
`model_providers.*`（自定义 provider：name/base_url/wire_api）、
`review_model`、`model_reasoning_effort`；另有
`model_catalog_json = "./model-catalog.gpt-5.5.json"` →
`~/.codex/model-catalog.gpt-5.5.json`（结构 `{fetched_at, etag,
client_version, models[]}`，随版本拉取）。
Source: `~/.codex/config.toml`；catalog JSON 解析
Stability: high（本机一手）

Fact: codex 亦支持 **skills 目录**：本机 `~/.codex/skills/` 内是标准
SKILL.md 格式 skill（dws、humanize 等，与 pi/agents 生态同一套文件）。
全局指令文件 `~/.codex/AGENTS.md`；`project_doc_fallback_filenames`
含 `CLAUDE.md`。
Source: `ls ~/.codex/skills/`；config.toml
Stability: high

Fact: 官方/社区文档确认自定义 agents 机制与用法；注意**版本漂移**：
较新版本中 subagent 派生的模型/推理参数行为有变（社区报告 subagent 继承
父设置），0.153.x 本机的 agents TOML 是否被新版本继续支持需升级后复验。
Issue #18823 记录"自定义 agent 请求被误路由到 skills"的坑。
Source: https://simonwillison.net/2026/Mar/16/codex-subagents ；
https://learn.chatgpt.com/docs/agent-configuration/subagents ；
https://github.com/openai/codex/issues/18823 ；
https://community.openai.com/t/codex-cli-can-no-longer-spawn-subagents-with-specific-models-or-reasoning/1386290
Stability: medium（版本敏感）

### agy / Google Antigravity CLI（本机 1.1.23 + 官方文档）

Fact: `agy` CLI 关键 flags：`--agent`（当前会话选 agent）、`--model`、
`--effort`（low|medium|high）、`--mode`（accept-edits/plan）、
`--sandbox`、`--dangerously-skip-permissions`、print 模式
（`-p`，支持 stream-json 输入输出）；子命令 `agent|agents` 列出可用
agent（本机当前输出为空——尚未定义任何自定义 agent）。
Source: `agy --help`；`agy agents`（2026-09-08）
Stability: high（本机一手）

Fact: 官方文档：自定义 agents 用 **Markdown + YAML frontmatter** 文件，
项目级 `.agents/agents/`，全局另有目录（文档指向 gemini-cli 系路径，
如 `~/.gemini/config/agents/`——与本机 `~/.config/Antigravity` Electron
profile 是两回事）。论坛有"文件型 agent 不出现在 /agents 列表"的已知
bug 报告，E2E 时需验证实际注册点。
Source: https://antigravity.google/blog/introducing-custom-agents ；
https://antigravity.google/docs/cli/commands/agents ；
https://antigravity.google/docs/cli/using ；
https://discuss.ai.google.dev/t/bug-report-file-based-custom-agents-dont-appear-in-the-agents-list/170906
Stability: medium（未本机复现注册路径）

Fact: agy print 模式提及 "slash command and skill expansion"，即 agy
支持 skill 展开（skills 生态兼容）；`--disable-slash-commands` 可关。
Source: `agy --help`
Stability: medium

### 消费端事实（Rope 侧）

Fact: 本机 pi 的 manifest 在 `~/.config/rope/harness/pi.json`，agent
文件在 `~/.pi/agent/agents/rope-*.md`；rope-go/verify 经 soft-degrade
契约消费。同事案例：在 codex 中调用 rope-harness-presets skill，codex
以"pi 的维护规则不适用当前环境"拒绝（用户口述 2026-09-08，未本机复现；
合理机制：skill 文本的 Host support 表 + pi-adapter 路径全为 pi 硬编码）。
Source: `.agents/skills/rope-harness-presets/SKILL.md`；用户口述
Stability: medium

## 发现式流程探测清单（host-discovery 的骨架，S2 输入）

1. **识别宿主**：会话自报（宿主名/harness 标识）或配置目录指纹
   （`~/.pi/agent` / `~/.codex` / `~/.gemini`+`.agents` / 其他）；无法
   确定时报错并列出探测到的候选，不猜。
2. **agent 注册点**：探测宿主的自定义 agent 目录与文件格式（pi: MD+
   frontmatter 于 `~/.pi/agent/agents/`；codex: TOML 于 `~/.codex/agents/`；
   agy: MD+frontmatter 于 `.agents/agents/` 或全局等价物）；本地无实例时
   检索官方文档确认（版本对齐），仍不确定 → 能力缺口。
3. **模型目录**：读宿主的模型配置（pi: settings.json enabledModels；
   codex: config.toml + model-catalog JSON；agy: `--model`/配置或文档），
   输出候选模型清单 + ranking 输入。
4. **skills/文档机制**：确认宿主是否读 SKILL.md 目录与 AGENTS.md 类
   全局指令（决定 skill 自身在该宿主如何被调用）。
5. **写模板**：按 role-schema 三角色契约，用宿主原生格式写
   `rope-implementer / rope-reviewer / rope-explore`，正文保持
   no-nested-spawn 与 tool bounds 中立表述。
6. **manifest**：`~/.config/rope/harness/<host>.json`（host 泛化，
   其余 schema 沿用），记 sources/confidence。
7. **报告**：产出路径 + 置信度 + 能力缺口（如 subagent 派生受限——
   codex 新版本继承行为、agy 列表注册 bug 等，逐条记录）。

## Assumptions

- codex 0.153.4 的 agents TOML 机制在当前本机可用（oh-my-codex 在用）；
  若 E2E 升级 codex 后行为变化，按版本漂移记录并重探。
- agy 的 agent 注册路径以官方文档为准（`.agents/agents/` MD+frontmatter），
  E2E 实跑确认；论坛 bug 提示列表刷新可能有坑。
- 同事拒绝案例的根因归因（pi 硬编码文本）未复现验证，E2E E1 会顺带证实。
