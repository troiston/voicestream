#!/usr/bin/env bash
# afterFileEdit — quando docs de fase ou prisma/schema.prisma mudam,
# emite avisos práticos. Não bloqueia. Não corre verify completo (rapidez).

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.file_path // .filePath // ""')

WARN=""

case "$FILE" in
  docs/0[0-9]_*.md|docs/1[0-3]_*.md)
    if grep -qE "TODO|TBD|XXX|<placeholder>" "$FILE" 2>/dev/null; then
      WARN="[phase-doc-sync] $FILE ainda tem placeholders (TODO/TBD/XXX). Resolva antes de fechar a fase."
    fi
    ;;
  prisma/schema.prisma)
    WARN="[phase-doc-sync] schema.prisma mudou: lembre-se de 'npx prisma migrate dev' e atualizar prisma/seed.ts (dados demo) se aplicável."
    ;;
  src/app/styleguide/*|src/app/styleguide/**)
    WARN="[phase-doc-sync] Styleguide alterado: confirme que docs/05_DESIGN.md reflete mudanças (tokens, estados, componentes)."
    ;;
esac

if [ -n "$WARN" ]; then
  jq -n --arg m "$WARN" '{userMessage:$m}'
else
  echo '{}'
fi
