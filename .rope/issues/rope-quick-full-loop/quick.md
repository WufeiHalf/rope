# quick — rope-quick charter 扩容 + grill-lite 前段

## Problem / Ask
rope-quick 边界不清：只写"已诊断的 fix"，单窗口小 feature 被迫走 shape
单切片或 informally 走 quick；且 quick 缺需求对齐段。

## Grill-lite 记录（本会话 grill 已完成，此处收录）
确认的事实（fact self-check 通过）：
- 原 SKILL.md charter = "already-diagnosed fixes"，已有 Direction 一步但无结构化对齐
- ADR 0006 Decision 1 为"无入口门"，stop lines 四条与本次扩容正交
- shape 铁律已规定单窗口改动应路由 quick（.rope/CONTEXT.md 切片规则词条）

Q&A（grill 2026-09-08）：
- 边界是什么？→ 一个 fresh context window（不是 fix/feature 之分）
- quick 要不要自带需求对齐？→ 要，grill-lite：事实自检 + 一轮决策问题 + Q&A 落 quick.md
- ADR 处置？→ 原位修订 0006（不新开 ADR）
- stop lines？→ 不变

## Chosen direction
扩 charter 至"任何单窗口小任务（fix + 小 feature）"；Direction 升级为
Grill-lite 三步；fix loop 增加 feature test-first 分支；ADR 0006 原位修订
（含 Considered Options 补充"保留 fix-only charter"被拒）。

## Red/green evidence
Docs-only（skill/ADR/CONTEXT/README 纯 Markdown）——red 免除，理由：无代码
行为变更。回归证据：`node bin/rope.js add --target /tmp/rope-skills-smoke`
diff 一致（ADD-SMOKE-OK）+ `--help` 通过。

## Doc updates
- specs/：skip（无对应 spec；skill 即权威文本）
- adr/：0006 原位修订 ✓
- research/：skip（引用 Matt 立场已存证于会话与 ADR context）
- CONTEXT.md：Quick Fix Path 词条更新 ✓；README 两处 ✓；bundled 副本同步 ✓

## Human leftovers
无。status: done
