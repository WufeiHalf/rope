#!/usr/bin/env bash
# Diff C1 high allowlist paths between last-reviewed SHA and tip.
# Parses correspondence.md high rows; never invents SHAs or marks.
# Exit codes:
#   0 — success (may be no-op or material; see MATERIAL=)
#   2 — bad/unknown last SHA (repair guidance on stderr)
#   3 — tip unresolved / clone bad
#   1 — other usage/parse failure
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage: allowlist-diff.sh --clone <path> --last <sha> --tip <sha> \
  [--correspondence <path>] [--named-watch skill1,skill2]

Prints machine-readable sections:
  LAST_SHA=...
  TIP_SHA=...
  RANGE=...
  MATERIAL=yes|no
  COMMITS=<n>
  HIGH_SKILLS=skill1 skill2 ...
  MISSING_AT_TIP=skill1 skill2 ...   (empty if none)
  MISSING_AT_LAST=skill1 skill2 ...
  --- commits ---
  <git log --oneline last..tip -- allowlist>
  --- per-skill ---
  SKILL=<name>
  TARGET=<rope target from correspondence>
  STATUS=changed|unchanged|missing-at-tip|missing-at-last|missing-both
  --- diff ---
  <git diff last tip -- allowlist paths that exist on either side>
EOF
  exit 1
}

CLONE=""
LAST=""
TIP=""
CORR=".rope/upstream/mattpocock-skills/correspondence.md"
NAMED_WATCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --clone) CLONE="${2:-}"; shift 2 ;;
    --last) LAST="${2:-}"; shift 2 ;;
    --tip) TIP="${2:-}"; shift 2 ;;
    --correspondence) CORR="${2:-}"; shift 2 ;;
    --named-watch) NAMED_WATCH="${2:-}"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "allowlist-diff: unknown arg: $1" >&2; usage ;;
  esac
done

[[ -n "$CLONE" && -n "$LAST" && -n "$TIP" ]] || usage
CLONE="${CLONE/#\~/$HOME}"

die() {
  echo "allowlist-diff: ERROR: $*" >&2
  exit 1
}

die_sha() {
  echo "allowlist-diff: ERROR: $*" >&2
  echo "allowlist-diff: REPAIR: verify last-reviewed-sha exists in the clone" >&2
  echo "allowlist-diff: REPAIR: git -C <clone> cat-file -t <sha>  # must be commit" >&2
  echo "allowlist-diff: REPAIR: or re-baseline (clear last-reviewed-sha after human say-so)" >&2
  exit 2
}

[[ -d "$CLONE/.git" ]] || {
  echo "allowlist-diff: ERROR: clone is not a git repo: $CLONE" >&2
  exit 3
}
[[ -f "$CORR" ]] || die "correspondence not found: $CORR"

# Validate SHAs exist as commits in clone
if ! git -C "$CLONE" cat-file -t "$LAST" 2>/dev/null | grep -qx commit; then
  die_sha "last-reviewed-sha not a known commit in clone: $LAST"
fi
if ! git -C "$CLONE" cat-file -t "$TIP" 2>/dev/null | grep -qx commit; then
  echo "allowlist-diff: ERROR: tip SHA not a known commit in clone: $TIP" >&2
  exit 3
fi

# Parse high rows: | `name` | target | high | notes |
# Also optional named watch skills from --named-watch
declare -a SKILLS=()
declare -A TARGETS=()

while IFS= read -r line; do
  # table data rows only
  [[ "$line" == \|* ]] || continue
  [[ "$line" == *"---"* ]] && continue
  # skip header
  echo "$line" | grep -qi 'Matt skill' && continue

  interest=$(echo "$line" | awk -F'|' '{print $4}' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')
  [[ "$interest" == "high" ]] || continue

  raw_name=$(echo "$line" | awk -F'|' '{print $2}' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/`//g')
  raw_target=$(echo "$line" | awk -F'|' '{print $3}' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/`//g')
  # correspondence may use "a / b" for alternate names — take first token only for path
  # e.g. diagnosing-bugs / diagnose → not high; high rows are single names
  name="$raw_name"
  # strip trailing notes-like parentheticals already outside cell
  [[ -n "$name" ]] || continue
  SKILLS+=("$name")
  TARGETS["$name"]="$raw_target"
done < "$CORR"

# Named watch skills (human-named only)
if [[ -n "$NAMED_WATCH" ]]; then
  IFS=',' read -ra WATCHES <<< "$NAMED_WATCH"
  for w in "${WATCHES[@]}"; do
    w=$(echo "$w" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/`//g')
    [[ -n "$w" ]] || continue
    # avoid dup
    dup=0
    for s in "${SKILLS[@]+"${SKILLS[@]}"}"; do
      [[ "$s" == "$w" ]] && dup=1 && break
    done
    if [[ $dup -eq 0 ]]; then
      SKILLS+=("$w")
      # look up target from correspondence if present
      t=""
      while IFS= read -r line; do
        [[ "$line" == \|* ]] || continue
        [[ "$line" == *"---"* ]] && continue
        echo "$line" | grep -qi 'Matt skill' && continue
        raw_name=$(echo "$line" | awk -F'|' '{print $2}' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/`//g')
        if [[ "$raw_name" == *"$w"* ]] || [[ "$raw_name" == "$w" ]]; then
          t=$(echo "$line" | awk -F'|' '{print $3}' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/`//g')
          break
        fi
      done < "$CORR"
      TARGETS["$w"]="${t:-_(none yet)_}"
    fi
  done
fi

if [[ ${#SKILLS[@]} -eq 0 ]]; then
  die "no high (or named-watch) skills parsed from $CORR"
fi

# Map skill name → directory path in mattpocock/skills tree.
# Upstream nests skills under skills/<bucket>/<name>/ (e.g. skills/engineering/tdd).
path_for() {
  local skill="$1" found=""
  found=$(git -C "$CLONE" ls-tree -r --name-only "$TIP" 2>/dev/null \
    | grep -E "(^|/)${skill}/SKILL\.md$" | head -1 || true)
  if [[ -z "$found" ]]; then
    found=$(git -C "$CLONE" ls-tree -r --name-only "$LAST" 2>/dev/null \
      | grep -E "(^|/)${skill}/SKILL\.md$" | head -1 || true)
  fi
  if [[ -n "$found" ]]; then
    dirname "$found"
  else
    # Unresolved name (renamed/removed upstream) — surfaces as missing-*
    echo "__missing__/${skill}"
  fi
}

declare -a PATHS=()
declare -a MISSING_TIP=()
declare -a MISSING_LAST=()
declare -a CHANGED=()
declare -a UNCHANGED=()

for skill in "${SKILLS[@]}"; do
  p=$(path_for "$skill")
  PATHS+=("$p")

  exists_tip=0
  exists_last=0
  # path exists if git can list anything under it at that tree
  if git -C "$CLONE" ls-tree -r --name-only "$TIP" -- "$p" 2>/dev/null | grep -q .; then
    exists_tip=1
  fi
  if git -C "$CLONE" ls-tree -r --name-only "$LAST" -- "$p" 2>/dev/null | grep -q .; then
    exists_last=1
  fi

  if [[ $exists_tip -eq 0 && $exists_last -eq 0 ]]; then
    MISSING_TIP+=("$skill")
    MISSING_LAST+=("$skill")
  elif [[ $exists_tip -eq 0 ]]; then
    MISSING_TIP+=("$skill")
  elif [[ $exists_last -eq 0 ]]; then
    MISSING_LAST+=("$skill")
  fi
done

# Commits touching any allowlist path
mapfile -t LOG_LINES < <(git -C "$CLONE" log --oneline "${LAST}..${TIP}" -- "${PATHS[@]}" 2>/dev/null || true)
COMMITS=${#LOG_LINES[@]}
# mapfile gives 1 empty element sometimes when no output
if [[ $COMMITS -eq 1 && -z "${LOG_LINES[0]:-}" ]]; then
  COMMITS=0
  LOG_LINES=()
fi

MATERIAL=no
if [[ $COMMITS -gt 0 ]]; then
  MATERIAL=yes
fi

# Per-skill change detection via diff --name-only
declare -A STATUS=()
for skill in "${SKILLS[@]}"; do
  p=$(path_for "$skill")
  in_missing_tip=0
  in_missing_last=0
  for m in "${MISSING_TIP[@]+"${MISSING_TIP[@]}"}"; do
    [[ "$m" == "$skill" ]] && in_missing_tip=1 && break
  done
  for m in "${MISSING_LAST[@]+"${MISSING_LAST[@]}"}"; do
    [[ "$m" == "$skill" ]] && in_missing_last=1 && break
  done

  if [[ $in_missing_tip -eq 1 && $in_missing_last -eq 1 ]]; then
    STATUS["$skill"]=missing-both
  elif [[ $in_missing_tip -eq 1 ]]; then
    STATUS["$skill"]=missing-at-tip
    MATERIAL=yes
  elif [[ $in_missing_last -eq 1 ]]; then
    STATUS["$skill"]=missing-at-last
    MATERIAL=yes
  else
    names=$(git -C "$CLONE" diff --name-only "$LAST" "$TIP" -- "$p" 2>/dev/null || true)
    if [[ -n "$names" ]]; then
      STATUS["$skill"]=changed
      CHANGED+=("$skill")
      MATERIAL=yes
    else
      STATUS["$skill"]=unchanged
      UNCHANGED+=("$skill")
    fi
  fi
done

# No-op when last == tip
if [[ "$LAST" == "$TIP" ]]; then
  MATERIAL=no
  COMMITS=0
  LOG_LINES=()
fi

echo "LAST_SHA=${LAST}"
echo "TIP_SHA=${TIP}"
echo "RANGE=${LAST}..${TIP}"
echo "MATERIAL=${MATERIAL}"
echo "COMMITS=${COMMITS}"
echo "HIGH_SKILLS=${SKILLS[*]}"
echo "MISSING_AT_TIP=${MISSING_TIP[*]:-}"
echo "MISSING_AT_LAST=${MISSING_LAST[*]:-}"
echo "--- commits ---"
if [[ $COMMITS -gt 0 ]]; then
  printf '%s\n' "${LOG_LINES[@]}"
fi
echo "--- per-skill ---"
for skill in "${SKILLS[@]}"; do
  echo "SKILL=${skill}"
  echo "TARGET=${TARGETS[$skill]:-_(none)_}"
  echo "STATUS=${STATUS[$skill]}"
done
echo "--- diff ---"
if [[ "$LAST" != "$TIP" && "$MATERIAL" == "yes" ]]; then
  # Only paths that exist on at least one side — git handles missing as full add/delete
  git -C "$CLONE" diff "$LAST" "$TIP" -- "${PATHS[@]}" 2>/dev/null || true
fi
