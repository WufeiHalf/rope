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
- Track local work under `.rope/issues/` unless the user says otherwise.
```
