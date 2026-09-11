/**
 * kernel.test.mjs — the orchestration faults that cost the audited session its run.
 *
 * Each test names the defect it fences, so a regression fails as the defect and
 * not as a mystery assertion. The real `verify-delivery.sh` runs as each leaf's
 * gate (the stub host executes gate commands for real), so delivery identity is
 * exercised end to end rather than described.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";

import { loadTemplate } from "./harness/load-workflow.mjs";
import { createStubHost } from "./harness/stub-host.mjs";
import {
  makeRepo, addDetachedWorktree, commitIn, git, branchAt, cleanup, scriptPath,
} from "./harness/tmp-repo.mjs";
import { greenPlan, approvingReplies, task, passCheck, failCheck, templatePath } from "./harness/fixture-plan.mjs";

const VERIFY = scriptPath("verify-delivery.sh");
const RUN_CHECK = scriptPath("run-check.sh");

/**
 * The vm realm builds its own Array and Object prototypes, so a strict deep
 * comparison against a host literal fails on "same structure, different
 * prototype". Round-tripping through JSON is the smallest honest normalizer.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

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

/* ------------------------------------------------------------------ *
 * Plan validation — refuse before spending a leaf
 * ------------------------------------------------------------------ */

test("a malformed plan is rejected naming the offending field, with zero spawns", async () => {
  // Shared mode keeps the mode-specific requirements out of the way, so each
  // case is about the field it names.
  const brief = { issue: "x", baseSha: "abc", mode: "shared", tasks: [task("A")] };
  const withTasks = (tasks) => Object.assign({}, brief, { tasks: tasks });
  const cases = [
    [{}, /args\.issue/],
    [Object.assign({}, brief, { tasks: undefined }), /args\.tasks/],
    [{ issue: "x", baseSha: "abc", mode: "worktree", tasks: [task("A")] }, /args\.targetBranch/],
    [withTasks([task("A"), task("A")]), /duplicate task id/],
    [withTasks([task("A", { blockedBy: [{ id: "Z", class: "seam-required" }] })]), /unknown task "Z"/],
    [withTasks([task("A", { blockedBy: [{ id: "A", class: "seam-required" }] })]), /declares itself as a blocker/],
    [withTasks([
      task("A", { blockedBy: [{ id: "B", class: "seam-required" }] }),
      task("B", { blockedBy: [{ id: "A", class: "seam-required" }] }),
    ]), /cycle/],
    [withTasks([task("A", { blockedBy: [{ id: "A", class: "nonsense" }] })]), /\.class must be one of/],
    [Object.assign({}, brief, { extra: 1 }), /unknown field plan\.extra/],
    [withTasks([task("A", { surprise: true })]), /unknown field/],
    [Object.assign({}, brief, { checks: [{ id: "c", stage: "whenever", command: "true" }] }), /\.stage must be one of/],
    [Object.assign({}, brief, { checks: [{ id: "c", stage: "l2", command: "true" }] }), /args\.evidenceDir is required/],
    [withTasks([task("A", { evidence: [{ id: "E", item: "a" }, { id: "E", item: "b" }] })]), /duplicate/],
  ];
  for (const [plan, expected] of cases) {
    const host = createStubHost({ repo: "/tmp", replies: {} });
    await assert.rejects(
      () => loadTemplate(templatePath(), { globals: host.globals, args: plan }),
      expected,
      "plan " + JSON.stringify(plan) + " should be rejected",
    );
    assert.equal(host.calls.length, 0, "a rejected plan must not spawn anything");
  }
});

/* ------------------------------------------------------------------ *
 * Delivery identity — routing comes from git, never from leaf text
 * ------------------------------------------------------------------ */

test("a leaf that committed but forgot its branch still lands: the gate creates it", async () => {
  const repo = await fixture("branch-recover-");
  const worktree = await addDetachedWorktree(repo.dir, "branch-recover-wt");
  try {
    const sha = await commitIn(worktree, "a.txt", "leaf work\n", "feat: leaf work");

    const host = createStubHost({
      repo: repo.dir,
      hashes: { A: sha },
      replies: Object.assign(approvingReplies(["A"]), {
        // The leaf's prose claims the branch it never created.
        "leaf:A": {
          taskId: "A", status: "done", branch: "rope/A", commit: sha,
          summary: "did the work", setup: "setup: no-op", evidence: [],
        },
      }),
    });
    host.context.gateCwd = worktree;

    const record = await loadTemplate(templatePath(), {
      globals: host.globals,
      args: greenPlan({ repo: repo, baseSha: repo.baseSha, tasks: [task("A")] }),
    });

    assert.equal(git(repo.dir, "rev-parse", "refs/heads/rope/A"), sha,
      "the delivery gate must have created the branch at the leaf\u0027s commit");
    assert.equal(record.tasks[0].state, "integrated");
    assert.equal(record.merged[0].commit, sha);
  } finally {
    await cleanup(worktree, repo.dir);
  }
});

test("a dirty worktree is committed by the gate instead of costing the implementation", async () => {
  const repo = await fixture("dirty-recover-");
  const worktree = await addDetachedWorktree(repo.dir, "dirty-recover-wt");
  try {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(join(worktree, "left-over.txt"), "uncommitted\n");

    const host = createStubHost({
      repo: repo.dir,
      replies: approvingReplies(["A"]),
    });
    host.context.gateCwd = worktree;

    const record = await loadTemplate(templatePath(), {
      globals: host.globals,
      args: greenPlan({ repo: repo, baseSha: repo.baseSha, tasks: [task("A")] }),
    });

    assert.notEqual(git(repo.dir, "rev-parse", "refs/heads/rope/A"), repo.baseSha,
      "the recovered commit must be a real new commit");
    assert.equal(record.tasks[0].state, "integrated");
    assert.ok(record.merged.length === 1);
  } finally {
    await cleanup(worktree, repo.dir);
  }
});

/* ------------------------------------------------------------------ *
 * Completion is "every planned task integrated", never "nothing running"
 * ------------------------------------------------------------------ */

test("a task that can never become ready is named, and the run does not report success", async () => {
  const repo = await fixture("never-ready-");
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A", "C"]), {
      // A blocks B, so B is never dispatched; C is independent and lands.
      "leaf:A": { taskId: "A", status: "blocked", blockerClass: "environment", blockers: ["no toolchain in this image"], branch: "", commit: "", summary: "", setup: "", evidence: [] },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo,
      baseSha: repo.baseSha,
      tasks: [
        task("A"),
        task("B", { blockedBy: [{ id: "A", class: "seam-required" }] }),
        task("C"),
      ],
    }),
  });

  assert.deepEqual(plain(record.neverReady), ["B"], "B must be reported as never-ready");
  assert.equal(record.tasks.find((entry) => entry.id === "B").state, "not-started");
  assert.equal(record.tasks.find((entry) => entry.id === "C").state, "integrated");
  assert.notEqual(record.verdict, "delivered");
  assert.ok(!host.calls.some((call) => call.label === "leaf:B"), "B must never be dispatched");
  assert.ok(!host.calls.some((call) => call.label === "checks:l2"),
    "L2 must not run while a planned task is missing — the audited defect was running it anyway");
  assert.equal(record.stages.l2.ok, false);
  assert.equal(record.stages.l2.ran, false);

  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * Frontier refill, merge priority, conflict re-dispatch
 * ------------------------------------------------------------------ */

test("independent slices refill the frontier, and a freed slot is spent on the merge first", async () => {
  const repo = await fixture("refill-");
  const ids = ["A", "B", "C", "D"];
  const host = createStubHost({ repo: repo.dir, replies: approvingReplies(ids) });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, inFlight: 2,
      tasks: ids.map((id) => task(id)),
    }),
  });

  const launchOrder = host.calls.map((call) => call.label);
  const firstMerge = launchOrder.findIndex((label) => label.startsWith("merge:"));
  const thirdLeaf = launchOrder.indexOf("leaf:C");
  assert.ok(firstMerge !== -1 && thirdLeaf !== -1);
  assert.ok(firstMerge < thirdLeaf,
    "a merge must be taken before a newly-ready slice is started: " + launchOrder.join(" "));

  // The window is never exceeded: leaf C cannot start before two leaves settled.
  const windowProbe = launchOrder.slice(0, 4);
  assert.deepEqual(windowProbe, ["leaf:A", "leaf:B", "merge:A", "merge:B"],
    "inFlight=2 must hold two leaves, then land both before refilling");
  assert.equal(record.concurrency.peak, 2);
  assert.equal(record.verdict, "delivered");
  await cleanup(repo.dir);
});

test("a merge conflict costs exactly one re-dispatch of the unmerged slice", async () => {
  const repo = await fixture("conflict-");
  let mergeAttempts = 0;
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A", "B"]), {
      "merge:B": () => {
        mergeAttempts += 1;
        return mergeAttempts === 1
          ? { commit: "deadbeef", mergeCommit: "", headAfter: "", failed: "conflict in app.txt could not be resolved" }
          : { commit: "<sha:B>", mergeCommit: "<sha:B>", headAfter: "<sha:B>", conflict: true, conflictPaths: ["app.txt"], failed: null };
      },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha,
      tasks: [
        task("A", { ownedFiles: ["app.txt"] }),
        task("B", { ownedFiles: ["app.txt"], blockedBy: [{ id: "A", class: "file-overlap" }] }),
      ],
    }),
  });

  const labels = host.calls.map((call) => call.label);
  assert.ok(labels.includes("leaf:B:r1"), "the conflicting slice must be re-dispatched once: " + labels.join(" "));
  assert.equal(record.tasks.find((entry) => entry.id === "B").rounds, 1);
  assert.equal(record.tasks.find((entry) => entry.id === "B").state, "integrated");
  assert.ok(record.merged.some((entry) => entry.id === "B" && entry.conflict === true));
  assert.equal(record.stages.l2.ok, true);
  assert.equal(record.verdict, "delivered");
  await cleanup(repo.dir);
});

test("file-overlap does not gate dispatch in worktree mode, and seam-required does", async () => {
  const repo = await fixture("edges-");
  const host = createStubHost({ repo: repo.dir, replies: approvingReplies(["A", "B"]), });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, inFlight: 2,
      tasks: [
        task("A"),
        task("B", { blockedBy: [{ id: "A", class: "file-overlap" }] }),
      ],
    }),
  });

  const labels = host.calls.map((call) => call.label);
  assert.deepEqual(labels.slice(0, 2), ["leaf:A", "leaf:B"],
    "a file-overlap edge orders merges, never dispatch: " + labels.join(" "));
  assert.equal(record.verdict, "delivered");
  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * Repair rounds are bounded
 * ------------------------------------------------------------------ */

test("a slice that never delivers exhausts its repair rounds and blocks with a reason", async () => {
  const repo = await fixture("rounds-");
  const host = createStubHost({
    repo: repo.dir,
    replies: {
      // Every attempt is rejected by the real delivery gate.
      "leaf:A": null,
      "leaf:A:r1": null,
      "leaf:A:r2": null,
    },
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({ repo: repo, baseSha: repo.baseSha, fixRounds: 2, tasks: [task("A")] }),
  });

  const labels = host.calls.map((call) => call.label);
  assert.deepEqual(labels, ["leaf:A", "leaf:A:r1", "leaf:A:r2"],
    "at most fixRounds repairs after the first attempt: " + labels.join(" "));
  assert.equal(record.tasks[0].state, "blocked");
  assert.equal(record.tasks[0].rounds, 2);
  assert.ok(record.blockers.some((blocker) => blocker.id === "A"));
  assert.notEqual(record.verdict, "delivered");
  await cleanup(repo.dir);
});

test("the return gate bounces a slice whose required evidence is missing, naming the item", async () => {
  const repo = await fixture("evidence-");
  const missingOne = {
    taskId: "A", status: "done", branch: "rope/A", commit: "<sha:A>",
    summary: "done", setup: "setup: no-op",
    evidence: [{ id: "A-E1", result: "pasted output" }],
  };
  const host = createStubHost({
    repo: repo.dir,
    replies: Object.assign(approvingReplies(["A"]), {
      "leaf:A": missingOne,
      // The bounce asks for exactly the missing item, and the repair supplies it.
      "leaf:A:r1": {
        taskId: "A", status: "done", branch: "rope/A", commit: "<sha:A>",
        summary: "done", setup: "setup: no-op",
        evidence: [{ id: "A-E1", result: "pasted output" }, { id: "A-E2", result: "pasted output" }],
      },
    }),
  });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha,
      tasks: [
        task("A", {
          evidence: [
            { id: "A-E1", item: "crash after rename", row: "B4" },
            { id: "A-E2", item: "concurrent get-or-create", row: "B5" },
          ],
        }),
      ],
    }),
  });

  const bounceCall = host.calls.find((call) => call.label === "leaf:A:r1");
  assert.ok(bounceCall, "the missing evidence must bounce the leaf, not the parent");
  assert.match(bounceCall.prompt, /A-E2/, "the bounce must name exactly the missing item");
  assert.ok(!/A-E1:/.test(bounceCall.prompt), "an item already returned must not reopen");
  assert.equal(record.tasks[0].state, "integrated");
  await cleanup(repo.dir);
});

test("an empty stage is reported as skipped, never as passed, and go without a review never delivers", async () => {
  const repo = await fixture("skipped-");
  const host = createStubHost({ repo: repo.dir, replies: approvingReplies(["A"]) });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, tasks: [task("A")],
      checks: [], e2e: [], review: null,
    }),
  });

  assert.equal(record.stages.l2.ran, false);
  assert.equal(record.stages.l2.skipped, true);
  assert.equal(record.stages.l2.ok, true, "an empty stage must not block");
  // The e2e stage sits after the review, so a run whose review was never
  // declared cannot reach it: it is held up, not skipped. "Held up by a prior
  // failure" and "declared empty" must not read the same in the record.
  assert.equal(record.stages.e2e.ran, false);
  assert.equal(record.stages.e2e.skipped, false);
  assert.equal(record.stages.e2e.ok, false);
  assert.equal(record.review.verdict, "skipped");
  assert.notEqual(record.verdict, "delivered",
    "a run with no review gate is not a delivered run");
  assert.ok(!host.calls.some((call) => call.label.startsWith("checks:l2")),
    "an empty stage must not spawn a carrier");
  await cleanup(repo.dir);
});

/* ------------------------------------------------------------------ *
 * The explain pass — the same numbers shape needs, without a spawn
 * ------------------------------------------------------------------ */

test("explain compiles the schedule from the gating classes without spending a leaf", async () => {
  const repo = await fixture("explain-");
  const host = createStubHost({ repo: repo.dir, replies: {} });

  const record = await loadTemplate(templatePath(), {
    globals: host.globals,
    args: greenPlan({
      repo: repo, baseSha: repo.baseSha, explain: true, inFlight: 6,
      tasks: [
        task("S1"),
        // S3 races with S1: it merely prefers to land after S2.
        task("S3", { blockedBy: [{ id: "S2", class: "file-overlap" }] }),
        task("S2", { blockedBy: [{ id: "S1", class: "seam-required" }] }),
        task("S4", { blockedBy: [{ id: "S2", class: "seam-required" }] }),
      ],
    }),
  });

  assert.equal(record.verdict, "explain");
  assert.equal(host.calls.length, 0, "explain must not spawn anything");
  assert.deepEqual(plain(record.schedule.initialReady), ["S1", "S3"]);
  assert.deepEqual(plain(record.schedule.levels.map((level) => level.tasks)), [["S1", "S3"], ["S2"], ["S4"]]);
  assert.equal(record.schedule.maxLevelWidth, 2);
  assert.equal(record.schedule.criticalPath, 3, 'the longest gating chain is three slices deep');
  assert.equal(record.schedule.workersBeyondCriticalPath, true,
    "a window wider than the chain buys nothing, and shape should see that before go");
  assert.deepEqual(
    plain(record.schedule.crossLevelPreferences).map((edge) => [edge.task, edge.after, edge.class]),
    [["S3", "S2", "file-overlap"]],
    "a preference edge orders merges without creating a level",
  );
  assert.equal(record.schedule.levels.length, 3);
  assert.deepEqual(plain(record.declaredStages.l2), ["quick"]);
  await cleanup(repo.dir);
});

test("the branch the gate verified is a real branch a real merge can land", async () => {
  const repo = await fixture("real-merge-");
  const worktree = await addDetachedWorktree(repo.dir, "real-merge-wt");
  try {
    const sha = await commitIn(worktree, "feature.txt", "the slice's work\n", "feat: slice A");
    const host = createStubHost({
      repo: repo.dir,
      hashes: { A: sha },
      replies: Object.assign(approvingReplies(["A"]), {
        "leaf:A": {
          taskId: "A", status: "done", branch: "rope/A", commit: sha,
          summary: "did the work", setup: "setup: no-op", evidence: [],
        },
        // A merge agent that really merges, so the identity chain is proved
        // end to end: gate-created branch -> real merge commit -> record.
        "merge:A": () => {
          git(repo.dir, "merge", "--no-ff", "--no-edit", "rope/A");
          return {
            commit: git(repo.dir, "rev-parse", "rope/A"),
            mergeCommit: git(repo.dir, "rev-parse", "HEAD"),
            headAfter: git(repo.dir, "rev-parse", "main"),
            conflict: false,
            failed: null,
          };
        },
      }),
    });
    host.context.gateCwd = worktree;

    const record = await loadTemplate(templatePath(), {
      globals: host.globals,
      args: greenPlan({ repo: repo, baseSha: repo.baseSha, tasks: [task("A")] }),
    });

    assert.equal(record.verdict, "delivered");
    assert.equal(git(repo.dir, "merge-base", "--is-ancestor", sha, "main").valueOf(), "",
      "the slice commit must be reachable from the target branch");
    assert.equal(git(repo.dir, "rev-parse", "main"), record.merged[0].mergeCommit);
    assert.equal(record.tasks[0].commit, sha, "the record's commit comes from git, not the leaf's claim");
    assert.equal(record.tasks[0].claimMismatch, undefined);
    assert.equal(git(repo.dir, "status", "--porcelain"), "", "the merge leaves a clean tree");
  } finally {
    await cleanup(worktree, repo.dir);
  }
});
