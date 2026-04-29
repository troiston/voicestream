---
id: cmd-test
title: Rodar testes focados
category: ops
skills:
  - using-superpowers
  - test-writer
  - test-driven-development
  - playwright-best-practices
---

# `/test [path]` — Rodar testes focados

## Skills obrigatórias
Carregar antes: `/using-superpowers`, `/test-writer`, `/test-driven-development`, `/playwright-best-practices`.

## Passos obrigatorios
1. Identificar escopo:
   - Se path fornecido, rodar testes apenas para esse path
   - Se nao, identificar arquivos alterados e rodar testes relacionados
2. Executar testes:
   - Unit/Integration: `npx vitest run [path]`
   - E2E (se aplicavel): `npx playwright test [path]`
3. Analisar resultados:
   - Listar testes que passaram e falharam
   - Para falhas: mostrar erro, localizacao e sugestao de correcao
4. Retornar:
   - Total de testes: passaram / falharam / skipped
   - Cobertura (se disponivel)
   - Proximos passos recomendados
