# Rope Init Templates

## `.rope/CONTEXT.md`

```md
# Context

Project-specific domain language for this repository.

## Language

<!-- Add resolved project terms here.

**Term**:
One or two sentence definition.
_Avoid_: ambiguous synonym
-->
```

## `.rope/routes.md`

```md
# Routes

Navigation map for agents working in this repository. Keep this concise and
evidence-based.

## Repo Shape

- Source roots:
- Test roots:
- Build/test commands:

## Common Work Routes

### <Area or workflow>

Read first:
- `<path>`

Verify with:
- `<command>`

Notes:
- <stable navigation note>
```

## `.rope/specs/index.md`

```md
# Rope Specs

Stable implementation contracts and project coding rules.

## Areas

- `guides/` - general thinking and verification guides.
- `<area>/` - area-specific implementation contracts.

## Usage

Before changing code, read the specs relevant to the target area. After fixing a
bug or discovering a reusable contract, update the smallest relevant spec.
```

## Agent Doc Block

```md
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
```
