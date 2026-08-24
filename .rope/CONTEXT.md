# Context

## Language

**Parent Orchestrator**:
The main issue session that owns grill, shape, the slice loop, leaf-worker dispatch, issue-level verify, and finish handoff. It is the only agent allowed to spawn workers for an issue. Judgment-primary and context-protective: it decides, talks to the human, writes durable artifacts, and re-briefs/steers leaves — it does not bulk-load exploratory noise or run long implement/fix loops in its own context, because compaction discards earlier discussion. Course correction is done by rewriting the brief and re-spawning a leaf, not by the parent absorbing the full failure trace and fixing in-place.
_Avoid_: main session (ambiguous), god agent, multi-agent swarm, pure router, parent self-implements everything
_Historical alias_: Planner Window / Window A (optional deployment mode, not the architecture)

**Leaf Worker**:
A subagent (or equivalent host worker) that receives a self-contained brief, does one job, and returns a summary plus artifact paths. Implementer, reviewer, and explore are leaf roles. Leaves also execute course-correction work after the parent rewrites the brief. A leaf worker must not spawn other workers.
_Avoid_: nested subagent, child orchestrator
_Historical alias_: Implementer Window / Window B when the host cannot spawn code-writing workers (degraded top-level session)

**Human Escalation Stop**:
When leaf fix loops fail twice on the same problem, or the parent judges the failure is a design/requirements/contract issue rather than an implementation miss, the parent stops automated repair and presents a short precise problem statement to the user for a decision. It does not keep re-spawning leaves hoping the third try works.
_Avoid_: infinite fix loop, silent retry, bury the design conflict in more patches

**Harness Profile / Role Preset**:
A binding of Rope leaf roles (implementer, reviewer, explore) onto **harness-native** subagent/agent preset templates. Default write target is the host's **user-level** agents directory (machine-local model churn). Plus a thin **user-global** Rope manifest (not project `.rope/`) that maps role → preset name/model and generation metadata. Refresh is **manual only** (no TTL/stale timer). The host preset is the source of spawn configuration; Rope does not keep a second full prompt/tool database as primary.
_Avoid_: hard-coded model list in skills, provider lock-in, Rope-only shadow agent runtime, default project-committed model ids, project-committed private model catalogs, automatic preset refresh

**Issue-Level Verify**:
The thin paperwork gate between go and finish (ADR 0007): the end-of-issue
review really ran (verdict + identity + fix rounds recorded), every E2E item
is terminal with drift hunted, per-slice commits present, tree clean,
architecture documentation outcomes routed. Read-only on everything; never
re-judges code or product truth — that verdict belongs to the end-of-issue
reviewer.
_Avoid_: second code review, replaying green tests, trusting verdict claims
without identity

**End-of-Issue Review**:
The single review gate after all slices (ADR 0007, mechanics refined by
0010): **two parallel read-only leaves with new eyes**, spawned in one
message. The **Standards scanner** (explore-class preset, cheap model)
runs lint/typecheck first, then judgement-call-scans the assembled diff
for repo conventions, TDD anti-patterns, the smell baseline, and inline
global invariants — never runs the product. The **Behavior reviewer**
(`rope-reviewer`, strong model) starts the product first, reads the diff
while it boots, then walks the Behavior Matrix at the **real entrypoint**
the way a user would, runs e2e items, and gives high-risk boundaries the
deepest look; it is the only leaf that may run the product. Aggregation
is mechanical — verdict = worst of axis verdicts, no rerank. Findings are
`blocking | note` with path:line + one-sentence fix; only blocking enters
the one fix brief (≤2 rounds, then Human Escalation Stop); post-fix
re-review is delta-only. Per-slice review no longer exists.
_Avoid_: review (wrong level), per-slice verdict bookkeeping, silent
self-check degradation, fixture-only acceptance, parent re-ranking axes,
scanner running the product

**Standards Scanner**:
The cheap read-only leaf of the end-of-issue review (ADR 0010): runs the
briefed lint/typecheck/build commands first (skips what tooling enforces),
then fast-scans the assembled diff against repo standards, TDD
anti-patterns, the fixed Fowler smell baseline, and the inline global
invariants — every hit a judgement call, never a violation, with
repo-documented standards overriding the baseline. Spawned from the
explore preset with the baseline pasted in the brief; returns `clean` or
≤200 words of `{severity, path:line, issue, fix}` findings. Never starts
the product; ports and processes belong to the Behavior reviewer.
_Avoid_: deep judgment in the scanner, hard-violation framing, moving
architecture-continuity judgment out of the Behavior reviewer

**Graph-Driven Execution**:
The post-0007/0008/0009 execution model. Shape slices tracer-bullet style
(blocking edges + fresh-context fit are the hard rules; component and
prefactor slices legal; vertical path-per-slice is a habit, not a rule). Shape reads the slice graph after
slicing — rivers, fresh-context size fit — and asks one execution question
with numbers. Go's default intent is maximum concurrency in either mode (every ready
slice gets a background leaf; serialization needs a recorded reason;
startup declares planned vs max parallelism). It picks a mode from host
capability: **worktree mode**
(slice-ready scheduling, ADR 0008 — ready = blockers merged, one worktree
per leaf, serial merge queue, repo-declared `worktree-setup:` contract in
`routes.md`, parent owns `map.md` updates) or **shared mode** (waves,
disjoint owned files per wave, leaves maintain the map). No `mode:` or
`review:` frontmatter; legacy packages that carry them are ignored.
Re-cutting that bends the requirement goes back to grill.
_Avoid_: wave barriers in worktree mode, asking serial-or-parallel before
the graph exists, merging in parallel, per-merge test rituals, leaves
writing the shared map concurrently

**Self-Fix Loop**:
A check/verify pattern (from Trellis) where the verifying model finds a problem and fixes it directly, then reruns checks, looping until green. Not used at issue-level verify in Rope, because verify must not edit code (cross-role separation of implement vs accept).
_Avoid_: auto-fix, retry (too generic)

**Escalation**:
The act of the verify model deciding on its own that a finding needs deeper inspection — either by reading more itself or by dispatching a read-only leaf (`explore`). Driven by the model's judgment, not by mechanical trigger rules.
_Avoid_: upgrade, promote (mechanical connotation)

**Upstream Harvest**:
A maintenance workflow for this Rope repository that compares pinned external inspiration sources (initially Matt Pocock skills, optionally Trellis) against the last reviewed revision, produces a human-facing review brief of idea/reference changes, and only after human accept/adapt/ignore decisions lands changes into Rope-native skills or `.rope/` docs. Not a product skill shipped by `rope add`, and not automatic vendor merge.
_Avoid_: sync (ambiguous with file copy), submodule update (mechanism only), one-time migration bridge (retired)

**Acceptance Behavior**:
The user- or caller-visible outcome a ticket or issue must make true. Layered (ADR 0009): **ticket-TDD** — each ticket's units proved by red→green at a shape-confirmed seam; **issue-BDD** — the Behavior Matrix is the issue's behavior spec (no slice pointers), walked at the real entrypoint by the end-of-issue reviewer; e2e.md carries real-environment behaviors only (`covered_by_slice` is deleted — anything that would earn it does not belong in e2e.md).
_Avoid_: TDD as “write many unit tests then code”, acceptance test as synonym for issue-level verify only, re-running every green unit test at verify by default

**Architecture Impact**:
The conditional shape-stage record of whether an issue touches an existing architecture decision, public seam, dependency direction, lifecycle, state, persistence, permission, concurrency, error semantics, adapter, runtime entrypoint, or duplicated responsibility. A `not-applicable` result is still an explicit lightweight check; an uncertain result is treated as requiring resolution.
_Avoid_: full architecture review for every task, inference from filenames or diff alone, architecture impact as an automatic ADR request

**Decision Disposition**:
The per-decision statement of how an issue handles a relevant existing architecture decision: `inherit`, `extend`, `supersede`, `exception`, or `not-applicable`. It is distinct from the source decision's status, which describes whether that source is active, superseded, deprecated, provisional, or unknown.
_Avoid_: one issue-level disposition for several decisions, silently choosing a disposition during implementation, treating exception as an undocumented shortcut

**Constraint Bundle**:
The portable architecture constraint set derived during shaping: decision sources and statuses, scope, invariants, public seams, forbidden shortcuts, acceptance evidence, and unresolved conflicts. The parent keeps the issue-level bundle; each leaf receives the global constraints plus the subset relevant to its slice.
_Avoid_: a bare instruction to “follow the ADR”, leaf-local reinterpretation, or a second canonical architecture document

**Contract Note**:
A shape-time, user-facing projection of the issue's Behavior Contract: 3–5 one-sentence bullets answering “when this issue is done, what can you observe?”, plus failure visibility where relevant. Written into `prd.md` as `## Contract Note`; step 11 of `rope-shape` asks the user to confirm the note instead of reading the full PRD. Confirming the note confirms the Behavior Contract because the note is a direct projection of it — not a separate wish list. Verify still accepts against the Behavior Contract, matrix, and E2E.
_Avoid_: a second contract that can drift from the PRD, asking the user to read the full PRD by default, treating the note as an acceptance artifact

**Minimal Leaf Brief**:
The hard budget for implementer/reviewer briefs: a content allowlist (slice Public behavior one sentence; Behavior Contract 6 fields at their thinnest; Constraint Bundle path + slice Constraint IDs + short global invariant list; test seam + one prior-art path) plus a required operational contract (relevant artifact paths for by-reference — including the investigation map path
reads, TDD red/green commands + red signal, expected return shape, no-nested-spawn
and commit rules). Everything else loads by reference; brief body ≤ 60 lines (paths and command blocks excluded). More enforceable than “be concise” because it can be checked before dispatch.
_Avoid_: full inline PRD paragraphs, inline bundle detail, speculative file-by-file plans, dropping TDD commands or return shape to save tokens

**Investigation Map**:
`<issue>/map.md` — one fact per line, each with a file path and a date.
Seeded at shape from exploration. Shared mode: implementers update the
lines their work falsifies before committing. Worktree mode: leaves report
falsified / needed lines in their summaries; the parent writes them after
each merge — concurrent leaves never share the file. Entries that stop
earning their line are deleted.
_Avoid_: dumping transcripts into the map, uncommented stale facts, inlining
the map into briefs

**Quick Fix Path**:
The lightweight solo entry (`rope-quick`) for small fixes whose investigation is already done (typically a prepared briefing in a worktree): one model clarifies the remaining direction (a few questions), fixes red→green at the nearest seam, commits locally, and syncs `.rope/` docs inline. No issue package, no leaf dispatch, no issue-level verify; the human is the accept gate, assisted by the closing report's risk-focus section. Four stop lines (new architecture decision, fix failed twice, scope sprawl, schema/destructive/production) abort to the full pipeline with `status: stopped` in `quick.md` — the solo-session replacement for "leaf conflict returns to the parent".
_Avoid_: treating quick as a replacement for the full pipeline on any issue, silent absorption of newly discovered architecture decisions, tests-green-only claims without red evidence, entry-gating what counts as quick

**Plan Artifact Reader Layering**:
The rule that plan artifacts name their reader: humans read the grill recap (3–6 bullets) and the Contract Note (3–5 bullets); machines read the Behavior Contract, Behavior Matrix, Constraint Bundle, and tasks records by reference. Unresolved questions are resolved at the grill gate before shape; a conflict discovered by a leaf during go is re-briefed back to the parent for disposition, never silently absorbed. This replaces the older “concise plan + list unresolved questions at the end” rule.
_Avoid_: one artifact trying to serve both readers with one format, unresolved questions shipped to execution, silent absorption of leaf conflicts
