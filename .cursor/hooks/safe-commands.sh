#!/usr/bin/env bash
# Safe Commands Hook — blocks dangerous shell commands before execution.
# Returns JSON with permission: "deny" for blocked commands.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.command // ""')

BLOCKED_PATTERNS=(
  "rm -rf /"
  "rm -rf /\*"
  "git push --force.*main"
  "git push --force.*master"
  "git push -f.*main"
  "git push -f.*master"
  "git reset --hard"
  "> /dev/sda"
  "mkfs\."
  "dd if=/dev/zero"
)

deny() {
  local msg="$1"
  printf '{"permission":"deny","userMessage":%s}\n' "$(jq -Rn --arg m "$msg" '$m')"
  exit 0
}

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qEi "$pattern"; then
    deny "Blocked dangerous command: ${COMMAND}"
  fi
done

# Block destructive Prisma reset without explicit override.
if echo "$COMMAND" | grep -qE "prisma migrate reset"; then
  if [ "${ALLOW_DESTRUCTIVE:-}" != "1" ]; then
    deny "prisma migrate reset bloqueado. Reexecute com ALLOW_DESTRUCTIVE=1 se for intencional."
  fi
fi

# Block demo wipe in production-like environments.
if echo "$COMMAND" | grep -qE "db:demo:wipe|wipe-demo"; then
  if [ "${NODE_ENV:-}" = "production" ]; then
    deny "db:demo:wipe bloqueado em NODE_ENV=production."
  fi
fi

# Block git push to main/master without release readiness GO.
if echo "$COMMAND" | grep -qE "git push( |.*)(origin )?(main|master)( |$)"; then
  RR="docs/13_RELEASE_READINESS.md"
  if [ ! -f "$RR" ] || ! grep -qE "^(Veredito|Decisão|Decision):.*(GO|GO WITH RISK)" "$RR"; then
    deny "Push a main/master bloqueado: $RR ausente ou sem veredito GO/GO WITH RISK."
  fi
fi

echo '{"permission":"allow"}'
