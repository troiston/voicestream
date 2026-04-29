#!/usr/bin/env bash
# postToolUseFailure — anexa falhas de ferramentas a docs/10_DEBUG.md
# para alimentar /debugger com dados reais. Append idempotente por timestamp.

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool // .toolName // "unknown"')
ERR=$(echo "$INPUT" | jq -r '.error // .errorMessage // ""' | head -c 500)

DEBUG_DOC="docs/10_DEBUG.md"
[ -f "$DEBUG_DOC" ] || { echo '{}'; exit 0; }

TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
{
  echo ""
  echo "### [auto] Falha de ferramenta — $TS"
  echo ""
  echo "- Ferramenta: \`$TOOL\`"
  echo "- Erro: $ERR"
} >> "$DEBUG_DOC"

echo '{}'
