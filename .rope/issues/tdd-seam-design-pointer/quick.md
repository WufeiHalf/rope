# Quick: seam-design shared vocabulary (upstream harvest adapt)

status: done

## Problem

上游 tdd skill 新增指针：seam 形状存疑时应查 codebase-design 设计词汇，
而不是硬选。Rope 的 tdd.md 有 seam 锁定规则但无选位判据，shape 商定
Testing Decisions 时同样靠临场发挥。

## Root cause

上游 v1.0 把深模块笔记抽进 codebase-design 后补了 consult 指针；Rope
当年吸收 tdd 时未带（2026-07-20 baseline 后新增）。

## Direction (user decision)

采纳（2026-09-01 harvest brief 人工标记），要求与 Rope 系列架构一致：
不新增独立 skill，复用「归属 skill 挂共享参考 + 消费方相对引用」模式
（同 architecture-continuity.md）。

## Changes (docs-only, red waived)

- 新增 `skills/rope-shape/references/seam-design.md`：seam 放置词汇
  （deep/shallow、convergence criterion、existing-boundary-first、ports、
  depth probes）+ placement rule（shape 决定、mid-go 疑形状回父会话作
  plan adjustment）。
- `skills/rope-shape/SKILL.md`：头部加链接行。
- `skills/rope-shape/references/issue-package.md`：Testing Decisions 的
  `Seams under test` 行加争议时引用。
- `skills/rope-go/references/tdd.md`：Seams 节加 consult 指针
  （相对路径链接，验证可达）。
- 同步 `.agents/skills`（diff 验证 SYNCED，链接 LINK OK）。

## Evidence

- Verification: 通读 + 安装副本 diff + 相对链接存在性检查（本仓无测试套件）。
- correspondence tdd 行已记录吸收落点。

## Human leftovers

- harvest brief 仍 open：retro↔rope-summary 映射行待裁决；批次关闭
  （推进 last-reviewed-sha → 6654f6b）待裁决。
