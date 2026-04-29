# WORKFLOW.md — Guia Operacional VibeCoding

> **Primeiro comando de toda sessão:** `/using-superpowers`  
> Pacotes de prompt prontos: `docs/S02_PROMPT_PACKS.md`  
> Skills por fase: `docs/S03_SKILLS_INDEX.md`

---

## Princípios Operacionais

- Uma fase por vez, um objetivo por chat.
- Não iniciar implementação sem especificação aprovada.
- Sempre atualizar o documento da fase ao concluir.
- Se houver ambiguidade relevante, pausar e perguntar antes de codar.
- `bash scripts/verify-docs.sh` exit 0 obrigatório antes de fechar qualquer fase.

---

## Checklist Inicial (uma vez por projeto)

1. Confirmar estrutura mínima:
   - `.cursor/agents`, `.cursor/commands`, `.cursor/rules`, `.cursor/skills`
   - `docs/DOCS_INDEX.md`, `docs/S03_SKILLS_INDEX.md`, `WORKFLOW.md`
2. Validar indexação do projeto no Cursor (Command Palette → Reindex)
3. Garantir variáveis de ambiente locais configuradas
4. Executar `bash scripts/verify-docs.sh` — deve passar sem erros

---

## Precedência entre Documentos

Em conflito, obedecer esta ordem (a mais alta vence):

1. `docs/01_PRD.md` — o que construir
2. `docs/02_MONETIZATION.md` — modelo de negócio, pricing e pagamentos (gate antes de market/design)
3. `docs/06_SPECIFICATION.md` — como construir
4. `docs/05_DESIGN.md` — como deve parecer e comportar na UI
5. `docs/07_IMPLEMENTATION.md` — estado real implementado
6. `docs/00_VALIDATION.md` — direção de problema/mercado e limites de escopo
7. `docs/08_SECURITY.md`, `docs/09_TESTS.md`, `docs/10_DEBUG.md` — gates de qualidade

---

## Skills obrigatórias por comando (política)

Antes de seguir qualquer comando em `.cursor/commands/`, o agente **deve**:

1. abrir o `.md` do comando, ler o frontmatter `skills:`;
2. invocar/carregar cada skill listada (e as skills obrigatórias da fase atual em `docs/S03_SKILLS_INDEX.md`);
3. só então executar a ação descrita no comando.

A obrigatoriedade é amarrada por hooks (`beforeSubmitPrompt` em `.cursor/hooks.json`) e por verificação estática (`npm run verify:commands`). Comandos sem skills no frontmatter são considerados defeituosos.

---

## Subagents — quando usar

| Subagent | Quando usar |
|---|---|
| `explore` | Explorar codebase ampla; buscar por padrões; "onde está X?", "como funciona Y?" |
| `shell` | Git, npm, comandos de terminal; operações que exigem execução de comandos |
| `debugger` | Investigar bugs; code review com foco em riscos; antes de release |
| `security-auditor` | Revisão OWASP antes de deploy; ativar com `@security` |
| `test-writer` | Criar suites Vitest/Playwright; cobrir fluxos críticos |

Regra: tarefas estreitas (arquivo específico, comando único) → ferramentas diretas. Exploração ampla ou multi-etapa → subagent.

---

## Gates Globais de Qualidade

- **Gate técnico:** `npm run typecheck` e `npm run lint` sem erros
- **Gate testes:** `npm run test` verde para fluxos alterados
- **Gate segurança:** sem vulnerabilidade crítica conhecida; `npm audit` limpo
- **Gate documentação:** documento da fase atualizado e coerente com código
- **Gate UX:** fluxos críticos com estados completos, a11y mínima e clareza de copy
- **Gate verify-docs:** `bash scripts/verify-docs.sh` exit 0

---

## Fase 0 — /validate

**Objetivo:** decidir se vale investir.

**Skills:** `/using-superpowers` → `/brainstorming` → `/validate` → `/market`  
(ver `docs/S03_SKILLS_INDEX.md` — Fase 0)

**Entrada mínima:** problema · público · proposta de solução

**Saída obrigatória:** `docs/00_VALIDATION.md` com:
- evidências de dores em comunidades
- análise de concorrentes
- pesquisa de projetos GitHub e bibliotecas
- análise de build vs buy
- scoring e veredito GO/HOLD/NO-GO
- risco de segurança, compliance e privacidade por domínio
- risco de UX (fricção, curva de aprendizado, confiança)

**Gate de saída:** nota >= 7 → seguir para PRD.

---

## Fase 1 — /prd

**Objetivo:** transformar validação em requisitos de produto.

**Skills:** `/using-superpowers` → `/prd` → `/context-driven-development`  
(ver `docs/S03_SKILLS_INDEX.md` — Fase 1)

**Entrada:** `docs/00_VALIDATION.md` aprovado

**Saída:** `docs/01_PRD.md` com escopo, requisitos, prioridades, métricas e riscos  
`docs/03_RESEARCH.md` quando houver integrações relevantes

**Gate de saída:** requisitos testáveis e claros para engenharia/design → seguir para Fase 1b (monetização).

---

## Fase 1b — /monetization-check (gate obrigatório)

**Objetivo:** definir modelo de negócio antes de design e implementação.

**Skills:** `/using-superpowers` → `/brainstorming` → `/writing-plans`

**Entrada:** `docs/01_PRD.md` aprovado

**Saída:** `docs/02_MONETIZATION.md` com:
- Modelo de monetização escolhido com justificativa
- Provedor de pagamento definido (Stripe/Paddle/outro)
- Tiers de pricing definidos (máx 3)
- Impactos em segurança e UX documentados

**Gate de saída:** modelo aprovado — não avançar para Market/Design sem este gate.

---

## Fase 1c — /market (obrigatória antes de design e implementação)

**Objetivo:** pesquisa aprofundada em OSS, concorrentes, comunidades e consolidação.

**Skills:** `/using-superpowers` → `/market` → `/brainstorming` → `/architecture-decision-records`  
(ver `docs/S03_SKILLS_INDEX.md` — Fase 1c)

**Entrada:** `docs/00_VALIDATION.md` + `docs/01_PRD.md` + `docs/02_MONETIZATION.md` aprovado

**Saída:** `docs/04_MARKET_AND_REFERENCES.md` preenchido com:
- repositórios e soluções OSS (qualidade, licenças, CVEs)
- análise de concorrentes e referências de mercado
- comunidades e feedback real de usuários
- consolidação: ferramentas aprovadas, escopo confirmado/descartado, riscos e ADRs

**Gate de saída:** consolidação aprovada; nenhuma linha de código antes desta etapa.

---

## Fase 1D — /design

**Objetivo:** criar base visual e de acessibilidade.

**Skills:** `/using-superpowers` → `/design` → `/frontend-design` → `/tailwind-design-system` → `/accessibility-compliance`  
(ver `docs/S03_SKILLS_INDEX.md` — Fase 1D)

**Entrada:** `docs/01_PRD.md` + `docs/04_MARKET_AND_REFERENCES.md`

**Saída:** `docs/05_DESIGN.md` + `app/styleguide` navegável

**Gate de saída:**
- tokens definidos, componentes base, dark mode e a11y básica
- padrão de formulários, feedback, erros e navegação por teclado documentado
- preview de componentes + preview de páginas **aprovado antes de /spec**

---

## Fase 2 — /spec

**Objetivo:** gerar plano técnico executável.

**Skills:** `/using-superpowers` → `/spec` → `/api-design-principles` → `/openapi-spec-generation` → `/postgresql-table-design`  
(ver `docs/S03_SKILLS_INDEX.md` — Fase 2)

**Entrada:** `docs/01_PRD.md` + `docs/05_DESIGN.md`

**Saída:** `docs/06_SPECIFICATION.md` com arquivos, contratos e ordem de implementação

**Gate de saída:**
- implementação possível sem "decidir no meio do caminho"
- controles de segurança, privacidade e UX mensuráveis por fluxo
- sem TODOs abertos — lacuna vira bloqueio explícito

---

## Fase 3 — /implement-backend e /implement-frontend

**Objetivo:** implementar com aderência total à spec.

**Skills backend:** `/using-superpowers` → `/implement-backend` → `/test-driven-development` → `/secrets-management`  
**Skills frontend:** `/using-superpowers` → `/implement-frontend` → `/react-state-management` → `/accessibility-compliance`  
(ver `docs/S03_SKILLS_INDEX.md` — Fases 3B e 3F)

**Regras:**
- backend e frontend em lotes pequenos
- cada lote fecha com validação técnica
- atualização contínua de `docs/07_IMPLEMENTATION.md`
- ciclo TDD: RED → GREEN → REFACTOR
- `/secrets-management` antes de todo commit
- após primeira migration: `npm run db:seed` (dados demo, `isDemo=true`); `npm run db:demo:wipe` para limpar

**Gate de saída:** fluxo crítico funcionando ponta a ponta localmente, com dados demo verificáveis.

---

## Fase 4 — Quality Agents

**Objetivo:** validar readiness de release.

**Skills:** ver `docs/S03_SKILLS_INDEX.md` — Fases 4a, 4b, 4c, 4d, 4e

Executar em paralelo:

| Track | Skill(s) | Saída |
|---|---|---|
| Security | `/secrets-management` `/k8s-security-policies` | `docs/08_SECURITY.md` |
| Testes | `/test-writer` `/playwright-best-practices` | `docs/09_TESTS.md` |
| Debug | `/debugger` `/systematic-debugging` | `docs/10_DEBUG.md` |
| UX Audit | `/accessibility-compliance` `/interaction-design` | `docs/11_UX_AUDIT.md` |
| Threat Model | `/k8s-security-policies` `/auth-implementation-patterns` | `docs/12_THREAT_MODEL.md` |

**Gate de saída:**
- nenhum bloqueio crítico em segurança, testes e debug
- sem regressão crítica de UX
- risco residual explicitamente aceito com owner e prazo

---

## Fase Final — /pr

**Objetivo:** abrir PR com checklist completo.

**Skills:** `/using-superpowers` → `/verification-before-completion` → `/finishing-a-development-branch` → `/changelog-automation` → `/release` → `/pr`  
(ver `docs/S03_SKILLS_INDEX.md` — Fase Final)

**Checklist mínimo:**
- diff revisado
- `bash scripts/verify-docs.sh` exit 0
- typecheck/lint/test ok
- commit semântico e mensagem clara
- PR com resumo, riscos e plano de teste
- `docs/13_RELEASE_READINESS.md` preenchido com decisão GO/GO WITH RISK/NO-GO

---

## Quando Reiniciar o Chat

- Contexto longo demais
- Repetição de erro
- Troca de fase
- Mudança forte de escopo

---

## Quando Usar Hotfix vs Fix-Issue

| Situação | Usar |
|---|---|
| Bug normal, próximo release | `/fix-issue` ou fluxo padrão |
| Produção down (SEV-1), segurança crítica (SEV-2) | `/hotfix` — ver `.cursor/commands/hotfix.md` |

Hotfix: branch de main, merge main + develop, tag semver, post-mortem em 48h.  
Template: `docs/OPS03_POST_MORTEM.md`.

---

## Checklist de Verificação dos Materiais (Revisão Periódica)

```bash
bash scripts/verify-docs.sh
npm run verify:framework
bash scripts/verify-docs-integrity.sh
```

`verify-docs.sh` verifica: docs de fase VibeCoding · gates técnicos · DOCS_INDEX · estrutura `.cursor/` incl. Web Excellence.  
`verify-framework` valida o grafo das 71 skills em `.cursor/skills-web-excellence/`.  
`verify-docs-integrity` valida frontmatter/links **apenas** em `docs/web-excellence/` e `.cursor/skills-web-excellence/`.

Ao revisar docs, agents e skills:
- [ ] Referências cruzadas corretas (`/docs/`, `docs/`)
- [ ] DOCS_INDEX com todos os documentos listados
- [ ] `S03_SKILLS_INDEX.md` atualizado com novas skills
- [ ] Agents referenciam estrutura dos docs da Fase 4 (08 a 12)
- [ ] Skills design e implement-frontend alinhados a S05_DESIGN_REFERENCES e S04_IMAGE_GENERATION
- [ ] PROMPT_PACKS sincronizado com skills

---

## Pipeline Web Excellence (páginas / marketing / SEO)

Complementa o fluxo VibeCoding **depois** de PRD e spec definidos para o que entra no produto.

| Fase | Agent | Commands típicos |
|------|--------|------------------|
| 1 | Architect | `/init-project` (brownfield: ver aviso no command; não usar create-next-app na raiz) |
| 2 | Designer | `/init-tokens` |
| 3 | Builder | `/new-page`, `/new-component`, `/new-section` |
| 4 | SEO | `/init-seo`, skills `seo/*` |
| 5 | Assets | `/gen-image`, `/gen-copy`, … |
| 6 | QA | `/audit-full`, `/audit-a11y`, … |
| 7 | Deploy | checklist pre-deploy |

**Índices:** `.cursor/agents/AGENTS_INDEX.md`, `.cursor/commands/COMMANDS_INDEX.md`, `.cursor/skills-web-excellence/SKILLS_INDEX.md`, `docs/web-excellence/DOCS_INDEX.md`.

---

## Anti-padrões (Proibido)

- Codar sem `docs/06_SPECIFICATION.md` aprovada
- Alterar escopo sem atualizar docs
- Adicionar dependência sem justificativa
- Finalizar fase sem gate fechado
- Liberar fluxo sensível sem authz testada e sem tratamento de erro UX
- Abrir PR sem `docs/13_RELEASE_READINESS.md` preenchido
- Fechar fase sem `bash scripts/verify-docs.sh` exit 0

---

## Definição de Pronto por Fase

- Fase só fecha com documento atualizado e checklist marcado.
- Lacunas registadas em "Riscos / Suposições / Pendências" do doc da fase.
- Sem checklist de segurança e UX fechado, fase não é considerada pronta.
- Sem owner definido para risco residual, item não pode ser marcado como pronto.
- `bash scripts/verify-docs.sh` deve retornar exit 0 antes de fechar qualquer fase.

---

## Comandos de Verificação Preferidos

```bash
npx tsc --noEmit src/path/to/file.ts          # typecheck focado
npx eslint --fix src/path/to/file.ts          # lint focado
npx vitest run src/path/to/file.test.ts       # teste focado
bash scripts/verify-docs.sh                   # gates VibeCoding
bash scripts/verify-docs-integrity.sh         # frontmatter/links Web Excellence
npm run verify:framework                      # grafo de skills Web Excellence
npm run verify:commands                       # skills no frontmatter de cada command
npm run typecheck && npm run lint && npm run test  # validação completa
```
