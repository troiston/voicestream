#!/usr/bin/env bash
# subagentStart — injeta na prompt do subagente:
# - caminho do doc da fase ativa,
# - regra de seguir as skills listadas no comando pai,
# - lembrete de /using-superpowers.

set -euo pipefail

PHASE_DOC=""
for f in \
  docs/07_IMPLEMENTATION.md \
  docs/06_SPECIFICATION.md \
  docs/05_DESIGN.md \
  docs/04_MARKET_AND_REFERENCES.md \
  docs/02_MONETIZATION.md \
  docs/01_PRD.md \
  docs/00_VALIDATION.md
do
  if [ -f "$f" ] && [ "$(wc -c <"$f")" -gt 200 ]; then
    PHASE_DOC="$f"
    break
  fi
done

BRIEF=$(printf '%s\n' \
  "[subagent-brief] Doc da fase ativa: ${PHASE_DOC:-nenhum}." \
  "[subagent-brief] Use as skills listadas no frontmatter do comando pai e as obrigatórias da fase em docs/S03_SKILLS_INDEX.md." \
  "[subagent-brief] Antes de tocar em código, ative /using-superpowers e confirme docs/06_SPECIFICATION.md."
)

jq -n --arg m "$BRIEF" '{userMessage:$m}'
