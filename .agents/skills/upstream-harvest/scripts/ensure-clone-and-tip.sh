#!/usr/bin/env bash
# Ensure machine-local clone of mattpocock/skills and print fetched default-branch tip.
# Exit non-zero on failure — never invent a tip.
set -euo pipefail

SOURCE_MD="${1:-.rope/upstream/mattpocock-skills/source.md}"
PROXY="${ROPE_UPSTREAM_PROXY:-http://127.0.0.1:8118}"
HTTPS_URL_DEFAULT="https://github.com/mattpocock/skills"
SSH_URL_DEFAULT="git@github.com:mattpocock/skills.git"
CLONE_DEFAULT="${HOME}/.cache/rope-upstream/mattpocock-skills"
BRANCH_DEFAULT="main"

die() {
  echo "ensure-clone-and-tip: ERROR: $*" >&2
  exit 1
}

same_repo() {
  local a b
  a=$(echo "$1" | sed -E 's#^git@github\.com:#https://github.com/#; s#\.git$##; s#/$##')
  b=$(echo "$2" | sed -E 's#^git@github\.com:#https://github.com/#; s#\.git$##; s#/$##')
  [[ "$a" == "$b" ]]
}

# Optional light parse of source.md (override via env always wins)
URL="$HTTPS_URL_DEFAULT"
BRANCH="$BRANCH_DEFAULT"
CLONE_PATH="$CLONE_DEFAULT"

if [[ -f "$SOURCE_MD" ]]; then
  line=$(grep -E '^- URL:' "$SOURCE_MD" | head -1 || true)
  if [[ -n "${line}" ]]; then
    parsed=$(echo "$line" | sed -E 's/^- URL:[[:space:]]*//; s/[` ]//g')
    [[ -n "$parsed" ]] && URL="$parsed"
  fi
  line=$(grep -E '^- Default branch:' "$SOURCE_MD" | head -1 || true)
  if [[ -n "${line}" ]]; then
    parsed=$(echo "$line" | sed -E 's/^- Default branch:[[:space:]]*//; s/[` ]//g')
    [[ -n "$parsed" ]] && BRANCH="$parsed"
  fi
  line=$(grep -E '^- Local clone' "$SOURCE_MD" | head -1 || true)
  if [[ -n "${line}" ]]; then
    parsed=$(echo "$line" | sed -E 's/.*:[[:space:]]*//; s/[` ]//g; s/\(default\)//g')
    # keep only path-looking token
    parsed=$(echo "$parsed" | awk '{print $1}')
    if [[ -n "$parsed" && "$parsed" != *"none"* ]]; then
      CLONE_PATH="$parsed"
    fi
  fi
fi

URL="${ROPE_UPSTREAM_URL:-$URL}"
BRANCH="${ROPE_UPSTREAM_BRANCH:-$BRANCH}"
CLONE_PATH="${ROPE_UPSTREAM_CLONE:-$CLONE_PATH}"
CLONE_PATH="${CLONE_PATH/#\~/$HOME}"

mkdir -p "$(dirname "$CLONE_PATH")"

git_https() {
  git -c "http.https://github.com.proxy=${PROXY}" "$@"
}

if [[ ! -d "$CLONE_PATH/.git" ]]; then
  echo "ensure-clone-and-tip: cloning into ${CLONE_PATH}" >&2
  # Prefer SSH when ROPE_UPSTREAM_TRANSPORT=ssh; else HTTPS+proxy
  transport="${ROPE_UPSTREAM_TRANSPORT:-https}"
  if [[ "$transport" == "ssh" ]]; then
    git clone "${ROPE_UPSTREAM_SSH_URL:-$SSH_URL_DEFAULT}" "$CLONE_PATH" \
      || die "git clone (ssh) failed for ${SSH_URL_DEFAULT} → ${CLONE_PATH}"
  else
    clone_url="$URL"
    if [[ "$clone_url" == git@* ]]; then
      clone_url="$HTTPS_URL_DEFAULT"
    fi
    git_https clone "$clone_url" "$CLONE_PATH" \
      || die "git clone (https via proxy ${PROXY}) failed for ${clone_url} → ${CLONE_PATH}"
  fi
else
  origin=$(git -C "$CLONE_PATH" remote get-url origin 2>/dev/null) \
    || die "cannot read origin in ${CLONE_PATH}"
  if ! same_repo "$origin" "$URL" && ! same_repo "$origin" "$SSH_URL_DEFAULT" \
    && ! same_repo "$origin" "$HTTPS_URL_DEFAULT"; then
    die "origin URL mismatch: origin=${origin} expected=${URL} (or SSH equivalent). Refusing to overwrite."
  fi
fi

echo "ensure-clone-and-tip: fetching origin in ${CLONE_PATH}" >&2
if git -C "$CLONE_PATH" remote get-url origin 2>/dev/null | grep -q '^https://'; then
  git_https -C "$CLONE_PATH" fetch origin \
    || die "git fetch failed (https via proxy ${PROXY}) in ${CLONE_PATH}"
else
  git -C "$CLONE_PATH" fetch origin \
    || die "git fetch failed in ${CLONE_PATH}"
fi

TIP_SHA=$(git -C "$CLONE_PATH" rev-parse "origin/${BRANCH}") \
  || die "cannot resolve origin/${BRANCH} after fetch"
SHORT_SHA="${TIP_SHA:0:7}"

echo "CLONE_PATH=${CLONE_PATH}"
echo "DEFAULT_BRANCH=${BRANCH}"
echo "TIP_SHA=${TIP_SHA}"
echo "SHORT_SHA=${SHORT_SHA}"
echo "REMOTE_URL=$(git -C "$CLONE_PATH" remote get-url origin)"
