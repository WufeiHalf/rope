#!/usr/bin/env bash
# verify-delivery.sh — the delivery-identity gate for one go-execute leaf.
#
# Runs inside the leaf's own worktree, as the spawn's gate, before the host
# commits leftovers and deletes the copy. The script's exit code is the verdict
# the kernel sees; the JSON it writes to --verdict is the detail a human or the
# parent session reads afterwards (the kernel cannot: a host strips the gate
# from a passing result and folds a failing gate's output into a null return).
#
# Two modes:
#   --branch <name> --base <sha> [--recover-dirty]   worktree delivery
#   --commit <sha>                                   shared-checkout delivery
#
# --evidence <dir> names the executor's own bookkeeping directory. It is not
# work: a clean tree means "no uncommitted product changes", so anything under
# that directory is excluded from the cleanliness check and from the leftover
# commit. Passing it is optional; omitting it makes a stray evidence file look
# like a dirty delivery, which is the honest answer when the plan never
# declared where evidence goes.
#
# Exit 0 = the delivery is verifiable. Exit 1 = it is not. Exit 2 = the script
# itself could not run, which the kernel must not read as a delivery verdict.

set -u

mode=""
branch=""
commit=""
base=""
recover_dirty=0
verdict=""
evidence=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --branch) branch="${2:-}"; shift 2 ;;
    --commit) commit="${2:-}"; shift 2 ;;
    --base) base="${2:-}"; shift 2 ;;
    --evidence) evidence="${2:-}"; shift 2 ;;
    --verdict) verdict="${2:-}"; shift 2 ;;
    --recover-dirty) recover_dirty=1; shift ;;
    *) echo "verify-delivery.sh: unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [ -n "$branch" ] && [ -n "$commit" ]; then
  echo "verify-delivery.sh: --branch and --commit are mutually exclusive" >&2
  exit 2
fi
if [ -z "$branch" ] && [ -z "$commit" ]; then
  echo "verify-delivery.sh: one of --branch or --commit is required" >&2
  exit 2
fi
if [ -z "$verdict" ]; then
  echo "verify-delivery.sh: --verdict <path> is required" >&2
  exit 2
fi

mode="branch"
[ -n "$commit" ] && mode="commit"

json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr '\n' ' '
}

# A verdict file left by an earlier attempt must never be mistaken for this one.
mkdir -p "$(dirname "$verdict")" 2>/dev/null
rm -f "$verdict"

write_verdict() {
  # write_verdict <ok> <reason> <extra-json>
  local ok="$1" reason="$2" extra="$3"
  local payload
  payload="{\"ok\":${ok},\"mode\":\"${mode}\",\"reason\":\"$(json_escape "$reason")\""
  [ -n "$extra" ] && payload="${payload},${extra}"
  payload="${payload}}"
  printf '%s\n' "$payload" > "$verdict"
  printf '%s\n' "$payload"
}

if ! command -v git >/dev/null 2>&1; then
  write_verdict false "git-missing" ""
  exit 2
fi
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  write_verdict false "not-a-git-worktree" ""
  exit 2
fi

head_sha="$(git rev-parse HEAD 2>/dev/null)"
if [ -z "$head_sha" ]; then
  write_verdict false "no-head" ""
  exit 2
fi

# The exclusion is only meaningful when the evidence directory can actually
# appear inside this tree; an absolute path in someone else's checkout (the
# common case, since the gate runs inside a worktree) needs no pathspec.
top_level="$(git rev-parse --show-toplevel 2>/dev/null)"
evidence_spec=""
evidence_excluded="false"
if [ -n "$evidence" ] && [ -n "$top_level" ]; then
  real_top="$(cd "$top_level" 2>/dev/null && pwd -P)"
  real_evidence="$(cd "$evidence" 2>/dev/null && pwd -P)"
  [ -n "$real_evidence" ] || real_evidence="$evidence"
  case "$real_evidence" in
    "$real_top"/*)
      evidence_spec="${real_evidence#"$real_top"/}"
      evidence_excluded="true"
      ;;
  esac
fi

specs=( . )
[ -n "$evidence_spec" ] && specs+=( ":(exclude)${evidence_spec}" )

dirty="$(git status --porcelain -- "${specs[@]}" 2>/dev/null)"
recovered="false"
if [ -n "$dirty" ]; then
  if [ "$mode" = "branch" ] && [ "$recover_dirty" -eq 1 ]; then
    # The leaf left work uncommitted. The host would commit it to
    # `pi-agent-<id>` — a branch the plan cannot name — so committing it here is
    # what keeps one forgotten step from costing a whole implementation.
    # `git add -A -- . ':(exclude)<evidence>'` is not usable here: naming an
    # ignored path in a pathspec makes git refuse the whole add. Staging
    # everything and unstaging the evidence afterwards works whether or not the
    # repository ignores that directory.
    git add -A -- . >/dev/null 2>&1
    [ -n "$evidence_spec" ] && git reset -q -- "$evidence_spec" >/dev/null 2>&1
    if git commit --no-verify -m "chore(rope): commit leaf leftovers before delivery" >/dev/null 2>&1; then
      head_sha="$(git rev-parse HEAD 2>/dev/null)"
      dirty="$(git status --porcelain -- "${specs[@]}" 2>/dev/null)"
      recovered="true"
    fi
  fi
fi

dirty_count="$(printf '%s' "$dirty" | grep -c . )"
dirty_files=""
if [ "$dirty_count" -gt 0 ]; then
  dirty_files="$(printf '%s' "$dirty" | head -20 | awk '{print $2}' | paste -sd, -)"
fi

if [ "$mode" = "commit" ]; then
  # Shared checkout: the leaf committed on the current branch, so the delivery
  # is that commit being a real object reachable from HEAD.
  if [ "$dirty_count" -gt 0 ]; then
    write_verdict false "dirty-tree" "\"dirtyFiles\":\"$(json_escape "$dirty_files")\",\"clean\":false,\"evidenceExcluded\":${evidence_excluded}"
    exit 1
  fi
  if ! git cat-file -e "${commit}^{commit}" >/dev/null 2>&1; then
    write_verdict false "missing-commit" "\"commit\":\"$(json_escape "$commit")\",\"clean\":true"
    exit 1
  fi
  if ! git merge-base --is-ancestor "$commit" HEAD >/dev/null 2>&1; then
    write_verdict false "commit-not-ancestor-of-head" "\"commit\":\"$(json_escape "$commit")\",\"clean\":true"
    exit 1
  fi
  write_verdict true "commit-verified" "\"commit\":\"$(json_escape "$commit")\",\"clean\":true,\"evidenceExcluded\":${evidence_excluded}"
  exit 0
fi

# Worktree delivery.
if [ "$dirty_count" -gt 0 ]; then
  write_verdict false "dirty-tree" "\"dirtyFiles\":\"$(json_escape "$dirty_files")\",\"clean\":false,\"head\":\"${head_sha}\""
  exit 1
fi

branch_sha="$(git rev-parse --verify "refs/heads/${branch}" 2>/dev/null)"
moved="false"
if [ "$branch_sha" != "$head_sha" ]; then
  # The leaf forgot the branch, or committed after creating it. Both are one
  # mechanical repair, and the branch must not be checked out anywhere for the
  # worktree to be detached — which it is, so `-f` is safe.
  if ! git branch -f "$branch" HEAD >/dev/null 2>&1; then
    write_verdict false "cannot-move-branch" "\"branch\":\"$(json_escape "$branch")\",\"clean\":true,\"head\":\"${head_sha}\""
    exit 1
  fi
  branch_sha="$head_sha"
  moved="true"
fi

head_moved="true"
if [ -n "$base" ] && [ "$head_sha" = "$base" ]; then
  head_moved="false"
fi

extra="\"branch\":\"$(json_escape "$branch")\",\"sha\":\"${head_sha}\",\"clean\":true,\"recovered\":${recovered},\"moved\":${moved},\"headMovedFromBase\":${head_moved},\"evidenceExcluded\":${evidence_excluded}"
[ -n "$base" ] && extra="${extra},\"baseSha\":\"$(json_escape "$base")\""
write_verdict true "branch-verified" "$extra"
exit 0
