# Quick: worktree setup as unconditional step 0

status: done

## Problem

worktree 模式的叶子不跑 worktree setup 脚本，测试依赖 setup 产物
（node_modules、构建产物等）时失败或误判为代码错误。

## Root cause

旧规则把 setup 写成条件修复——「仅当 green 命令因缺环境失败时才跑」，
依赖叶子正确**识别**环境错误；preset 无第 0 步；Return Gate 无环境
证据项。三处叠加使跳过/误判检测不到。

## Direction (user decision)

翻转语义：setup = 无条件第 0 步（机械），不是失败后修复（判断）。
Declared 脚本必须 check-first 幂等（已可测则秒退），鼓励 symlink/
共享缓存等便宜策略；返回多一行 setup 结果，Return Gate 缺行 BOUNCE。

## Changes (docs-only, red waived)

- `skills/rope-go/references/execution-rules.md`: Worktree setup 节重写
  （declared = check-first + step 0 无条件 + setup 返回行 + host-managed
  仍带第 0 步 no-op 检查）；brief 契约与 Return Gate payload 更新。
- `skills/rope-harness-presets/references/agent-templates.md`:
  rope-implementer 加 fresh worktree 第 0 步 bullet（环境失败=blocker，
  不是 fix-round 材料）。
- `skills/rope-shape/SKILL.md`: 步骤 2 worktree-setup 检查改为优先征询
  check-first 幂等脚本。
- 同步 `.agents/skills`（diff 验证）。

## Evidence

- Verification: 通读三处 + 安装副本 diff（本仓无测试套件）。

## Human leftovers

- 各落地仓的 `worktree-setup` 脚本本体要按 check-first 约定改造
  （属目标仓工作，不属本仓）。
- 并行度批次（file-overlap 降级边界：推荐档 vs 全部降级）仍待裁决。
