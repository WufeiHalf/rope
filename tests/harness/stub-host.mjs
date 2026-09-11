/**
 * stub-host.mjs — a stub SubagentWorkflow host for offline template tests.
 *
 * Every behaviour the tests rely on carries a citation to the real source it
 * imitates. A stub behaviour with no citation is a finding, and a citation that
 * no longer matches the installed extension is a finding too: these tests are
 * the only fence between a fixed template and a changed host contract.
 *
 * | Stub behaviour                                   | Real source                        |
 * | ------------------------------------------------ | ---------------------------------- |
 * | `text` is the structured payload when a schema   | `host.ts` `toSpawnResult`:         |
 * | was requested, the prose result otherwise        | `text: record.structuredJson ?? record.result` |
 * | a worktree child's prose gains the host's branch | `agent-manager.ts` appends         |
 * | note; a schema'd payload does not                | "Changes saved to branch `…`" to   |
 * |                                                  | `record.result` only               |
 * | a failed spawn is `null`, never a throw          | `runtime.ts` `respond(callId,false)`, "a dead agent is a null in the script" |
 * | a gate rejection is `null` with no readable text | `runtime.ts` `applyGate`, then the same null path |
 * | `gate` runs before the worktree is cleaned up    | `host.ts` `onBeforeWorktreeCleanup` |
 * | `phase`/`log`/`console` are injected, nothing else | `worker-source.ts` sandbox construction |
 * | `budget.spent()` counts output tokens            | `runtime.ts` `budget`           |
 *
 * Determinism is deliberate: no clock, no randomness, no ids that vary between
 * runs, because the template itself may not read any of those.
 */

import { spawnSync } from "node:child_process";

/**
 * Replace `<sha:key>` placeholders in a scripted reply.
 *
 * An explicit hash wins; otherwise a deterministic 40-hex stand-in is derived
 * from the key, so a test that does not care about the real object still reads
 * the same and never depends on a clock or a counter.
 */
function materialize(value, scope) {
  if (typeof value === "string") {
    return value.replace(/<sha:([^>]+)>/g, (_, key) => scope[key] || standInSha(key));
  }
  if (Array.isArray(value)) return value.map((item) => materialize(item, scope));
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) out[key] = materialize(value[key], scope);
    return out;
  }
  return value;
}

function standInSha(key) {
  return (String(key).toLowerCase().replace(/[^0-9a-f]/g, "c") + "0".repeat(40)).slice(0, 40);
}

export function createStubHost(options = {}) {
  const calls = [];
  const phases = [];
  const logs = [];
  const context = { repo: options.repo, gateCwd: undefined, hashes: options.hashes || {} };

  /**
   * The host runs a `gate` command with `pi.exec` in the child's cwd. In tests
   * the gate command is a `bash …` invocation, which is executed for real so the
   * shell scripts under test are exercised rather than described.
   */
  function runGate(command) {
    const result = spawnSync("bash", ["-c", command], {
      cwd: context.gateCwd || context.repo,
      encoding: "utf8",
      timeout: options.gateTimeoutMs || 60_000,
    });
    return { ok: result.status === 0, output: String(result.stdout || "") + String(result.stderr || "") };
  }

  function resolveReply(script, call) {
    if (script === undefined) throw new Error("no scripted reply for " + call.label);
    const value = typeof script === "function" ? script(call) : script;
    if (value === undefined || value === null) return { fail: true };
    return { value: materialize(value, context.hashes) };
  }

  async function agent(prompt, opts = {}) {
    const call = {
      index: calls.length,
      label: opts.label === undefined ? "agent:" + calls.length : opts.label,
      agentType: opts.agentType,
      isolation: opts.isolation,
      phase: opts.phase,
      hasSchema: opts.schema !== undefined,
      hasGate: opts.gate !== undefined,
      prompt: prompt,
      gate: opts.gate,
      gateResult: undefined,
    };
    calls.push(call);
    if (opts.phase !== undefined) phases.push(opts.phase);

    const scripted = options.replies === undefined ? undefined : options.replies[call.label];
    const fallback = options.replies === undefined || options.replies[call.label] !== undefined
      ? undefined
      : options.replies[call.label.replace(/:r\d+$/, "")];
    const outcome = resolveReply(scripted === undefined ? fallback : scripted, call);
    if (outcome.fail === true) return null;

    // gate runs only on a successful child, and for an isolated child before
    // the worktree is cleaned up — the template depends on both.
    if (opts.gate !== undefined) {
      const verdict = runGate(opts.gate);
      call.gateResult = verdict;
      if (!verdict.ok) return null;
    }

    const payload = outcome.value;
    if (opts.schema === undefined) {
      // Prose. A worktree child's prose carries the host's branch note, which
      // is exactly why the template must always request a schema.
      const prose = typeof payload === "string" ? payload : JSON.stringify(payload);
      return {
        ok: true,
        text: opts.isolation === "worktree" && options.branchNote !== false
          ? prose + "\n\n---\nChanges saved to branch `pi-agent-<id>`."
          : prose,
      };
    }
    return { ok: true, text: JSON.stringify(payload) };
  }

  /** A `parallel` that really runs its thunks concurrently and never rejects. */
  async function parallel(thunks) {
    const results = await Promise.all(thunks.map(async (thunk) => {
      try {
        return await thunk();
      } catch {
        return null;
      }
    }));
    return results;
  }

  async function pipeline(items, ...stages) {
    return Promise.all(items.map(async (item, index) => {
      let value = item;
      for (const stage of stages) value = await stage(value, item, index);
      return value;
    }));
  }

  return {
    calls,
    phases,
    logs,
    context,
    globals: {
      agent,
      parallel,
      pipeline,
      phase: (title) => phases.push(title),
      log: (message) => logs.push(message),
      budget: { spent: () => options.spentOutputTokens || 0, remaining: () => Infinity, total: null },
      console: { log() {}, error() {}, warn() {} },
    },
  };
}
