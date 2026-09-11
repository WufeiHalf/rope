# Fixed Go Execution Template — Investigation Map

One current fact per line: path + date. Seeded at shape (2026-09-11) from the
host-source audit and the session diagnosis. Worktree mode: leaves **report**
falsified or needed lines in their summary; the parent writes them after each
merge. Concurrent leaves never edit this file.

## Host facts (pi subagents extension, verified 2026-09-11)

- `src/workflow/worker-source.ts:191-201,728-749` — a workflow script body executes in a `vm` context whose sandbox is exactly `{agent, parallel, pipeline, phase, log, workflow, budget, console}` with `meta` and `args` materialised **inside** the realm; `codeGeneration: {strings: false}` makes `eval` and `Function(...)` throw. No `require`, no `import`, no filesystem. 2026-09-11
- `src/workflow/worker-source.ts:56-62` — `Date.now`, `Math.random` and argless `new Date()` throw inside the sandbox, because a journaled run is replayed by prefix and a clock read diverges it. 2026-09-11
- `src/workflow/worker-source.ts:673-686` — nested `workflow(ref)` compiles a second body in the same realm as `(async (agent, phase, log, workflow, console, args) => …)`; nesting is one level and shares budgets. 2026-09-11
- `src/workflow/host.ts:120-145` — `toSpawnResult` returns `{ok, text, error, skipped, tokens, outputTokens, structuredRetried, toolCalls, cwd, gate}`; there is **no branch or baseSha field**. 2026-09-11
- `src/workflow/host.ts:132-135` — `text` is `record.structuredJson ?? record.result`: **with a schema, `text` is the parsed payload; without one it is prose, and for a worktree child it has the branch note appended, so it would not parse.** Calling `agent()` without `schema` therefore hands the script unparseable prose. 2026-09-11
- `src/workflow/host.ts:25-32` — a `gate` for an isolated child runs from `onBeforeWorktreeCleanup`, i.e. before the worktree is committed and deleted, and the verdict travels back on the spawn result. 2026-09-11
- `src/workflow/host.ts:51` — `DEFAULT_GATE_TIMEOUT_MS` is 10 minutes; a gate that hangs wedges the slot it holds. 2026-09-11
- `src/workflow/saved.ts:51-57` — saved-workflow name roots are `<cwd>/.pi/workflows`, `<cwd>/.agents/workflows`, `<agentDir>/workflows`. 2026-09-11
- `src/workflow/saved.ts:118-131` — a non-absolute `scriptPath` is resolved against the host `cwd`, **not** against the skill directory; an absolute path is used as given and is not symlink-checked. 2026-09-11
- `src/workflow/saved.ts:82-86` + `src/memory.ts:35-55` — name resolution rejects a symlinked root and rejects a symlinked file (`safeReadFile` returns undefined), so a symlinked template copy cannot be resolved by name. 2026-09-11
- `src/worktree.ts:106-114` — a workflow leaf's worktree is created `--detach` at `HEAD`, so a branch created inside it lands in the main checkout's refs. 2026-09-11
- `src/worktree.ts:123-177` — cleanup commits leftover changes first, then creates `pi-agent-<agentId>` at the worktree HEAD; if the tree is clean **and** HEAD equals the base SHA, no branch is created and the work is discarded. 2026-09-11
- `src/agent-manager.ts:963` — the host appends `\n\n---\nChanges saved to branch \`<branch>\`` to the child's result text; `test/worktree-isolation-e2e.test.ts:187` asserts it is absent when nothing changed. 2026-09-11
- `src/workflow/runtime.ts:48` — `workflowConcurrency()` is `max(1, min(16, cpuCount − 2))`; `:593` is the call site that applies it as the default. The lifetime agent cap is 1000 and a single `parallel`/`pipeline` call accepts at most 4096 items. 2026-09-11
- `~/.pi/agent/workflows/` does not exist on this machine and `PI_CODING_AGENT_DIR` is unset, so name-based resolution currently finds nothing; `~/.agents/skills` is a real directory, not a symlink. 2026-09-11

## Repository facts (this Rope checkout, verified 2026-09-11)

- `bin/rope.js` (`copyDir`) — `rope add` copies a skill directory recursively, so a `skills/<name>/workflows/` or `scripts/` subdirectory installs with no installer change. 2026-09-11
- `package.json` — `files: ["bin/", "skills/"]`, so a new `tests/` tree is committed but never published; there is no `test` script today. 2026-09-11
- `.rope/routes.md:11-32` — `Test roots: Unknown`, quick tier is the CLI entry smoke, `Worktree setup: host-managed` (a pure Markdown rules repo needs no build, so a fresh worktree is immediately testable). 2026-09-11
- `skills/rope-go/references/dynamic-workflow.md:43-52` — the Go section says "compile `tasks.md` into a host workflow script", i.e. per-issue authorship is the current rule. 2026-09-11
- `skills/rope-go/references/execution-rules.md` (Leaf Brief Contract) — the leaf return shape requires `commit hash (or branch name in worktree mode)`, which is exactly the field no host result exposes; the delivery branch must be declared by the plan instead. 2026-09-11

## Audited session facts (agent-workbench `legal-retrieval-pagination`, 2026-09-11)

- `.rope/issues/dynamic-go-session-audit/diagnosis.md` — go was split across two workflows (`wf_fd1cce5869d2` for S1 alone, then `wf_cfd94049809c` for the rest) after the user objected; the parent merged S1 by hand between them. 2026-09-11
- `.rope/issues/dynamic-go-session-audit/diagnosis.md` — the replacement script's branch parser took the **first** `branch` occurrence in the returned text (`branch: HEAD`, quoted from a brief) instead of the host's delivery footer, so both concurrent implementers were marked blocked and no merge ran. 2026-09-11
- `.rope/issues/dynamic-go-session-audit/diagnosis.md` — with nothing integrated, L2 still ran and passed on the un-integrated checkout, then E2E ran; `l2`/`e2ePass` were returned as fields, never used as preconditions. 2026-09-11
- `.rope/issues/dynamic-go-session-audit/diagnosis.md` — S3b/S4/P1/P2/P3 appear nowhere in the run's result; "no running agent" was read as completion. 2026-09-11
- `.rope/research/session-01a0840a-dynamic-field-report.md` — the first production dynamic run spent ~11 full-suite executions, ≈38 of 73 minutes, and omitted the step-0 setup line (three of five leaves blocked on missing `node_modules`). 2026-09-11

## Target facts (template under construction)

- `skills/rope-go/workflows/go-execute.js` — does not exist yet; must remain a single self-contained file because the sandbox forbids imports. 2026-09-11
- `skills/rope-go/references/execution-template.md` — does not exist yet; will be the single authority for the task-data and return schemas. 2026-09-11
- `tests/` — does not exist yet; this repository has no test tree, so Slice 1 also derives and writes the `Test tiers` declaration. 2026-09-11
