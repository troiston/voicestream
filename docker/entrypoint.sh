#!/bin/sh
set -e

# Carrega cada arquivo de /run/secrets/* como variável de ambiente
# Nome do arquivo vira o nome da env var (em UPPER_CASE preservado)
if [ -d /run/secrets ]; then
  for f in /run/secrets/*; do
    [ -f "$f" ] || continue
    name="$(basename "$f")"
    # Apenas se ainda não estiver setada no ambiente
    if [ -z "$(eval echo \$$name)" ]; then
      val="$(cat "$f")"
      export "$name=$val"
    fi
  done
fi

exec "$@"
