# Dynamic go session audit

Date: 2026-09-11
Status: diagnosed — skill/runtime files unchanged; target workflow not modified or stopped

## Conclusion

The user intended one autonomous go lifecycle, not repeated workflow-wrapped leaf dispatch. The target initially reverted to parent-mediated dispatch/merge because its author treated the workflow sandbox's lack of shell access as a reason to put merges outside the script. The latest documentation retained end-to-end ownership but compressed away the older explicit recipe: a dedicated mechanical merge agent, not the parent. This is a concrete affordance loss, not a decision to change the workflow model.

After the user corrected it, the replacement script included the full lifecycle in its source, but its executor was incorrect: it could not parse either implementer's actual branch return, then proceeded to integration/E2E despite integrating neither slice. The observed result is therefore more serious than ceremonial workflow labels: it tests an incomplete checkout. This is reproducible offline from the saved script and actual leaf returns.

No evidence supports a stale installation or an actual host failure forcing the original split. Prompt wording is a contributing reliability risk; a single session cannot prove wording alone caused the model's decision. The author had read instructions assigning all these responsibilities to the script.

## Sources / evidence handles

- **T** — `/home/wufei/.pi/agent/sessions/--home-wufei-herdr-agent-workbench-fix-legal-retrieval-pagination--/2026-09-11T05-05-16-040Z_01a08edb-0f07-7057-8dc2-ae5db16cb1b9.jsonl`
- **H1** — `/home/wufei/.pi/agent/sessions/--home-wufei-Desktop-privatecode-rope--/2026-09-08T05-37-04-372Z_01a07f85-1974-71ed-b9f9-86623a9e9b07.jsonl`
- **H2** — `/home/wufei/.pi/agent/sessions/--home-wufei-Desktop-privatecode-rope--/2026-09-09T07-04-12-199Z_01a084fb-3aa6-752c-9963-c5f01cd2400e.jsonl`
- **W** — `/tmp/pi-subagents-1000/home-wufei-herdr-agent-workbench-fix-legal-retrieval-pagination/01a08edb-0f07-7057-8dc2-ae5db16cb1b9/tasks/`
- First script: `W/wf_fd1cce5869d2.workflow.js`; replacement: `W/wf_cfd94049809c.workflow.js`.
- Replacement journal: `W/wf_cfd94049809c.workflow.jsonl`. This was still accumulating during the audit; absence of a later entry is not a completed-run verdict.

## User intent timeline (original wording checked)

1. H1:288 (`fa4e8a56`): after grill/shape, go should launch a dynamic workflow via JS spawning agents.
2. H1:339 (`e673645a`): priority is go's speed and output quality, especially defects discovered only during real E4; compaction alone is not the goal.
3. H1:524 (`4b0720f7`): config enables dynamic across grill/shape/go; assembly defects need a general solution, not one issue's patch.
4. H1:571 (`ecb41021`): “真正的dynamic是脚本驱动，而非模型驱动的”.
5. H2:14 (`821c98f6`): failed review should produce structured findings and autonomously dispatch fixes “在脚本层解决，而非回到主模型判断”; E2E should use locally available browser/CLI capabilities rather than be parked on the user.
6. T:159 (`aafbdced`): “dynamic路径不应该一个workflow完成全部吗？派生专人合并就行了，你这样效率反而还低了。是skill里没说清楚吗》”.

Historical nuance: `.rope/research/dynamic-workflow-replay-legal-finance.md:10,17-22` records one workflow spanning parallel implementation → integration → further implementation → integration → EOI, but explicitly excludes E4 browser walking from that experiment. Do not inflate that experiment into proof that every historical run already completed real E2E. Later user requirements explicitly close that gap. `.rope/research/session-01a0840a-dynamic-field-report.md:74-82` records the earlier review-return-to-parent failure that motivated the in-script fix-loop requirement.

## What the target actually did

- T:139-141 read the installed `dynamic-workflow.md` and `execution-rules.md`; the returned text includes dispatch/merge/gates/fixes plus in-script review and E2E. This rules out missing runtime reference as this incident's explanation.
- T:156,158 declared Run 1 as S1 only. Explicit rationale: “pi 脚本无 shell，串行合并由父会话在各 run 之间持有”. First script really is one `agent(brief, ...)` followed by `return {run:'Run1', slice:'S1', result:s1}` — no remaining graph or review tail.
- T:159 user challenged this. T:160 assistant admitted it had interpreted missing shell access as a reason for parent merges, and acknowledged an in-script merge agent was the correct host adaptation.
- T:162-173 parent merged S1, reran focused tests, edited map/tasks, committed bookkeeping. T:176-178 then authored/launched the replacement full-lifecycle script; T:179 advertised autonomous continuation.
- Replacement source contains implementers, merge agents, L2, E2E, two-axis review, and review fixes. Its initial source topology is not merely a single-leaf wrapper.
- Actual replacement journal entries 1-2 are S3/S2 implementation results, each with a host-appended saved branch. Entry 3 is L2 PASS. There are **no merge-agent returns between them**.
- During parent verification, journal entry 4 appeared: E2E FAIL, explicitly stating P1/P2/P3 had not landed and cursor/seen suppression were absent. This is evidence of premature E2E, not evidence of a completed issue or a final review verdict.

## Reproduced executor defects

### 1. Branch parsing rejects valid saved branches

`W/wf_cfd94049809c.workflow.js:98-106` finds the *first* occurrence of `branch`, takes only that line, and accepts only `pi-agent` / `rope/` tokens.

Actual leaf return shape (journal entries 1-2):

```text
branch: HEAD
...
Changes saved to branch `pi-agent-…`. Merge with: `git merge pi-agent-…`
```

The real branch is in the host footer; the parser never reaches it. Both returns become `null`. Lines 194-200 mark both slices blocked without invoking a merge agent. A prompt asking for “structured” prose is not a schema-validated return contract.

### 2. No-running-work is mistaken for implementation completion

Script lines 170-185 exit the loop when `running.size === 0`. After S2/S3 are blocked, all five consumers have unmet dependencies. There is no all-slices-integrated check before proceeding at lines 223 onward, and those five consumers are not added to the blocked result.

### 3. L2 checks tests, not integration completeness

Lines 223-245 ask a model to execute test commands and accept a string containing `L2: PASS`. They do not assert that every intended branch is integrated. This directly violates the shipped L2 dual assertion (`skills/rope-go/references/dynamic-workflow.md:82-85`). Existing tests can pass on the old checkout, which is exactly why they are insufficient.

E2E is unconditional at lines 248-258; review is also entered without checking all slices, L2 success, or a clean frozen HEAD. `l2Pass` and `e2ePass` are returned as fields, not used as preconditions for those stages.

### Offline probe

Executed the **actual saved JS** inside Node `vm`, replacing all workflow hooks with in-memory stubs: S2/S3/L2/E2E responses came from their actual journal entries; final review responses were synthetic `approve` only to terminate the simulation. No git, product, leaf, network, or real E2E was run. This checks orchestration, not product correctness.

```json
{
  "labels": ["impl:S2", "impl:S3", "gate:L2", "e2e:E1E2", "review:scanner", "review:behavior"],
  "merged": [],
  "blocked": ["S2", "S3"],
  "l2Pass": true,
  "e2ePass": false,
  "missingSlices": ["S3b", "S4", "P1", "P2", "P3"]
}
```

Return arrival order is immaterial: neither return parses, so neither order can integrate anything. The synthetic review result is **not** a claim about the live review.

## Why the update contributed without changing the intended design

Commit `18a6139` (2026-09-10) shortened/reorganized go and moved the dynamic contract into shipped references. Before it:

- Old `.rope/specs/dynamic-workflow-mode.md` said: “Merge/integration is a dedicated mechanical agent, not the parent”.
- Old `skills/rope-go/SKILL.md` also explicitly named a dedicated mechanical merge/integration agent (with an obsolete per-wave qualifier).

Current `skills/rope-go/references/dynamic-workflow.md:56-73` says the script owns merges and “The integrator merges serially”, but does not explicitly bridge the sandbox's lack of shell access to spawning a mechanical leaf. The author itself identified this ambiguity in T:160. The semantic ownership remains clear, so this is not solely a documentation excuse.

Current `skills/rope-go/SKILL.md:20-25,38-42` separates dynamic from the Agent slice loop; dynamic reference `97-114` still requires in-script frozen-HEAD review/fixes/Matrix/E2E. Impact-based test selection replaced rigid full-suite frequency; that did **not** authorize dropping integration assertions or moving workflow stages to the parent.

`skills/rope-go/` ships prose only, no workflow skeleton/compiler or offline executor contract tests. ADR 0014:113 defers `graph2workflow`. Each model independently invents return parsing, state transitions, and failure gates. That explains the variability and is a reliability limitation exposed by this incident — not a recommendation to build a large runtime now.

## Minimal corrective direction (not implemented)

1. Preserve coverage-driven grill. Do not turn this into a fan-out quota or revert dynamic mode.
2. Define go as one logical workflow owning the whole lifecycle, including a serial mechanical merge leaf on sandboxed hosts. Host failure/resume or a real human gate may interrupt it; a routine slice boundary must not require parent relay.
3. Add a small host-specific execution example/reference with validated state/return handling, rather than more prose alone or a large framework. Separate host worktree-result normalization from slice evidence; consume durable commit/branch identity, not first-line natural-language regex.
4. Before integration/review, mechanically reconcile **every** planned slice: integrated, explicitly blocked (including dependent consumers), or a legitimate stop. Ready/running exhaustion is not success. L2 = all inputs integrated **and** tests green. Review requires the actual freeze preconditions.
5. Test the example offline with missing branch metadata, host-appended branch footer, blocked seam/consumers, partial integration + green tests, and bounded review-fix/delta-review. These are scheduler behavior tests, not keyword-presence tests.
6. Review actual E2E ownership/evidence in the same lifecycle; only human-only or approved gated boundaries return to the user. Preserve agent-run E2E, not mandatory all-suite rituals.

Immediate operational recommendation: pause/reconcile the target run before treating missing planned slices as generic review-fix findings. This audit did not stop it or change its project; that remains the user's decision.
