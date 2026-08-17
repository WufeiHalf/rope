# Review Cost & Token Efficiency in Agent Workflow Systems

## Question

How do other agent-workflow systems (Anthropic/Claude Code, Cognition/Devin,
Trellis, OpenAI Codex, GitHub Copilot) handle code-review cost and frequency in multi-agent coding workflows? Specifically: reviewer per work unit vs batched/exception-based review, duplicate verification passes (review vs verify overlap), and token-saving practices for orchestrator/parent contexts. Input for Rope's decision on per-slice review frequency, go overall-review vs rope-verify overlap, and reviewer model routing.

## Verified Facts

### anthropic-token-economics

Fact: Anthropic reports agents use ~4× more tokens than chat, multi-agent systems ~15×; token usage alone explains 80% of performance variance on BrowseComp. Multi-agent fits research (parallel search) better than coding, where "most coding tasks involve fewer truly parallelizable tasks than research"; economic viability requires task value to justify the spend.
Source: https://www.anthropic.com/engineering/multi-agent-research-system
Verified by: fetch_content + passage retrieval (2026-07)
Stability: high
Implication: Every added agent pass (e.g. reviewer leaf per slice) multiplies token burn; upstream treats per-agent overhead as a cost to justify, not a default.

### anthropic-end-state-evaluation

Fact: Anthropic appendix on stateful agents: "focusing on end-state evaluation rather than turn-by-turn analysis … evaluate whether it achieved the correct final state. For complex workflows, break evaluation into discrete checkpoints where specific state changes should have occurred, rather than attempting to validate every intermediate step."
Source: same post, appendix ("End-state evaluation of agents that mutate state over many turns")
Verified by: fetch_content exact-quote extraction
Stability: high
Implication: Argues against LLM-validating every intermediate slice; checkpoints (deterministic gates) plus one end-state judgment.

### anthropic-filesystem-artifacts

Fact: Anthropic appendix: subagents should "store their work in external systems, then pass lightweight references back to the coordinator … reduces token overhead from copying large outputs through conversation history"; also summarize completed phases into external memory; subagents "condense the most important tokens" for the lead agent.
Source: same post, appendix ("Subagent output to a filesystem …", "Long-horizon conversation management"); pinned in `.rope/research/single-window-go-orchestration.md` (`anthropic-endstate-and-artifacts`)
Verified by: fetch_content exact quotes + local pinned research
Stability: high
Implication: Parent reads artifacts/diffs + summaries by reference, never inline leaf traces. Rope's issue package already fits this.

### claude-code-adversarial-review-step

Fact: Claude Code best practices prescribe a single adversarial review at the END of unattended work, not per unit: "The longer Claude works unattended, the more an independent check matters before you count the work as done. A reviewer running in a fresh subagent context sees only the diff and the criteria you give it." Bundled `/code-review` "reviews the current diff for bugs in a fresh subagent". Also: Writer/Reviewer two-session pattern ("A fresh context improves code review since Claude won't be biased toward code it just wrote") and evidence-over-assertion ("Have Claude show evidence rather than asserting success: the test output …").
Source: https://code.claude.com/docs/en/best-practices
Verified by: fetch_content + passage retrieval (2026-07)
Stability: medium (living docs page)
Implication: Review frequency scales with unattended duration/risk, not unit count; one fresh-context diff review + evidence display is the first-party pattern.

### claude-code-subagent-cost-control

Fact: Official guidance: "Since context is your fundamental constraint, subagents are one of the most powerful tools available … Subagents run in separate context windows and report back summaries"; subagents support cheaper `model` overrides; auto mode routes per-command risk review to "a separate classifier model" that "blocks only what looks risky" (cheap-model review-by-exception). Model overrides can be silently inoperative (pinned GitHub issues).
Source: https://code.claude.com/docs/en/best-practices; https://code.claude.com/docs/en/sub-agents (pinned in `.rope/research/single-window-go-orchestration.md` `claude-code-subagent-capabilities`, `claude-code-model-override-fragility`)
Verified by: fetch_content + local pinned research
Stability: medium
Implication: Cheap model for mechanical scanning, strong model for judgment; record the *effective* model per leaf.

### cognition-context-fragmentation

Fact: Cognition's "Don't Build Multi-Agents": splitting work across agents fails via context fragmentation — Principle 1: "Share context, and share full agent traces"; Principle 2: actions carry implicit decisions, so conflicting decision-makers diverge. Claude Code subagents (June 2025) only answer questions, never write code in parallel; the win is "all the subagent's investigative work does not need to remain in the history of the main agent".
Source: https://cognition.com/blog/dont-build-multi-agents
Verified by: fetch_content + passage retrieval (2026-07)
Stability: medium (opinionated but widely cited)
Implication: Read-only review agents are the safe extra agent (intelligence, not actions); each agent that must reconstruct context costs tokens and risks miscommunication.

### cognition-clean-context-reviewer

Fact: Cognition's "Multi-Agents: What's Actually Working": Devin Review "catches an average of 2 bugs per PR, of which roughly 58% are severe"; the loop works BEST when "the coding and review agents do not share any context beforehand" — the reviewer "gets to skip this extraneous context, only look at the diff, and re-discover any context it needs … With a shorter context, the improved intelligence naturally leads to increased detection of nuanced issues." A communication bridge (coder filters findings via its fuller context) prevents looping. Principle: "multi-agent systems work best today when writes stay single-threaded and the additional agents contribute intelligence rather than actions."
Source: https://cognition.com/blog/multi-agents-working
Verified by: fetch_content + passage retrieval (2026-07)
Stability: medium
Implication: Review at the delivery unit (PR), loop-to-clean; minimal reviewer context (diff + criteria only) is BOTH cheapest AND highest-yield — the reviewer does not need the implementation transcript.

### trellis-single-check-self-fix

Fact: Trellis runs ONE check phase per task after implementation (`trellis-check`): reads `prd.md`, optional `design.md`/`implement.md`, narrow `check.jsonl` context manifests, changed files; runs local test/lint/type-check; "is allowed to fix findings directly, then rerun checks" (self-fix loop). After checks pass, the main session performs final verification + durable-spec update. Lightweight tasks can be PRD-only; `check.jsonl` stays narrow (spec/research by reference, never modified files).
Source: https://docs.trytrellis.app/start/how-it-works (steps 5–10); repo facts pinned in `.rope/research/upstream-inspiration-sources.md` (AGPL-3.0, idea-extraction only)
Verified by: fetch_content (2026-07) + local pinned research
Stability: medium
Implication: No per-sub-unit reviewer; deterministic commands + one read-fix loop per task, then an evidence/final-state pass. Review context loads by reference from manifests.

### github-tiered-risk-based-review

Fact: GitHub's first-party guidance on agent PRs: automated pass first, owning the mechanical tier — "Let Copilot run first … it handles the low-level scan. That frees you up for the judgment work"; review depth set by classification ("Scan and classify … Narrow task … or complex … That classification sets your review depth"); oversized unscoped PRs correlate with agent abandonment, so demand a breakdown rather than reviewing deeply. Copilot code review: 60M+ reviews, 10× growth in under a year.
Source: https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/
Verified by: fetch_content + passage retrieval (2026-07)
Stability: high
Implication: Explicit tiering (mechanical/automated vs judgment) and risk-classified review depth — not uniform review frequency.

### openai-codex-review-rules

Fact: Codex Code Review runs per PR plus on-demand (`@codex review`); it is "an additional reviewer; tests, branch protections, and required approvals continue to provide hard enforcement" (deterministic gates stay authoritative). Review guidance lives in `AGENTS.md` by reference ("concise, scoped review guidance … apply the rules that matter to a change and cite them in a finding"); rule-guided review recovered 98% of required custom findings vs 58.3% baseline.
Source: https://developers.openai.com/blog/custom-code-review-rules-for-codex
Verified by: fetch_content answer-mode exact quotes (2026-07)
Stability: high
Implication: LLM review supplements rather than duplicates deterministic verification; quality gains come from durable rule docs read by reference, not bigger reviewer context.

### local-thrifty-and-pinned-sources

Fact: `thrifty` (pinned in `.rope/research/single-window-go-orchestration.md` `thrifty-tiered-delegation`): strong model writes contract; cheap model executes and self-fixes against an independently re-run gate; strong model spends tokens "only on failures / assertional criteria"; ~64% cheaper at equal gate quality (small n, caveats documented). Same file pins Aider Architect/Editor (strong reasoner + cheaper editor) and Depot `/orc` (structured reviewer verdicts after build). The pinned mattpocock/skills upstream (`source.md`, `correspondence.md`) contains nothing on review frequency, batching, or token budgets; `tdd` maps to rope-go slice discipline, `handoff` (watch) to the absorbed leaf-brief pattern. Trellis is historical inspiration only (decision U1 in `upstream-inspiration-sources.md`).
Source: `.rope/research/single-window-go-orchestration.md` (`thrifty-tiered-delegation`, `industry-supplement-clean-review`); `.rope/upstream/mattpocock-skills/source.md`; `.rope/upstream/mattpocock-skills/correspondence.md`; `.rope/research/upstream-inspiration-sources.md`; https://github.com/2389-research/thrifty
Verified by: local pinned research (previously clone/read-verified) + direct read (2026-07)
Stability: medium
Implication: Gate-first, LLM-judgment-on-failure is the closest measured analog to Rope's desired cost split; no review-frequency pressure comes from the mattpocock upstream.

## Answers to the Three Key Questions

1. **Reviewer per unit vs batch/exception:** No surveyed first-party system runs a fresh LLM reviewer per internal work unit. Review attaches to the delivery unit or end of an unattended run: Devin Review loops per PR (`cognition-clean-context-reviewer`); Codex per PR / on demand (`openai-codex-review-rules`); Copilot per PR as mechanical first tier (`github-tiered-risk-based-review`); Claude Code does one adversarial fresh-context review before counting work done (`claude-code-adversarial-review-step`); Trellis one check+self-fix per task (`trellis-single-check-self-fix`); thrifty none while gates are green (`local-thrifty-and-pinned-sources`). Risk/diff classification sets review depth — review-by-exception.

2. **Duplicate verification passes:** Upstream keeps deterministic gates authoritative (Codex: "tests … continue to provide hard enforcement"; thrifty: independently re-run gate) and reserves LLM passes for end-state judgment (Anthropic end-state evaluation; Claude Code evidence-not-assertion). Nobody runs two same-scope LLM read passes over one assembled diff; Trellis's check (fix loop) and finish (final verification) are sequenced with different jobs — fix vs accept — not overlapping reviews. A go overall-review plus a same-shape rope-verify is exactly the pattern upstream systems avoid.

3. **Orchestrator/parent token practices:** (a) filesystem artifacts + lightweight references, never copying large outputs through the parent (`anthropic-filesystem-artifacts`); (b) subagents return summaries; parent reads diffs, not traces (`claude-code-subagent-cost-control`); (c) narrow by-reference context manifests for review (`trellis-single-check-self-fix`, `openai-codex-review-rules`); (d) minimal clean reviewer context is cheaper AND better, not a compromise (`cognition-clean-context-reviewer`); (e) model routing: cheap for mechanical scan/execute, strong only for judgment/failure (`claude-code-subagent-cost-control`, `local-thrifty-and-pinned-sources`).

## Implications for Rope

(a) **Per-slice review frequency.** Per-slice LLM review is more frequent than any surveyed upstream default. Evidence supports Rope's existing "thin" option (`.rope/research/single-window-go-orchestration.md`, "Per-Slice Review: Keep, Thin, or Drop?"): deterministic gates (tests/matrix/E2E) are the default per-slice check; a reviewer leaf runs only on `Review: required` (risk flagged at shape time, mirroring GitHub's classify-then-set-depth) or when a gate fails (thrifty's adaptive verification). Preserves early detection at high-risk boundaries while cutting baseline review tokens.

(b) **go overall-review vs rope-verify overlap.** Two strong-model, read-only, whole-diff LLM passes back-to-back duplicate the one thing upstream keeps singular. Evidence-consistent options: fold go's overall-review into verify as the single end-state gate (Anthropic end-state evaluation; Claude Code single adversarial step), or split scopes — overall-review becomes evidence-assembly/mechanical (cheap model, matrix/E2E evidence collection) while rope-verify owns judgment/accept, mirroring Trellis check-vs-finish and the automated-tier/judgment-tier split. Either way, verify should consume recorded evidence rather than re-review findings.

(c) **Reviewer model/thinking routing.** Route by tier: cheap model (low/no thinking) for mechanical scan and evidence assembly (Claude Code classifier/subagent model override; Copilot first tier); strong model reserved for judgment on gate failure and final accept (thrifty; Devin review-filter bridge). Reviewer briefs must be diff + acceptance criteria + paths by reference — never implementation transcripts (Cognition clean-context is both cheaper and higher-yield). Record effective model/thinking per leaf (pinned model-override fragility issues).

## Sources

Local (pinned):
- `.rope/upstream/mattpocock-skills/source.md`
- `.rope/upstream/mattpocock-skills/correspondence.md`
- `.rope/research/upstream-inspiration-sources.md`
- `.rope/research/single-window-go-orchestration.md`

Web (primary, fetched 2026-07):
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/sub-agents
- https://cognition.com/blog/dont-build-multi-agents
- https://cognition.com/blog/multi-agents-working
- https://docs.trytrellis.app/start/how-it-works
- https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/
- https://developers.openai.com/blog/custom-code-review-rules-for-codex
- https://github.com/2389-research/thrifty
