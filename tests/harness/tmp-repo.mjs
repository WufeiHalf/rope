/**
 * tmp-repo.mjs — throwaway git repositories for offline template tests.
 *
 * The template's delivery identity is git-verified, so the tests need real git
 * objects, real refs and real merges. Everything is created under the system
 * temp directory and removed afterwards; nothing touches the working repository.
 */

import { mkdtemp, mkdir, writeFile, rm, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error("git " + args.join(" ") + " failed in " + cwd + ": " + (result.stderr || result.stdout));
  }
  return String(result.stdout).trim();
}

export function gitAllowFailure(cwd, ...args) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

export async function makeTmpDir(prefix) {
  return mkdtemp(join(tmpdir(), prefix));
}

/** A repository with one commit on `main` and a clean tree. */
export async function makeRepo(prefix = "go-execute-") {
  const dir = await makeTmpDir(prefix);
  git(dir, "init", "-q", "-b", "main");
  git(dir, "config", "user.email", "test@example.invalid");
  git(dir, "config", "user.name", "go-execute test");
  git(dir, "config", "commit.gpgsign", "false");
  await writeFile(join(dir, "README.md"), "# fixture\n");
  await writeFile(join(dir, "app.txt"), "base\n");
  // A configured repository, as execution-template.md requires: the evidence
  // directory lives in the tree, so the repo ignores it. Tests that exercise a
  // repository that never declared this line delete the file themselves.
  await writeFile(join(dir, ".gitignore"), ".rope/issues/*/evidence/\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "chore: base");
  return { dir, baseSha: git(dir, "rev-parse", "HEAD") };
}

/**
 * The host cuts a workflow leaf's worktree detached at HEAD of the main
 * checkout, so a branch the leaf creates lands in the main checkout's refs.
 * Source: pi-subagents `src/worktree.ts` (`--detach`, then cleanup creating
 * `pi-agent-<id>`).
 */
export async function addDetachedWorktree(repo, name) {
  const path = join(repo, "..", name);
  git(repo, "worktree", "add", "--detach", path, "HEAD");
  return path;
}

/** Commit a file in a worktree and return the commit — the leaf's honest path. */
export function commitIn(worktree, file, contents, message) {
  const path = join(worktree, file);
  return writeFile(path, contents)
    .then(() => {
      git(worktree, "add", "-A");
      git(worktree, "commit", "-q", "-m", message);
      return git(worktree, "rev-parse", "HEAD");
    });
}

/** Point a delivery branch at a commit from anywhere in the repo. */
export function branchAt(repo, branch, sha) {
  git(repo, "branch", "-f", branch, sha);
  return sha;
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function cleanup(...dirs) {
  for (const dir of dirs) {
    if (!dir) continue;
    try {
      await rm(dir, { recursive: true, force: true });
    } catch {
      /* a leftover temp directory is not a test failure */
    }
  }
}

/** The path of a shipped script, so tests never hardcode an absolute location. */
export function scriptPath(name) {
  return new URL("../../skills/rope-go/scripts/" + name, import.meta.url).pathname;
}

export function templatePath() {
  return new URL("../../skills/rope-go/workflows/go-execute.js", import.meta.url).pathname;
}
