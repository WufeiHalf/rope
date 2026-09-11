/**
 * gates.test.mjs — staged preconditions, mechanical checks, and the frozen review.
 *
 * The kernel must advance only through a satisfied precondition: the audited
 * session returned `l2`/`e2ePass` as fields and then ran the later stages
 * anyway, which is the defect these tests fence.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

import { loadTemplate } from "./harness/load-workflow.mjs";
import { createStubHost } from "./harness/stub-host.mjs";
import { makeRepo, git, readJson, cleanup, scriptPath } from "./harness/tmp-repo.mjs";
import { greenPlan, approvingReplies, task, passCheck, failCheck, e2eItem, templatePath } from "./harness/fixture-plan.mjs";

const VERIFY = scriptPath("verify-delivery.sh");
const RUN_CHECK = scriptPath("run-check.sh");

async function fixture(prefix) {
  const repo = await makeRepo(prefix);
  // The real location: inside the repository, beside the issue package. Every
  // fixture run therefore exercises the evidence exclusion in the delivery gate,
  // and a kernel that forgot to declare it would fail these tests.
  repo.evidenceDir = join(repo.dir, ".rope", "issues", prefix.replace(/-+$/, ""), "evidence");
  repo.verifyScript = VERIFY;
  repo.checkScript = RUN_CHECK;
  return repo;
}

/** See the note in kernel.test.mjs: the vm realm has its own Array prototype. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function runScript(script, args, cwd) {
  return spawnSync("bash", [script, ...args], { cwd, encoding: "utf8" });
}

/* ------------------------------------------------------------------ *
 * verify-delivery.sh, directly
 * ------------------------------------------------------------------ */

test("verify-delivery.sh: creates a forgotten branch, refuses a dirty tree, and checks reachability", async () => {
  const repo = await fixture("verify-");
  // The verdict lives beside the evidence, inside .git, so a real run never
  // makes the working tree dirty by writing its own verification output.
  const verdict = join(repo.evidenceDir, "verdict.json");

  // Nothing committed: the branch cannot be produced from a clean tree at base.
  const atBase = runScript(VERIFY, ["--verdict", verdict, "--branch", "rope/A", "--base", repo.baseSha], repo.dir);
  assert.equal(atBase.status, 0, atBase.stderr);
  assert.equal(git(repo.dir, "rev-parse", "refs/heads/rope/A"), repo.baseSha);

  // A dirty tree is refused when recovery is not offered.
  await writeFile(join(repo.dir, "scratch.txt"), "uncommitted\n");
  const dirty = runScript(VERIFY, ["--verdict", verdict, "--branch", "rope/B", "--base", repo.baseSha], repo.dir);
  assert.equal(dirty.status, 1);
  const dirtyVerdict = await readJson(verdict);
  assert.equal(dirtyVerdict.ok, false);
  assert.equal(dirtyVerdict.reason, "dirty-tree");
  assert.match(dirtyVerdict.dirtyFiles, /scratch\.txt/);

  // Recovery commits it, so a forgotten commit step costs a flag, not the work.
  const recovered = runScript(VERIFY, ["--verdict", verdict, "--branch", "rope/B", "--base", repo.baseSha, "--recover-dirty"], repo.dir);
  assert.equal(recovered.status, 0, recovered.stderr);
  const recoveredVerdict = await readJson(verdict);
  assert.equal(recoveredVerdict.ok, true);
  assert.equal(recoveredVerdict.recovered, true);
  assert.equal(recoveredVerdict.moved, true);
  assert.equal(git(repo.dir, "rev-parse", "refs/heads/rope/B"), recoveredVerdict.sha);
  assert.equal(git(repo.dir, "status", "--porcelain"), "");

  // Shared mode: the commit must exist and be reachable from HEAD.
  const unreachable = runScript(VERIFY, ["--verdict", verdict, "--commit", "c".repeat(40)], repo.dir);
  assert.equal(unreachable.status, 1);
  assert.equal((await readJson(verdict)).reason, "missing-commit");
  const reachable = runScript(VERIFY, ["--verdict", verdict, "--commit", "HEAD"], repo.dir);
  assert.equal(reachable.status, 0, reachable.stderr);
  assert.equal((await readJson(verdict)).reason, "commit-verified");

  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * run-check.sh: mechanical execution and evidence reuse
 * ------------------------------------------------------------------ */

test("run-check.sh runs each check once per key and reuses the evidence after that", async () => {
  const repo = await fixture("checks-");
  const counter = join(repo.dir, "runs.txt");
  const evidence = repo.evidenceDir;
  const batch = JSON.stringify([
    { id: "costly", command: "printf x >> " + counter, scope: "affected", required: true, key: "affected@abc123" },
    { id: "skipped-tier", command: "exit 7", scope: "repo", required: false, key: "repo@abc123" },
  ]);

  const first = runScript(RUN_CHECK, ["--evidence", evidence, "--batch", batch], repo.dir);
  assert.equal(first.status, 0, "a failing optional check must not fail the batch: " + first.stderr);
  assert.equal(await readFile(counter, "utf8"), "x");

  const record = await readJson(join(evidence, "affected@abc123", "costly.json"));
  assert.equal(record.exitCode, 0);
  assert.equal(record.reused, false);
  assert.equal(record.key, "affected@abc123");
  assert.ok(typeof record.durationMs === "number");

  const optional = await readJson(join(evidence, "repo@abc123", "skipped-tier.json"));
  assert.equal(optional.exitCode, 7);
  assert.equal(optional.required, false);

  const second = runScript(RUN_CHECK, ["--evidence", evidence, "--batch", batch], repo.dir);
  assert.equal(second.status, 0);
  assert.equal(await readFile(counter, "utf8"), "x", "an unchanged key must not spend the command again");
  assert.match(second.stdout, /reuse\s+costly/);

  // A changed state is a changed key, so the command runs again.
  const moved = JSON.stringify([
    { id: "costly", command: "printf x >> " + counter, scope: "affected", required: true, key: "affected@def456" },
  ]);
  assert.equal(runScript(RUN_CHECK, ["--evidence", evidence, "--batch", moved], repo.dir).status, 0);
  assert.equal(await readFile(counter, "utf8"), "xx");

  await cleanup(repo.dir);
});

test("run-check.sh fails the batch when a required check exits non-zero", async () => {
  const repo = await fixture("checks-fail-");
  const batch = JSON.stringify([
    { id: "red", command: "exit 4", scope: "repo", required: true, key: "repo@aaa" },
  ]);
  const result = runScript(RUN_CHECK, ["--evidence", repo.evidenceDir, "--batch", batch], repo.dir);
  assert.equal(result.status, 1);
  assert.equal((await readJson(join(repo.evidenceDir, "repo@aaa", "red.json"))).exitCode, 4);
  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * Staged preconditions
 * ------------------------------------------------------------------ */

test("a failing L2 stops the run before E2E and before the review ever starts", async () => {
  const repo = await fixture("fence-");
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A"]), { "checks:l2": { ack: "ok" } }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      checks: [failCheck("integration", "l2"), passCheck("smoke", "l3"), passCheck("frozen", "freeze")],
      e2e: [e2eItem("E1")],
    }),
  });

  const labels = host.calls.map((call) => call.label);
  assert.ok(labels.includes("checks:l2"));
  assert.equal(record.stages.l2.ok, false);
  assert.equal(labels.includes("checks:l3"), false, "L3 must not start on a failed L2: " + labels.join(" "));
  assert.equal(labels.includes("checks:freeze"), false);
  assert.equal(labels.includes("e2e:E1"), false);
  assert.equal(labels.includes("review:scanner"), false, "the review must not run on a failed stage");
  assert.equal(record.stages.e2e.ok, false);
  assert.equal(record.stages.e2e.ran, false);
  assert.equal(record.review.verdict, "skipped");
  assert.match(record.stages.l3.reason, /L2/);
  assert.notEqual(record.verdict, "delivered");
  await cleanup(repo.dir);
});

test("a failing post-merge warning does not gate: it is an early signal, not a stage", async () => {
  const repo = await fixture("warning-");
  const host = createStubHost({ repo: repo.dir, replies: approvingReplies(["A"]) });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      checks: [failCheck("lint", "merge"), passCheck("integration", "l2")],
    }),
  });

  assert.ok(host.calls.some((call) => call.label === "checks:merge"), "the warning batch must run");
  assert.equal(record.stages.l2.ok, true, "a failed warning must not stop L2");
  assert.equal(record.verdict, "delivered");
  assert.equal(record.checks.find((check) => check.id === "lint").ok, false);
  await cleanup(repo.dir);
});

test("a failing E2E item fences the review and is reported by id", async () => {
  const repo = await fixture("e2e-");
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A"]), {
      "e2e:E1": { id: "E1", status: "passed", evidence: "curl /health → 200", detail: "ok" },
      "e2e:E2": { id: "E2", status: "failed", evidence: "curl /next?cursor=bogus", detail: "tampered cursor returned page 1" },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      e2e: [
        e2eItem("E1", { prompt: "hit the live health endpoint" }),
        e2eItem("E2", { prompt: "replay a tampered cursor against the live service" }),
      ],
    }),
  });

  assert.equal(record.stages.e2e.ran, true);
  assert.equal(record.stages.e2e.ok, false);
  assert.match(record.stages.e2e.reason, /E2:agent_failed/);
  assert.equal(record.e2e.find((item) => item.id === "E1").status, "agent_passed");
  assert.equal(host.calls.some((call) => call.label === "review:scanner"), false);
  assert.notEqual(record.verdict, "delivered");
  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * The frozen review and its bounded fix loop
 * ------------------------------------------------------------------ */

test("blocking findings cost one fix round plus a delta-only re-review, then stop at the bound", async () => {
  const repo = await fixture("review-");
  const finding = {
    severity: "blocking", path: "src/connector.py", line: 42,
    issue: "cursor is not validated before reuse",
    fix: "reject a cursor whose signature does not match the issued set",
  };
  const replies = Object.assign(approvingReplies(["A"]), {
    "review:scanner": { axis: "scanner", verdict: "approve", identity: "stub-scanner", findings: [] },
    "review:behavior": { axis: "behavior", verdict: "changes_requested", identity: "stub-reviewer", findings: [finding] },
    "fix:1": { status: "done", branch: "rope/review-fix-1", commit: "<sha:fix1>", summary: "validated the cursor" },
    "merge:fix1": { commit: "<sha:fix1>", mergeCommit: "<sha:fix1>", headAfter: "<sha:fix1>", conflict: false, failed: null },
    "fix:2": { status: "done", branch: "rope/review-fix-2", commit: "<sha:fix2>", summary: "second attempt" },
    "merge:fix2": { commit: "<sha:fix2>", mergeCommit: "<sha:fix2>", headAfter: "<sha:fix2>", conflict: false, failed: null },
  });
  // The finding survives both fix rounds, so the bound — not the reviewer — ends the loop.
  for (const label of ["review:scanner:delta"]) {
    replies[label] = { axis: "scanner", verdict: "approve", identity: "stub-scanner", findings: [] };
  }
  replies["review:behavior:delta"] = { axis: "behavior", verdict: "changes_requested", identity: "stub-reviewer", findings: [finding] };

  const host = createStubHost({ repo: repo.dir, replies: replies });
  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({ repo: repo, baseSha: repo.baseSha, fixRounds: 2, tasks: [task("A")] }),
  });

  const labels = host.calls.map((call) => call.label);
  assert.deepEqual(labels.filter((label) => label.startsWith("fix:")), ["fix:1", "fix:2"],
    "at most fixRounds fix rounds: " + labels.join(" "));
  assert.deepEqual(labels.filter((label) => label.startsWith("review:") && !label.includes("delta")),
    ["review:scanner", "review:behavior"],
    "the full review runs exactly once, at the freeze point: " + labels.join(" "));
  assert.deepEqual(labels.filter((label) => label.includes("delta")), [
    "review:scanner:delta", "review:behavior:delta",
    "review:scanner:delta", "review:behavior:delta",
  ], "each fix round gets one delta re-review, never a full one: " + labels.join(" "));
  assert.equal(record.review.rounds, 2);
  assert.equal(record.review.verdict, "changes_requested",
    "the bound stops the loop instead of spending a third round");
  assert.equal(record.review.blockingRemaining, 1);
  assert.notEqual(record.verdict, "delivered");

  const fixPrompt = host.calls.find((call) => call.label === "fix:1").prompt;
  assert.match(fixPrompt, /src\/connector\.py:42/, "the fix brief transcribes the finding verbatim");
  assert.match(fixPrompt, /reject a cursor whose signature does not match/);
  assert.match(host.calls.find((call) => call.label === "review:behavior:delta").prompt, /delta re-review/);
  await cleanup(repo.dir);
});

test("a fix round that clears a blocking finding ends in a delivered run", async () => {
  const repo = await fixture("review-fixed-");
  const finding = { severity: "blocking", path: "src/x.py", line: 7, issue: "leaks a handle", fix: "close it in a finally block" };
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A"]), {
      "review:behavior": { axis: "behavior", verdict: "changes_requested", identity: "stub-reviewer", findings: [finding] },
      "fix:1": { status: "done", branch: "rope/review-fix-1", commit: "<sha:fix1>", summary: "closed the handle" },
      "merge:fix1": { commit: "<sha:fix1>", mergeCommit: "<sha:fix1>", headAfter: "<sha:fix1>", conflict: false, failed: null },
      "review:scanner:delta": { axis: "scanner", verdict: "approve", identity: "stub-scanner", findings: [] },
      "review:behavior:delta": { axis: "behavior", verdict: "approve", identity: "stub-reviewer", findings: [] },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({ repo: repo, baseSha: repo.baseSha, tasks: [task("A")] }),
  });

  assert.equal(record.review.rounds, 1);
  assert.equal(record.review.verdict, "approve");
  assert.equal(record.verdict, "delivered");
  assert.deepEqual(plain(record.review.fixes.map((fix) => fix.branch)), ["rope/review-fix-1"],
    "the fix lands as a real merge, not an in-place edit");
  assert.equal(record.headSha, record.review.fixes[0].mergeCommit,
    "the recorded HEAD advances to the fix merge");
  await cleanup(repo.dir);
});

test("note-only findings are recorded, never repaired by a fix round", async () => {
  const repo = await fixture("notes-");
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A"]), {
      "review:behavior": {
        axis: "behavior", verdict: "changes_requested", identity: "stub-reviewer",
        findings: [{ severity: "note", path: "src/x.py", issue: "could be clearer", fix: "rename" }],
      },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({ repo: repo, baseSha: repo.baseSha, tasks: [task("A")] }),
  });

  assert.equal(host.calls.some((call) => call.label.startsWith("fix:")), false,
    "a note is recorded, not repaired");
  assert.equal(record.review.rounds, 0);
  assert.equal(record.review.findings.length, 1);
  await cleanup(repo.dir);
});

test("the kernel refuses to report a delivery when a slice is missing, and suggests taking over", async () => {
  const repo = await fixture("downgrade-");
  const host = createStubHost({
    repo: repo.dir,
    replies: {
      "leaf:A": null,
      "leaf:B": null,
    },
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({ repo: repo, baseSha: repo.baseSha, fixRounds: 0, tasks: [task("A"), task("B")] }),
  });

  assert.equal(record.verdict, "stopped");
  assert.equal(record.merged.length, 0);
  assert.equal(record.stages.l2.ran, false);
  assert.match(record.stages.l2.reason, /not every planned task is integrated \(0 of 2\)/);
  assert.ok(record.suggestDowngrade, "repeated failure must offer the parent a way out");
  assert.deepEqual(plain(record.suggestDowngrade.tasks), ["A", "B"]);
  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * Evidence is bookkeeping, not work
 *
 * Evidence lives in the repository (`.rope/issues/<slug>/evidence/`), so the
 * delivery gate has to be told that path: an untracked evidence file must
 * never make a finished delivery look dirty, and the leftover-recovery commit
 * must never sweep it into history.
 * ------------------------------------------------------------------ */

test("an untracked evidence directory never fails a delivery", async () => {
  const repo = await fixture("evidence-");
  const evidence = join(repo.dir, ".rope", "issues", "x", "evidence");
  // Even in a repository that never declared the ignore rule: the gate is told
  // the path, so bookkeeping can never read as an unfinished delivery.
  await rm(join(repo.dir, ".gitignore"));
  try {
    await writeFile(join(repo.dir, "work.txt"), "done\n");
    git(repo.dir, "add", "-A");
    git(repo.dir, "commit", "-q", "-m", "the slice");
    git(repo.dir, "branch", "rope/A", "HEAD");
    // The executor's own bookkeeping, written after the leaf committed.
    await mkdir(join(evidence, "delivery"), { recursive: true });
    await writeFile(join(evidence, "delivery", "A-r0.json"), "{\"ok\":true}\n");

    const withoutFlag = runScript(VERIFY, [
      "--branch", "rope/A", "--base", repo.baseSha,
      "--verdict", join(repo.dir, ".git", "v1.json"),
    ], repo.dir);
    assert.equal(withoutFlag.status, 1, "an undeclared evidence path must read as dirty");
    assert.equal((await readJson(join(repo.dir, ".git", "v1.json"))).reason, "dirty-tree");

    const withFlag = runScript(VERIFY, [
      "--branch", "rope/A", "--base", repo.baseSha, "--evidence", evidence,
      "--verdict", join(repo.dir, ".git", "v2.json"),
    ], repo.dir);
    assert.equal(withFlag.status, 0, withFlag.stderr + withFlag.stdout);
    const verdict = await readJson(join(repo.dir, ".git", "v2.json"));
    assert.equal(verdict.ok, true);
    assert.equal(verdict.evidenceExcluded, true);
    assert.equal(verdict.recovered, false, "evidence alone must not trigger a leftover commit");
    assert.equal(git(repo.dir, "status", "--porcelain"), "?? .rope/", "the evidence stays untracked");

    const log = git(repo.dir, "log", "--oneline");
    assert.equal(log.split("\n").length, 2, "no leftover commit was created: " + log);
  } finally {
    await cleanup(repo.dir);
  }
});

test("leftover recovery commits the leaf's work but never the evidence", async () => {
  const repo = await fixture("evidence-recover-");
  const evidence = join(repo.dir, ".rope", "issues", "x", "evidence");
  try {
    await writeFile(join(repo.dir, "late.txt"), "forgotten\n");
    await mkdir(join(repo.evidenceDir, "checks"), { recursive: true });
    await writeFile(join(repo.evidenceDir, "checks", "l2.json"), "{\"exitCode\":0}\n");
    assert.notEqual(repo.evidenceDir, evidence, "the fixture must exercise the declared path");

    const result = runScript(VERIFY, [
      "--branch", "rope/A", "--base", repo.baseSha, "--recover-dirty", "--evidence", evidence,
      "--verdict", join(repo.dir, ".git", "v.json"),
    ], repo.dir);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    const verdict = await readJson(join(repo.dir, ".git", "v.json"));
    assert.equal(verdict.recovered, true);
    assert.equal(verdict.branch, "rope/A");

    const committed = git(repo.dir, "show", "--name-only", "--pretty=format:", "HEAD");
    assert.match(committed, /late\.txt/);
    assert.doesNotMatch(committed, /evidence/, "evidence must not be committed by the recovery path");
    assert.equal(git(repo.dir, "rev-parse", "rope/A"), git(repo.dir, "rev-parse", "HEAD"));
  } finally {
    await cleanup(repo.dir);
  }
});

test("concurrent e2e items are the default; e2eSerial makes the plan wait", async () => {
  const repo = await fixture("e2e-serial-");
  try {
    let active = 0;
    let peak = 0;
    const order = [];
    const items = ["E1", "E2", "E3"].map((id) => e2eItem(id, { required: true }));
    const tasks = [task("A")];

    const buildHost = (serial) => createStubHost({
      repo: repo.dir,
      replies: Object.assign(approvingReplies(["A"]), Object.fromEntries(items.map((item) => [
        "e2e:" + item.id,
        () => {
          active += 1;
          peak = Math.max(peak, active);
          order.push(item.id);
          active -= 1;
          return { id: item.id, status: "passed", evidence: "stub", detail: "stub" };
        },
      ]))),
    });

    const parallelHost = buildHost(false);
    await loadTemplate(templatePath(), {
      globals: parallelHost.globals,
      args: greenPlan({ repo: repo, baseSha: repo.baseSha, tasks: tasks, e2e: items }),
    });

    peak = 0;
    order.length = 0;
    const serialHost = buildHost(true);
    await loadTemplate(templatePath(), {
      globals: serialHost.globals,
      args: Object.assign(greenPlan({ repo: repo, baseSha: repo.baseSha, tasks: tasks, e2e: items }), { e2eSerial: true }),
    });

    assert.equal(peak, 1, "e2eSerial must never let two items overlap");
    assert.deepEqual(plain(order), ["E1", "E2", "E3"], "serial items keep declaration order");
  } finally {
    await cleanup(repo.dir);
  }
});

test("a review fix marks the stages that passed before it as stale", async () => {
  const repo = await fixture("stale-");
  let reviewCall = 0;
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A"]), {
      // First pass requests a change; the delta review after the fix approves.
      "review:scanner": () => {
        reviewCall += 1;
        return reviewCall === 1
          ? {
            axis: "scanner", verdict: "changes_requested", identity: "stub-scanner",
            findings: [{ severity: "blocking", path: "a.ts", line: 3, issue: "unhandled branch", fix: "handle it" }],
          }
          : { axis: "scanner", verdict: "approve", identity: "stub-scanner", findings: [] };
      },
      "fix:1": { status: "done", branch: "rope/review-fix-1", commit: "<sha:fix1>", summary: "handled the branch" },
      "merge:fix1": {
        commit: "<sha:fix1>", mergeCommit: "<sha:fix1>", headAfter: "<sha:fix1>", conflict: false, failed: null,
      },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      checks: [passCheck("quick", "l2"), passCheck("suites", "freeze")],
    }),
  });

  assert.equal(plain(record.verdict), "delivered");
  assert.equal(plain(record.stages.freeze).ran, true, "the fixture must actually run a freeze batch");
  assert.equal(plain(record.stages.freeze).ok, true);
  assert.equal(plain(record.review).rounds, 1);
  assert.equal(plain(record.review.fixes).length, 1, "the fix merge is recorded for the parent");
  // Every stage ran before the fix, so none of them may read as evidence about
  // the delivered HEAD without saying so.
  for (const stage of ["merge", "l2", "freeze"]) {
    assert.equal(plain(record.stages[stage]).staleAfterFixes, true, stage + " must be marked stale after a fix");
    assert.equal(typeof plain(record.stages[stage]).atSha, "string", stage + " must record the HEAD it ran on");
  }
  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * Shape's executor decision reaches the plan, and a decision the kernel
 * cannot carry out is a recorded terminal outcome, never a silent skip.
 * ------------------------------------------------------------------ */

test("a user-executed e2e item is recorded as blocked_on_user, never spawned, and does not kill the delivery", async () => {
  const repo = await fixture("e2e-user-");
  const host = createStubHost({ repo: repo.dir, replies: approvingReplies(["A"]) });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      e2e: [{ id: "E1", executor: "user", decision: "user-run", reason: "2FA login is human-only", required: true }],
    }),
  });

  assert.equal(host.calls.some((call) => call.label === "e2e:E1"), false, "a user-only item must not be spawned");
  const item = record.e2e.find((entry) => entry.id === "E1");
  assert.equal(item.status, "blocked_on_user");
  assert.equal(item.ran, false);
  assert.equal(item.evidence, "2FA login is human-only");
  assert.equal(record.stages.e2e.ok, true, "a recorded human-only item is not an agent failure");
  assert.equal(record.stages.e2e.skipped, true, "nothing ran, so the stage is skipped rather than green");
  assert.equal(record.verdict, "delivered");
  await cleanup(repo.dir);
});

test("a not-run item and a shape-skipped gate are recorded by their decision, not dropped", async () => {
  const repo = await fixture("e2e-declared-");
  const host = createStubHost({ repo: repo.dir, replies: approvingReplies(["A"]) });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      e2e: [
        { id: "E1", executor: "not-run", decision: "not-run-waived", reason: "service decommissioned", required: false },
        { id: "E2", executor: "agent-with-gate", decision: "skipped", reason: "user declined the restart", required: true },
        { id: "E3", executor: "agent-with-gate", decision: "blocked", reason: "approval never arrived", required: true },
      ],
    }),
  });

  assert.equal(host.calls.some((call) => call.label.startsWith("e2e:")), false);
  assert.equal(record.e2e.find((entry) => entry.id === "E1").status, "not_run_with_reason");
  assert.equal(record.e2e.find((entry) => entry.id === "E2").status, "skipped_by_user_at_shape");
  assert.equal(record.e2e.find((entry) => entry.id === "E3").status, "blocked_on_gate");
  assert.equal(record.stages.e2e.skipped, true);
  await cleanup(repo.dir);
});

test("a gated action may not run without a recorded approval", async () => {
  const repo = await fixture("e2e-gate-");
  let thrown = null;
  try {
    await loadTemplate(templatePath(), {
      globals: { agent: async () => null },
      args: greenPlan({
        repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
        e2e: [e2eItem("E1", { executor: "agent-with-gate" })],
      }),
    });
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown !== null, "a gated item with no decision must be rejected at compile time");
  assert.match(String(thrown.message), /e2e\[0\]\.decision/);
  await cleanup(repo.dir);
});

test("a running e2e item must name its preset, so the model cannot drift silently", async () => {
  const repo = await fixture("e2e-preset-");
  let thrown = null;
  try {
    await loadTemplate(templatePath(), {
      globals: { agent: async () => null },
      args: greenPlan({
        repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
        e2e: [{ id: "E1", prompt: "walk it" }],
      }),
    });
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown !== null, "a running item without a preset must be rejected at compile time");
  assert.match(String(thrown.message), /e2e\[0\]\.preset/);
  await cleanup(repo.dir);
});

test("a leaf that reports blocked has not passed: the escape is a shape decision, not the leaf's word", async () => {
  const repo = await fixture("e2e-blocked-");
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A"]), {
      "e2e:E1": { id: "E1", status: "blocked", evidence: "no credentials available", detail: "could not sign in" },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      e2e: [e2eItem("E1", { prompt: "sign in and walk the console" })],
    }),
  });

  assert.equal(record.e2e.find((entry) => entry.id === "E1").status, "blocked_on_user");
  assert.equal(record.stages.e2e.ok, false, "a required item that did not pass must fence the rest");
  assert.equal(record.stages.freeze.ran, false);
  assert.notEqual(record.verdict, "delivered");
  await cleanup(repo.dir);
});
