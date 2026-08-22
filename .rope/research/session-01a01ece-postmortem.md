# Session 01a01ece Post-mortem — green pipeline, broken product

## Question

Session `01a01ece-3a5f-7b43-b846-60560b71abc7` (agent-workbench, issue
`webui-staff-desk`) ran the full rope pipeline — grill → shape → go (9 slices,
per-slice review, TDD) → E1 smoke → verify PASS — over ~11.5 hours of agent
time, 55 leaf dispatches, 40+ commits. Minutes after the PASS report, the user
could not see the staff desk entrance or reach `/desk` routes as admin. What
did the pipeline miss, and which external agent-harness patterns close the gap?

## Session Evidence

Source: session jsonl `2026-08-20T10-23-21-711Z_01a01eb2…` (internal id
`01a01ece…`), `/tmp/pi-subagents-1000/…/tasks/` (55 leaf outputs, 18 MB),
issue package `.rope/issues/webui-staff-desk/` in agent-workbench.

### timeline

Fact: grill 01:06–02:00 → S1–S9 implement/review loops 02:00–09:00 → E1
smoke 09:00–09:14 → verify 09:14–09:27 → PASS report 09:27 → user reports
"admin 看不到入口、无法访问路由" 09:46 → compaction 11:38 → fix round
11:38–12:31 (~53 min) found three root causes, fixed all, verified by real
browser walk-through.

### root-causes-all-environment-parity

Fact: the fix round's own verdict (session record [560], e2e.md Result):
1. 真实 registry 从未有法务/财务 profile —— **S1–S9 全部用测试 fixture**，
   no slice owned landing real config;
2. 主题 CSS 只定义了 neutral accent —— `--desk-accent-legal-purple` /
   `finance-gold` 在双主题中都不存在（token 映射在，值不在）;
3. admin 建岗位会话 403 —— MR !43 grant 语义只给 admin 隐含研发面角色，
   S6 让 admin 看到全部页签但没人验证"看到之后点得动"。
All three are *environment/data parity* gaps, not logic bugs. Every unit,
slice, and E1 assertion was green because every test ran against fixtures
that supplied exactly what the code expected.

### e1-was-fixture-scoped-by-design

Fact: e2e.md E1 says "启动本地 WebUI 栈（fixture/本地运行时，含测试岗位
profile 授予张三）" — the smoke booted its own server with a fixture
registry. It honestly validated the *code path* and passed. The only
product-truth gate left was E2, classified `Executor: user / Gate Decision:
user-run`, i.e. deferred to the human — who then found everything broken.

### fix-round-is-the-proof

Fact: the 53-minute fix round did what 7.5 h of fixture testing could not,
using exactly one new ingredient: it booted the **real** stack (real
registry, built dist, real auth), logged in as admin via browser automation,
clicked the tabs, screenshotted, and sent a message. Root causes surfaced in
minutes. The agent demonstrably *can* perform product-truth verification;
the pipeline just never asked it to.

### infra-overhead

Fact: harness-level failures burned ~1.5 h of the session:
- S1 dispatch ×6 failed on `maxTokens 384000 > 上游 131072` (models-store
  entry; fix required editing config + full pi restart) — ~40 min;
- S7 retry storm: 7 dispatches across upstream 503 / content-filter
  misfires, degradation to general-purpose, finally parent self-implemented
  (recorded as 降级执行) — ~36 min;
- one leaf (720 s) truncated mid-fix, leaving uncommitted red tests the
  parent recovered manually.

Verified by: session records [163–198], [352–418], [209–215].
Stability: high (own session).

## Verified Facts (external patterns)

### anthropic-evaluator-clicks-through-running-app

Fact: Anthropic's long-running harness write-up: "Applications from earlier
harnesses often looked impressive but still had real bugs when you actually
tried to use them. To catch these, the evaluator used the Playwright MCP to
click through the running application the way a user would, testing UI
features, API endpoints, and database states." Also: "out of the box, Claude
is a poor QA agent… it identify[s] legitimate issues, then talk[s] itself
into deciding they weren't a big deal and approve the work anyway" — the fix
is a *separate, tuned-skeptical* evaluator with hard per-criterion
thresholds.
Source: https://www.anthropic.com/engineering/harness-design-long-running-apps
Verified by: fetch 2026-08-22
Stability: high
Implication: rope's reviewer/verify leaves need (a) a real-runtime probe
step, (b) calibration language against leniency, (c) hard fail on any
must-fix criterion.

### anthropic-sprint-contract

Fact: generator and evaluator negotiate what "done" looks like **before code
is written** ("sprint contract"), bridging spec and testable implementation;
contracts were granular (27 criteria for one sprint) and evaluator findings
cited exact file:line causes.
Source: same article.
Implication: rope's Contract Note already does this at issue level; the gap
is that contracts are negotiated without stating **against which
environment** "done" will be observed.

### pulumi-self-verifying-browser-loop

Fact: "The AI verifies its own work. It builds a component, launches a
browser, tests the interaction, confirms behavior matches expectations…
Without browser automation, that someone is you." Compact snapshot+ref
tooling (agent-browser) cut E2E context cost ~82.5% vs full accessibility
trees, making in-loop browser verification affordable.
Source: https://www.pulumi.com/blog/self-verifying-ai-agents-vercels-agent-browser-in-the-ralph-wiggum-loop
Verified by: fetch 2026-08-22
Stability: high
Implication: an `agent`-executable browser E2E class is practical in pi
today (agent_browser tool); context cost is a solved concern with
snapshot-ref discipline.

### osmani-harness-ratchet

Fact: harness engineering core habit — "every time the agent slips, engineer
it so it never makes that mistake again"; every rule must trace to a real
failure; hooks enforce deterministically with "success is silent, failures
are verbose"; preflight-style gates (typecheck/lint/test on edit) close the
self-verification loop.
Source: https://addyosmani.com/blog/agent-harness-engineering
Verified by: fetch 2026-08-22
Stability: high
Implication: this post-mortem's root causes should each become a named rope
rule, not a one-off story. Config preflight before dispatch is the same
pattern as a typecheck hook.

### spec-tool-landscape

Fact: spec-kit (lightweight gated specify→plan→tasks→implement + constitution
checks), BMAD (agentic planning + dev phases), OpenSpec (minimal markdown),
Kiro (spec-driven IDE with hooks), AgentOS (multi-agent MCP orchestration
server). None of the surveyed tools encode an explicit "verify against the
real/deployed environment, not only fixtures" gate; the evaluator-clicks-
through-app pattern (Anthropic) is the strongest public practice available
to copy.
Source: https://medium.com/@tim_wang/spec-kit-bmad-and-agent-os-e8536f6bf8a4 (+ search)
Verified by: fetch 2026-08-22
Stability: medium
Implication: rope can lead here rather than port; no upstream template
exists for environment-parity gating.

## Diagnosis → rope gaps

| # | Gap | Where it lives | Session proof |
| --- | --- | --- | --- |
| 1 | No **real-environment** E2E class; `user` became the only product-truth gate, and its scope mixed mechanical checks (入口可见/路由可达) with genuine taste | `rope-shape/references/gates-and-vocab.md` E2E Executor Rules | E1 fixture-only by design; E2 `user-run`; user found breakage |
| 2 | Shape never inventories the **real runtime environment** (registry/config/dist/migrations/seeds) nor assigns ownership for landing real data | `rope-shape` workflow; issue-package slice kinds | root causes 1 & 2 (missing real profiles, missing CSS values) |
| 3 | Verify audits **paperwork** (verdict existence, dates, evidence dirs), never product truth | `rope-verify/SKILL.md` step 3 checklist | verify Round 1 findings were 100% documentation-level |
| 4 | No **dispatch preflight / failure budget**; retry storms and config errors burn wall-clock silently | `rope-go/references/execution-rules.md` | ~40 min maxTokens, ~36 min S7 storm |
| 5 | Reviewer accepts fixture-only evidence when a real environment exists | reviewer brief / `tdd.md` anti-patterns | 9/9 slice PASS against fixtures |

## Proposed changes (ranked)

### P0-1 · real-env E2E class + user-run decomposition

`gates-and-vocab.md`: extend E2E Executor Rules —
- New rule: an issue touching user-visible surfaces served from real
  config/artifacts (registry entries, built frontend dist, seeds,
  migrations) must carry ≥1 E2E item executed against the **as-deployed**
  environment (real config + built artifacts + real auth), executor `agent`
  (browser walk-through allowed), before verify can pass.
- New rule: `user` items must be decomposed first — anything mechanically
  checkable (visibility, reachability, status codes, data presence) moves to
  an `agent` item; only taste/2FA/private-env stays `user`.

### P0-2 · verify product-truth check

`rope-verify/SKILL.md` step 3 + `references/verify-rules.md`: add a
minimum check — "for issues with user-visible surfaces: one fresh
real-environment probe (agent-run E2E or verify-inspector boot-and-click),
or verify cannot PASS on paperwork alone". Add calibration line against
evaluator leniency (Anthropic finding): reviewer/verifier must cite
environment evidence, not test counts.

### P1-1 · shape-stage environment inventory

`rope-shape` workflow + `issue-package.md`: one grill/shape question —
"what real data/config must exist for this feature to be observable, and
who lands it?" If missing ⇒ either a `data-config` slice (real registry
files, CSS values, seeds) or an explicit real-env E2E item. This converts
root causes 1–2 from "discovered at E2 by the user" to "owned at shape".

### P1-2 · dispatch preflight + failure budget

`execution-rules.md`:
- Before the first leaf dispatch per role preset: cheap probe spawn or
  config sanity (model resolves, maxTokens within provider limit).
- Dispatch failure budget: after 3 consecutive failed dispatches of the
  same brief, stop retrying and surface to the user (Human Escalation Stop
  extended to the dispatch layer, not just fix loops).
- After any aborted leaf: mandatory git-status + test-state probe before
  re-dispatch (codifies what the parent improvised at [211–215]).

### P2 · reviewer anti-pattern + ratchet maintenance

`tdd.md` anti-pattern table: "acceptance proven only against fixtures while
a real environment exists" → finding. Keep this research doc as the trace
for each new rule (Osmani ratchet: every rule traces to a real failure).

## Round 2 — wall-clock accounting + upstream/community findings

### wall-clock-accounting

Fact: go phase (S1 spawn 02:00 → verify PASS 09:27) = 7.45 h wall. Leaf busy
sum = 391 min (6.5 h, 87% of wall) — the parent orchestrator was NOT the
bottleneck; **serial foreground leaves were**. Breakdown: implement leaves
~287 min, review leaves ~65 min, failed dispatches ~35 min. Fix rounds
(修正轮/收尾) alone ≈ 94 min — a third of implementation time re-doing what
per-slice review found. Only 2/55 spawns used run_in_background. Elephant
leaves: S7 impl 31.6m/1.3M tok, S7 fix 28.9m/2.4M, S8 27.1m/1.8M, S9
35.7m/3.0M — each far beyond "single fresh context window" sizing.
Verified by: session `details.durationMs` per dispatch.
Stability: high.

### no-drift-execution-matched-plan

Fact: execution matched the shape 9/9 slices; commits clean; no scope
wander. The two real defects were **plan blind spots**, not drift:
(a) PRD Non-goals explicitly descoped "法务/财务 Agent Role Profile 的内容
装配（⑤⑨ 另线）" — so no slice owned making real profiles exist, and E1
legitimately used fixtures because fixtures were the only world the plan
made real; (b) S6 decision "admin 看全部岗位页签" collided with MR !43
grant semantics "admin 只隐含研发面角色" → 403 on session creation. Two
work streams' decisions never reconciled.
Verified by: prd.md Non-goals; e2e.md E2 fix-round record.
Stability: high.

### matt-implement-spec-concurrent

Fact: upstream mattpocock/skills added `implement-spec` (skills/in-progress/,
after baseline 9603c1c — commit 84b5ee5, last touched 2026-08-21). Design:
tickets as task graph with frontier; **implementer subagents run in the
background for maximum concurrency**; each in own worktree; exploration
notes saved to a directory outside the repo shared by all future
subagents; **one /code-review at the end on the whole PR branch**, all
findings fixed in a single implementer subagent; sparse communication via
context pointers, no duplication.
Source: ~/.cache/rope-upstream/mattpocock-skills@origin/main
Verified by: git show 2026-08-22
Stability: high (in-progress skill, may evolve)
Implication: rope-go's serial foreground slice loop + per-slice review is
the wall-clock multiplier; Matt's default is the opposite on all three
axes (concurrency, review timing, communication volume). Harvest candidate
— correspondence row missing.

### matt-agent-brief-durability

Fact: triage AGENT-BRIEF.md principles: durability over precision (no file
paths/line numbers — they go stale; describe types/signatures/behavioral
contracts), behavioral not procedural, complete acceptance criteria,
explicit scope boundaries. to-tickets sizing rule: "each slice is sized to
fit in a single fresh context window".
Source: same clone.
Implication: rope minimal briefs rely on file paths — acceptable because
rope dispatches immediately, but slice sizing should adopt the
context-window rule (see elephant leaves above).

### anthropic-discourages-default-subagents

Fact: Claude Code 2.1.219+ ships a hardcoded prompt for Opus 5: "Do not call
the AgentTool unless the user requested it… Do not use workflows or
deep-research unless the user requested it". Community analysis: routine
delegation made output worse, incl. a self-audit running non-blind because
the auditor agent couldn't be spawned.
Source: r/ClaudeCode 1v6y5q2 (156 comments); anthropics/claude-code#80988
Verified by: rdt read 2026-08-22
Stability: medium (community-reported, binary-analyzed)
Implication: delegation must be justified per task (context protection,
blast radius, parallelism), not habitual — the vendor itself reached this
conclusion for its flagship model.

### workflows-code-not-llm-for-control-flow

Fact: Claude Code /workflows (shipped 2.1.147, since pulled) replaced the
LLM orchestrator with a JS phase graph: "use code for what code is good at
(control flow), and models for what models are good at (judgment inside
each step)"; sub-agent outputs flow phase-to-phase without re-entering the
orchestrator context ("token tax"). Community alternatives: agent teams,
agentrelay.
Source: r/ClaudeCode 1tkjy4u (273 comments)
Verified by: rdt read 2026-08-22
Stability: medium (feature pulled; principle widely echoed)
Implication: rope-go's slice loop is half-deterministic already (Blocked-by
dispatch graph); moving spawn/review/fix sequencing into code (pi SDK
runner) removes parent-in-loop latency entirely — bigger architectural
direction, not a skill tweak.

### actual-slice-graph-admits-two-streams

Fact: tasks.md Blocked-by graph was NOT a chain. Frontier at t0: S1, S2,
S3, S7. Edges: S4/S5 ← S1,S2,S3; S6 ← S2,S3; S8 ← S7; S9 ← S7,S8.
Critical path = the attachment stream S7(31.6m)→S8(27.1m)→S9(35.7m) ≈
94m; the entire desk-frontend family S1–S6 (~90m) had zero edge into or
out of the attachment stream. Serial go ran them strictly one-at-a-time.
Verified by: tasks.md; leaf durations from session details.

### mode-question-ordering-flaw

Fact: rope-shape step 1 asks the dynamic-mode question BEFORE slicing
(step 9), with no wave analysis — and guardrails forbid auto-detection by
design. So the recommendation given was rule-consistent (serial default,
dynamic opt-in) but information-free: the user was asked to choose
parallelism before the graph that would justify it existed. Additionally
this shape's cut violates dynamic's disjoint-owned-files discipline (S1
owns types.ts/webuiApi.ts which S3 display types also touch), so going
dynamic would have required re-cutting with a contract slice — the serial
recommendation was consistent with the current cut, but the cut itself
was never re-examined for parallelism.

### matt-code-review-two-axis

Fact: implement-spec step 7's "/code-review" = Matt's engineering skill
`code-review`: two axes (Standards = repo-documented standards + fixed
Fowler smell baseline; Spec = faithfulness to originating issue/spec),
both run as parallel sub-agents over `git diff <fixed>...HEAD`, aggregated
side by side without reranking, once at the end. Notably the local skill
`code-review` in ~/.agents/skills is this exact skill (already harvested).
Weaknesses vs rope-reviewer: no architecture-continuity/constraint audit,
no verdict bookkeeping/fix-round budget/escalation stop; generic smell
baseline vs rope's ADR-grounded checks. Strength: the Spec axis runs
against the ASSEMBLED diff — the only review that can catch cross-slice
semantic conflicts (this session's admin-403 class) and spec-observable
gaps (missing real profiles), which 16 per-slice reviews structurally
could not see.

### matt-timeline-first-party-numbers

Fact: Matt Pocock's own tweets on /implement-spec (2026-08-21):
intro — "Takes in a spec and tickets… Implements all the tickets in
subagents with maximum concurrency… Reviews the final code against the
spec… Should be able to smash out huge chunks of work autonomously with
minimal supervision" (2,252 likes); follow-up — "This just ran for 1hr 20,
built 6 tickets, 120K context in the main orchestrator (with some
inefficiencies I can cull). Overall, I like it." Comparable scale to our
session: 6 tickets / 1h20 max-concurrency vs 9 slices / 7.5h serial.
Also: 2026-08-18 "bitter lesson-ing myself… Instead of hand-rolling a
deterministic loop… I'll just get an agent to delegate to subagents.
Probably more expensive, less reliable, but may have emergent benefits"
(he consciously chose LLM delegation over deterministic loop, tradeoff
acknowledged); 2026-08-17 ratchet tweet ("every time you intervene and
correct your agent, think about how to eliminate it entirely… 1. better
architecture/data structures…"); 2026-08-18 "grep hygiene" (agent greps
should return code, not sludge of specs/plans/research docs — applies to
`.rope/` doc layering); 2026-08-14 /code-review ratchet via
CODING_STANDARDS.md.
Source: twitter user-posts mattpocockuk (auth: Chrome Profile 1 cookie,
8118 proxy); search endpoint 404 — timeline mining only.
Verified by: fetch 2026-08-22
Stability: high (first-party)

## Round 2 — speed/accuracy conclusions

1. Speed is a **pipeline-shape choice**, not a subagent tax: this issue ran
   `mode: serial` + `review: per-slice` when its slice graph (disjoint
   frontend/backend clusters) admitted fan-out, and rope already ships both
   `dynamic` and `batch` modes. Estimated same-gates wall time with
   dynamic+batch+background: ~2.5–3 h.
2. The "single-thread 1 h" comparison is real for greenfield features —
   but it reproduces fixture-green-broken-product faster. The fix is not
   fewer gates; it is (a) parallel gates, (b) gates pointed at the real
   environment (Round 1 P0).
3. Accuracy: stop framing as "agent drifted from my plan". Execution
   fidelity was 100%. Add the two missing shape questions (environment
   inventory; cross-module decision conflict scan) and the failure class
   disappears at the same cost as one grill round.

## Non-changes (validated by this session)

- Parent Orchestrator context protection held: after 11:38 compaction the
  fix round operated entirely from issue-package state — the
  brief/artifact design survived a 19-record context loss without confusion.
- Soft degradation (S7 parent self-implement with evidence + reviewer
  after) worked, but it violates "parent does not implement" — keep it as
  bounded escape hatch with its existing recording rules rather than
  formalize it further.
