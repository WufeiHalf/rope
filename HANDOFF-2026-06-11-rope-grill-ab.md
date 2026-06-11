# Handoff: rope-grill A/B 实验与后续改造

日期：2026-06-11

## 背景

用户正在把 Rope 做成通用 spec coding / BDD 工具。`agent-workbench` 是 Rope 的主要实验项目，但 Rope 不应被改成只服务 agent-workbench 或 agent 场景。

前一轮真实使用里暴露两个问题：

- `rope-go` 阶段因为限制没有派生 review 子代理，最后自己 review。
- `/grow` 需求在 `rope-grill` 阶段没有讲清 behavior contract，导致实现阶段走错方向：用户想要的是由 OpenHands 的 agent turn 处理问题，而不是把核心行为写进当前 Workbench runtime/controller。

用户已明确的设计方向：

- `rope-go` 不做 behavior contract 的强阻塞，因为 `go` 的目标是用户 AFK 后 agent 长跑。
- `rope-go` 对 `Review: required` 必须先尝试发现并使用只读 review 子代理；不可用时才降级记录。
- `rope-grill` 要补的是通用的 behavior contract 澄清能力，不是围着 agent-workbench 或 OpenHands 打补丁。

## 已完成的 Rope 源仓库改动

Rope 源仓库：

`/home/wufei/Desktop/privatecode/rope`

远端：

`ssh://git@git.haizhi.com:10022/wufei/rope-skill.git`

已提交并推送：

- `813dad3 feat: 强化 Rope 行为契约和复核规则`
- `846080c fix: 清理 Rope 文档末尾空行`

主要改动：

- `skills/rope-grill/SKILL.md`
  - 增加 `Behavior Contract` 澄清要求：System under test、Trigger/input、Collaborators、Observable result、Failure visibility、Forbidden shortcuts。
- `skills/rope-shape/SKILL.md`
  - 要求 shape 输出 PRD、Behavior Contract、vertical slices、E2E plan。
- `skills/rope-shape/references/issue-package.md`
  - PRD 模板增加 Behavior Contract。
- `skills/rope-go/SKILL.md`
  - 要求 `Review: required` 先尝试使用 read-only review subagent。
- `skills/rope-go/references/execution-rules.md`
  - 记录 review 子代理不可用时的降级字段，例如 `review_degraded: no_subagent_tool_available`。

安装到 agent-workbench 使用的命令：

```bash
rtk npx git+ssh://git@git.haizhi.com:10022/wufei/rope-skill.git add --target ./.codex/skills
```

注意：用户纠正过安装命令，不要写成 `skill@latest` 形式。

## agent-workbench 当前状态

工作目录：

`/home/wufei/Desktop/workcode/agent-workbench`

已安装但尚未提交的 Rope skill 文件：

- `.codex/skills/rope-go/SKILL.md`
- `.codex/skills/rope-go/references/execution-rules.md`
- `.codex/skills/rope-grill/SKILL.md`
- `.codex/skills/rope-shape/SKILL.md`
- `.codex/skills/rope-shape/references/issue-package.md`

临时实验目录：

`/home/wufei/Desktop/workcode/agent-workbench/.tmp-rope-grill-exp/`

这个目录是未跟踪临时证据。不要把它当成正式项目内容提交。

## A/B 实验当前结论

用户要求：

- 真实跑两个 Codex 进程。
- 使用 tmux。
- 对比旧版 `rope-grill` 和新版 `rope-grill`。
- 用户已关闭 Codex memory。
- 像真实需求澄清一样多轮讨论。
- 不要为了证明改动有效而写带偏向的提示词。

已经做过几次尝试，但不能作为最终 A/B 结论：

1. `codex exec` 多轮尝试
   - 问题：每轮是新的非交互进程，不是单个持续 Codex session。
   - 只能作为粗略观察，不能满足“像我一样多轮讨论”。

2. 第一次 tmux 交互尝试
   - 问题：复用了已被 `codex exec` 污染的实验目录。
   - 不干净。

3. `/tmp` clean 尝试
   - 问题：Codex TUI 出现 “Do you trust this directory?”，没有正确处理。

4. `agent-workbench/.tmp-rope-grill-exp/{old,new}` clean2 尝试
   - session id：
     - old: `019eb492-0ec3-7aa1-ad3d-8bc400b7ad45`
     - new: `019eb492-0ecb-7f72-b041-fa91068ebddd`
   - session JSONL：
     - `/home/wufei/.codex/sessions/2026/06/11/rollout-2026-06-11T10-45-31-019eb492-0ec3-7aa1-ad3d-8bc400b7ad45.jsonl`
     - `/home/wufei/.codex/sessions/2026/06/11/rollout-2026-06-11T10-45-31-019eb492-0ecb-7f72-b041-fa91068ebddd.jsonl`
   - 问题：这组也不能作为 A/B 结论。session 里注入的 skill 路径实际都是父项目的 `.codex/skills/rope-grill/SKILL.md`，不是各自实验目录里的 old/new 版本。
   - 另外 clean2 只覆盖首轮，没有完成多轮讨论。

因此当前诚实结论是：还没有完成有效 A/B。已有观察显示新版规则会被模型读到，但还不能证明它在真实多轮澄清中稳定覆盖原问题。

## 下一步建议实验

目标：让两个真实 Codex TUI session 分别加载不同版本的 `rope-grill`，并跑同一套中性多轮用户回复。

推荐做法：

1. 准备两个完全独立的实验 HOME / CODEX_HOME，避免父项目 `.codex/skills` 污染。
2. 在 old 的 CODEX_HOME 安装 `5ee3f7b` 的 `skills/rope-grill`。
3. 在 new 的 CODEX_HOME 安装 `846080c` 的 `skills/rope-grill`。
4. 两边使用同一个最小实验 repo，包含：
   - `.rope/CONTEXT.md`
   - `.rope/routes.md`
   - `.rope/specs/backend/memory.md`
5. 用 tmux 启动两个 Codex TUI。
6. 初始 prompt 保持中性，不提 behavior contract、OpenHands、agent turn、system under test、forbidden shortcuts 等目标词。
7. 按同一套用户回复推进至少 4 轮。
8. 从 Codex session JSONL 抽取 assistant/user messages，对比它实际问的问题和沉淀的文档。

中性初始需求可继续使用：

```text
$rope-grill 帮我讨论一个新功能，不要实现代码，不要创建 issue。像真实需求澄清一样一次只问我一个问题，并给你的推荐答案。

功能想法：在一个 active support chat session 里，用户诊断结束后发送 `/grow`。系统应该基于当前对话写入一条可复用的 troubleshooting memory，供未来类似问题使用。不要保存原始 transcript。需要先搜索已有 memory，相似就合并，不相似就新建。用户应该能在聊天里看到进度，memory 工具失败也要能看到失败原因。
```

建议固定用户回复，不把答案引向 OpenHands：

1. 同意结构化摘要，核心是未来能复用。
2. 相似 memory 应该合并，但要保留新诊断证据，不能覆盖掉旧适用条件。
3. `/grow` 只能在诊断已经结束后触发；没结束时应该提示先完成诊断。
4. 用户需要看到搜索、合并/新建、写入成功或失败原因。

评估点：

- 是否主动澄清“被指定和测试的行为到底是谁的行为”。
- 是否区分 behavior owner 与 collaborators。
- 是否问到触发条件和完成条件，而不仅是 memory 字段。
- 是否问到用户可见的成功/失败证据。
- 是否问到禁止的捷径，例如直接保存 transcript、跳过搜索、把核心行为硬编码进错误层。
- 是否能在文档中形成可供 `rope-shape` 复用的 Behavior Contract。

## 关键注意事项

- 不要把 `agent-workbench` 的具体答案写进实验 prompt。
- 不要提示 OpenHands、agent turn、Behavior Contract、System under test、Forbidden shortcuts。
- 如果 Codex TUI 因目录不受信任退出，换到已信任目录或提前处理 trust prompt。
- 如果使用 `codex exec`，只能作为补充，不算用户要求的真实 tmux 多轮实验。
- 如果从 session JSONL 抽证据，优先看 `session_meta.payload.cwd` 和 `response_item.payload`。

可用抽取命令：

```bash
rtk proxy jq -r 'select(.type=="session_meta") | .payload.id + " " + .payload.cwd' <session.jsonl>
rtk proxy jq -r 'select(.type=="response_item") | .payload | select(.type=="message") | .role as $r | ((.content // []) | map(.text // .input_text // .output_text // "") | join("\n")) as $t | select($r=="assistant" or $r=="user") | "ROLE=" + $r + "\n" + $t + "\n---"' <session.jsonl>
```

## Suggested Skills

- `$handoff`：如果下个 session 还需要再次压缩上下文。
- `$rope-grill`：继续验证和改造需求澄清流程。
- `$zoom-out`：如果要从通用 spec coding / BDD 角度重新审视 Rope 工作流，而不是围绕单个需求补洞。
- `$skill-creator`：如果需要系统性调整 skill 指令结构、触发边界和 progressive disclosure。
