#!/usr/bin/env bash
# stop — quando a sessão termina, se DOCS_INDEX.md marcar alguma fase como
# 'em revisão' / 'in review', corre verify-docs.sh para sinalizar gates.
# Não bloqueia (fail-open); apenas avisa.

set -euo pipefail

INDEX="docs/DOCS_INDEX.md"
if [ ! -f "$INDEX" ]; then
  echo '{}'
  exit 0
fi

if ! grep -qiE 'em revisão|em revisao|in review' "$INDEX"; then
  echo '{}'
  exit 0
fi

if bash scripts/verify-docs.sh >/tmp/verify-gate.log 2>&1; then
  jq -n '{userMessage:"[verify-gate] verify-docs OK — pode fechar a fase."}'
else
  TAIL=$(tail -n 20 /tmp/verify-gate.log 2>/dev/null || true)
  jq -n --arg t "$TAIL" '{userMessage: ("[verify-gate] verify-docs falhou. Resolva antes de fechar a fase.\n" + $t)}'
fi
