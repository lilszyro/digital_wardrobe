#!/usr/bin/env bash
# filepath: .agents/skills/t-design-frontend/scripts/check_design_scope.sh
#
# t-design-frontend scope guard.
# Verifies the current change (working tree + staged, vs HEAD) touches ONLY
# files the design skill is allowed to edit, and at most ONE brand directory.
# Read-only: uses `git diff --name-only` and never mutates anything.
#
# Exit codes: 0 = in scope, 1 = violation (prints the offending paths).

set -euo pipefail

ALLOWED_MARKETING="frontend/apps/marketing/src/lib/tenant-config.ts"

mapfile -t changed < <(
  {
    git diff --name-only HEAD
    git diff --name-only --staged
    git ls-files --others --exclude-standard
  } | sort -u
)

if [ "${#changed[@]}" -eq 0 ]; then
  echo "OK: no changes in the working tree."
  exit 0
fi

violations=()
brands=()

for path in "${changed[@]}"; do
  case "$path" in
    brands/*/*)
      slug="${path#brands/}"
      slug="${slug%%/*}"
      brands+=("$slug")
      ;;
    "$ALLOWED_MARKETING")
      ;;
    *)
      violations+=("$path")
      ;;
  esac
done

# Deduplicate brand slugs.
mapfile -t unique_brands < <(printf '%s\n' "${brands[@]:-}" | sed '/^$/d' | sort -u)

status=0

if [ "${#violations[@]}" -gt 0 ]; then
  echo "SCOPE VIOLATION — these files are outside the design allowlist:"
  printf '  %s\n' "${violations[@]}"
  echo "Allowed: brands/<slug>/** and ${ALLOWED_MARKETING}"
  echo "Revert them (ask Cecy to run: git checkout -- <path>) or hand off to T."
  status=1
fi

if [ "${#unique_brands[@]}" -gt 1 ]; then
  echo "SCOPE VIOLATION — more than one brand touched in a single change:"
  printf '  brands/%s/\n' "${unique_brands[@]}"
  echo "Rule: one brand per branch/commit. Split the work."
  status=1
fi

if [ "$status" -eq 0 ]; then
  if [ "${#unique_brands[@]}" -eq 1 ]; then
    echo "OK: change is scoped to brands/${unique_brands[0]}/ (+ marketing config if listed above)."
  else
    echo "OK: change touches only the marketing tenant config."
  fi
fi

exit "$status"
