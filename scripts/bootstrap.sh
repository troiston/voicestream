#!/usr/bin/env bash
# bootstrap.sh — Setup inicial de um novo projeto VibeCoding
# Uso: bash scripts/bootstrap.sh
set -euo pipefail

echo "=== VibeCoding Bootstrap ==="

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "ERRO: Node.js não encontrado. Instale Node.js 20+ primeiro."
  exit 1
fi
echo "Node.js $(node -v) encontrado"

# 2. Instalar dependências
echo "Instalando dependências..."
npm install

# 3. Copiar .env
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Criado .env a partir de .env.example — EDITE com seus valores reais"
  else
    echo "AVISO: .env.example não encontrado"
  fi
else
  echo ".env já existe — mantendo"
fi

# 4. Gerar Prisma Client
echo "Gerando Prisma Client..."
npx prisma generate

# 5. Verificar docs
echo "Verificando framework docs..."
bash scripts/verify-docs.sh || echo "Verificação concluída com avisos (normal para projeto novo)"

echo ""
echo "=== Bootstrap concluído ==="
echo "Próximos passos:"
echo "  1. Edite .env com seus valores reais (DATABASE_URL etc.)"
echo "  2. Com DB configurado:"
echo "       npx prisma migrate dev"
echo "       npm run db:seed         # popula dados demo (isDemo=true)"
echo "       npm run db:demo:wipe    # apaga apenas dados demo"
echo "  3. Execute: npm run dev"
echo "  4. Ative /using-superpowers no Cursor"
echo "  5. Leia docs/DOCS_INDEX.md e WORKFLOW.md para começar"
