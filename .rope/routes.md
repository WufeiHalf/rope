# Routes

Navigation map for agents working in this repository. Keep this concise and
evidence-based.

## Repo Shape

- Source roots:
  - `skills/` — bundled Rope skill packages (`SKILL.md` + `references/`)
  - `skills/rope-go/workflows/go-execute.js` — the fixed go execution kernel
  - `skills/rope-go/scripts/` — the mechanical gates the host runs (`verify-delivery.sh`, `run-check.sh`)
  - `bin/rope.js` — CLI that installs skills into an agent skills directory
- Test roots:
  - `tests/` — `node --test`, no external dependency: `tests/harness/` (vm loader, stub host, tmp repo), `tests/kernel.test.mjs`, `tests/gates.test.mjs`, `tests/smoke.test.mjs`
- Build/test commands:
  - `node --test tests/*.test.mjs` — the whole suite
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
- Worktree setup: host-managed — 纯 Markdown 规则仓 + 零依赖 Node 测试，`node --test`
  在 fresh worktree 里直接可跑，无需安装。叶子在 fresh worktree 的验证 = 该切片
  的聚焦测试（通常是 `node --test tests/<file>.test.mjs`）加结构检查。
- Test tiers: quick: `node --test tests/*.test.mjs`（~2s，30 用例，2026-09-11 实测）；
  full 未单独定义 —— 本仓无更大型套件，quick 即全部。派生于 shape 2026-09-11
  （routes Test roots 改为 `tests/`）。
- Evidence: `.rope/issues/<slug>/evidence/` — 内核与 gate 的证据目录，位于工作树内，
  由仓库 `.gitignore`（`.rope/issues/*/evidence/`）忽略；delivery gate 另有
  `--evidence` 排除，未声明忽略的仓库也不会因此误判脏树。
- Test policy: fast-iteration — 本仓没有"freeze 必须全量"的要求；go 按影响选测，
  冻结点只跑声明的 freeze 检查。本仓全部套件即 quick，故实跌上等价。

## Common Work Routes

### Change or add a skill

Read first:
- `README.md`
- `skills/<skill-name>/SKILL.md`
- `skills/<skill-name>/references/` (if present)
- relevant `.rope/adr/` and `.rope/CONTEXT.md` when workflow semantics change

Verify with:
- `node --test tests/*.test.mjs` — the offline suite; it evaluates the shipped
  kernel in a host-like sandbox, so a skill change that breaks `go-execute.js`,
  `verify-delivery.sh` or `run-check.sh` fails here
- `python3 /path/to/skill-creator/scripts/quick_validate.py skills/<skill>` when skill-creator is available
- manual read-through of `SKILL.md` workflow + guardrails

Notes:
- Install target for local project use is typically `./.agents/skills`
- `rope add` overwrites bundled skill files but preserves existing `settings.json`

### Change the installer CLI

Read first:
- `bin/rope.js`
- `package.json`
- `README.md` Install section

Verify with:
- `node bin/rope.js --help`
- `node bin/rope.js add --target /tmp/rope-skills-smoke` (or another disposable target)

Notes:
- CLI currently supports `add` / `install-skills` and `--target`

### Update project language or architecture decisions

Read first:
- `.rope/CONTEXT.md`
- `.rope/adr/`
- `.rope/specs/`
- `.rope/routes.md`

For issue workflow changes, also read:
- `.rope/adr/0002-architecture-decision-continuity.md`
- `.rope/adr/0004-risk-tiered-review-mode-and-lean-briefs.md`
- `.rope/adr/0005-plan-artifact-reader-layering.md`
- `.rope/adr/0013-test-cost-tiering.md`
- `.rope/specs/guides/architecture-continuity.md`
- `skills/rope-shape/references/architecture-continuity.md`
- `skills/rope-go/references/dynamic-workflow.md` — shipped execution contract;
  `.rope/specs/dynamic-workflow-mode.md` is only the maintainer route
- `skills/rope-clear/references/current-docs.md` — current truth and document maintenance
- `skills/rope-clear/SKILL.md` — approved cleanup workflow

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
- Structural: `.agents/skills/upstream-harvest/SKILL.md` present; not under `skills/`
- Human review of the harvest brief under `.rope/upstream/mattpocock-skills/reviews/`

Notes:
- Skill path: `.agents/skills/upstream-harvest/` (user-invoked; not product `skills/`)
- Not shipped by `rope add`
- Pin is machine-local clone + last-reviewed SHA (no submodule)
