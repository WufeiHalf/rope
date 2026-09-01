# Quick: rope-grill frontier rounds (upstream harvest adapt)

status: done

## Problem

rope-grill 访谈是隐式的「独立可批量、依赖保序」，缺显式循环模型：一问一答慢、
探索阻塞访谈、「聊透了吗」无判定判据。

## Root cause

上游 mattpocock/skills grilling 已升级为 design tree + frontier rounds
（区间 9603c1c..6654f6b）；Rope 2026-07-20 baseline 后未跟。

## Direction (user decision)

采纳 adapt（2026-09-01 harvest brief 人工标记）：收 frontier 重算循环、
探索非阻塞、frontier 空判据三点；不收 emoji 问题格式。见
`.rope/upstream/mattpocock-skills/reviews/2026-09-01-6654f6b.md`。

## Changes (docs-only, red waived)

- `skills/rope-grill/references/grilling.md`: Decision tree 节改写为
  Design tree + frontier rounds；Facts 加非阻塞 explore leaf 规则；
  Communication 批量提问改成分轮规则。
- `skills/rope-grill/SKILL.md`: 步骤 2（事实非阻塞）、步骤 6（frontier
  rounds 提问）。
- 同步 `.agents/skills`（`rope add`，diff 验证 SYNCED）。

## Evidence

- Verification: 通读两个文件 + 安装副本 diff 干净（本仓无测试套件）。
- 收敛说明：SKILL.md 第 8 步「next unblocked question」与新模型天然一致，未改。

## Human leftovers

- harvest brief 仍 open：待人工「关闭」推进 last-reviewed-sha 到 6654f6b；
  两个 watch 项（tdd seam 词汇指针、retro↔rope-summary 行）待裁决。
