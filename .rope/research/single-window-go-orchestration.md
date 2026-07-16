# Single-Window Go Orchestration

## Question

Should Rope move from a human multi-window handoff
(`planner window: grill/shape/verify` ↔ `implementer window: go`)
to a single issue window where the parent session runs grill → shape →
spawns a go subagent → parent reviews/verifies?
What are the benefits, costs, reference workflows, and open product
decisions — especially whether per-slice review remains load-bearing?

## Verified Facts

### rope-current-window-split

Fact: Rope's durable language and ADR codify a **Planner Window (A)** /
**Implementer Window (B)** split. Window A owns grill, shape, issue-level
verify, and final accept/reject. Window B owns `rope-go` (slice TDD,
per-slice review, E2E). Verify is read-only on code and routes fix
prompts back to the implementer window. Per-slice review is owned by go,
not by verify.
Source:
- `.rope/CONTEXT.md` (`Planner Window`, `Implementer Window`,
  `Per-Slice Review`, `Issue-Level Verify`)
- `.rope/adr/0001-issue-level-verify-separated-from-go.md`
- `skills/rope-verify/SKILL.md`, `skills/rope-go/SKILL.md`
- `README.md` Typical Workflow steps 4–5
Verified by: direct read of repo docs/skills/ADR
Stability: high
Implication: User's current multi-window practice matches the ADR/CONTEXT
design more closely than the "default inline" wording in grill/shape.

### rope-skill-handoff-tension

Fact: `rope-grill` and `rope-shape` currently say **default is inline /
same session**, and only emit cross-window copy-paste prompts when the
user signals switching windows. `rope-go` still ends by prompting the
user to run `rope-verify` in the planner window. README/ADR still
describe planner-window verify + implementer-window fix routing.
Source: `skills/rope-grill/SKILL.md` handoff section;
`skills/rope-shape/SKILL.md` handoff section; `skills/rope-go/SKILL.md`
Overall Verification step 6; `README.md`
Verified by: direct read
Stability: medium (docs already partially drift)
Implication: The product intent is already halfway toward single-window
orchestration; the remaining hard split is **go execution model routing
+ issue-level verify separation**, not "always two windows."

### adr-why-verify-not-self-fix

Fact: ADR 0001 rejected Trellis-style self-fix at issue-level verify
because (1) strong-model tokens should buy judgment not edit loops,
(2) a single code-writing surface keeps git/history co-located, and
(3) escalation should be model-driven. Empirical triggers were silent
`review_degraded` and failed E2E leaking into "completed."
Source: `.rope/adr/0001-issue-level-verify-separated-from-go.md`
Verified by: direct read
Stability: high
Implication: Moving go into a subagent does **not** automatically
invalidate issue-level verify. The durable property to preserve is
**cross-role separation of implement vs accept**, not necessarily two
human windows.

### anthropic-orchestrator-worker

Fact: Anthropic's production Research system uses an orchestrator-worker
pattern (lead agent + parallel subagents with separate context windows).
Internal eval: Opus lead + Sonnet workers beat single-agent Opus by
**90.2%** on research tasks. Multi-agent systems use ~**15×** chat
tokens; ordinary agents ~**4×**. Anthropic explicitly notes multi-agent
fits breadth-first parallel search better than most coding tasks, and
that coding agents are not yet great at real-time multi-agent
coordination.
Source: https://www.anthropic.com/engineering/multi-agent-research-system
Verified by: fetch of primary Anthropic engineering post
Stability: medium (architecture guidance; numbers are Anthropic-internal)
Implication: Subagents for **isolated exploration / compression** are
well-supported. Parallel multi-writer coding is the weak case. Rope's
proposed "one go worker after shape" is sequential orchestrator-worker,
not parallel multi-coder — closer to Claude Code's design than Research.

### anthropic-workflow-patterns

Fact: Anthropic's agent pattern catalog includes prompt chaining with
gates, routing, parallelization, **orchestrator-workers**, and
**evaluator-optimizer**. Coding agents benefit from verifiable tests and
human review for broader system fit. Advice: start simple; add
complexity only when measured useful.
Source: https://www.anthropic.com/engineering/building-effective-agents
Verified by: fetch of primary Anthropic engineering post
Stability: high
Implication: Rope already resembles prompt-chaining
(grill→shape→go→verify) with gates. Evaluator-optimizer maps to
verify↔fix loop. Orchestrator-workers maps to parent spawning go.

### anthropic-endstate-and-artifacts

Fact: Anthropic appendix guidance for stateful multi-turn agents:
prefer **end-state evaluation** over turn-by-turn process judging; use
**filesystem artifacts** so subagents write durable outputs and return
lightweight references, reducing telephone-game loss through the
coordinator.
Source: same multi-agent research post appendix
Verified by: fetch
Stability: high
Implication: Rope's issue package (`prd.md`/`tasks.md`/`e2e.md`) plus
git commits already is the right handoff medium. Parent should trust
artifacts + diff, not the go subagent's prose summary alone.

### claude-code-subagent-capabilities

Fact: Claude Code subagents run in isolated context windows; support
`model` override (including cheaper models), tool allow/deny lists,
`skills` preload, `maxTurns`, background/foreground, nested spawn
(depth capped at 5), and `isolation: worktree`. Official guidance:
use subagents to preserve main context and control cost; keep verbose
work out of the parent; prefer main conversation when phases share
heavy iterative context or need frequent user back-and-forth.
Source: https://code.claude.com/docs/en/sub-agents
Verified by: fetch of Claude Code docs
Stability: medium (product surface moves quickly; model-override bugs
have been reported in GitHub issues)
Implication: "Parent spawns cheap go worker" is a first-class pattern
in a major coding harness. Caveat: model override reliability must be
verified on the actual host (pi/Claude Code version), not assumed.

### claude-code-model-override-fragility

Fact: Community/issue reports claim subagent `model` frontmatter or
Agent-tool `model` params can be silently inoperative, overridden by
env (`CLAUDE_CODE_SUBAGENT_MODEL`), or dropped after continuation
boundaries.
Source:
- https://github.com/anthropics/claude-code/issues/54448
- https://github.com/anthropics/claude-code/issues/57718
- https://github.com/anthropics/claude-code/issues/68147
Verified by: web search summaries of GitHub issues
Stability: low (bugs may be version-specific)
Implication: Single-window cost win depends on **observable effective
model**. Rope should record actual go-subagent model/thinking in
`tasks.md` / final go report, not only the requested model.

### cognition-dont-build-multi-agents

Fact: Cognition (Devin) argues multi-agent coding is often fragile
because (1) context is not fully shared and (2) actions carry implicit
decisions that diverge across agents. Principles: share full traces when
possible; avoid conflicting decision-makers. As of their June 2025
writeup, Claude Code subagents were described as mostly for
**questions/research**, not parallel code writing, and not concurrent
with the main agent writing code. They prefer single-threaded agents
plus compression/memory over multi-writer multi-agents.
Source: https://cognition.com/blog/dont-build-multi-agents
Verified by: fetch of Cognition blog
Stability: medium (strong opinion from one lab; still widely cited)
Implication: Rope should **not** turn go into many parallel slice
writers without a stronger contract. One implementer subagent executing
a pinned issue package is much closer to Cognition's acceptable
subtask pattern than "multi-coder consensus."

### discrete-phase-separation

Fact: Agent design literature recommends research / plan / execute in
**separate conversations**, with only distilled artifacts crossing
boundaries. Prompt-level sectioning inside one context is weaker because
attention still spans the junk. Phase separation also enables
model-per-phase routing (strong plan, cheap execute).
Source: https://agentpatterns.ai/agent-design/discrete-phase-separation/
Verified by: fetch
Stability: high (pattern-level; widely repeated)
Implication: grill/shape in parent + go in subagent is phase separation
done right. Running go **inline in the same parent context** would
pollute the planner/verifier window with test logs and failed attempts.

### context-pollution-coding-loops

Fact: Long mixed-role coding threads suffer "context rot": ticket text,
greps, failed plans, logs, and reviews collapse into an unstructured
window and later steps get weaker. Practical loops (e.g. Depot `/orc`)
isolate planner / clarifier / builder / reviewers as subagents and pass
structured packets only.
Source:
- https://depot.dev/blog/context-isolation-in-coding-agent-loops
- https://ar5iv.labs.arxiv.org/html/2601.14914 (CodeDelegator: role
  separation mitigates debugging-trace pollution)
Verified by: fetch / arXiv html
Stability: medium
Implication: Single **window for the human** is good; single **context
for all roles** is bad. The optimization target is "one human surface,"
not "one KV cache for grill+go+verify."

### thrifty-tiered-delegation

Fact: `thrifty` benchmarks a tiered coding architecture: strong model
writes a contract + sprints; cheap model executes and self-fixes against
an independently re-run gate; strong model only does scoped patches on
failure. Reported ~**64%** cheaper than Opus solo at equal gate quality
on 7 multi-unit tasks (n=1, local cost estimates, caveats documented).
Load-bearing lessons: pin cross-sprint ambiguous decisions; prefer one
cached cheap agent over many cold dispatches; never open-ended strong
fix agents; adaptive verification (run gate first, spend strong model
only on failures / assertional criteria).
Source: https://github.com/2389-research/thrifty (README + eval/RESULTS.md)
Verified by: clone/read of README and RESULTS.md
Stability: medium (benchmark caveats explicit; direction robust)
Implication: Closest open reference to Rope's desired cost split. Rope
already has the contract analog (issue package + Behavior Matrix). The
open design choice is whether go's mid-flight review is a strong-model
job or a gate/tests job.

### pi-stock-vs-runtime-subagents

Fact: Stock pi README states pi "skips features like sub agents and plan
mode" and provides subagents as an **example extension** that spawns
isolated `pi` subprocesses with agent defs (`scout`/`planner`/`reviewer`/
`worker`) and chained prompts (`implement`, `implement-and-review`).
This runtime's Agent tool comes from installed package
`@tintinweb/pi-subagents` (not pi core). It supports `model`, `thinking`,
`run_in_background`, `isolation: worktree`, `inherit_context`, and
resume/steer.
Source:
- pi README philosophy section
- `examples/extensions/subagent/README.md`
- live install of `@tintinweb/pi-subagents` + Agent tool surface
Verified by: local package read + explore of installed extension
Stability: medium (host-dependent)
Implication: Rope's single-window design must be written against **host
capabilities**, with a portable skill contract and a cross-window escape
hatch when the host cannot route models or spawn code-writing workers.

### pi-subagents-no-nested-agent

Fact: On `@tintinweb/pi-subagents`, child sessions intentionally do **not**
inherit `Agent` / `get_subagent_result` / `steer_subagent`. A go-as-subagent
cannot spawn a read-only review subagent. Cheaper model override,
write/edit/bash/commit, background/steer/resume, and worktree isolation are
supported; nested Agent graphs are not.
Source: explore of installed pi-subagents runner tool-exclusion list
Verified by: read-only explore agent on local install
Stability: high for this host version (Claude Code allows nested Agents with
depth limits; do not assume portability)
Implication: Naive "main spawns full rope-go as leaf subagent" recreates
`review_degraded: no_subagent_tool_available` — the exact failure ADR 0001
was written to catch. Viable single-window designs on this host:
1. go remains a **top-level** cheap session (own window/session with Agent),
2. **parent** owns the slice loop and spawns implementer Agent + review
   Agent separately (skill ownership rewrite), or
3. go-as-leaf keeps only **deterministic** mid-flight gates; LLM per-slice
   review moves to parent or is thinned away.

### industry-supplement-clean-review

Fact: Cognition's later multi-agent guidance: extra agents work when they
**review/advise**, not co-write; clean-context review is high ROI. Aider's
Architect/Editor shows strong reasoner + cheaper editor can beat solo.
Practitioner verify writeups: agents often claim complete while large
fractions of checklist items are missing — re-run real signals, do not trust
success prose. Devin-like systems keep structured plan state outside chat.
Source: multi-agent research subagent brief citing Cognition
multi-agents-working, Aider architect post, Loadsys completion-proof
Verified by: web research subagent synthesis
Stability: medium
Implication: Keep issue package as bus and issue-level verify as mandatory;
middle-flight LLM review can thin if deterministic gates hold.

## Assumptions

- "One issue → one window" means one human conversation surface, not
  collapsing all roles into one model context.
- Cheap go remains desirable; strong model remains desirable for
  grill/shape/issue-level verify.
- Issue package quality after shape remains the primary handoff
  artifact; go should not need the full grill transcript if the package
  is complete.
- Host can either spawn a code-writing subagent with a different model,
  or Rope must keep a manual Window B escape hatch.

## Crystallized Product Direction (grill, 2026-07-16)

These are product decisions from the user, not yet shaped into an issue:

1. **Multi-harness portability.** Rope must work beyond pi. Skills encode a
   **generic orchestration strategy**; concrete model ids, agent-type names,
   and spawn APIs are resolved per harness at runtime.
2. **Parent is the only orchestrator.** The main/planner session owns the
   issue loop (grill → shape → implement slices → review dispatches →
   issue-level verify). Subagents are **leaf workers** only.
3. **No nested subagent spawning as policy.** Even on hosts that allow
   nested Agents (e.g. Claude Code depth limits), Rope does **not** let a
   worker spawn another worker. This matches pi-subagents' hard limit and
   keeps the graph portable and debuggable.
4. **Harness model inventory + role presets skill (new).** Local available
   models change often. Add a skill that:
   - discovers models currently available on the active harness
   - researches relative strengths (web/docs/benchmarks as available)
   - ranks and writes **role presets** for Rope worker roles
   - emits harness-specific binding format when needed, under a shared
     role schema
5. **Naive leaf-full-rope-go is rejected** on hosts without nested Agents,
   and rejected as policy everywhere: go's old "spawn review inside go"
   ownership moves up to the parent orchestrator.
6. **Leaf role set (confirmed):** `implementer`, `reviewer`, `explore`,
   `verify-inspector`. Parent is session role, not a preset row.
7. **Context-protective parent (confirmed):** correction work is re-brief +
   re-spawn leaf; parent avoids polluting itself because compaction drops
   grill chat. Durable decisions must be written to `.rope/` / issue package
   during grill, not left only in conversation.
8. **Preset storage (confirmed direction):** write role workers into each
   harness's native subagent/agent preset directory; keep only a thin Rope
   manifest/record for role→preset mapping and refresh metadata.
9. **Preset write scope (confirmed):** default to the harness **user-level**
   agents directory (e.g. pi `~/.pi/agent/agents/`). Project-level agent
   dirs are opt-in later if a team wants shared prompts; not the default,
   because local model catalogs churn per machine.
10. **Rope manifest location (confirmed):** user-global only, e.g.
    `~/.config/rope/harness/<host>.json` or `~/.rope/harness/<host>.json`
    — not project `.rope/`, not skill-local settings as primary. Maps role →
    harness agent name/model + generation metadata; no second prompt DB.
11. **Preset refresh (confirmed):** manual skill invocation only. No
    `stale_after` / TTL. Orchestrator may notice missing presets and tell the
    user to run the skill; it does not auto-refresh or time-expire working
    presets.
12. **Missing preset policy (confirmed):** soft degrade — use harness generic
    worker types without forced model pin; record `preset_missing`; continue;
    prompt user to run the preset skill manually. No hard block; no auto-generate.
13. **Issue packaging (confirmed):** two issues. **W2 first** = harness model
    inventory + native agent presets + user-global manifest skill. **W1 later**
    = parent-orchestrator workflow + skill wording (grill/go/shape/verify)
    for no-nested-spawn, context-protective parent, leaf correction. W1 may
    soft-use W2 presets but must not hard-depend on them.
14. **Leaf effort/thinking (confirmed):** defaults live on harness-native
    role presets; parent may override per spawn when risk warrants; host
    without per-agent effort ignores the field. Leaf self-picking effort is
    not the primary strategy.
15. **Skill-local settings.json pin (confirmed retire in W2):** remove
    `rope-verify` skill-local `settings.json` / `settings.example.json` pin path
    and README guidance. Single pin source becomes harness-native `rope-*`
    presets + user-global manifest. No dual-read compatibility layer required;
    optional one-shot migrate hint if an old settings file is found.

### Portable orchestration contract (draft)

```text
Parent (strong / session model)
  owns: grill, shape, slice loop, review dispatch, issue verify, finish handoff
  may spawn leaf workers:
    - implementer (write+test+commit one unit of work)
    - reviewer (read-only critique of a finished unit)
    - explorer / mechanical inspector (read-only facts)
  never: asks a leaf to spawn another leaf

Leaf workers
  receive: self-contained brief + artifact paths + acceptance criteria
  return: summary + paths/status only
  do not: orchestrate other agents

Artifacts remain the bus: .rope/issues/<id>/* + git
```

### Parent executes vs delegates (draft policy)

Parent is **judgment-primary and context-protective**. User decision
(2026-07-16): even course correction should be **executed by a leaf** after
the parent rewrites the brief. Parent context is the scarcest resource;
compaction drops earlier grill discussion, so the parent must not fill itself
with exploratory dumps, long test logs, or multi-turn fix loops.

**Parent must do (stays in parent context):**
- grill / shape / gate decisions / issue-level accept-reject
- talk to the human
- write durable decisions into `.rope/` and the issue package early
  (these survive compaction; chat does not)
- decide *what* brief a leaf gets, including correction briefs
- read **summaries** and artifact diffs, not full leaf traces by default

**Parent must not bulk-do (spawn a leaf instead):**
- large explore / grep / log / test-output ingestion
- slice implementation and re-implementation after failure
- long surgical fix loops after verify (parent writes a scoped fix brief;
  implementer leaf executes)
- mechanical matrix/E2E evidence gathering for verify

**Course-correction pattern (preferred):**
```text
leaf fails or drifts
  → parent judges from summary + artifacts (not full trace by default)
  → parent rewrites a tighter brief (pins the missed decision)
  → parent re-spawns implementer/reviewer leaf
  → only if brief cannot be written without more facts:
       spawn explore leaf first, then re-brief
```

**Rare parent self-execution exceptions** (keep narrow):
- editing issue docs / ADR / research / CONTEXT during grill-shape
- trivial one-line doc fix where spawn overhead is absurd
- host cannot spawn workers at all (degraded mode)

**Decision rule of thumb:**
Parent holds *decisions*; leaves hold *noisy work*.
If an action would load tokens the parent will not need after compact,
spawn a leaf. If a decision must survive compact, write it to `.rope/` or
the issue package immediately — do not leave it only in chat.

**Grill skill implication:**
`rope-grill` (and later orchestrator skills) must explicitly remind the parent
to spawn leaves for context-polluting investigation, and to crystallize
resolved decisions into durable docs before the window is compacted away.

### Mature harness / skill references for this split

| Reference | Orchestrator does | Workers do | Fit for Rope |
|---|---|---|---|
| Claude Code main vs subagent | Shared multi-phase judgment, iterative refinement, user back-and-forth | Side tasks that would flood context; cheaper models; tool-limited jobs | Direct: parent keeps issue judgment; leaves for implement/review/explore |
| thrifty | Strong model writes contract + sprints; scoped strong patch only on leftover failure | Cheap model executes units against gate | Closest cost split; parent surgical fix |
| architect-loop (DanMcInerney) | Architect = arbitration, gates, merge/integrate; judgment only | Builders in worktrees, test-first | Stricter than Rope; useful for "judge vs build" language |
| Cognition multi-agent guidance | Single writer of truth; escalate for intelligence | Review/advise agents with clean context | Review leaves good; multi-writer bad |
| Aider Architect/Editor | Strong reasons about edits | Cheaper model applies edits | Optional micro-split inside implement; not full issue lifecycle |
| Anthropic orchestrator-workers | Lead decomposes, synthesizes, scales effort | Parallel specialized workers | Research-shaped; for coding keep workers sequential writers |
| "Orchestrator never writes code" essays | Pure dispatch/validate | All mutation in workers | Rejected as absolute rule for Rope; useful as default bias only |

Implication: Role Presets cover **leaf workers**. Parent uses the session
model the human chose for the issue window. Parent still has an **execution
policy** (when to self-do vs delegate), but that is skill logic, not a model
preset row — unless we later add an optional `parent-fixer` leaf for scoped
patches on a strong model different from the session model.

### Harness adapter surface (draft, not implemented)

Skills should ask runtime questions, not hardcode pi:

- Can this host spawn code-writing workers with a model override?
- What agent types exist (general-purpose, explore, custom, …)?
- How is model identity spelled (`provider/modelId`, alias, …)?
- Are tools allow/deny and read-only modes expressible?
- Is background/steer/resume available?

If spawn+model-override is unavailable: degrade to top-level cheap session
or explicit human handoff — still without nested orchestration fiction.

### Role-preset skill (draft scope)

Working name: something like `rope-harness-presets` / `rope-model-presets`.

Inputs:
- harness identity (pi, claude-code, codex, …)
- currently enabled/available models from host config or CLI
- optional user constraints (max cost, prefer local, exclude providers)

Outputs (user-preferred layout, grill 2026-07-16):
1. **Harness-native agent/subagent presets** written into that host's normal
   preset directory (not a Rope-invented model DB as the primary store).
   Examples of target families:
   - pi: agent defs under the host agent dir (e.g. `~/.pi/agent/agents/` or
     project `.pi/agents/`) — same shape the pi-subagents package already loads
   - Claude Code: `~/.claude/agents/` or project `.claude/agents/`
   - Codex / others: whatever that harness uses for named agents
2. **Thin Rope record/manifest** only — role → harness agent name, chosen
   model id, generated_at, sources/confidence, stale hint. Not a second full
   copy of prompts/tools.

Why this is better than Rope-owned profile JSON as primary:
- Spawn path is native (`Agent({ subagent_type: "rope-implementer" })`)
- No runtime translate from Rope schema → host agent schema every call
- Matches multi-harness reality: each host already has preset templates
- Model churn updates host agents; Rope only refreshes the pointer record

Skill still owns:
- shared Rope **role schema** (implementer/reviewer/explore/verify-inspector)
- per-harness **writer adapter** (path + file format + frontmatter fields)
- research/ranking when choosing models
- manifest update + staleness

Resolved: user-level agents dir; user-global manifest; manual refresh only;
missing-preset soft degrade; two issues W2-first; effort defaults+override;
retire verify settings.json in W2; first writer = pi only (+ stub other hosts).
Resolved further: skill name `rope-harness-presets`; manifest
`~/.config/rope/harness/<host>.json`; agents `rope-implementer` |
`rope-reviewer` | `rope-explore` | `rope-verify-inspector`; pi write dir
user agents (`~/.pi/agent/agents/rope-*.md` or host-equivalent).
Resolved: agent templates are medium-depth (role contract + tool bounds +
output format; not full rope-go text); offline/web research failure →
local heuristics ranking, confidence low, still write presets (no hard fail).
W2 grill surface is complete enough to shape; W1 orchestrator rewrite remains
a separate later issue.

16. **Human escalation stop (confirmed for W1):** after **two** unsuccessful
    fix rounds on the same problem, or when the parent judges a **design /
    requirements / contract** defect (not a mere implement miss), stop
    automated leaf repair. Parent must explain the problem to the user in a
    short precise form and wait for a decision. No open-ended third+ silent
    retry loop.

## Design Options (not decided)

### Option A1 — Parent spawns full rope-go leaf (naive single-window)

```text
[Human one window / strong model]
  grill → shape → commit issue package
       → spawn go subagent (cheap model, full rope-go skill)
       → parent rope-verify
```

Pros: simplest UX story
Cons on this host: **go cannot nest review Agents** → permanent review
degradation unless go is rewritten. Not recommended as-is on pi-subagents.

### Option A2 — Parent owns slice loop (single-window, host-honest)

```text
[Human one window / strong model]
  grill → shape → commit issue package
       → for each slice:
            spawn implementer Agent (cheap, write)
            run deterministic gates
            optionally spawn review Agent (read-only; parent has Agent)
       → parent rope-verify
       → on CHANGES_REQUESTED: spawn fix Agent
```

Pros:
- One human window
- Review still possible because parent holds Agent
- Cheap model still burns implement tokens
- Matches Cognition "writers single-thread, reviewers extra"

Cons:
- rope-go skill ownership rewrite (parent becomes orchestrator)
- More skill complexity than leaf-go
- Human gates / mid-flight steering still need policy

### Option A3 — Top-level cheap go session, same human "issue room" UX

Not a subagent: after shape, skill opens/continues a **separate top-level
cheap session** (second process/window auto-launched or user-switched once)
that has Agent for nested review; planner session only verifies later.

Pros: preserves rope-go as written; keeps nested review
Cons: may still be two sessions under the hood; UX win depends on harness
launcher quality

### Option B — Same session, model switch, no subagent

```text
grill/shape on strong → /model cheap → go → /model strong → verify
```

Pros: simplest mechanically
Cons: context pollution; verify reads its own implementation noise;
violates discrete phase separation. Generally inferior for quality.

### Option C — Artifact dispatch outside chat (thrifty-dispatch style)

```text
shape writes package → deterministic dispatcher runs cheap go sessions
→ parent only reads manifest + verify
```

Pros: minimal parent context tax; very cheap
Cons: more infra; weaker interactive mid-flight steering; less natural
inside pure skill-only Rope today

### Option D — Hybrid with escape hatch

Default A for normal issues; keep cross-window B for huge/long-running
or host-limited cases.

Pros: practical migration path
Cons: two modes to document and maintain

## Per-Slice Review: Keep, Thin, or Drop?

### Why it exists today

- Catch high-risk mistakes before later slices build on them
- Independent eyes (read-only subagent) vs implementer self-check
- ADR evidence shows it was **already silently degraded** in practice

### Reference patterns

| Pattern | Mid-flight review | End review | Trust contract |
|---|---|---|---|
| Rope today | per-slice review inside go | issue-level verify | matrix + E2E + verify.md |
| thrifty | usually none if gate green | strong only on failure / assertional | independently re-run gate |
| Depot `/orc` | multi-reviewer council after build | boss synthesis | structured verdicts |
| Anthropic eval-optimizer | loop until criteria met | final answer | explicit rubric |
| Cognition single-thread | continuous same context | human | shared full trace |

### Candidate policies for single-window Rope

1. **Keep as-is inside go subagent**
   - Safest migration
   - Cost depends on whether go can spawn nested review subagents
   - Still need issue-level verify (different job)

2. **Thin per-slice review**
   - `Review: required` only for high-risk boundaries
   - Runnable verification (tests/smoke) is the default mid-flight gate
   - Strong parent does issue-level verify once
   - Closest to thrifty adaptive verification

3. **Drop per-slice review; rely on issue-level verify only**
   - Lowest mid-flight cost
   - Highest risk of late discovery after many slices committed
   - Conflicts with slice-independent commit discipline unless verify is
     willing to request multi-slice rework often

Research leaning (not a product decision): **do not drop**. Prefer
**thin + gate-first**, keep issue-level verify, and treat nested
read-only review as optional upgrade when host/model budget allows.

## Pros / Cons of Multi-Window Human Handoff vs Single-Window Subagent Go

### Multi-window (current practiced)

Pros:
- Hard isolation of models and contexts without host features
- Easy for user to watch implementer stream in its own terminal
- Clear psychological boundary: "this window writes code"

Cons:
- High human attention tax (copy prompts, switch, re-sync)
- Handoff prompts drift / get stale
- Easy to skip verify or lose fix-loop state
- Two sessions to babysit

### Single-window parent + go subagent

Pros:
- One human surface per issue
- Parent context remains planner/judge quality
- Automatic handoff if skill encodes spawn contract
- Verify naturally continues after go returns
- Still can use cheap model for implementation tokens

Cons:
- Depends on host subagent quality and model-routing truthfulness
- Long go runs can block or require background+steer discipline
- User visibility into go mid-flight may be worse than a dedicated window
- Human gates / credentials / UI validation still need explicit routing
- Nested review depth and cost need policy

## Recommended Working Shape (research recommendation only)

If Rope optimizes for "one issue → one human window" without abandoning
quality gates:

1. Keep phases: grill → shape → go → issue-level verify → finish
2. Keep artifacts as the only required handoff (issue package + git)
3. Default go execution: **spawn isolated subagent with cheap model**
4. Keep issue-level verify in the parent/strong role (read-only on code)
5. Thin per-slice review rather than deleting it
6. Keep cross-window as escape hatch when host cannot do (3)
7. Record effective model, review mode, and any `review_degraded` always
8. Prefer filesystem truth over go prose summary when verifying

This is **not** "multi-agent free-for-all." It is **phase-separated
single implementer under a planner/judge**, which is the intersection of
Anthropic orchestrator-worker, thrifty tiering, Claude Code subagents,
and Cognition's warning against multi-writer agents.

## Open Questions

- Human product: is the primary pain multi-window switching, cost, or
  verify skip-rate?
- Should go subagent run foreground (simpler) or background (parent free)?
- Must go preserve the ability to pause for human gates inside the
  subagent, or should all gates be forced to shape-time / parent-time?
- Per-slice review policy: keep / thin / drop?
- On `CHANGES_REQUESTED`, resume the same go agent or spawn a fresh fix
  agent with only the fix prompt + package?
- How portable must the skill be across hosts without reliable subagent
  model override?
- Do we rewrite ADR 0001's "window" language into role language
  (Planner Role / Implementer Role), with window as one deployment mode?

## Sources

- Rope ADR/CONTEXT/skills/README (local)
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://www.anthropic.com/engineering/building-effective-agents
- https://code.claude.com/docs/en/sub-agents
- https://cognition.com/blog/dont-build-multi-agents
- https://agentpatterns.ai/agent-design/discrete-phase-separation/
- https://depot.dev/blog/context-isolation-in-coding-agent-loops
- https://ar5iv.labs.arxiv.org/html/2601.14914
- https://github.com/2389-research/thrifty
- https://www.langchain.com/blog/planning-agents
- pi local package docs + `examples/extensions/subagent`
