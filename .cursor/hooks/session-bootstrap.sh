#!/usr/bin/env bash
# sessionStart — injeta lembrete de bootstrap (using-superpowers + DOCS_INDEX)
# e mostra a fase VibeCoding atual detetada (último doc preenchido).

set -euo pipefail

PHASE="desconhecida"
for f in \
  docs/13_RELEASE_READINESS.md \
  docs/12_THREAT_MODEL.md \
  docs/11_UX_AUDIT.md \
  docs/10_DEBUG.md \
  docs/09_TESTS.md \
  docs/08_SECURITY.md \
  docs/07_IMPLEMENTATION.md \
  docs/06_SPECIFICATION.md \
  docs/05_DESIGN.md \
  docs/04_MARKET_AND_REFERENCES.md \
  docs/02_MONETIZATION.md \
  docs/01_PRD.md \
  docs/00_VALIDATION.md
do
  if [ -f "$f" ] && [ "$(wc -c <"$f")" -gt 200 ]; then
    PHASE=$(basename "$f" .md)
    break
  fi
done

MSG=$(printf '%s\n' \
  "[bootstrap] Execute /using-superpowers antes de qualquer ação." \
  "[bootstrap] Leia docs/DOCS_INDEX.md (estado das fases) e docs/S03_SKILLS_INDEX.md (skills por fase)." \
  "[bootstrap] Fase atual detetada: ${PHASE}." \
  "[bootstrap] Política: todo comando .cursor/commands/** carrega as skills do seu frontmatter."
)

jq -n --arg m "$MSG" '{userMessage:$m}'
