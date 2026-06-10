# Rope Grill Document Formats

## `.rope/CONTEXT.md`

Use for project-specific domain language only.

```md
# Context

## Language

**<Canonical Term>**:
One or two sentence definition of what it is.
_Avoid_: <ambiguous synonym>, <wrong term>
```

Rules:
- Add terms only after they are resolved in conversation or verified from docs/code.
- Do not add implementation steps, file paths, tickets, or temporary facts.
- Prefer canonical vocabulary and list avoided alternatives.

## `.rope/adr/NNNN-slug.md`

Use only when all three are true:
- hard to reverse
- surprising without context
- real tradeoff between credible options

```md
# <Decision Title>

<1-3 sentences explaining context, decision, and why.>
```

Optional sections only when useful:
- `Status`
- `Considered Options`
- `Consequences`

## `.rope/research/<topic>.md`

Use for external, platform, or service facts that may be reused across issues.

```md
# <Research Topic>

## Question

<What fact was checked?>

## Verified Facts

### <stable-anchor>

Fact: <verified fact>
Source: <official docs, primary source, command, or code pointer>
Verified by: <command/search/source access>
Stability: low | medium | high
Implication: <how this changes planning or implementation>

## Assumptions

- <temporary assumption, if any>

## Open Questions

- <question requiring human decision or unavailable environment>
```

## `.rope/specs/<area>/<topic>.md`

Use for stable implementation contracts and gotchas.

```md
# <Spec Title>

## Scope

<When this spec applies.>

## Contract

- <signature, payload shape, invariant, or boundary rule>

## Tests Required

- <observable behavior that must be tested>

## Wrong vs Correct

### Wrong

<bad pattern>

### Correct

<safe pattern>
```

