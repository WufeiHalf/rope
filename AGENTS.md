# AGENTS

## Rope

This repository uses `.rope/` as a local agent knowledge layer.

Before shaping or implementing work:
- Read `.rope/CONTEXT.md` for project language.
- Read `.rope/routes.md` for navigation.
- Read relevant `.rope/specs/` before changing code.
- Read relevant `.rope/adr/` before changing architecture.
- Read referenced `.rope/research/` for external or platform facts.
- 需要代码上下文时，先读相关 `.rope/specs/` / `.rope/adr/` / `.rope/research/`，不要只靠文件名或 grep 结果推断架构。
- 完成代码变更后，若沉淀出可复用架构规则、adapter contract、配置契约、部署约束或踩坑修复，更新最小相关 `.rope/specs/` / `.rope/adr/` / `.rope/research/` 后再收尾。
- Track local work under `.rope/issues/` unless the user says otherwise.
