---
name: rope-summary
description: Updates Rope architecture/context docs after implementation when reusable contracts, adapter boundaries, config rules, deployment constraints, or bug-fix learnings should be preserved. Use when user invokes rope-summary or asks to summarize/沉淀 current work into .rope architecture docs.
---

# Rope Summary

把已验证的实现经验沉淀到 `.rope/`，保持代码事实、架构契约和 agent 指令一致。

## Workflow

1. Inspect current repo state:
   - `git status --short`
   - changed files / recent commits relevant to the just-finished work
2. Read context before writing:
   - `.rope/CONTEXT.md`
   - `.rope/routes.md`
   - relevant `.rope/specs/`
   - relevant `.rope/adr/`
   - referenced `.rope/research/`
3. Decide whether docs need updates:
   - update when work created or clarified reusable architecture rule, adapter contract, config contract, deployment constraint, validation pattern, or recurring failure mode
   - skip when change is one-off, private implementation detail, or already covered by existing docs
4. Update the smallest durable doc:
   - `.rope/specs/` for stable implementation contracts and tests required
   - `.rope/adr/` for architecture decisions with trade-offs
   - `.rope/research/` for external/platform facts
   - `.rope/CONTEXT.md` only for domain language changes
5. Keep docs evidence-based:
   - link rule to observed code/test/log behavior when useful
   - do not invent product facts or future workflow runtime
   - do not paste secrets, raw prompts, base64, or large payloads
6. Verify and commit if the target repo expects commit discipline:
   - run lightweight doc/diff checks when available
   - commit only the doc update unless user asked to bundle it

## Agent Doc Rule

Rope-enabled repos should include this same rule in their root agent doc:

```md
- 需要代码上下文时，先读相关 `.rope/specs/` / `.rope/adr/` / `.rope/research/`，不要只靠文件名或 grep 结果推断架构。
- 完成代码变更后，若沉淀出可复用架构规则、adapter contract、配置契约、部署约束或踩坑修复，更新最小相关 `.rope/specs/` / `.rope/adr/` / `.rope/research/` 后再收尾。
```

## Output

Return:

- Updated files
- What rule/fact was preserved
- Verification run or reason skipped
- Commit hash if committed
