# 0010 Parallel Two-Leaf End-of-Issue Review

**Status:** active — refines [0007](0007-graph-driven-go-single-review.md)'s
review mechanics (one gate, two parallel read-only leaves); the gate itself,
new eyes, and the real-entrypoint probe are unchanged. Works on top of
[0009](0009-ticket-tdd-issue-bdd-layering.md)'s Matrix-as-spec.

Date: 2026-08-24

## Decision

1. The end-of-issue gate spawns **two parallel read-only leaves in one
   message**: a **Standards scanner** (explore-class preset, cheap model,
   checklist scan) and the **Behavior reviewer** (`rope-reviewer`, strong
   model: Matrix walk at the real entrypoint + e2e + high-risk deepest
   look). First response = max(leaf times), not their sum.
2. **Only the Behavior reviewer may start the product** — ports, processes,
   and the browser are exclusively its resource; the scanner never runs the
   product (this is why the split stops at two).
3. **Aggregation is mechanical**: verdict = worst of the axis verdicts;
   blocking findings from either leaf route to one fix brief. No rerank,
   no merge, no re-judgment by the parent — the two axes stay separate
   (upstream `code-review` pattern).
4. Severity is binary `blocking | note`. Notes are recorded, never enter a
   fix brief. Every finding carries `path:line` + a one-sentence fix —
   the fix brief is a transcription, not an exploration.
5. Post-fix re-review is **delta-only**: scanner on the fix-commit diff;
   reviewer re-probes only affected paths. Full re-review never repeats.
6. Diff hygiene and probe overlap: the diff command both leaves receive
   excludes lockfiles / generated / snapshot paths; the reviewer starts the
   product **first** and reads the diff while it boots.

## Context

End-of-issue review measured 3–10 min / 50–150 K tokens on a medium issue:
one leaf serialized token-dense work (Standards deep-read ≈ 30–40 % of wall
time) with I/O-dense work (service boot + browser probe ≈ 40–50 %, model
idle while waiting). Upstream `code-review` already runs Standards and Spec
as parallel ≤400-word sub-agents; 80 % of its Standards axis is a fixed
smell baseline scanned as judgement calls, with documented repo standards
overriding and tooling-enforced categories skipped. Rope's scanner reuses
the existing `rope-explore` preset (cheap model, thinking off, read-only +
bash for lint/typecheck) — no new agent file; the smell baseline rides in
the brief, pasted verbatim.

## Why this shape

- The three iron rules of 0007 hold: one gate (one aggregated verdict
  line), new eyes (both leaves never watched the build), real-entrypoint
  probe (unmoved, now the sole critical path).
- Standards is judgement-call checklist work — the class cheap models do
  well; Behavior + probe are fused by 0009 (Matrix walked at the real
  entrypoint) and stay in one strong leaf.
- Expected economics: first response 3–10 min → 2–4.5 min; strong-model
  tokens −50–60 % (bundle deep-read demoted to on-suspicion; map dropped
  from the reviewer brief); raw tokens +20–40 % (diff read twice) absorbed
  by the explore-class scanner.

## Consequences

- Reviewer brief loses `map.md` (orientation asset for builders; the
  reviewer's terrain is the diff and the running product) and the upfront
  bundle read (inline global invariants instead; bundle path read only on
  suspected conflict).
- The scanner's verdict is advisory-boolean (clean / findings); verdict
  semantics stay owned by the behavior reviewer + the mechanical
  aggregation rule.
- Fix rounds get cheaper: blocking-only briefs with prescribed fixes,
  delta re-review (30–90 s vs a hidden full re-review).
- Known cost, accepted: two briefs instead of one; the parent must resist
  re-ranking (the aggregation rule is written down precisely to prevent a
  second review from emerging).

## Alternatives considered

- N-way static split (per-file scanner shards, separate axes per leaf):
  rejected — the probe is the sole critical path, static leaves never move
  it; port/process exclusivity caps runtime leaves at one.
- Probe as its own leaf: rejected — Behavior acceptance is defined as
  walking the Matrix at the real entrypoint (0009); splitting serializes
  them again.
- Keep the single leaf, protocol tweaks only: rejected — leaves the
  token-dense/I/O-dense serialization, the largest single lever, untouched.
