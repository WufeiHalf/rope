/**
 * smoke.test.mjs — this repository's own quick tier.
 *
 * The Rope repo is a Markdown rules repo with a small CLI, so its tests are a
 * structure check, not a suite: every skill has a readable frontmatter block,
 * every relative reference resolves, and the CLI still installs. Derived and
 * written back to `.rope/routes.md` as the declared quick tier.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const ROOT = new URL("..", import.meta.url).pathname;

async function skills() {
  const dir = join(ROOT, "skills");
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function assertReadable(path) {
  const info = await stat(path);
  assert.ok(info.size > 0, path + " is empty");
  const body = await readFile(path, "utf8");
  assert.ok(!body.includes("\0"), path + " contains a null byte");
  return body;
}

test("every skill declares frontmatter with a name and a description", async () => {
  for (const name of await skills()) {
    const body = await assertReadable(join(ROOT, "skills", name, "SKILL.md"));
    const frontmatter = body.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter, name + "/SKILL.md has no frontmatter block");
    assert.match(frontmatter[1], new RegExp("^name: " + name + "$", "m"),
      name + "/SKILL.md must declare its own directory name as `name`");
    const description = frontmatter[1].match(/^description: (.+)$/m);
    assert.ok(description, name + "/SKILL.md has no description");
    assert.ok(description[1].length <= 1024, name + "/SKILL.md description exceeds 1024 characters");
  }
});

test("every relative reference inside a skill resolves from its installed directory", async () => {
  const root = join(ROOT, "skills");
  const missing = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const body = await readFile(path, "utf8");
      for (const match of body.matchAll(/\]\(([^)#\s]+\.md)(#[^)\s]*)?\)/g)) {
        const target = match[1];
        if (target.startsWith("http") || target.startsWith("/")) continue;
        const resolved = resolve(dirname(path), target);
        if (!resolved.startsWith(root)) continue;
        try {
          await stat(resolved);
        } catch {
          missing.push(path.replace(ROOT + "/", "") + " → " + target);
        }
      }
    }
  };
  await walk(root);
  assert.deepEqual(missing, [], "references that do not resolve from an installed skill:\n" + missing.join("\n"));
});

test("the go template is a single self-contained script: no imports, no require, no shell", async () => {
  const body = await assertReadable(join(ROOT, "skills/rope-go/workflows/go-execute.js"));
  assert.match(body, /^export const meta = \{/m, "the template must open with an exported meta literal");
  assert.ok(!/^\s*import\s/m.test(body), "the workflow sandbox has no module loader");
  assert.ok(!/\brequire\(/.test(body), "the workflow sandbox has no require");
  assert.ok(!/\bprocess\./.test(body), "the workflow sandbox has no process object");
  assert.ok(!/Date\.now\(\)|Math\.random\(\)/.test(body),
    "Date.now()/Math.random() throw inside a workflow script because a journaled run replays by prefix");
  assert.ok(!/run-check\.sh --|\bexec\(/.test(body), "the script must compose gate commands, never run them");
});

test("the shipped scripts are executable and self-describing", async () => {
  for (const name of ["verify-delivery.sh", "run-check.sh"]) {
    const body = await assertReadable(join(ROOT, "skills/rope-go/scripts", name));
    assert.match(body.split("\n")[1], /^#/, name + " must open with a comment explaining what it is for");
    assert.match(body, /^set -u$/m, name + " must run with unset variables as an error");
    assert.ok(!body.includes("\t\t"), name + " indents with spaces");
  }
});

test("the CLI still reports usage and installs the bundled skills", async () => {
  const helper = spawnSync("node", [join(ROOT, "bin/rope.js"), "--help"], { encoding: "utf8" });
  assert.equal(helper.status, 0, helper.stderr);
  assert.match(helper.stdout, /rope add/);

  const target = await mkdtemp(join(tmpdir(), "rope-smoke-"));
  try {
    const install = spawnSync("node", [join(ROOT, "bin/rope.js"), "add", "--target", target], { encoding: "utf8" });
    assert.equal(install.status, 0, install.stderr);
    for (const name of await skills()) {
      await assertReadable(join(target, name, "SKILL.md"));
    }
    await assertReadable(join(target, "rope-go", "workflows", "go-execute.js"));
    await assertReadable(join(target, "rope-go", "scripts", "verify-delivery.sh"));
    await assertReadable(join(target, "rope-go", "references", "execution-template.md"));
  } finally {
    await rm(target, { recursive: true, force: true });
  }
});
