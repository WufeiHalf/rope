# Worktree Setup Contracts — symlink & install notes

Human-facing notes behind ADR 0008's `worktree-setup:` contract. Not skill
content: skill text stays universal, these are the per-ecosystem facts an
operator needs when choosing a tier or writing the script.

## Why a contract at all

A git worktree copies tracked files only. Untracked dependencies
(`node_modules/`, `.venv/`, build caches) do not travel, so a fresh
worktree's test command usually fails until the environment is prepared.
Preparing it can cost seconds (symlink) or minutes (cold install) per
worktree — with slice-ready dispatch creating one worktree per leaf, that
cost multiplies by concurrency.

## Tier choice

- **`host-managed`**: the host already prepares worktrees at creation
  time. Example: agent-workbench's herdr script symlinks dependencies into
  every new worktree. Fastest; couples the repo to that host (on other
  machines/hosts the repo degrades to tier 3 unless a command also
  exists).
- **Declared command**: portable; runs inside the leaf, only when needed
  (condition step — repos whose tests pass without setup pay nothing).

## Per-ecosystem notes (symlink feasibility)

### Node / npm

- Symlinking `node_modules` from the main checkout is the classic speedup
  and is what the herdr script does. Caveats:
  - **Security**: `npm` historically *follows* symlinked `node_modules`
    upward and may write into the real one during install — never run
    `npm install` inside the worktree while symlinked; the condition step
    must only *run tests*, not add dependencies.
  - Native builds (`node-gyp`) keyed to absolute paths can misbehave
    through symlinks on rare toolchains; cold `npm ci` is the fallback.
- `pnpm` already stores packages content-addressed; `pnpm install` in the
  worktree is fast enough that a symlink is usually pointless.

### Python

- **venvs do not symlink safely**: a venv hard-codes absolute paths
  (interpreter, `pyvenv.cfg`, entry-point shebangs). Symlinked venvs break
  in confusing ways. Options:
  - `uv sync` (uv) — fast enough to just run per worktree (~seconds); the
    best declared command for uv projects.
  - `python -m venv .venv && pip install -e .[test]` — correct but slow;
    acceptable for low-concurrency repos.
- `virtualenv --copies` is not a workaround here; the problem is
  path-pointing *into* the main checkout, not the interpreter binary.

### Rust / Go

- `cargo` and `go` share caches globally by default
  (`~/.cargo`, `~/go/pkg/mod`) — worktrees usually need **no setup at
  all**. Declare nothing (tests pass → tier 3 never triggers).

### JVM

- Gradle/Maven caches are user-global; a worktree typically needs only the
  wrapper to run. Usually tier "nothing" as well.

## Contract hygiene

- The line lives in `routes.md` "Build/test commands" — one place, read by
  shape/go/init.
- `rope-shape` re-asks when the line is missing, so existing repos onboard
  incrementally without re-running `rope-init`.
- A setup script that mutates shared state (writes into the main
  checkout's dependencies) violates isolation assumptions — keep it
  worktree-local (symlinks out, writes inside).
