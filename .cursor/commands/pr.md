---
id: cmd-pr
title: Commit, push e abrir PR
category: ops
skills:
  - using-superpowers
  - verification-before-completion
  - finishing-a-development-branch
  - changelog-automation
  - pr
---

# `/pr` — Commit, push e abrir Pull Request

## Skills obrigatórias
Carregar antes: `/using-superpowers`, `/verification-before-completion`, `/finishing-a-development-branch`, `/changelog-automation`, `/pr`.

## Passos obrigatorios
1. Verificar status:
   - `git status` para ver arquivos modificados
   - `git diff --staged` e `git diff` para entender mudancas
2. Validar qualidade:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test` (se houver testes no escopo)
3. Verificar docs:
   - `bash scripts/verify-docs.sh`
   - Confirmar que `docs/13_RELEASE_READINESS.md` esta atualizado (se release)
4. Criar commit:
   - Usar conventional commits (feat:, fix:, docs:, refactor:, test:, chore:)
   - Mensagem focada no "por que", nao no "o que"
5. Push:
   - `git push -u origin HEAD`
6. Criar PR:
   - `gh pr create` com titulo claro e body estruturado
   - Incluir: resumo, mudancas principais, riscos, plano de teste
7. Retornar URL do PR
