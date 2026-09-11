/**
 * fixture-plan.mjs — plan builders for the offline template tests.
 *
 * Kept separate so a test reads as the behaviour it checks, not as a pile of
 * plan plumbing. Defaults are deliberately minimal: one task, no checks, no
 * review — each test adds only what it is about.
 */

import { templatePath } from "./tmp-repo.mjs";

export { templatePath };

/** A check spec with a trivially-passing command. */
export function passCheck(id, stage, overrides = {}) {
  return Object.assign({ id: id, stage: stage, command: "true" }, overrides);
}

/** A check spec that always fails. */
export function failCheck(id, stage, overrides = {}) {
  return Object.assign({ id: id, stage: stage, command: "exit 3" }, overrides);
}

export function task(id, overrides = {}) {
  return Object.assign({
    id: id,
    title: "slice " + id,
    briefPath: "/tmp/briefs/" + id + ".md",
  }, overrides);
}

/**
 * A plan whose every stage is declared and passes, and whose review approves.
 * Pass `review: null` to declare no review at all — the kernel must then record
 * a skip rather than a pass.
 */
export function greenPlan(args) {
  const repo = args.repo;
  return {
    issue: args.issue || "fixture",
    baseSha: args.baseSha,
    mode: args.mode === undefined ? "worktree" : args.mode,
    targetBranch: "main",
    mainCheckout: repo.dir,
    verifyScript: args.verifyScript === undefined ? repo.verifyScript : args.verifyScript,
    checkScript: args.checkScript === undefined ? repo.checkScript : args.checkScript,
    evidenceDir: repo.evidenceDir,
    inFlight: args.inFlight === undefined ? 4 : args.inFlight,
    fixRounds: args.fixRounds === undefined ? 2 : args.fixRounds,
    setupCommand: args.setupCommand,
    explain: args.explain,
    branchPrefix: args.branchPrefix,
    tasks: args.tasks,
    checks: args.checks === undefined ? [passCheck("quick", "l2")] : args.checks,
    e2e: args.e2e,
    review: args.review === null
      ? undefined
      : args.review === undefined
        ? {
          scanner: { prompt: "Scan the diff.", preset: "rope-explore" },
          behavior: { prompt: "Walk the matrix.", preset: "rope-reviewer" },
        }
        : args.review,
  };
}

/** The default approving replies for a green run, keyed by the kernel's labels. */
export function approvingReplies(taskIds) {
  const replies = {};
  for (const id of taskIds) {
    replies["leaf:" + id] = {
      taskId: id,
      status: "done",
      branch: "rope/" + id,
      commit: "<sha:" + id + ">",
      summary: "implemented " + id,
      setup: "setup: no-op",
      evidence: [],
    };
    replies["merge:" + id] = {
      commit: "<sha:" + id + ">",
      mergeCommit: "<sha:" + id + ">",
      headAfter: "<sha:" + id + ">",
      conflict: false,
      failed: null,
    };
  }
  replies["checks:merge"] = { ack: "ok" };
  replies["checks:l2"] = { ack: "ok" };
  replies["checks:l3"] = { ack: "ok" };
  replies["checks:freeze"] = { ack: "ok" };
  replies["review:scanner"] = { axis: "scanner", verdict: "approve", identity: "stub-scanner", findings: [] };
  replies["review:behavior"] = { axis: "behavior", verdict: "approve", identity: "stub-reviewer", findings: [] };
  return replies;
}
