---
id: cmd-onboard
title: Onboarding de novo membro
category: project
skills:
  - using-superpowers
  - context-driven-development
---

# `/onboard [papel]` — Onboarding de novo membro

## Skills obrigatórias

Antes de executar, ativar:

- `/using-superpowers`
- `/context-driven-development`

## Passos obrigatórios

1. Identificar papel: Tech Lead / Designer / QA Jr.
2. Gerar contexto do projeto:
   - Ler `README.md` para stack e estrutura
   - Ler `WORKFLOW.md` para fluxo, precedência de docs e regras operacionais
   - Ler `docs/DOCS_INDEX.md` para fase atual
   - Ler `docs/S03_SKILLS_INDEX.md` para skills da fase
3. Apresentar resumo:
   - Fase atual e próximo gate
   - Stack utilizada
   - Documentos prioritários para o papel
   - Skills a ativar (de `docs/S03_SKILLS_INDEX.md`)
4. Checklist de setup:
   - [ ] Clonar repo e instalar dependências
   - [ ] Configurar variáveis de ambiente (ver `.env.example`)
   - [ ] Indexar projeto no Cursor (Command Palette > Reindex)
   - [ ] Ler docs da fase atual
   - [ ] Ativar `/using-superpowers` no Cursor
   - [ ] (Fase 3+) Correr `npm run db:seed` para popular dados demo
5. Retornar guia personalizado para o papel.
