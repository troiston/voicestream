#!/bin/sh
set -e

# Carrega cada arquivo de /run/secrets/* como variável de ambiente.
# O nome do arquivo (lowercase, ex: database_url) é convertido para
# UPPERCASE (DATABASE_URL) antes de exportar — convenção Docker Swarm
# secrets => env vars consumidas pelo Node.
if [ -d /run/secrets ]; then
  for f in /run/secrets/*; do
    [ -f "$f" ] || continue
    raw="$(basename "$f")"
    name="$(echo "$raw" | tr '[:lower:]' '[:upper:]')"
    if [ -z "$(eval echo \$$name)" ]; then
      val="$(cat "$f")"
      export "$name=$val"
    fi
  done
fi

exec "$@"
