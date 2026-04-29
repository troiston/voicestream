#!/usr/bin/env bash
# beforeMCPExecution — failClosed:true. Regista chamadas MCP em log auditável
# e bloqueia uso de chaves reais (Stripe live, Supabase prod) em fases
# pré-implementação (antes de docs/06_SPECIFICATION.md existir).

set -euo pipefail

INPUT=$(cat)
SERVER=$(echo "$INPUT" | jq -r '.server // ""')
TOOL=$(echo "$INPUT" | jq -r '.tool // .toolName // ""')
ARGS=$(echo "$INPUT" | jq -c '.arguments // {}')

LOG_DIR=".cursor/logs"
mkdir -p "$LOG_DIR"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
printf '%s\t%s\t%s\t%s\n' "$TS" "$SERVER" "$TOOL" "$ARGS" >> "$LOG_DIR/mcp-audit.log"

deny() {
  local msg="$1"
  jq -n --arg m "$msg" '{permission:"deny", userMessage:$m}'
  exit 0
}

# Pré-implementação: sem 06_SPECIFICATION.md → bloquear MCPs sensíveis com payload "live".
if [ ! -f docs/06_SPECIFICATION.md ]; then
  case "$SERVER" in
    *stripe*)
      if echo "$ARGS" | grep -qiE '"sk_live_|live_mode.*true|"livemode":true'; then
        deny "MCP Stripe com chave/flag live bloqueado: docs/06_SPECIFICATION.md ainda não existe. Use chaves test."
      fi
      ;;
    *supabase*)
      if echo "$ARGS" | grep -qiE 'production|prod-' ; then
        deny "MCP Supabase apontando para produção bloqueado antes da Fase 2 (Spec)."
      fi
      ;;
  esac
fi

echo '{"permission":"allow"}'
