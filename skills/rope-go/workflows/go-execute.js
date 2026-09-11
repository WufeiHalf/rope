export const meta = {
  name: "go-execute",
  description: "Fixed dynamic-go kernel: readiness dispatch, delivery-verified merges, staged gates, freeze review.",
  whenToUse: "Invoked by rope-go through an absolute scriptPath with compiled task data; never edited per issue.",
  phases: [
    { title: "Dispatch" },
    { title: "Merge" },
    { title: "Checks" },
    { title: "E2E" },
    { title: "Review" },
  ],
};

/* ------------------------------------------------------------------ *
 * The plan interface. Authority and rationale live in
 * skills/rope-go/references/execution-template.md — this file validates
 * against it and never redefines it.
 * ------------------------------------------------------------------ */

const PLAN_KEYS = [
  "issue", "baseSha", "mode", "targetBranch", "mainCheckout", "branchPrefix",
  "inFlight", "fixRounds", "setupCommand", "verifyScript", "checkScript",
  "evidenceDir", "tasks", "checks", "e2e", "review", "explain",
];
const TASK_KEYS = ["id", "title", "briefPath", "blockedBy", "ownedFiles", "evidence", "preset"];
const EDGE_KEYS = ["id", "class"];
const EDGE_CLASSES = ["seam-required", "file-overlap", "methodology-order"];
const CHECK_KEYS = ["id", "stage", "command", "scope", "required", "cwd"];
const CHECK_STAGES = ["merge", "l2", "l3", "freeze"];
const E2E_KEYS = ["id", "prompt", "preset", "required"];
const REVIEW_KEYS = ["base", "scanner", "behavior"];
const AXIS_KEYS = ["prompt", "preset"];
const BLOCKER_CLASSES = ["product", "stale-contract", "environment", "host-template", "plan"];

function planError(message) {
  throw new Error("go-execute plan: " + message);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectUnknown(value, allowed, where) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) planError("unknown field " + where + "." + key);
  }
}

function requireString(value, where) {
  if (typeof value !== "string" || value.trim() === "") planError(where + " must be a non-empty string");
  return value;
}

function optionalString(value, where) {
  return value === undefined ? undefined : requireString(value, where);
}

function optionalBoolean(value, where, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") planError(where + " must be a boolean");
  return value;
}

function optionalInteger(value, where, fallback, min, max) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) {
    planError(where + " must be an integer in " + min + ".." + max);
  }
  return value;
}

function eachItem(value, where, validate) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) planError(where + " must be an array");
  value.forEach((item, index) => validate(item, where + "[" + index + "]"));
  return value;
}

function validatePlan(raw) {
  if (!isPlainObject(raw)) planError("args must be an object (it was " + typeof raw + ")");
  rejectUnknown(raw, PLAN_KEYS, "plan");

  const plan = {
    issue: requireString(raw.issue, "args.issue"),
    baseSha: requireString(raw.baseSha, "args.baseSha"),
    mode: raw.mode === undefined ? "worktree" : raw.mode,
    targetBranch: optionalString(raw.targetBranch, "args.targetBranch"),
    mainCheckout: optionalString(raw.mainCheckout, "args.mainCheckout"),
    branchPrefix: raw.branchPrefix === undefined ? "rope/" : requireString(raw.branchPrefix, "args.branchPrefix"),
    setupCommand: optionalString(raw.setupCommand, "args.setupCommand"),
    verifyScript: optionalString(raw.verifyScript, "args.verifyScript"),
    checkScript: optionalString(raw.checkScript, "args.checkScript"),
    evidenceDir: optionalString(raw.evidenceDir, "args.evidenceDir"),
    fixRounds: optionalInteger(raw.fixRounds, "args.fixRounds", 2, 0, 5),
    inFlight: optionalInteger(raw.inFlight, "args.inFlight", 6, 1, 16),
    explain: optionalBoolean(raw.explain, "args.explain", false),
  };

  if (plan.mode !== "worktree" && plan.mode !== "shared") {
    planError("args.mode must be \"worktree\" or \"shared\"");
  }
  if (plan.mode === "worktree") {
    if (plan.targetBranch === undefined) planError("args.targetBranch is required in worktree mode");
    if (plan.mainCheckout === undefined) planError("args.mainCheckout is required in worktree mode");
    if (plan.verifyScript === undefined) planError("args.verifyScript is required in worktree mode");
  } else {
    // One checkout, one index: concurrent leaves would fight over it, so the
    // kernel serializes rather than pretending it can parallelize them.
    plan.inFlight = 1;
    plan.targetBranch = plan.targetBranch === undefined ? "HEAD" : plan.targetBranch;
  }

  if (!Array.isArray(raw.tasks) || raw.tasks.length === 0) planError("args.tasks must be a non-empty array");
  const ids = new Set();
  plan.tasks = raw.tasks.map((task, index) => {
    const where = "args.tasks[" + index + "]";
    if (!isPlainObject(task)) planError(where + " must be an object");
    rejectUnknown(task, TASK_KEYS, where);
    const id = requireString(task.id, where + ".id");
    if (ids.has(id)) planError(where + ".id \"" + id + "\" is a duplicate task id");
    ids.add(id);

    const evidence = eachItem(task.evidence, where + ".evidence", (item, itemWhere) => {
      if (!isPlainObject(item)) planError(itemWhere + " must be an object");
      rejectUnknown(item, ["id", "item", "row"], itemWhere);
      requireString(item.id, itemWhere + ".id");
      requireString(item.item, itemWhere + ".item");
    });
    const seenEvidence = new Set();
    for (const item of evidence) {
      if (seenEvidence.has(item.id)) planError(where + ".evidence id \"" + item.id + "\" is a duplicate");
      seenEvidence.add(item.id);
    }

    const blockedBy = eachItem(task.blockedBy, where + ".blockedBy", (edge, edgeWhere) => {
      if (!isPlainObject(edge)) planError(edgeWhere + " must be an object");
      rejectUnknown(edge, EDGE_KEYS, edgeWhere);
      requireString(edge.id, edgeWhere + ".id");
      if (!EDGE_CLASSES.includes(edge.class)) {
        planError(edgeWhere + ".class must be one of " + EDGE_CLASSES.join(", "));
      }
    });

    return {
      id: id,
      title: requireString(task.title, where + ".title"),
      briefPath: requireString(task.briefPath, where + ".briefPath"),
      branch: plan.branchPrefix + id,
      ownedFiles: eachItem(task.ownedFiles, where + ".ownedFiles", (item, itemWhere) => requireString(item, itemWhere)),
      preset: optionalString(task.preset, where + ".preset"),
      evidence: evidence,
      blockedBy: blockedBy,
    };
  });

  for (const task of plan.tasks) {
    for (const edge of task.blockedBy) {
      if (edge.id === task.id) planError("task \"" + task.id + "\" declares itself as a blocker");
      if (!ids.has(edge.id)) planError("task \"" + task.id + "\".blockedBy names unknown task \"" + edge.id + "\"");
    }
  }
  assertAcyclic(plan.tasks);

  const checkIds = new Set();
  plan.checks = eachItem(raw.checks, "args.checks", (check, where) => {
    if (!isPlainObject(check)) planError(where + " must be an object");
    rejectUnknown(check, CHECK_KEYS, where);
    const id = requireString(check.id, where + ".id");
    if (checkIds.has(id)) planError(where + ".id \"" + id + "\" is a duplicate check id");
    checkIds.add(id);
    if (!CHECK_STAGES.includes(check.stage)) {
      planError(where + ".stage must be one of " + CHECK_STAGES.join(", "));
    }
    requireString(check.command, where + ".command");
    optionalString(check.cwd, where + ".cwd");
    optionalString(check.scope, where + ".scope");
    optionalBoolean(check.required, where + ".required", true);
  }).map((check) => ({
    id: check.id,
    stage: check.stage,
    command: check.command,
    cwd: check.cwd,
    scope: check.scope === undefined ? "repo" : check.scope,
    required: check.required === undefined ? true : check.required,
  }));

  const e2eIds = new Set();
  plan.e2e = eachItem(raw.e2e, "args.e2e", (item, where) => {
    if (!isPlainObject(item)) planError(where + " must be an object");
    rejectUnknown(item, E2E_KEYS, where);
    const id = requireString(item.id, where + ".id");
    if (e2eIds.has(id)) planError(where + ".id \"" + id + "\" is a duplicate e2e id");
    e2eIds.add(id);
    requireString(item.prompt, where + ".prompt");
    optionalString(item.preset, where + ".preset");
    optionalBoolean(item.required, where + ".required", true);
  }).map((item) => ({
    id: item.id,
    prompt: item.prompt,
    preset: item.preset,
    required: item.required === undefined ? true : item.required,
  }));

  if (raw.review !== undefined) {
    if (!isPlainObject(raw.review)) planError("args.review must be an object");
    rejectUnknown(raw.review, REVIEW_KEYS, "args.review");
    const review = {};
    for (const axis of ["scanner", "behavior"]) {
      const value = raw.review[axis];
      if (!isPlainObject(value)) planError("args.review." + axis + " must be an object");
      rejectUnknown(value, AXIS_KEYS, "args.review." + axis);
      review[axis] = {
        prompt: requireString(value.prompt, "args.review." + axis + ".prompt"),
        preset: optionalString(value.preset, "args.review." + axis + ".preset"),
      };
    }
    review.base = raw.review.base === undefined
      ? plan.baseSha
      : requireString(raw.review.base, "args.review.base");
    plan.review = review;
  }

  const needsEvidence = plan.checks.length > 0 || plan.review !== undefined;
  if (needsEvidence && plan.evidenceDir === undefined) {
    planError("args.evidenceDir is required when checks or a review are declared");
  }
  if (plan.checks.length > 0 && plan.checkScript === undefined) {
    planError("args.checkScript is required when any check is declared");
  }

  return plan;
}

function assertAcyclic(tasks) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const mark = new Map();
  const visit = (task, trail) => {
    const seen = mark.get(task.id);
    if (seen === "done") return;
    if (seen === "open") planError("blockedBy cycle through " + trail.concat(task.id).join(" -> "));
    mark.set(task.id, "open");
    for (const edge of task.blockedBy) visit(byId.get(edge.id), trail.concat(task.id));
    mark.set(task.id, "done");
  };
  for (const task of tasks) visit(task, []);
}

/* ------------------------------------------------------------------ *
 * Shell composition. The script runs nothing itself; it writes the
 * command string the host will run as a `gate`.
 * ------------------------------------------------------------------ */

function shellQuote(value) {
  return "'" + String(value).split("'").join("'\\''") + "'";
}

function shellCommand(parts) {
  return parts.filter((part) => part !== undefined && part !== "").join(" ");
}

/* ------------------------------------------------------------------ *
 * Schemas. Every spawn carries one: on this host `text` is
 * `structuredJson ?? result`, and a worktree child's prose carries the
 * host's branch note, so a schema-less spawn hands the kernel prose it
 * cannot parse.
 * ------------------------------------------------------------------ */

const LEAF_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskId", "status", "branch", "commit", "summary", "setup", "evidence"],
  properties: {
    taskId: { type: "string" },
    status: { type: "string", enum: ["done", "blocked"] },
    branch: { type: "string" },
    commit: { type: "string" },
    summary: { type: "string" },
    setup: { type: "string" },
    blockerClass: { type: "string", enum: BLOCKER_CLASSES },
    blockers: { type: "array", items: { type: "string" } },
    evidence: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "result"],
        properties: {
          id: { type: "string" },
          result: { type: "string" },
          path: { type: "string" },
        },
      },
    },
    mapLines: { type: "array", items: { type: "string" } },
    scopeDeviations: { type: "array", items: { type: "string" } },
  },
};

const CARRIER_SCHEMA = {
  type: "object",
  required: ["ack"],
  properties: { ack: { type: "string" } },
};

const MERGE_SCHEMA = {
  type: "object",
  required: ["commit", "mergeCommit", "headAfter"],
  properties: {
    commit: { type: "string" },
    mergeCommit: { type: "string" },
    headAfter: { type: "string" },
    conflict: { type: "boolean" },
    conflictPaths: { type: "array", items: { type: "string" } },
    failed: { type: ["string", "null"] },
  },
};

const AXIS_SCHEMA = {
  type: "object",
  required: ["axis", "verdict", "identity", "findings"],
  properties: {
    axis: { type: "string" },
    verdict: { type: "string", enum: ["approve", "changes_requested", "blocked"] },
    identity: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        required: ["severity", "path", "issue", "fix"],
        properties: {
          severity: { type: "string", enum: ["blocking", "note"] },
          path: { type: "string" },
          line: { type: "integer" },
          issue: { type: "string" },
          fix: { type: "string" },
        },
      },
    },
  },
};

const E2E_SCHEMA = {
  type: "object",
  required: ["id", "status", "evidence"],
  properties: {
    id: { type: "string" },
    status: { type: "string", enum: ["passed", "failed", "blocked"] },
    evidence: { type: "string" },
    detail: { type: "string" },
  },
};

const FIX_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["status", "branch", "commit", "summary"],
  properties: {
    status: { type: "string", enum: ["done", "blocked"] },
    branch: { type: "string" },
    commit: { type: "string" },
    summary: { type: "string" },
    blockers: { type: "array", items: { type: "string" } },
  },
};

/* ------------------------------------------------------------------ *
 * Prompt construction. The kernel owns the delivery contract; the
 * parent owns only what is inside the brief it wrote.
 * ------------------------------------------------------------------ */

function gateCarrierPrompt(what) {
  return "This spawn exists so the host runs a mechanical command as its gate (" + what
    + "). Run no commands and read no files. Answer with ack set to \"ok\".";
}

function deliveryContract(plan, task) {
  const lines = [];
  if (plan.setupCommand) {
    lines.push("- Step 0, before anything else: `" + plan.setupCommand + "`. It is check-first — a fast no-op when the worktree is already testable. An environment failure after it is a blocker, never a code fix round.");
  } else {
    lines.push("- Step 0: this repository declares no setup command.");
  }
  lines.push("- Run the focused tests your brief names, and re-run them after your last change.");
  if (plan.mode === "worktree") {
    lines.push("- Commit everything inside your own worktree. `git status --porcelain` must be empty when you finish: the host commits anything left over to a different branch, and routing will not see it.");
    lines.push("- Then, as your very last write, point your delivery branch at it: `git branch -f " + task.branch + " HEAD`.");
    lines.push("- Report `branch` as `" + task.branch + "` and `commit` as the full SHA printed by `git rev-parse HEAD`. Never report a SHA you have not printed.");
  } else {
    lines.push("- Commit everything on the current branch. `git status --porcelain` must be empty when you finish.");
    lines.push("- Report `branch` as the current branch and `commit` as the full SHA printed by `git rev-parse HEAD`.");
  }
  lines.push("- To stop, return status `\"blocked\"`, a `blockerClass` (" + BLOCKER_CLASSES.join(", ") + "), and the reason. Never invent a branch or a commit to look finished.");
  return lines;
}

function buildLeafPrompt(plan, task, context) {
  const lines = ["You are one slice leaf in a script-driven execution. Your brief is at:", "  " + task.briefPath,
    "Read it first: it is the authority on what to build. This message is the authority on how to deliver.",
    "", "## Delivery contract — fixed, do not reinterpret"];
  lines.push("- Work only inside your own worktree. Do not touch the main checkout.");
  lines.push.apply(lines, deliveryContract(plan, task));
  lines.push("", "## This task");
  lines.push("- task id: " + task.id);
  lines.push("- title: " + task.title);
  lines.push("- delivery branch: " + task.branch);
  if (task.ownedFiles.length > 0) lines.push("- owned files: " + task.ownedFiles.join(", "));
  if (context.integrated.length > 0) {
    lines.push("- already integrated into the main checkout before your worktree was cut:");
    for (const entry of context.integrated) lines.push("  - " + entry.id + " " + entry.branch + " @ " + entry.mergeCommit);
  } else {
    lines.push("- nothing is integrated yet; your worktree is the plan base " + plan.baseSha);
  }
  if (task.evidence.length > 0) {
    lines.push("", "## Required evidence — your return needs one entry per id, with the pasted result or an artifact path");
    for (const item of task.evidence) {
      lines.push("- " + item.id + (item.row ? " [matrix " + item.row + "]" : "") + ": " + item.item);
    }
  }
  lines.push("", "Return the structured payload: taskId, status, branch, commit, summary, setup, one evidence entry per id, blockers, and any map lines your work falsified.");
  return lines.join("\n");
}

function buildRepairPrompt(plan, task, reason, outstanding) {
  const lines = ["Repair round for one slice in a script-driven execution. Your brief is at:", "  " + task.briefPath,
    "Read it first.", "", "## What went wrong", reason, "", "## Fix exactly this, nothing else"];
  for (const line of outstanding) lines.push("- " + line);
  lines.push("", "## Delivery contract — same as before, fixed");
  if (plan.setupCommand) lines.push("- Step 0: `" + plan.setupCommand + "`.");
  if (plan.mode === "worktree") {
    lines.push("- Your predecessor's work is on branch `" + task.branch + "`. Start with `git checkout -B " + task.branch + " " + task.branch + "` inside your worktree, then repair on top of it.");
    lines.push("- Commit everything, leave `git status --porcelain` empty, then `git branch -f " + task.branch + " HEAD` as the last write.");
  } else {
    lines.push("- Repair on top of the current branch; commit everything and leave the tree clean.");
  }
  lines.push("- Report `branch` as `" + task.branch + "` and `commit` as the SHA printed by `git rev-parse HEAD`.");
  lines.push("- Do not reopen anything outside the list above.");
  return lines.join("\n");
}

function buildMergePrompt(plan, branch, claim) {
  return [
    "You are the merge queue for a script-driven execution. Do exactly this and nothing more.",
    "",
    "Repository root: " + plan.mainCheckout,
    "Target branch: " + plan.targetBranch,
    "Merge in: `" + branch + "`" + (claim ? " (the slice reported commit " + claim + ")" : ""),
    "",
    "Steps, in order:",
    "1. `cd " + plan.mainCheckout + "`. Run `git status --porcelain`. If it is not empty, report `failed` as `main-checkout-dirty` with the offending paths. Do not stash, commit, or clean anything.",
    "2. `git rev-parse --verify refs/heads/" + branch + "` — if this fails, report `failed` as `missing-branch`.",
    "3. `git merge --no-ff --no-edit " + branch + "`.",
    "4. On conflict: resolve every conflicted path in favour of the slice being merged — its brief and commits are the primary intent source, and the already-landed behaviour is kept wherever the slice does not contradict it. `git add` each resolved path, then `git commit --no-edit`. Never use `--ours`/`--theirs` wholesale, never `git merge --abort`, never `git reset`.",
    "5. Report `commit` = `git rev-parse " + branch + "`, `mergeCommit` = `git rev-parse HEAD`, `headAfter` = `git rev-parse " + plan.targetBranch + "`, and whether a conflict was resolved.",
    "",
    "Never push, never rebase, never delete or force-move a branch, and never edit product code beyond conflict resolution. If a step cannot be completed, report it in `failed` and change nothing further. If the branch is already merged, report `failed` as `already-merged`.",
  ].join("\n");
}

function buildReviewPrompt(plan, axis, config, delta) {
  const lines = [config.prompt, "", "## Facts"];
  lines.push("- repository root: " + plan.mainCheckout);
  lines.push("- frozen HEAD under review: " + headSha);
  lines.push("- diff command: `git diff " + (delta ? delta.fromSha + "..." + delta.headSha : plan.review.base + "...HEAD") + " -- . ':(exclude)*lock*' ':(exclude)*.snap' ':(exclude)dist/'`");
  if (delta) {
    lines.push("- this is a **delta re-review**: only commit " + delta.headSha + " on top of " + delta.fromSha + " is new. Report findings in that range only; do not repeat the earlier review.");
  }
  lines.push("- your axis: " + axis);
  lines.push("", "Read-only on code. Report `identity` as the preset and model you are running as, `verdict` as one of approve / changes_requested / blocked, and every finding as {severity blocking|note, path, line, issue, fix}.");
  return lines.join("\n");
}

function buildFixPrompt(plan, findings, round, branch) {
  const lines = [
    "You are the single fix implementer for one script-driven execution. Fix the blocking review findings below, exactly as written, and nothing else.",
    "",
    "Delivery branch: `" + branch + "` (your worktree is cut from the frozen review HEAD)",
    "",
    "## Blocking findings — verbatim, do not re-explore and do not re-judge",
  ];
  for (const finding of findings) {
    lines.push("- " + finding.path + (finding.line === undefined ? "" : ":" + finding.line) + " — " + finding.issue);
    lines.push("  fix: " + finding.fix);
  }
  lines.push("", "## Contract");
  lines.push("1. Change only what these findings require. Add no acceptance requirements, refactor nothing beyond the finding, and rewrite nothing that already passes.");
  lines.push("2. Re-run the tests covering the paths you touched.");
  lines.push("3. Commit everything; `git status --porcelain` must be empty.");
  lines.push("4. Then `git branch -f " + branch + " HEAD` as your last write.");
  lines.push("5. Report status, branch, commit = the SHA printed by `git rev-parse HEAD`, and a summary naming each finding and how it was fixed. A finding you cannot fix makes this round `blocked`, never a partial fix reported as done.");
  return lines.join("\n");
}

function buildE2ePrompt(plan, item) {
  return item.prompt
    + "\n\n## Facts\n- repository root: " + plan.mainCheckout
    + "\n- e2e item id: " + item.id
    + "\n\nRun this against the real environment, not a mock. Report `status` as passed, failed, or blocked, with the exact command or steps in `evidence` and the observed result in `detail`. A status you did not obtain is `blocked`, never `passed`.";
}

/* ------------------------------------------------------------------ *
 * Kernel state
 * ------------------------------------------------------------------ */

const plan = validatePlan(args);
log("go-execute: " + plan.tasks.length + " tasks, " + plan.checks.length + " checks, mode " + plan.mode
  + ", inFlight " + plan.inFlight + ", fixRounds " + plan.fixRounds);

const GATING_CLASSES = plan.mode === "shared"
  ? ["seam-required", "file-overlap"]
  : ["seam-required"];

if (plan.explain) {
  // A compile-only pass: the caller gets the schedule without spending a leaf.
  return {
    verdict: "explain",
    issue: plan.issue,
    mode: plan.mode,
    schedule: compileSchedule(),
    declaredStages: {
      merge: plan.checks.filter((check) => check.stage === "merge").map((check) => check.id),
      l2: plan.checks.filter((check) => check.stage === "l2").map((check) => check.id),
      l3: plan.checks.filter((check) => check.stage === "l3").map((check) => check.id),
      freeze: plan.checks.filter((check) => check.stage === "freeze").map((check) => check.id),
      e2e: plan.e2e.map((item) => item.id),
      review: plan.review === undefined ? "not-declared" : ["scanner", "behavior"],
    },
  };
}

const state = new Map();
for (const task of plan.tasks) state.set(task.id, { state: "pending", rounds: 0 });

const integrated = [];
const blockers = [];
const bounced = new Map();
const neverReady = [];
const checkRecords = [];
const running = new Map();
const settled = [];
let peakInFlight = 0;
let headSha = plan.baseSha;
let e2eResults = [];
let suggestDowngrade = null;

function record(blocker) {
  blockers.push({
    id: blocker.id === undefined ? null : blocker.id,
    class: blocker.class === undefined ? "product" : blocker.class,
    message: blocker.message,
  });
}

function blockersSatisfied(task) {
  return task.blockedBy.every((edge) => {
    if (!GATING_CLASSES.includes(edge.class)) return true;
    return integrated.some((entry) => entry.id === edge.id);
  });
}

function readyTasks() {
  return plan.tasks.filter((task) => state.get(task.id).state === "pending" && blockersSatisfied(task));
}

function integratedContext() {
  return integrated.map((entry) => ({ id: entry.id, branch: entry.branch, mergeCommit: entry.mergeCommit }));
}

/*
 * The same gating classes that schedule the run answer shape's questions about
 * it: how many slices can start immediately, how wide the graph ever gets, and
 * how many sequential levels the longest chain forces. Computed here, so the
 * number shape reports is the number the executor will actually take.
 */
function compileSchedule() {
  const byId = new Map(plan.tasks.map((task) => [task.id, task]));
  const depth = new Map();
  const computeDepth = (task) => {
    if (depth.has(task.id)) return depth.get(task.id);
    let best = 0;
    for (const edge of task.blockedBy) {
      if (!GATING_CLASSES.includes(edge.class)) continue;
      best = Math.max(best, computeDepth(byId.get(edge.id)) + 1);
    }
    depth.set(task.id, best);
    return best;
  };
  for (const task of plan.tasks) computeDepth(task);

  const levels = [];
  for (const task of plan.tasks) {
    const level = depth.get(task.id);
    if (levels[level] === undefined) levels[level] = [];
    levels[level].push(task.id);
  }
  const widths = levels.map((level) => level.length);
  let widest = 0;
  for (const width of widths) widest = Math.max(widest, width);

  const heldByPreference = [];
  for (const task of plan.tasks) {
    for (const edge of task.blockedBy) {
      if (!GATING_CLASSES.includes(edge.class)) {
        heldByPreference.push({ task: task.id, after: edge.id, class: edge.class });
      }
    }
  }

  return {
    tasks: plan.tasks.length,
    gatingClasses: GATING_CLASSES,
    initialReady: plan.tasks.filter((task) => task.blockedBy.every((edge) => !GATING_CLASSES.includes(edge.class))).map((task) => task.id),
    levels: levels.map((level, index) => ({ level: index, tasks: level })),
    maxLevelWidth: widest,
    criticalPath: levels.length,
    inFlight: plan.inFlight,
    workersBeyondCriticalPath: plan.inFlight > levels.length,
    crossLevelPreferences: heldByPreference,
  };
}

/* ------------------------------------------------------------------ *
 * Leaf execution
 * ------------------------------------------------------------------ */

function deliveryVerdictPath(taskId, round) {
  return plan.evidenceDir + "/delivery/" + taskId + "-r" + round + ".json";
}

function deliveryGate(task, round) {
  if (plan.verifyScript === undefined) return undefined;
  const parts = ["bash", shellQuote(plan.verifyScript), "--verdict", shellQuote(deliveryVerdictPath(task.id, round))];
  if (plan.mode === "worktree") {
    parts.push("--branch", shellQuote(task.branch), "--base", shellQuote(plan.baseSha), "--recover-dirty");
  } else {
    parts.push("--commit", shellQuote("HEAD"));
  }
  return shellCommand(parts);
}

function launchTask(task) {
  const entry = state.get(task.id);
  const round = entry.rounds;
  const repair = bounced.get(task.id);
  const prompt = entry.reason === undefined
    ? buildLeafPrompt(plan, task, { integrated: integratedContext() })
    : buildRepairPrompt(plan, task, entry.reason, repair === undefined ? [] : repair);

  const options = {
    label: "leaf:" + task.id + (round > 0 ? ":r" + round : ""),
    phase: "Dispatch",
    schema: LEAF_SCHEMA,
    gate: deliveryGate(task, round),
  };
  if (task.preset !== undefined) options.agentType = task.preset;
  if (plan.mode === "worktree") options.isolation = "worktree";

  entry.state = "running";
  entry.reason = undefined;
  const promise = agent(prompt, options)
    .then((result) => { settled.push({ task: task, round: round, result: result, threw: null }); })
    .catch((error) => {
      settled.push({
        task: task,
        round: round,
        result: null,
        threw: error && error.message ? String(error.message) : String(error),
      });
    })
    .then(() => { running.delete(task.id); });
  running.set(task.id, { promise: promise });
  if (running.size > peakInFlight) peakInFlight = running.size;
}

function parsePayload(result) {
  if (result === null || result === undefined || !result.ok) return null;
  if (typeof result.text !== "string" || result.text.trim() === "") return null;
  try {
    return JSON.parse(result.text);
  } catch {
    return null;
  }
}

/** ADR 0011 Return Gate: a table check, never a review. */
function reconcileEvidence(task, payload) {
  const returned = new Map();
  for (const row of payload.evidence === undefined ? [] : payload.evidence) {
    if (row !== null && typeof row === "object" && typeof row.id === "string") returned.set(row.id, row);
  }
  const outstanding = [];
  for (const item of task.evidence) {
    const row = returned.get(item.id);
    if (row === undefined || typeof row.result !== "string" || row.result.trim() === "") outstanding.push(item);
  }
  return outstanding;
}

function repairOrBlock(task, blockerClass, reason, outstanding) {
  const entry = state.get(task.id);
  if (entry.rounds >= plan.fixRounds) {
    entry.state = "blocked";
    entry.reason = reason;
    record({ id: task.id, class: blockerClass, message: reason + " — repair rounds exhausted" });
    return;
  }
  entry.rounds += 1;
  entry.state = "pending";
  entry.reason = reason;
  bounced.set(task.id, outstanding.length > 0 ? outstanding : [reason]);
}

async function handleSettled(item) {
  const task = item.task;
  const entry = state.get(task.id);
  const payload = parsePayload(item.result);

  if (payload === null) {
    // The host returns null for a gate rejection, a crashed child, and a schema
    // failure alike, so the kernel names the evidence path it can predict
    // instead of guessing which one it was.
    const reason = item.threw !== null
      ? "the leaf did not finish: " + item.threw
      : "the leaf produced no verifiable delivery; its verdict file, when one was written, is at " + deliveryVerdictPath(task.id, item.round);
    repairOrBlock(task, "product", reason, ["Satisfy the delivery contract: commit everything, leave the tree clean, point your delivery branch at your final commit."]);
    return;
  }
  if (payload.taskId !== task.id) {
    repairOrBlock(task, "product", "the leaf reported taskId " + payload.taskId + " while briefed for " + task.id, []);
    return;
  }
  if (payload.status === "blocked") {
    const blockerClass = BLOCKER_CLASSES.includes(payload.blockerClass) ? payload.blockerClass : "product";
    const message = (payload.blockers === undefined ? [] : payload.blockers).join("; ") || payload.summary || "blocked without a reason";
    if (blockerClass === "product") {
      repairOrBlock(task, blockerClass, message, ["Resolve the blocker and deliver, or report a blocker class that explains why this is not a code problem."]);
      return;
    }
    entry.state = "blocked";
    entry.reason = message;
    record({ id: task.id, class: blockerClass, message: message });
    return;
  }

  const outstanding = reconcileEvidence(task, payload);
  if (outstanding.length > 0) {
    repairOrBlock(task, "product", "the return is missing required evidence", outstanding.map((item) => item.id + ": " + item.item));
    return;
  }

  entry.setup = payload.setup;
  entry.summary = payload.summary;
  entry.mapLines = payload.mapLines === undefined ? [] : payload.mapLines;
  entry.scopeDeviations = payload.scopeDeviations === undefined ? [] : payload.scopeDeviations;
  entry.claim = payload.commit;
  await mergeOne(task);
}

/* ------------------------------------------------------------------ *
 * Merge queue — serial, one branch at a time, in landing order.
 * ------------------------------------------------------------------ */

async function mergeOne(task) {
  const entry = state.get(task.id);

  if (plan.mode !== "worktree") {
    // Shared mode: the verified commit IS the integration. The host verified
    // `HEAD` when the leaf settled, and the record's authority is the verdict
    // file at the deterministic path.
    entry.state = "integrated";
    entry.branch = plan.targetBranch;
    entry.commit = entry.claim;
    entry.mergeCommit = entry.claim;
    entry.verdictPath = deliveryVerdictPath(task.id, entry.rounds);
    integrated.push({ id: task.id, branch: plan.targetBranch, commit: entry.claim, mergeCommit: entry.claim, conflict: false });
    headSha = entry.claim === undefined ? headSha : entry.claim;
    return;
  }

  const result = await agent(buildMergePrompt(plan, task.branch, entry.claim), {
    label: "merge:" + task.id,
    phase: "Merge",
    schema: MERGE_SCHEMA,
  });
  const payload = parsePayload(result);
  if (payload === null) {
    repairOrBlock(task, "product", "the merge agent returned no usable result for " + task.branch, [
      "Re-deliver the branch: it could not be merged.",
    ]);
    return;
  }
  if (payload.failed !== null && payload.failed !== undefined) {
    repairOrBlock(task, "product", "the merge agent failed for " + task.branch + ": " + payload.failed, [
      "Re-deliver the branch so it merges cleanly: " + payload.failed,
    ]);
    return;
  }

  entry.state = "integrated";
  entry.commit = payload.commit;
  entry.mergeCommit = payload.mergeCommit;
  entry.claimMismatch = entry.claim !== undefined && payload.commit !== undefined && entry.claim !== payload.commit
    ? entry.claim
    : undefined;
  if (typeof payload.headAfter === "string" && payload.headAfter.trim() !== "") headSha = payload.headAfter;
  integrated.push({
    id: task.id,
    branch: task.branch,
    commit: payload.commit,
    mergeCommit: payload.mergeCommit,
    conflict: payload.conflict === true,
    conflictPaths: payload.conflictPaths === undefined ? [] : payload.conflictPaths,
  });
}

/* ------------------------------------------------------------------ *
 * Staged checks. The script has no shell, so the host runs the declared
 * command as a gate and its exit code is the verdict; per-check detail
 * lands in the evidence directory, which the parent can read.
 * ------------------------------------------------------------------ */

function integratedCommitKey() {
  const commits = integrated.map((entry) => String(entry.mergeCommit === undefined ? entry.commit : entry.mergeCommit).slice(0, 12));
  commits.sort();
  return commits.length === 0 ? "none" : commits.join("-");
}

function scopeKey(scope) {
  return scope + "@" + integratedCommitKey();
}

async function runStageChecks(stage) {
  const batch = plan.checks.filter((check) => check.stage === stage);
  if (batch.length === 0) return { ran: false, ok: false, reason: "no " + stage + " checks declared" };

  const specs = batch.map((check) => ({
    id: check.id,
    command: check.command,
    scope: check.scope,
    cwd: check.cwd,
    required: check.required,
    key: scopeKey(check.scope),
    outPath: plan.evidenceDir + "/" + scopeKey(check.scope) + "/" + check.id + ".out",
    detailPath: plan.evidenceDir + "/" + scopeKey(check.scope) + "/" + check.id + ".json",
  }));
  const result = await agent(gateCarrierPrompt(stage + " check batch"), {
    label: "checks:" + stage,
    phase: "Checks",
    schema: CARRIER_SCHEMA,
    gate: shellCommand([
      "bash", shellQuote(plan.checkScript),
      "--evidence", shellQuote(plan.evidenceDir),
      "--batch", shellQuote(JSON.stringify(specs)),
    ]),
  });
  const passed = result !== null;
  for (const spec of specs) {
    checkRecords.push({
      id: spec.id,
      stage: stage,
      scope: spec.scope,
      key: spec.key,
      required: spec.required,
      ok: passed || !spec.required,
      verdictFile: spec.detailPath,
      outputFile: spec.outPath,
    });
  }
  if (!passed) {
    const requiredIds = batch.filter((check) => check.required).map((check) => check.id);
    record({
      id: null,
      class: "product",
      message: "stage " + stage + " failed: a required check exited non-zero (" + requiredIds.join(", ") + "); evidence under " + plan.evidenceDir + "/" + scopeKey("stage-" + stage),
    });
    return { ran: true, ok: false, reason: "one or more required " + stage + " checks exited non-zero: " + requiredIds.join(", ") };
  }
  return { ran: true, ok: true, reason: "every required " + stage + " check exited zero" };
}

/* ------------------------------------------------------------------ *
 * E2E and review
 * ------------------------------------------------------------------ */

async function runE2e() {
  if (plan.e2e.length === 0) return [];
  const results = await parallel(plan.e2e.map((item) => () => {
    const options = { label: "e2e:" + item.id, phase: "E2E", schema: E2E_SCHEMA };
    if (item.preset !== undefined) options.agentType = item.preset;
    return agent(buildE2ePrompt(plan, item), options);
  }));
  return plan.e2e.map((item, index) => {
    const payload = parsePayload(results[index]);
    if (payload === null) {
      return { id: item.id, status: "blocked", evidence: "(no usable return)", required: item.required };
    }
    return { id: item.id, status: payload.status, evidence: payload.evidence, detail: payload.detail, required: item.required };
  });
}

function worstVerdict(verdicts) {
  let worst = "approve";
  for (const verdict of verdicts) {
    if (verdict === "blocked") return "blocked";
    if (verdict === "changes_requested") worst = "changes_requested";
  }
  return worst;
}

async function runAxis(axis, delta) {
  const config = plan.review[axis];
  const options = { label: "review:" + axis + (delta === undefined ? "" : ":delta"), phase: "Review", schema: AXIS_SCHEMA };
  if (config.preset !== undefined) options.agentType = config.preset;
  const payload = parsePayload(await agent(buildReviewPrompt(plan, axis, config, delta), options));
  if (payload === null) return { axis: axis, verdict: "blocked", identity: "(no usable return)", findings: [] };
  return { axis: axis, verdict: payload.verdict, identity: payload.identity, findings: payload.findings === undefined ? [] : payload.findings };
}

async function runReview() {
  if (plan.review === undefined) {
    return { verdict: "skipped", axes: [], rounds: 0, findings: [], reason: "the plan declares no review" };
  }
  const axes = (await parallel([() => runAxis("scanner", undefined), () => runAxis("behavior", undefined)]))
    .filter((axis) => axis !== null && axis !== undefined);

  let verdict = worstVerdict(axes.map((axis) => axis.verdict));
  let findings = axes.flatMap((axis) => axis.findings);
  let rounds = 0;
  const fixes = [];
  let delta;

  while (verdict !== "approve" && rounds < plan.fixRounds) {
    const blocking = findings.filter((finding) => finding.severity === "blocking");
    if (blocking.length === 0) break;
    rounds += 1;
    const branch = plan.branchPrefix + "review-fix-" + rounds;
    const fixOptions = {
      label: "fix:" + rounds,
      phase: "Review",
      schema: FIX_SCHEMA,
    };
    if (plan.mode === "worktree") {
      fixOptions.isolation = "worktree";
      fixOptions.gate = shellCommand([
        "bash", shellQuote(plan.verifyScript),
        "--verdict", shellQuote(plan.evidenceDir + "/delivery/review-fix-" + rounds + ".json"),
        "--branch", shellQuote(branch), "--base", shellQuote(headSha), "--recover-dirty",
      ]);
    }
    const fix = parsePayload(await agent(buildFixPrompt(plan, blocking, rounds, branch), fixOptions));
    if (fix === null || fix.status !== "done") {
      record({ id: null, class: "product", message: "review fix round " + rounds + " produced no usable fix" });
      break;
    }

    if (plan.mode === "worktree") {
      const merged = parsePayload(await agent(buildMergePrompt(plan, branch, fix.commit), {
        label: "merge:fix" + rounds,
        phase: "Merge",
        schema: MERGE_SCHEMA,
      }));
      if (merged === null || (merged.failed !== null && merged.failed !== undefined) || typeof merged.headAfter !== "string") {
        record({ id: null, class: "product", message: "review fix round " + rounds + " did not merge" });
        break;
      }
      delta = { fromSha: headSha, headSha: merged.headAfter };
      fixes.push({ round: rounds, branch: branch, commit: fix.commit, mergeCommit: merged.mergeCommit });
      headSha = merged.headAfter;
    } else {
      delta = { fromSha: headSha, headSha: headSha };
    }

    const reAxes = (await parallel([() => runAxis("scanner", delta), () => runAxis("behavior", delta)]))
      .filter((axis) => axis !== null && axis !== undefined);
    findings = reAxes.flatMap((axis) => axis.findings);
    verdict = worstVerdict(reAxes.map((axis) => axis.verdict));
    if (verdict === "blocked") break;
  }

  return {
    verdict: verdict,
    axes: axes.map((axis) => ({ axis: axis.axis, verdict: axis.verdict, identity: axis.identity })),
    rounds: rounds,
    fixes: fixes,
    findings: findings,
    blockingRemaining: findings.filter((finding) => finding.severity === "blocking").length,
  };
}

/* ------------------------------------------------------------------ *
 * The scheduling loop: refill the frontier, let nothing but a merge
 * consume a freed slot, and never read "nothing is running" as done.
 * ------------------------------------------------------------------ */

phase("Dispatch");

while (true) {
  while (settled.length > 0) await handleSettled(settled.shift());

  let launched = true;
  while (launched) {
    launched = false;
    for (const task of readyTasks()) {
      if (running.size >= plan.inFlight) break;
      launchTask(task);
      launched = true;
    }
  }

  if (running.size === 0) break;
  await Promise.race(Array.from(running.values(), (entry) => entry.promise));
}

for (const task of plan.tasks) {
  if (state.get(task.id).state === "pending") neverReady.push(task.id);
}

const integratedCount = plan.tasks.filter((task) => state.get(task.id).state === "integrated").length;
const everyTaskIntegrated = integratedCount === plan.tasks.length;

/* ------------------------------------------------------------------ *
 * Stages, each advancing only on the previous one's success
 * ------------------------------------------------------------------ */

let stages = everyTaskIntegrated
  ? { merge: { ran: true, ok: true, skipped: false, reason: integratedCount + " integrations landed", conflicts: integrated.filter((entry) => entry.conflict === true).length } }
  : { merge: { ran: true, ok: false, skipped: false, reason: integratedCount + " of " + plan.tasks.length + " planned tasks integrated" } };

/** A stage with no required items is skipped and does not block; a stage held up by a prior failure never reads as skipped. */
function skippedStage(stage) {
  return { ran: false, ok: true, skipped: true, reason: "no required " + stage + " items declared" };
}

function blockedByPriorStage(stage, prior) {
  return { ran: false, ok: false, skipped: false, reason: prior + " did not pass" };
}

/** A stage held up by an unfinished integration never reads as skipped. */
function blockedByIntegration(stage, integratedCount, plannedCount) {
  return {
    ran: false,
    ok: false,
    skipped: false,
    reason: "not every planned task is integrated (" + integratedCount + " of " + plannedCount + ")",
  };
}

if (!everyTaskIntegrated) {
  stages.l2 = blockedByIntegration("l2", integratedCount, plan.tasks.length);
  stages.l3 = blockedByIntegration("l3", integratedCount, plan.tasks.length);
  stages.e2e = blockedByIntegration("e2e", integratedCount, plan.tasks.length);
  stages.freeze = blockedByIntegration("freeze", integratedCount, plan.tasks.length);
  log("stopping before L2: " + integratedCount + "/" + plan.tasks.length + " tasks integrated");
} else {
  const mergeStage = await runStageChecks("merge");
  if (mergeStage.ran) log("post-merge warnings: " + mergeStage.reason);

  const l2 = await runStageChecks("l2");
  stages.l2 = l2.ran ? { ran: true, ok: l2.ok, skipped: false, reason: l2.reason } : skippedStage("l2");

  if (stages.l2.ok) {
    const l3 = await runStageChecks("l3");
    stages.l3 = l3.ran ? { ran: true, ok: l3.ok, skipped: false, reason: l3.reason } : skippedStage("l3");
  } else {
    stages.l3 = blockedByPriorStage("l3", "L2");
  }

  if (stages.l3.ok) {
    e2eResults = await runE2e();
    const requiredE2e = e2eResults.filter((item) => item.required);
    stages.e2e = e2eResults.length === 0
      ? { ran: false, ok: true, skipped: true, reason: "no e2e items declared" }
      : { ran: true, ok: requiredE2e.every((item) => item.status === "passed"), skipped: false, reason: requiredE2e.map((item) => item.id + ":" + item.status).join(", ") };
  } else {
    stages.e2e = blockedByPriorStage("e2e", "L3");
  }

  if (stages.e2e.ok) {
    const freeze = await runStageChecks("freeze");
    stages.freeze = freeze.ran ? { ran: true, ok: freeze.ok, skipped: false, reason: freeze.reason } : skippedStage("freeze");
  } else {
    stages.freeze = blockedByPriorStage("freeze", "the e2e stage");
  }
}

const stagesOk = everyTaskIntegrated
  && [stages.l2, stages.l3, stages.e2e, stages.freeze].every((stage) => stage.ok);

const review = stagesOk
  ? await runReview()
  : { verdict: "skipped", axes: [], rounds: 0, findings: [], reason: "a required stage did not pass" };

if (review.verdict === "changes_requested" || review.verdict === "blocked") {
  record({
    id: null,
    class: "product",
    message: "end-of-issue review returned " + review.verdict + " after " + review.rounds + " fix round(s) with " + review.blockingRemaining + " blocking finding(s) remaining",
  });
}

const delivered = everyTaskIntegrated && stagesOk && review.verdict === "approve";
const blockedTaskCount = plan.tasks.filter((task) => state.get(task.id).state === "blocked").length;
const templateTrouble = blockers.some((blocker) => blocker.class === "environment" || blocker.class === "host-template");

if (!delivered && (templateTrouble || blockedTaskCount >= 2)) {
  suggestDowngrade = {
    reason: templateTrouble
      ? "the environment or the template rejected repeated attempts; more rounds will repeat the same failure"
      : "two or more slices exhausted their repair rounds; the remaining work is better taken over than retried",
    tasks: plan.tasks.filter((task) => state.get(task.id).state !== "integrated").map((task) => task.id),
  };
}

return {
  verdict: delivered ? "delivered" : (integratedCount === 0 ? "stopped" : "partial"),
  issue: plan.issue,
  baseSha: plan.baseSha,
  headSha: headSha,
  tasks: plan.tasks.map((task) => {
    const entry = state.get(task.id);
    return {
      id: task.id,
      state: entry.state === "pending" ? "not-started" : entry.state,
      branch: entry.branch,
      commit: entry.commit,
      mergeCommit: entry.mergeCommit,
      rounds: entry.rounds,
      reason: entry.reason,
      claimMismatch: entry.claimMismatch,
      setup: entry.setup,
      summary: entry.summary,
      scopeDeviations: entry.scopeDeviations,
      mapLines: entry.mapLines,
    };
  }),
  merged: integrated,
  neverReady: neverReady,
  blockers: blockers,
  checks: checkRecords,
  stages: stages,
  e2e: e2eResults,
  review: review,
  concurrency: { inFlight: plan.inFlight, peak: peakInFlight },
  tokens: { output: budget.spent() },
  suggestDowngrade: suggestDowngrade,
};
