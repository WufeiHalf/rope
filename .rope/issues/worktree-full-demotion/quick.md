# Quick: ADR 0012 worktree-verified full demotion of file-overlap edges

status: done

## Problem

file-overlap 边在所有模式都挡 dispatch（ADR 0011），worktree 模式下启动
宽度被压到 antichain 以下；且模式判定在 go startup 才做，shape 切片时
不知道将跑什么模式。

## Root cause

ADR 0011 制定时未区分模式：file-overlap 挡 dispatch 的动机（避免并发
写冲突）在 worktree 隔离下只剩 merge-time 成本，不再是调度约束；
模式判定滞后于切片。

## Direction (user decision)

人工裁决 2026-09-01：**全部降级**（对比小重叠降级档，取最大 antichain；
owned-files 事实保留，误判边代价 = 一次冲突重派）。含三个配套：
shape 前置探测记录 Execution mode、seam-required 永不降级、宽重构
纪律不变；吸收上游 field report——冲突重派在未落地支上解（作者意图
在它的 brief+commits 里）。

## Changes (docs-only, red waived)

- 新增 `.rope/adr/0012-worktree-verified-full-demotion-of-file-overlap-edges.md`
- `skills/rope-shape/SKILL.md`: 步骤 2 加 Execution-mode probe；
  步骤 8 边语义更新（file-overlap 模式相关）；步骤 9 宽度按
  seam-required-only 图计算
- `skills/rope-shape/references/gates-and-vocab.md`: 边表 Effect 列
  按模式分栏
- `skills/rope-shape/references/issue-package.md`: tasks.md 模板加
  `Execution mode:` 头行；Owned files 唯一性限定到 shared-mode wave
- `skills/rope-go/SKILL.md`: startup 消费记录模式（legacy 包回退旧
  推导）；ready set = seam-required blockers merged；冲突重派改在
  未落地支上解
- `skills/rope-go/references/execution-rules.md`: merge queue 冲突
  规则同步作者意图措辞
- `.rope/CONTEXT.md`: Edge Classification 与 Graph-Driven Execution
  两术语更新（含新增 Avoid：不得降级 seam-required）
- 同步 `.agents/skills`（diff 验证）

## Evidence

- Verification: 通读全部改动 + 安装副本 diff（本仓无测试套件）；
  语义一致性检查：ADR 0012 与 gates-and-vocab 边表、go ready-set、
  CONTEXT 三处措辞互相对齐。

## Human leftovers

- 提交分组待定（本 session 改动较多）。
