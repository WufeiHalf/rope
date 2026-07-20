# Routes

Navigation map for agents working in this repository. Keep this concise and
evidence-based.

## Repo Shape

- Source roots:
  - `skills/` — bundled Rope skill packages (`SKILL.md` + `references/`)
  - `bin/rope.js` — CLI that installs skills into an agent skills directory
- Test roots:
  - Unknown — no dedicated `tests/`, `test/`, or `spec/` tree found
- Build/test commands:
  - `node bin/rope.js --help` — CLI usage
  - `node bin/rope.js add --target <dir>` — install bundled skills
  - `python3 /path/to/skill-creator/scripts/quick_validate.py skills/<skill>` — skill validation (external tool path; not vendored here)
- Package marker:
  - `package.json` (`@wufei/rope`, bin `rope` → `./bin/rope.js`)
- Root agent docs:
  - `AGENTS.md`
- Existing durable docs:
  - `README.md`
  - `.rope/CONTEXT.md`
  - `.rope/adr/`

## Common Work Routes

### Change or add a skill

Read first:
- `README.md`
- `skills/<skill-name>/SKILL.md`
- `skills/<skill-name>/references/` (if present)
- relevant `.rope/adr/` and `.rope/CONTEXT.md` when workflow semantics change

Verify with:
- `python3 /path/to/skill-creator/scripts/quick_validate.py skills/<skill>` when skill-creator is available
- manual read-through of `SKILL.md` workflow + guardrails

Notes:
- Install target for local project use is typically `./.agents/skills`
- `rope add` overwrites bundled skill files but preserves existing `settings.json`

### Change the installer CLI

Read first:
- `bin/rope.js`
- `package.json`
- `README.md` Install Skills section

Verify with:
- `node bin/rope.js --help`
- `node bin/rope.js add --target /tmp/rope-skills-smoke` (or another disposable target)

Notes:
- CLI currently supports `add` / `install-skills` and `--target`

### Update project language or architecture decisions

Read first:
- `.rope/CONTEXT.md`
- `.rope/adr/`
- `.rope/routes.md`

Verify with:
- Unknown — documentation-only; no automated doc tests discovered

### Harvest Matt Pocock upstream inspiration (maintenance)

Read first:
- `.rope/CONTEXT.md` (term: Upstream Harvest)
- `.rope/research/upstream-inspiration-sources.md`
- `.rope/upstream/mattpocock-skills/source.md`
- `.rope/upstream/mattpocock-skills/correspondence.md`
- latest file under `.rope/upstream/mattpocock-skills/reviews/` if present
- relevant `skills/rope-*` targets named by correspondence

Verify with:
- Unknown — maintenance skill not implemented yet; human review of harvest brief

Notes:
- Not a product skill shipped by `rope add`
- Pin is machine-local clone + last-reviewed SHA (no submodule)
