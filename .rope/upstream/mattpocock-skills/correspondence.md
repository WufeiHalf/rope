# Correspondence: mattpocock/skills → Rope

Scan policy: **C1** — default harvest diffs only rows with interest `high`.
Rows marked `watch` are recorded for optional named scans; `out` is ignored.

| Matt skill | Rope target | Interest | Notes |
| --- | --- | --- | --- |
| `grill-me` | `skills/rope-grill` | high | Core interview loop |
| `grill-with-docs` | `skills/rope-grill` | high | Grill + durable docs |
| `grilling` | `skills/rope-grill` | high | Shared grilling methodology |
| `to-spec` | `skills/rope-shape` | high | Conversation → PRD/spec (upstream renamed from `to-prd`) |
| `to-tickets` | `skills/rope-shape` | high | PRD → vertical slices / issues (upstream renamed from `to-issues`) |
| `to-prd` | `skills/rope-shape` | out | Renamed upstream → `to-spec` (baseline 9603c1c) |
| `to-issues` | `skills/rope-shape` | out | Renamed upstream → `to-tickets` (baseline 9603c1c) |
| `setup-matt-pocock-skills` | `skills/rope-init` | high | Per-repo scaffold conventions; migrate stays separate |
| `tdd` | `skills/rope-go` | high | TDD discipline inside go slice loop (not a standalone Rope skill) |
| `triage` | _(none yet)_ | watch | Tracker intake state machine; not Rope's default path |
| `prototype` | _(none yet)_ | watch | Throwaway code to answer design questions; optional grill detour |
| `diagnosing-bugs` / `diagnose` | _(none yet)_ | watch | Debug loop; may inspire a future skill |
| `domain-modeling` | `.rope/CONTEXT.md` / adr habits | watch | Glossary/ADR sharpening; partly absorbed by rope-grill |
| `handoff` | leaf brief pattern in go/verify | watch | Already partially absorbed |
| `ask-matt` | _(none)_ | out | Skill router; Rope uses Parent Orchestrator |
| `zoom-out` / `teach` | _(none)_ | out | Prompting/education, not product workflow |
| `write-a-skill` / `writing-great-skills` | _(none)_ | out | Meta skill authoring; out of v1 harvest |
| non-Matt local skills | _(none)_ | out | e.g. browser/frontend tooling |

When upstream adds a skill that maps to Rope, add a row before relying on default scan.
