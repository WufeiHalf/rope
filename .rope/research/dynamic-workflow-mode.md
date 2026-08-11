# Dynamic Workflow Mode (Parallel multi-writer, opt-in)

## Question

Can Rope add a **manually toggled "dynamic workflow mode"** that, when on,
shapes an issue into a **contract-first + disjoint file-ownership** slice set
and then concurrently spawns cheap subagents to implement the disjoint slices
— so a feature is "planned into small file-owning slices, built in parallel,
wired together in one light integration slice"? How does this square with the
existing single-window / no-nested-spawn / Cognition-warning guidance?

## Verified Facts

### external-harness-parallel-slices

Fact: The pattern the user describes — **contract-first (freeze shared
interface) → split into disjoint file-owner slices → per-agent isolated git
worktree → parallel subagents → merge + review** — is now mainstream, framed
as "table stakes" for agent CLIs in 2026. Consistent across Claude Code, Cursor
3, Roo Code, Cline, OpenHands, Codex, and orchestrator tools.
- Claude Code: `Workflow` tool (`parallel()`/`pipeline()`/`agent()`), Agent
  Teams (lead + teammates sharing a task list + mailbox), `--worktree` flag.
  Caveat: Agent Teams currently run **one model for all agents** (Opus 4.6);
  role-based model selection is a community request, not yet shipped.
- Cursor 3: built-in `/worktree`, up to 8 parallel agents on isolated worktrees.
- Roo Code: Orchestrator/Boomerang mode + **per-mode "Sticky Models"** and
  `file_access` read/write globs — closest native match to "cheap writer +
  per-role model + file ownership at once." (Unverified rumor of mid-2026
  shutdown; do not treat as fact.)
- Cline: read-only parallel subagents + a web Kanban board for parallel agents
  with isolated worktrees and auto-commits.
- OpenHands: service-based delegation, parallel refactors.
- OpenAI Codex: cloud-sandbox parallel tasks; concurrency without
  orchestration (tasks do not coordinate).
Source: web research (multiple provider summaries), Aug 2026
Verified by: web_search synthesis
Stability: medium (fast-moving product surface)
Implication: The "plan into disjoint slices then run in parallel" idea is
**validated and well-supported externally**; it is not experimental.

### dedicated-slice-planner-tools

Fact: Several tools exist specifically to be the "planning brain" that cuts a
task into disjoint file boundaries before agents run:
- **batuta-mcp** (MCP server): decomposes a brain dump into 2–5 plans whose
  `fileBoundaries` do not overlap, auto-corrects overlap once, scaffolds a
  `git worktree` per plan with a ready-to-paste prompt.
- **parallel-implementation skill**: "Iron Law" — a slice plan is valid only
  when every slice has independent inputs/outputs; two slices sharing a file,
  a shared data structure, or shared mid-execution state are **not** parallel
  (merge them or serialize).
- **Claim Plane** (arXiv preprint 2607.21909): formal "pre-write admission";
  agents declare versioned ChangeIntents; same-file parallelism only within
  declared disjoint regions; fails closed on ambiguous overlap.
Source: web research, Aug 2026
Verified by: web_search synthesis
Stability: medium
Implication: The "disjoint file ownership" rule is the load-bearing guard rail
for true parallel multi-writer. Rope's `rope-shape` already has the analog
(`Blocked by` / `Scope` / frontier): the dynamic mode makes it **mandatory**
rather than advisory.

### per-role-model-support-varies

Fact: "Each parallel writer uses a different cheap model" is **unevenly
supported**:
- Roo Code: native per-mode model (Sticky Models) — best native fit.
- multi-agent-orchestrator-skill: can pin a model per worker via CLI template.
- Claude Code Agent Teams: NOT supported (all agents same model currently).
- pi / Rope: model routing is via `rope-harness-presets` role templates
  (`rope-implementer` / `rope-reviewer` / `rope-explore` /
  `rope-verify-inspector`); parent may override per spawn. All roles here are
  currently configured to `deepseek-v4-flash`.
Source: web research + local Rope harness-presets skill, Aug 2026
Verified by: web_search + repo read
Stability: medium
Implication: Rope already routes models through presets; the dynamic mode
should **reuse existing presets** (per user decision) rather than introduce a
new model mechanism. No new strong-model requirement.

### anthropic-cognition-warning-still-holds

Fact: Cognition argues parallel multi-writer coding is fragile (context not
fully shared; actions carry implicit decisions that diverge). Anthropic notes
multi-agent suits breadth-first research better than coding, and coding agents
are not great at real-time multi-agent coordination. Parallel is safest when
tasks are **independently verifiable**; team size 3–5 is optimal; >5 raises
conflict probability. "**The interface is the contract**": any shared boundary
must be governed by an explicit contract neither agent modifies unilaterally.
Source: cognition "don't build multi-agents"; Anthropic engineering posts
(see also single-window-go-orchestration.md)
Verified by: prior research capture + web
Stability: high
Implication: The dynamic mode is **not** a blanket licence to parallelize
everything. Its safety contract is exactly: contract slice first (serial),
disjoint file ownership, independent verification per slice, review/verify
gates retained. Slices that share a core file stay serial.

### relation-to-existing-single-window-research

Fact: `single-window-go-orchestration.md` crystallized direction 3 (no nested
subagent spawning as policy), direction 13 (W1 parent-orchestrator skill), and
a "Recommended Working Shape" of **phase-separated single implementer under a
planner/judge** — explicitly "not multi-agent free-for-all." The dynamic mode
is a **new opt-in variant on top of W1**: it allows parallel implementer leaves
for **disjoint-scope** slices, while keeping the parent as the only orchestrator
and review/verify as parent-owned gates.
Source: `.rope/research/single-window-go-orchestration.md`
Verified by: repo read
Stability: high
Implication: Dynamic mode must preserve: parent is the only spawner; leaves do
not spawn leaves; issue-level verify stays parent-owned and read-only; per-slice
review stays a parent-dispatched gate (not owned by the implementer).

### pi-dynamic-workflows-extension

Fact: `pi-dynamic-workflows` (prototype) registers a `workflow` tool that runs
dynamic JS in a Node vm sandbox, spawning in-memory Pi subagent sessions via
`agent()` / `parallel()` / `pipeline()`. It has **no** worktree isolation, no
concurrency cap, no approval nodes, no retry/failure policy, no persistence, and
is marked prototype.
Source: web fetch of the repo, Aug 2026
Verified by: fetch_content
Stability: low (prototype)
Implication: Adopting it as the engine for Rope's slice loop would fight Rope's
review/commit/verify gates and lack worktree isolation. User decision: **do not**
use it as the engine; keep Rope-native orchestration. It may still be used
manually for one-off read-only fan-out (research / multi-view review / frontend
prototype variants), which does not require any Rope change.

## Crystallized Decisions (grill, current session)

These are the user's product decisions, not yet shaped into an issue.

1. **This is a Rope change (scope flip).** Earlier "zero-change, use
   pi-dynamic-workflows manually" was replaced by: **modify Rope** to add a
   manually toggled dynamic workflow mode. Deferred / still allowed: manual
   use of pi-dynamic-workflows for one-off read-only fan-out, no Rope change.
2. **Manual toggle — asked at shape time.** At the start of `rope-shape`, the
   skill asks the user whether this issue should use dynamic mode. If yes,
   shape enforces the three-piece discipline and writes `mode: dynamic` into
   the issue package; go reads the field and fans out disjoint slices. If no,
   normal serial behavior with the existing optional parallel frontier.
   `mode` is a durable issue-package field (artifacts are the bus), not a
   chat-time remark at go.
3. **Slice modeling — mandatory "three-piece" discipline at shape:** (a) a
   **contract slice** that only defines interfaces / data structures / call
   boundaries, serial and must be first; (b) implementation slices cut by
   **disjoint file ownership** (a core file touched by multiple slices is a
   shape defect, not a go problem); (c) a **per-slice size cap** (avoid
   7000-line slices). Slice health becomes a rule, not a habit.
4. **go behavior — parallelize only non-overlapping slices, keep gates.**
   When dynamic mode is on, rope-go fans out disjoint implementation slices to
   concurrent cheap implementer leaves; each slice still passes a review gate;
   a light integration slice (serial) wires the module slices together and
   verifies contract alignment; issue-level verify remains parent-owned and
   read-only. ADR 0001 (implement/accept separation) is preserved.
5. **Model routing — reuse existing harness presets.** No new strong-model
   requirement and no new model mechanism. Dynamic-mode workers are spawned via
   the existing `rope-harness-presets` role templates (currently all
   `deepseek-v4-flash`). Parent may override per spawn when risk warrants.
6. **Keep no-nested-spawn and parent-only-orchestration.** Parent is the only
   spawner; a parallel implementer leaf must not spawn another leaf. This
   matches research direction 3 and pi-subagents' hard limit.
7. **Architecture impact: required.** Touches `rope-shape` (slice discipline),
   `rope-go` + `execution-rules.md` (dynamic mode toggle + parallel dispatch),
   `rope-harness-presets` (worker pool reuse, likely no schema change), and
   `single-window-go-orchestration.md` (extend W1 direction), plus a new
   `CONTEXT.md` term and likely an ADR for the parallel-orchestration decision.

## Open Questions (for shape)

- Exact per-slice size cap (lines / files) and how it is enforced (hard rule vs
  review warning).
- Pipeline detail: does the contract slice carry a deterministic gate (types
  compile / schema lint) that must pass before fan-out starts?
- Where the `mode` field lives (prd.md frontmatter vs tasks.md) and its exact
  schema.
- Whether the integration slice needs its own review gate or folds into
  issue-level verify.
- Whether per-slice review stays a strong-model gate or thins to deterministic
  gates + cheap review (deferred; default keep review gate).

## Sources

- External harness research (web, Aug 2026): Claude Code Workflow/Agent Teams/
  worktrees, Cursor 3, Roo Code, Cline, OpenHands, Codex, batuta-mcp,
  parallel-implementation skill, Claim Plane, multi-agent-orchestrator-skill.
- Cognition "Don't Build Multi-Agents"; Anthropic engineering posts.
- pi-dynamic-workflows repo (fetch_content).
- Local Rope: `.rope/CONTEXT.md`, `.rope/adr/0001`, `.rope/research/single-window-go-orchestration.md`, `skills/rope-go`, `skills/rope-shape`, `skills/rope-harness-presets`.