# 01_PRD.md — Product Requirements Document

> **Skills:** `/using-superpowers` `/prd` `/context-driven-development` `/writing-plans`
> **Prompt pack:** `S02_PROMPT_PACKS.md` → Fase 1
> **Responsável:** Tech Lead
> **Depende de:** [`00_VALIDATION.md`](00_VALIDATION.md) (status: APPROVED — GO COM ESCOPO REPOSICIONADO em 2026-04-25)
> **Gate de saída:** Requisitos priorizados e critérios de aceitação testáveis aprovados; e [`02_MONETIZATION.md`](02_MONETIZATION.md) aprovado antes de `/design`
> **ADRs aplicáveis:** [0001-reposicionamento](decisions/0001-reposicionamento-copiloto-de-vida.md), [0002-phone-call-recording](decisions/0002-phone-call-recording.md), [0003-niveis-de-autonomia](decisions/0003-niveis-de-autonomia.md), [0004-arquitectura-de-espacos](decisions/0004-arquitectura-de-espacos.md), [0005-memoria-e-auto-evolucao](decisions/0005-memoria-e-auto-evolucao.md), [0006-skills-marketplace-e-ceo-agent](decisions/0006-skills-marketplace-e-ceo-agent.md)

Status: APPROVED (reposicionado em 2026-04-25)
Data: 2026-04-24 (criado) · 2026-04-25 (reposicionado)
Autor: Tech Lead (CloudVoice)

> **Nota de reposicionamento (2026-04-25):** Este PRD foi reposicionado de "voz → tarefas profissional" para **"copiloto de vida com Espaços"**. O MVP cobre **Onda 1** (Web PWA + Android + Espaços essenciais + agentes especializados básicos). Funcionalidades fora do MVP estão em **Onda 2** e **Onda 3** (Seção 12). Ver [ADR-0001](decisions/0001-reposicionamento-copiloto-de-vida.md).

---

## 1. Contexto e Problema

- **Problema validado:** pessoas operam em **múltiplos contextos por dia** (trabalho, família, saúde, fé, finanças, estudos) e perdem informação dita oralmente em todos eles; transformar isso em ações, decisões e contexto partilhado **com o nível certo de privacidade por contexto** é manual, fragmentado e demorado. Ver [00_VALIDATION.md §6](00_VALIDATION.md#6-problema-icp-e-jtbd) e Parte III (§26-32).
- **Evidência:** [00_VALIDATION.md §7](00_VALIDATION.md#7-evidências-externas) — Otter, Granola, Limitless, Plaud captaram > US$ 200M cobrindo apenas o ângulo profissional. Mercados família, fé e saúde permanecem mal servidos; concorrentes não oferecem **isolamento por contexto, agentes especializados ou multi-domínio na mesma identidade**.
- **Por que agora:** STT streaming barato (Deepgram, Fireworks), VAD on-device maduro (Silero), LLMs rápidos para intenção/classificação (GPT-4o-mini, Haiku, Mistral Nemo), primitivas mobile maduras para captura consentida, e padrões emergentes de personalização de agentes (memória episódica, skills marketplace). Janela competitiva curta (12–18 meses) antes de Apple Intelligence/Gemini comoditizarem a camada base — diferenciação por **Espaços + agentes especializados + colaboração granular**.
- **Restrições herdadas da validação:** modelo económico **não** pode depender do Fire Pass (passe pessoal, [proibido em production workloads](https://docs.fireworks.ai/firepass)); captura "sempre ligada" 24/7 inviável globalmente — substituída por **captura por sessão consentida** + modos auxiliares (calendar-aware, hardware trigger, always-on Android Onda 3) por Espaço.

---

## 2. Objetivos e Não Objetivos

**Objetivos (MVP / Onda 1):**

- Capturar conversas em sessões consentidas (mobile + web), com indicador visível e consentimento explícito
- Organizar tudo em **Espaços** (mín. 5 canónicos: `personal`, `work`, `family`, `health`, `finance`) com **isolamento de dados por Espaço** (RLS + chaves de encriptação separadas)
- **Roteador de Espaços** (Camadas 1, 2, 4 — manual + contextual + re-classificação manual; Camada 3 LLM em Onda 2) que classifica cada sessão no Espaço correcto
- **Agente especializado por Espaço** (até 3 personas no Pessoal, 5 no Pro) com memória de usuário
- Transcrever, gerar resumos no estilo do Espaço, sugerir ações e executar em módulo nativo de tarefas com **autonomia configurável** (ver [ADR-0003](decisions/0003-niveis-de-autonomia.md))
- Permitir partilha de tarefas dentro do Espaço `work` (RBAC) e dentro do Espaço `family` (família/casal)
- Trilha de auditoria de toda mutação executada por IA, **por Espaço**
- **Free tier 300 min/mês** + **Pessoal $9** + **Pro $19** + **Família $29** disponíveis no MVP

**Não objetivos (Onda 1):**

- Captura "sempre ligada" 24/7 sem trigger — apenas sessão consentida + calendar-aware (Onda 2) + always-on Android (Onda 3)
- Hotword on-device personalizada — usar atalhos físicos/gestuais
- Execução automática silenciosa cat 5+ — apenas cat 1-4 com undo no MVP
- Integrações externas além de Calendar (read-only) e Notion básico — Trello/ClickUp/Slack/Asana entram em Onda 2
- Kanban, calendário, linha do tempo completos — Onda 2 (MVP entrega apenas Lista + Linha-tempo)
- App iOS nativo — Onda 2 (MVP cobre Web PWA universal + Android nativo)
- Skill Builder UI / Marketplace pago — Onda 2
- CEO Agent / Enterprise tier — Onda 3
- Phone call recording (qualquer caminho) — Onda 3 + add-on específico ([ADR-0002](decisions/0002-phone-call-recording.md))
- Confidential computing (Nitro Enclaves) — Onda 3
- Multi-idioma além de PT-BR e EN
- Hardware dedicado (pendant, watch button) — Onda 2/3

---

## 3. Personas


| Persona                                      | Perfil                                           | Dor principal                                                              | Espaços ativos                       | Ganho esperado                                                                |
| -------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| Primária — *Camila, consultora independente* | 32, gere 8–12 reuniões/dia, vida pessoal/família | Perde decisões/ações; mistura trabalho com pessoal; sem privacidade clara  | `work`, `personal`, `family`, `finance` | Espaços separados; agentes específicos; ações 1-tap; cross-space search opcional |
| Secundária — *Rafael, PM em squad de 6*      | 35, casado, dois filhos, devocional aos domingos | Trabalho misturado com família; igreja não tem ferramenta dedicada         | `work`, `family`, `church`, `personal` | Agente Pastoral; agente Família; isolamento entre contextos; `work` partilhado com squad |
| Terciária — *Família Silva*                  | Casal + 2 filhos teen, app Família partilhado    | Listas dispersas; combinados perdidos; sem tooling pessoal acessível       | `family` partilhado + Espaços individuais por membro | 4 utilizadores num só billing; `family` partilhado; permissões parentais        |
| Quaternária — *Drª Ana, médica*              | 38, clínica privada + plantões + diário pessoal  | Privacidade absoluta exigida em saúde; ferramenta única não cobre          | `health` (E2EE), `work`, `personal`  | Espaços com encriptação E2EE; agente Médico de Família; nada partilhado |
| Quinta — *Equipa pequena (≤ 25)*             | Agência ou squad B2B                             | Cada um anota o seu; decisões duplicadas                                   | `work` partilhado + Espaços individuais | RBAC + partilha + auditoria + agentes especializados                            |
| Sexta (Onda 3) — *Pedro, CEO*                | 47, lidera empresa de 200 pessoas                | Não tem agregado real do que está a acontecer organizacionalmente          | `work` cross-org agregado            | CEO Agent com k-anonymity ≥ 5; sem drill-down individual                       |


---

## 4. Requisitos Funcionais Priorizados (MoSCoW)

### Must Have (P0 — MVP / Onda 1)


| ID     | Requisito                                                                                                                     | Valor para o usuário                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| RF-001 | Sessão de captura consentida com indicador visível em mobile e web                                                            | Confiança; conformidade com lojas e LGPD/GDPR        |
| RF-002 | Transcrição streaming com fornecedor STT (Deepgram Nova-2 primário; AssemblyAI fallback)                                       | Tempo real; baixa latência percebida                 |
| RF-003 | **Espaços canónicos:** `personal`, `work`, `family`, `health`, `finance` (5 mín. no MVP) com isolamento por RLS + chaves       | Privacidade granular; vida multi-contexto             |
| RF-004 | **Roteador de Espaços** Camadas 1, 2, 4 (manual pre-tag + contextual auto-arm + re-classificação manual)                       | Atribui sessão ao Espaço correcto sem fricção        |
| RF-005 | **Agente especializado por Espaço** com persona base e templates (work, family, personal, health, finance)                     | Output relevante ao contexto                         |
| RF-006 | **Memória de usuário por Espaço** (camadas: imediata + curta + trabalho); refresh semanal de prompt no Pro+                   | Agente que aprende com o tempo                        |
| RF-007 | Resumo automático por sessão + extração de ações sugeridas (estilo definido pelo Espaço)                                       | Output útil em < 30s pós-sessão                      |
| RF-008 | Módulo de tarefas nativo: Lista + Linha-tempo; criar, marcar concluído, atribuir owner/prazo                                   | Substituto mínimo a integração externa               |
| RF-009 | **Autonomia configurável por categoria** (cat 1-4 disponíveis no MVP; default Suggest/Confirm; ver [ADR-0003](decisions/0003-niveis-de-autonomia.md)) | Confiança + automação prática                        |
| RF-010 | Identidade + organizações + roles (owner/admin/member/viewer) via Clerk                                                        | RBAC base para partilha                              |
| RF-011 | **Plano Família (4 utilizadores)** com `family` Espaço partilhado e Espaços individuais isolados                              | Caso de uso família validado                         |
| RF-012 | Partilha de tarefas em `work` (RBAC) e `family` (membros designados)                                                          | Colaboração no Espaço correcto                       |
| RF-013 | **Espaços sensíveis com E2EE** (`health`, `diary`, `mental_health`) — chave derivada device-side                               | Privacidade radical onde é exigido                   |
| RF-014 | Trilha de auditoria por mutação (quem, quando, sessão de origem, Espaço)                                                       | Conformidade + confiança                             |
| RF-015 | Encriptação at-rest e in-transit; retenção configurável **por Espaço** (default 30 dias); "apagar Espaço" 1-clique             | LGPD/GDPR + threat model                             |
| RF-016 | Onboarding de privacidade + escolha de 2 Espaços iniciais (Free) / 5 (Pessoal+) antes da primeira gravação                     | Time-to-value + conformidade                         |
| RF-017 | Billing via Stripe — **Free 300 min · Pessoal $9 · Pro $19 · Família $29 · Team $39/seat**                                     | Sustentabilidade económica                           |
| RF-018 | **Cost dashboard** por Espaço (minutos consumidos, custo de IA, % do tier); avisos a 80%                                        | Transparência económica desde dia 1                  |
| RF-019 | **Cross-space search** opcional (excluindo Espaços marcados como sensíveis); off por default em sensíveis                       | Memória pessoal sem violação de privacidade          |
| RF-020 | Skills built-in básicas (≥ 15) por Espaço — sem Skill Builder UI no MVP                                                       | Capacidade de domínio sem custo de desenvolvimento adicional |


### Should Have (P1 — MVP se houver folga)


| ID     | Requisito                                                                                       | Valor                             |
| ------ | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| RF-021 | Atalhos físicos para iniciar sessão (gesto Android, atalho de teclado web)                       | Reduz fricção sem hotword         |
| RF-022 | VAD on-device para pausar STT em silêncio (Silero)                                              | Reduz custo de inferência em ~40% |
| RF-023 | Histórico pesquisável por palavra-chave por Espaço                                              | Recall                            |
| RF-024 | Modo *retain 0 days* (streaming sem persistência de áudio bruto) por Espaço                     | Privacidade radical opcional      |
| RF-025 | Exportação completa de dados por usuário (JSON + áudio) por Espaço                             | LGPD Art. 18 / GDPR Art. 20       |
| RF-026 | *Undo* até 30 min após execução de ação por IA (cat 4 com undo disponível ao MVP)               | Tolerância a erro                 |
| RF-027 | Quiet Hours / Boundary Mode por Espaço                                                          | Mental separation                  |


### Could Have (P2 — Onda 2)


| ID     | Requisito                                          | Valor                |
| ------ | -------------------------------------------------- | -------------------- |
| RF-028 | Notificação resumo diário por Espaço               | Engagement           |
| RF-029 | Convidar membros por email com role pré-definido   | Setup organizacional |
| RF-030 | Sub-Espaços (até 3 por Espaço pai)                 | Granularidade        |
| RF-031 | Calendar-aware capture (auto-arm em reuniões)      | Automação            |
| RF-032 | Recall Bot para Zoom/Meet/Teams (add-on)           | Captura sem app aberto |
| RF-033 | Skill Builder UI + Marketplace gratuita            | Customização agente  |
| RF-034 | Integrações Trello/ClickUp/Slack/Asana              | Workflow profissional |
| RF-035 | Vista Kanban + Calendário + Linha-tempo completas  | Tooling visual        |
| RF-036 | App iOS nativo                                      | Paridade plataforma   |
| RF-037 | Speaker ID com biometria (add-on, opt-in)          | Distinguir falantes   |
| RF-038 | Roteador Camada 3 (LLM content classification)     | Classificação fina    |


### Won't Have (Onda 1)

- Captura ambiente sempre-ligada sem trigger (Onda 3 Android-only)
- Hotword personalizada (Onda 3 com custom voiceprint)
- Phone call recording (Onda 3 — caminhos B/C/D, ver [ADR-0002](decisions/0002-phone-call-recording.md))
- CEO Agent + Enterprise tier (Onda 3, ver [ADR-0006](decisions/0006-skills-marketplace-e-ceo-agent.md))
- Marketplace pago de skills (Onda 2/3)
- Confidential computing (Nitro Enclaves) (Onda 3)
- Cat 5+ silent auto-execution (apenas em Pro+ Onda 2)
- Hardware dedicado próprio (pendant, watch button) — Onda 2/3
- Multi-idioma além de PT-BR e EN

---

## 5. Requisitos Não Funcionais


| Requisito                                      | Métrica alvo                                                                                                             | Como medir                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Latência de transcrição                        | P95 < 1500ms entre fala e palavra renderizada                                                                            | Telemetria streaming STT                |
| Latência ação por voz                          | P95 < 3s entre fim de fala e notificação de confirmação                                                                  | Telemetria pipeline LLM                 |
| Disponibilidade                                | 99,5% mensal (mobile pode degradar para offline-first)                                                                   | Probes Sentry + uptime check            |
| Custo de IA por usuário ativo (medium tier) | < US$ 15/mês                                                                                                             | Painel de custo agregado por usuário |
| Segurança                                      | Encriptação at-rest (KMS por organização) + in-transit (TLS 1.3); rate limit por endpoint; OWASP Top 10 endereçado       | Auditoria `08_SECURITY.md`              |
| Acessibilidade                                 | WCAG 2.2 AA; navegação por teclado; alternativa visual para tudo que é só áudio                                          | axe-core + testes manuais               |
| Responsividade                                 | Mobile-first 320px+; web app funcional em browsers modernos (Chrome, Safari, Firefox últimos 2 anos)                     | Playwright cross-browser                |
| Observabilidade                                | Logs estruturados; alertas para falha de STT/LLM/billing; trace de cada sessão                                           | Sentry + Amplitude + logs estruturados  |
| Privacidade                                    | Indicador visível enquanto grava; consentimento explícito por sessão; opção *retain 0 days*                              | Auditoria UX + revisão jurídica         |
| Performance Web                                | LCP < 2,5s; CLS < 0,1; INP < 200ms; First Load JS < 200KB ([Constituição §3](../.cursor/rules/core/00-constitution.mdc)) | Lighthouse CI                           |


---

## 6. Stack e Restrições Técnicas

- **Stack confirmada:** Next.js 15 App Router · TypeScript strict · Tailwind v4 · shadcn/ui · Prisma · Stripe · Clerk (já presentes no repo conforme [README.md](../README.md))
- **Stack a adicionar (proposta):**
  - **STT streaming:** Deepgram Nova-2 (primário) com adapter para AssemblyAI e Fireworks (fallback) — decisão final em `03_RESEARCH.md`
  - **LLM intenção/resumos:** OpenAI GPT-4o-mini (primário) + provider abstraction; spike adicional com Fireworks (pay-per-use, **não** Fire Pass) e Anthropic Haiku
  - **VAD on-device:** Silero VAD (web via WebAssembly + Android nativo)
  - **Mobile Android:** React Native + Expo — para reaproveitar TypeScript e partilhar lógica com web
  - **Storage de áudio:** object storage **S3-compatible** (SeaweedFS self-hosted no MVP, via ADR-0008) + criptografia por Espaço (E2EE quando aplicável)
  - **Push:** Expo Notifications (FCM)
  - **Pipeline orquestração voz:** avaliar [LiveKit Agents](https://github.com/livekit/agents) vs *home-grown* em `03_RESEARCH.md`
- **Restrições de compliance:** LGPD (Brasil), GDPR (UE), CCPA (Califórnia se vendermos lá); voz tratada como dado biométrico; consentimento granular obrigatório
- **Restrições de orçamento/prazo:** MVP em 12–16 semanas após GO; equipe inicial 2–3 engenheiros + 1 designer (alocação a confirmar em `02_MONETIZATION.md`)
- **Restrições explícitas:** **não** depender do Fire Pass para inferência ([00_VALIDATION.md §K5](00_VALIDATION.md#3-kill-criteria-definidos-antes-da-pesquisa))

---

## 7. Critérios de Aceitação (Given/When/Then)

**RF-001 — Sessão de captura consentida**

- *Given* usuário autenticado em mobile ou web
- *When* toca "Iniciar sessão" pela primeira vez
- *Then* vê tela de consentimento (3 telas), grava só após confirmar; durante gravação aparece indicador persistente (banner topo + ícone barra de notificações)
- *Error case:* se permissão de microfone negada, mostrar instruções para reabilitar

**RF-002 — Transcrição streaming**

- *Given* sessão ativa com permissão de microfone
- *When* usuário fala
- *Then* texto aparece na UI em < 1500ms P95; sessão pode ser pausada/retomada; transcrição persiste mesmo se rede cair (buffer local + reenvio)
- *Error case:* perda de rede > 30s exibe banner "modo offline — gravando localmente"

**RF-003 — Classificação por contexto**

- *Given* sessão concluída com transcrição
- *When* sistema processa
- *Then* atribui rótulo "pessoal" ou "trabalho" via heurística (palavras-chave, organização ativa, hora do dia); usuário pode alterar com 1 tap
- *Error case:* baixa confiança → marca como "indefinido" e pede ao usuário

**RF-004 — Resumo + ações sugeridas**

- *Given* sessão concluída de duração ≥ 30s
- *When* processamento termina
- *Then* usuário recebe notificação com: resumo (≤ 5 bullets) + lista de até 5 ações sugeridas, cada uma com título e contexto
- *Error case:* falha LLM → manter transcrição; oferecer "tentar novamente"

**RF-005 — Módulo de tarefas nativo**

- *Given* usuário autenticado
- *When* navega para "Tarefas"
- *Then* vê lista filtrada por contexto e organização; pode criar, editar, marcar concluído, atribuir owner e prazo; suporta operações por voz com confirmação (RF-006)
- *Error case:* conflito de edição simultânea resolve por *last-write-wins* + notificação

**RF-006 — Confirmação default ON**

- *Given* IA infere mutação a partir de fala (criar tarefa, marcar concluído, alterar prazo)
- *When* intenção identificada
- *Then* enviar push + card in-app com *preview* da mutação e botão "Confirmar"; default ON exige confirmação para mutações de alto risco
- *Error case:* timeout 5 min sem confirmação → descarta e regista no histórico

**RF-007 — Identidade + organizações + roles**

- *Given* usuário novo
- *When* cria conta
- *Then* pode criar organização, convidar membros, atribuir roles (owner/admin/member/viewer); roles são respeitados em todas as APIs
- *Error case:* tentar mutar como viewer retorna 403 com mensagem clara

**RF-008 — Partilha view/edit**

- *Given* tarefa criada por usuário A em organização X
- *When* A partilha com B (mesma organização) em modo "edit"
- *Then* B vê + edita; em modo "view", B só vê; mudança de modo é registada na auditoria
- *Error case:* partilha cross-organização exige convite explícito + aceitação

**RF-009 — Auditoria**

- *Given* qualquer mutação iniciada por IA ou humano
- *When* aplicada
- *Then* registo imutável: timestamp, ator, sessão de origem (se aplicável), trecho de transcrição, *diff* da mutação
- *Error case:* falha em gravar auditoria **bloqueia** mutação (fail-closed)

**RF-010 — Privacidade e retenção**

- *Given* usuário em configurações
- *When* define retenção (0/7/30/90/365 dias) ou clica "apagar tudo"
- *Then* sistema apaga áudio bruto conforme política em até 24h; transcrições e tarefas seguem regra separada; "apagar tudo" exige confirmação dupla
- *Error case:* falha em apagar gera ticket interno + notificação ao usuário em 24h

**RF-011 — Onboarding de privacidade**

- *Given* usuário novo, primeira abertura
- *When* tenta iniciar sessão
- *Then* fluxo de 3 ecrãs explicando: (1) o que é gravado e quando, (2) onde fica e por quanto tempo, (3) como apagar tudo; aceitar é registado na auditoria
- *Error case:* recusa → não permite gravação; resto do app funcional (modo só-tarefas)

**RF-012 — Billing**

- *Given* usuário em organização
- *When* uso atinge limites do tier
- *Then* aviso em 80%, bloqueio em 100% (com opção de upgrade self-service via Stripe Checkout); webhook Stripe sincroniza estado
- *Error case:* webhook falha → reconciliação por job nightly

---

## 8. Jornada Principal (fluxo de maior valor)

1. Camila abre o app no Android, toca o atalho de captura
2. Indicador persistente aparece; ela diz "Estou na call com cliente Y, anota: precisamos enviar portfólio até quinta"
3. Ao terminar a sessão, em < 30s recebe notificação: resumo (3 bullets) + 1 ação sugerida ("Enviar portfólio para cliente Y — prazo quinta")
4. Aceita; tarefa criada no contexto "trabalho", atribuída a si com prazo
5. Mais tarde diz "Marca a tarefa do portfólio como concluída"
6. Recebe notificação de confirmação com *preview* — toca "Confirmar"
7. Mutação aplicada; auditoria registada; se Camila tem colega Rafael na organização com a tarefa partilhada, Rafael recebe notificação da mudança

**Edge cases críticos:**

- Microfone bloqueado → fluxo de re-permissão claro
- Sessão > 60 min → split automático com avisos a cada 30 min
- Múltiplos dispositivos simultâneos → só uma sessão ativa por usuário
- IA infere mutação ambígua → cartão de desambiguação ("Qual tarefa do portfólio?")

---

## 9. Impacto Técnico

- **Entidades novas (Prisma):** `Organization` (extensão Clerk), `Membership`, `Session` (de captura), `Transcript`, `AudioBlob`, `Task`, `TaskShare`, `AuditLog`, `RetentionPolicy`, `UsageMeter`
- **Endpoints novos (App Router):**
  - `POST /api/sessions` (start), `PATCH /api/sessions/:id` (stop/pause)
  - `WS /api/stt` (streaming proxy ao Deepgram)
  - `POST /api/intents` (LLM → ação sugerida)
  - `POST /api/actions/:id/confirm` (executar mutação após confirmação)
  - CRUD `/api/tasks`, `/api/shares`, `/api/audit`
  - `POST /api/webhooks/stripe` (já existe — estender)
  - `POST /api/webhooks/clerk` (sincronizar org/membership)
- **Integrações externas:** Deepgram (STT), OpenAI (LLM), storage S3-compatible (áudio; SeaweedFS no MVP), Expo (push), Stripe (billing), Clerk (auth)
- **App mobile:** React Native + Expo no monorepo (decisão final em `06_SPECIFICATION.md`); partilha tipos com web via package interno
- **Risco de compatibilidade:** sem Prisma para mobile — mobile consome API REST/WS; tipos partilhados via package
- **Dependências críticas:** Deepgram (SLA + cota); OpenAI (limites); APNs (Fase 2); FCM (MVP)

---

## 10. Métricas de Sucesso


| Métrica                                   | Tipo    | Meta 30d | Meta 90d |
| ----------------------------------------- | ------- | -------- | -------- |
| Time-to-value (1ª ação útil)              | Leading | < 5 min  | < 3 min  |
| Sessões/usuário ativo/semana           | Leading | ≥ 3      | ≥ 8      |
| Taxa de confirmação de ações sugeridas    | Leading | ≥ 50%    | ≥ 70%    |
| Retenção D30                              | Lagging | ≥ 25%    | ≥ 35%    |
| ARPU                                      | Lagging | US$ 12   | US$ 22   |
| Custo IA / usuário ativo (medium tier) | Lagging | ≤ US$ 18 | ≤ US$ 12 |
| NPS                                       | Lagging | ≥ 30     | ≥ 45     |


**Sinais de falha (kill no pós-lançamento):**

- Taxa de erro em mutações por IA > 5% por 2 semanas seguidas → desativar execução automática
- Custo / usuário ativo > ARPU em qualquer tier por 1 mês → revisar pricing antes de escalar
- > 10% reviews mencionando "vigilância" ou "privacidade" → revisar comunicação e onboarding

---

## 11. Riscos e Mitigações


| Risco                                          | Probabilidade | Impacto | Mitigação                                                                                                                            |
| ---------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Rejeição em App Store / Play Store             | Média         | Alto    | Modo sessão (não 24/7); indicador visível; descrição honesta; spike TestFlight em paralelo ao MVP                                    |
| LGPD/GDPR — voz de terceiros                   | Alta          | Alto    | Consentimento por sessão; modo trabalho exige adesão organizacional; DPIA antes do release                                           |
| Custo de IA acima do ARPU                      | Média         | Alto    | VAD on-device; tiers com limites; dashboards de custo por usuário desde dia 1                                                     |
| Latência ação por voz > 3s                     | Média         | Médio   | Pipeline streaming (LiveKit Agents ou home-grown); LLM rápido (Groq/Fireworks routers pay-per-use)                                   |
| Confiança quebra após erro                     | Média         | Alto    | Confirmação default ON; *undo* 30 min (P2); auditoria visível                                                                        |
| Apple Intelligence / Gemini comoditiza captura | Alta          | Médio   | Diferenciar pela camada colaborativa (RBAC, partilha, ações em terceiros) — ver `02_MONETIZATION.md` e `04_MARKET_AND_REFERENCES.md` |
| Equipa subdimensionada                         | Média         | Médio   | Escopo MVP enxuto (sem iOS, sem integrações, sem kanban); Fase 2 explícita                                                           |


---

## 12. Plano de Rollout (Ondas)

### Onda 1 — MVP (16-20 semanas pós-GO)

- Plataformas: **Web PWA universal** (Next.js 15) + **Android nativo** (React Native + Expo)
- Espaços: 5 canónicos (`personal`, `work`, `family`, `health`, `finance`) com isolamento + RLS
- Roteador de Espaços: Camadas 1, 2, 4 (sem LLM content classification)
- Agentes especializados base por Espaço; memória curta + trabalho; refresh semanal de prompt (Pro+)
- Skills built-in: ≥ 15 por Espaço; sem Skill Builder UI
- Módulo tarefas: Lista + Linha-tempo
- Autonomia: cat 1-4 com undo
- Tiers disponíveis: **Free, Pessoal, Pro, Família, Team**
- E2EE para Espaços sensíveis
- Cost dashboard
- Integrações: Calendar (read-only), Notion (básico)

### Onda 2 (20-32 semanas)

- iOS nativo (paridade)
- Roteador Camada 3 (LLM content classification)
- Sub-Espaços + Espaços customizados
- Skill Builder UI + marketplace gratuita
- Integrações completas (Trello, ClickUp, Slack, Asana, Salesforce, HubSpot)
- Vistas Kanban + Calendário completas
- Calendar-aware capture
- Recall Bot (Zoom/Meet/Teams) — add-on
- Speaker ID com biometria — add-on
- Hardware trigger (botão Bluetooth) — add-on
- Tier **Business** (introdução)

### Onda 3 (32+ semanas)

- Always-on Android (background buffer 30s, com revisão jurídica DPIA reforçada)
- Phone call recording: OEM auto-sync (B), Conference call add-on "Ligar Gravando" (C)
- **CEO Agent + tier Enterprise** com k-anonymity ≥ 5 e auditoria reforçada
- VoIP integrado (D) para Enterprise
- Confidential computing (Nitro Enclaves) — opcional Business / incluído Enterprise
- Cat 5-8 silent auto-execution (Pro+ com auditoria reforçada)
- Wear OS / Apple Watch trigger
- Self-hosted Enterprise

### Feature flags / rollback

- Todas as integrações externas, modos de captura especiais, execução cat 5+, marketplace pago, CEO Agent, phone call recording — **gated por feature flag**
- Se sinal de falha (Seção 10) ativa por > 1 semana → desligar feature flag e rollback

---

## 13. Premissas e Dependências

- Veredito da Fase 0 vira **GO** após resolução dos 3 bloqueios
- `02_MONETIZATION.md` aprovado antes de `/design` (gate obrigatório)
- Acesso a Deepgram, OpenAI, Supabase, Expo, Stripe, Clerk com contas ativas no início da Fase 3
- Equipa: 2–3 engenheiros + 1 designer + apoio jurídico pontual
- Mercado primário: Brasil + EUA (PT-BR + EN)

---

## 14. Glossário


| Termo                  | Definição                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| Sessão de captura      | Janela explícita iniciada pelo usuário onde áudio é gravado e processado |
| VAD                    | Voice Activity Detection — heurística que pausa STT em silêncio             |
| STT                    | Speech-to-Text                                                              |
| Intenção               | Saída do LLM identificando qual mutação o usuário pediu                  |
| Confirmação default ON | Política em que toda mutação de IA exige aprovação humana antes de executar |
| Organização            | Tenant lógico em que membros partilham tarefas e auditoria                  |
| Contexto               | Rótulo "pessoal" ou "trabalho" aplicado a uma sessão e suas saídas          |
| Auditoria              | Log imutável de toda mutação                                                |
| ICP                    | Ideal Customer Profile                                                      |
| ARPU                   | Average Revenue Per User                                                    |


---

## 15. Impacto em Segurança e UX

- **Segurança:** voz como dado biométrico (LGPD Art. 5º II / GDPR Art. 9); encriptação at-rest com KMS por organização; rate limit em todos os endpoints; auditoria *fail-closed*; *secrets-management* obrigatório em toda Fase 3 ([rules/core/project.mdc](../.cursor/rules/core/project.mdc)); threat model formal em `12_THREAT_MODEL.md`.
- **UX:** *radical transparency* (indicador persistente durante captura, notificação local ao iniciar sessão por voz, resumo diário de captura); onboarding de privacidade obrigatório; cada estado da UI explícito (loading, empty, error, success) conforme [project.mdc](../.cursor/rules/core/project.mdc); WCAG 2.2 AA; *retain 0 days* opcional para utilizadores high-privacy.

---

## 16. Mapa de Rastreabilidade (dor → RF → critério → métrica)


| Dor validada                         | RF                       | Critério de aceite                          | Métrica                                  |
| ------------------------------------ | ------------------------ | ------------------------------------------- | ---------------------------------------- |
| Perder decisões/ações entre reuniões | RF-001 + RF-002 + RF-004 | Sessão consentida → resumo + ações em < 30s | Time-to-value, sessões/semana            |
| Digitar TODO depois da call          | RF-005 + RF-006          | Ação sugerida + confirmação 1-tap           | Taxa de confirmação                      |
| Quem decidiu o quê                   | RF-009 + RF-008          | Auditoria + partilha view/edit              | Retenção D30 organização                 |
| Privacidade / vigilância             | RF-001 + RF-010 + RF-011 | Indicador visível + retenção configurável   | Reviews qualitativas, tickets de suporte |
| Custo previsível                     | RF-012                   | Tiers com limites e avisos                  | ARPU vs custo IA                         |


---

## 17. Questões em Aberto (para `/spec`)

1. **STT primário:** Deepgram Nova-2 (decidido como primário) vs AssemblyAI fallback — benchmark final de PT-BR em [`03_RESEARCH.md`](03_RESEARCH.md)
2. **Mobile:** React Native + Expo (decidido como Onda 1) — confirmar versão e EAS pipeline em [`06_SPECIFICATION.md`](06_SPECIFICATION.md)
3. **Pipeline streaming:** LiveKit Agents vs home-grown sobre WebSocket — spike + ADR em `decisions/` antes da Fase 3
4. **VAD:** Silero VAD (recomendado) vs Picovoice Cobra — benchmark em `03_RESEARCH.md`
5. **LLM por tarefa:**
   - Intenção/ações: GPT-4o-mini (default) — confirmado
   - Classificação Espaços (Roteador Camada 3): Mistral Nemo vs Gemini Flash-Lite — benchmark
   - Resumos premium: Claude Haiku 3.5 (Pro+ via add-on) — confirmado
6. **Modelo de partilha cross-organização (Team/Business):** convite explícito vs link público com expiração — decisão antes do design
7. **Identificadores Espaços canónicos:** chave técnica (`work`, `family`, etc.) é estável; nome de exibição é localizável — confirmar i18n strategy
8. **Roteador Camada 3 thresholds:** confiança mínima para auto-classify (proposta inicial: 0.85; abaixo disso, pede confirmação) — calibrar com dados reais
9. **Memória — esquecimento programado:** TTL por camada de memória (imediata 24h / curta 7d / trabalho 90d / longa 1 ano / episódica permanente) — validar com utilizadores reais antes de Onda 2
10. **Família — adolescentes:** restrições parentais por idade; integração com Family Link / Screen Time — decisão antes da Onda 2
11. **CEO Agent — pricing exacto:** $150/seat vs custom por org — validar com 3 enterprises piloto antes de Onda 3