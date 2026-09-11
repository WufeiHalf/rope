/**
 * load-workflow.mjs — evaluate a real workflow-script source the way the host does.
 *
 * Fidelity note. The host does not `import` a workflow script: it reads the
 * file, strips the single `export` keyword from `export const meta`, and
 * compiles the remainder as the body of an async function inside a `vm`
 * context whose sandbox is exactly
 *
 *   { agent, parallel, pipeline, phase, log, workflow, budget, console,
 *     meta, args }
 *
 * with `codeGeneration: { strings: false }` and a determinism prelude that
 * makes Date.now(), Math.random() and an argless new Date() throw.
 * Sources: pi-subagents `src/workflow/worker-source.ts` (sandbox, PRELUDE,
 * `new vm.Script("(async () => {" + PRELUDE + "\n" + body + "\n})()")`) and
 * `src/workflow/saved.ts` (`validateScript` / meta extraction).
 *
 * So the only faithful way to test a template offline is the same one: read the
 * source, compile it there, and hand it stubs.
 */

import { readFile } from "node:fs/promises";
import vm from "node:vm";

/** Mirrors the host's determinism prelude: a journaled run is replayed by prefix. */
const DETERMINISM_PRELUDE = `
  const __noDeterminism = function (what) {
    throw new Error(what + " is unavailable in workflow scripts (breaks resume).");
  };
  Date.now = function () { return __noDeterminism("Date.now()"); };
  Math.random = function () { return __noDeterminism("Math.random()"); };
  const __RealDate = Date;
  globalThis.Date = function () { return __noDeterminism("new Date()"); };
  globalThis.Date.now = Date.now;
`;

/** The host reads the file and drops the one `export` on the meta declaration. */
export function stripMetaExport(source) {
  if (!/^\s*export\s+const\s+meta\s*=/.test(source)) {
    throw new Error("workflow source must declare `export const meta = {...}` at the top level");
  }
  return source.replace(/^(\s*)export(\s+const\s+meta\s*=)/m, "$1$2");
}

/** Evaluate a workflow source against injected host globals and return its result. */
export async function loadWorkflow(source, { globals, args } = {}) {
  const body = stripMetaExport(source);
  const sandbox = Object.assign(
    {
      agent: async () => {
        throw new Error("agent() was not stubbed");
      },
      parallel: null,
      pipeline: null,
      phase: () => {},
      log: () => {},
      workflow: async () => {
        throw new Error("workflow() is not used by this template");
      },
      budget: { spent: () => 0, remaining: () => Infinity, total: null },
      console: { log() {}, error() {}, warn() {} },
    },
    globals,
  );
  const context = vm.createContext(sandbox, {
    name: "workflow",
    codeGeneration: { strings: false, wasm: false },
  });
  // meta and args are materialised inside the realm, as the host does.
  const script = new vm.Script("(async () => {" + DETERMINISM_PRELUDE + "\n" + body + "\n})()", {
    filename: "workflow.js",
    lineOffset: -1,
  });
  sandbox.args = args === undefined ? undefined : vm.runInContext(`(${JSON.stringify(args)})`, context);
  return script.runInContext(context);
}

/** Read and evaluate a template file. */
export async function loadTemplate(path, options) {
  const source = await readFile(path, "utf8");
  return loadWorkflow(source, options);
}
