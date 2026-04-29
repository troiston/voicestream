#!/usr/bin/env bash
# beforeSubmitPrompt — quando o utilizador envia um slash command,
# carrega o frontmatter `skills:` do .md correspondente e prefixa um
# lembrete ao prompt para o agente carregar essas skills.
#
# Também bloqueia (continue:false) se a fase exigir doc predecessor ausente.

set -euo pipefail

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""')

# Aceitar prompts não-slash sem alteração.
if ! printf '%s' "$PROMPT" | grep -qE '^[[:space:]]*/[a-zA-Z][a-zA-Z0-9_-]*'; then
  echo '{"continue":true}'
  exit 0
fi

CMD_NAME=$(printf '%s' "$PROMPT" | sed -E 's@^[[:space:]]*/([a-zA-Z][a-zA-Z0-9_-]*).*@\1@')

CMD_FILE=$(find .cursor/commands -type f -name "${CMD_NAME}.md" 2>/dev/null | head -n1 || true)

if [ -z "$CMD_FILE" ]; then
  echo '{"continue":true}'
  exit 0
fi

# Extrair skills do frontmatter YAML.
SKILLS=$(awk '
  BEGIN { infm=0; insk=0 }
  /^---[[:space:]]*$/ { infm=!infm; next }
  infm && /^skills:[[:space:]]*$/ { insk=1; next }
  infm && insk && /^[[:space:]]*-[[:space:]]*/ {
    sub(/^[[:space:]]*-[[:space:]]*/, "")
    gsub(/[[:space:]]+$/, "")
    print
    next
  }
  infm && insk && /^[a-zA-Z]/ { insk=0 }
' "$CMD_FILE" | tr '\n' ' ' | sed 's/[[:space:]]*$//')

# Detetar gates de fase (doc predecessor exigido).
PHASE_GATE_MISSING=""
case "$CMD_NAME" in
  prd) [ -f docs/00_VALIDATION.md ] || PHASE_GATE_MISSING="docs/00_VALIDATION.md" ;;
  monetization-check) [ -f docs/01_PRD.md ] || PHASE_GATE_MISSING="docs/01_PRD.md" ;;
  market) [ -f docs/02_MONETIZATION.md ] || PHASE_GATE_MISSING="docs/02_MONETIZATION.md" ;;
  design) [ -f docs/04_MARKET_AND_REFERENCES.md ] || PHASE_GATE_MISSING="docs/04_MARKET_AND_REFERENCES.md" ;;
  spec) [ -f docs/05_DESIGN.md ] || PHASE_GATE_MISSING="docs/05_DESIGN.md" ;;
  implement-backend|implement-frontend) [ -f docs/06_SPECIFICATION.md ] || PHASE_GATE_MISSING="docs/06_SPECIFICATION.md" ;;
  pr|release) [ -f docs/07_IMPLEMENTATION.md ] || PHASE_GATE_MISSING="docs/07_IMPLEMENTATION.md" ;;
esac

if [ -n "$PHASE_GATE_MISSING" ]; then
  MSG="Comando /${CMD_NAME} requer ${PHASE_GATE_MISSING} preenchido. Conclua a fase anterior antes de prosseguir."
  jq -n --arg m "$MSG" '{continue:false, userMessage:$m}'
  exit 0
fi

if [ -z "$SKILLS" ]; then
  REMINDER="[skills-policy] Comando /${CMD_NAME} sem skills declaradas no frontmatter. Adicione skills antes de continuar (ver WORKFLOW.md → 'Skills obrigatórias por comando')."
else
  REMINDER="[skills-policy] /${CMD_NAME} requer carregar as skills: ${SKILLS}. Carregue-as via Read em .cursor/skills/<nome>/SKILL.md (ou .cursor/skills-web-excellence/) ANTES de executar o comando. Cruzar com docs/S03_SKILLS_INDEX.md para skills da fase atual."
fi

ATTACH=$(jq -n --arg r "$REMINDER" --arg p "$PROMPT" '{continue:true, prompt: ($r + "\n\n" + $p)}')
echo "$ATTACH"
