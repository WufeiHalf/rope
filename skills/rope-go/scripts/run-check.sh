#!/usr/bin/env bash
# run-check.sh — run one stage's declared check batch, mechanically.
#
# The host runs this as a gate, so the exit code the kernel sees is this
# script's verdict and neither an agent nor the kernel can misreport it.
# Per-check detail lands in the evidence directory:
#
#   <evidence>/<key>/<id>.out   combined output of the command
#   <evidence>/<key>/<id>.json  {id, command, cwd, scope, key, exitCode,
#                                durationMs, reused, required, at}
#
# Exit 0 = every required check exited zero. Exit 1 = at least one did not.
# Exit 2 = the invocation itself was wrong.
#
# Reuse is the point of the key: the key encodes the integrated commit set plus
# the check's scope, so re-evaluating an unchanged state finds the evidence
# already there and does not spend the command again. Delete the evidence or
# change the scope to force a rerun.

set -u

evidence=""
batch=""
reuse=1

while [ "$#" -gt 0 ]; do
  case "$1" in
    --evidence) evidence="${2:-}"; shift 2 ;;
    --batch) batch="${2:-}"; shift 2 ;;
    --no-reuse) reuse=0; shift ;;
    *) echo "run-check.sh: unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$evidence" ] || [ -z "$batch" ]; then
  echo "usage: run-check.sh --evidence <dir> --batch <json-array>" >&2
  exit 2
fi

if ! command -v node >/dev/null 2>&1; then
  echo "run-check.sh: node is required to parse the batch" >&2
  exit 2
fi

# The batch is a JSON array; the plan is compiled by the parent session, so
# parsing it with node is the smallest correct reader available here.
plan_file="$(mktemp "${TMPDIR:-/tmp}/run-check-XXXXXX.json")"
trap 'rm -f "$plan_file"' EXIT
printf '%s' "$batch" > "$plan_file"

if ! node -e '
const fs = require("fs");
const plan = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (!Array.isArray(plan)) { console.error("batch must be an array"); process.exit(1); }
for (const [i, spec] of plan.entries()) {
  for (const field of ["id", "command", "key", "scope"]) {
    if (typeof spec[field] !== "string" || spec[field] === "") {
      console.error(`batch[${i}].${field} must be a non-empty string`);
      process.exit(1);
    }
  }
  if (typeof spec.required !== "boolean") { console.error(`batch[${i}].required must be a boolean`); process.exit(1); }
  process.stdout.write([spec.id, spec.key, spec.scope, spec.required ? "1" : "0", spec.cwd || "", spec.command].join("\u001f") + "\n");
}
' "$plan_file" > "$plan_file.tsv"; then
  echo "run-check.sh: cannot parse the batch" >&2
  exit 2
fi

failed_required=0
failed_ids=""

# \u001f (unit separator) is not IFS whitespace, so `read` preserves empty
# fields — with a tab delimiter an empty cwd would shift every later field.
while IFS=$'\x1f' read -r id key scope required cwd command; do
  [ -z "$id" ] && continue
  dir="${evidence}/${key}"
  out_path="${dir}/${id}.out"
  json_path="${dir}/${id}.json"
  mkdir -p "$dir"

  if [ "$reuse" -eq 1 ] && [ -f "$json_path" ] && [ -f "$out_path" ]; then
    exit_code="$(node -e 'try{process.stdout.write(String(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).exitCode))}catch(e){process.stdout.write("missing")}' "$json_path" 2>/dev/null)"
    if [ "$exit_code" != "missing" ]; then
      echo "reuse  ${id}  (exit ${exit_code})  ${key}"
      [ "$required" = "1" ] && [ "$exit_code" != "0" ] && { failed_required=1; failed_ids="${failed_ids} ${id}"; }
      continue
    fi
  fi

  run_dir="${cwd:-.}"
  started="$(date +%s 2>/dev/null || echo 0)"
  if [ -n "$cwd" ]; then
    ( cd "$run_dir" && bash -c "$command" ) > "$out_path" 2>&1
  else
    bash -c "$command" > "$out_path" 2>&1
  fi
  exit_code=$?
  finished="$(date +%s 2>/dev/null || echo 0)"
  duration_ms=$(( (finished - started) * 1000 ))

  printf '{"id":"%s","scope":"%s","key":"%s","command":"%s","cwd":"%s","exitCode":%s,"durationMs":%s,"reused":false,"required":%s,"at":%s}\n' \
    "$(printf '%s' "$id" | sed 's/"/\\"/g')" \
    "$(printf '%s' "$scope" | sed 's/"/\\"/g')" \
    "$(printf '%s' "$key" | sed 's/"/\\"/g')" \
    "$(printf '%s' "$command" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')" \
    "$(printf '%s' "$cwd" | sed 's/"/\\"/g')" \
    "$exit_code" "$duration_ms" \
    "$([ "$required" = "1" ] && echo true || echo false)" \
    "$finished" > "$json_path"

  if [ "$exit_code" = "0" ]; then
    echo "ok     ${id}  (${duration_ms}ms)  ${key}"
  else
    echo "FAIL   ${id}  exit ${exit_code}  (${duration_ms}ms)  ${key}"
    echo "       see ${out_path}"
    if [ "$required" = "1" ]; then
      failed_required=1
      failed_ids="${failed_ids} ${id}"
    fi
  fi
done < "$plan_file.tsv"

if [ "$failed_required" -eq 1 ]; then
  echo "run-check.sh: required checks failed:${failed_ids}" >&2
  exit 1
fi
echo "run-check.sh: every required check exited zero"
exit 0
