# 04_MARKET_AND_REFERENCES.md — Pesquisa de Mercado e Referências (Fase 1c)

> **Skills:** `/using-superpowers` `/market` `/brainstorming` `/architecture-decision-records`  
> **Responsável:** Tech Lead  
> **Depende de:** `00_VALIDATION.md` (GO), `01_PRD.md` (APPROVED), `02_MONETIZATION.md` (APPROVED), ADRs [0001-0008](decisions/README.md)  
> **Gate de saída:** 4 frentes concluídas (concorrentes · alternativas/OSS · comunidades/tendências · build-vs-buy) + decisões consolidadas para `/design`

Status: COMPLETO (sem pesquisa externa nesta sessão)  
Data: 2026-04-25  
Autor: Tech Lead (CloudVoice)

> **Nota metodológica (restrição desta execução):** sem internet nesta sessão. Onde o documento normalmente traria links e números atuais, eu marquei como **HIPÓTESE** e registrei **perguntas de validação**. A base factual aqui vem de `00_VALIDATION.md`, `01_PRD.md`, `02_MONETIZATION.md` e ADRs 0001–0008.

---

## 1. Resumo Executivo (decisão em 10 linhas)

- O mercado “meeting notes” (Otter/Granola/Fireflies) está **validado e saturando**; ganhar ali exige integrações e distribuição que nos puxam para commodity.
- O reposicionamento para **Espaços + agentes por Espaço** ([ADR-0001](decisions/0001-reposicionamento-copiloto-de-vida.md)) cria uma categoria mais defensável e amplia TAM (família, igreja, saúde mental, finanças) com **privacidade por contexto** como vantagem.
- **Fireflies.ai** é referência em “recording + summary + action items” para B2B; vencê-lo no jogo dele é caro. O caminho CloudVoice é competir em **multi-domínio + privacidade + autonomia determinística + marketplace + Enterprise (CEO Agent)**.
- Build-vs-buy recomendado: **comprar commodities** (STT, LLM, billing, auth) e **construir CORE IP** (roteador de Espaços, políticas de privacidade por Espaço, autonomia 9×4, memória por Espaço, marketplace/CEO Agent).
- Roadmap: Onda 1 foca “2–5 Espaços + confiança + custo previsível”; Onda 2 expande “integrações + builder + roteador L3”; Onda 3 entrega “Enterprise/CEO Agent + compliance pesada + modos de captura avançados”.
- Riscos principais a reduzir antes de `/design`: validação de mensagens (posicionamento), legal/policies (consentimento), unit economics reais (minutos/LLM), e desenho de E2EE por Espaço sem matar UX.

---

## 2. Contexto do PRD + reposicionamento (o que estamos realmente comparando)

### 2.1 O que o mercado já entrega bem (commodities)

- **Transcrição e resumo de reuniões**: “bom o suficiente” já existe (Otter/Granola/Fireflies).
- **Assistentes de OS** (Apple Intelligence / Gemini) tendem a commoditizar o “base layer” (capturar e resumir) nos próximos 12–18 meses (sinal citado em `00_VALIDATION.md`).
- **Integrações de produtividade** (Notion/Trello/ClickUp com IA) já ganham em “executar tarefas” quando o input é texto.

### 2.2 O que o CloudVoice pretende ganhar (diferenciais defensáveis)

Baseado nos ADRs e no PRD:

- **Espaços (multi-domínio)**: produto orientado a contexto (work/family/church/health/finance/journal/mental_health etc.), com UI e agente próprios ([ADR-0004](decisions/0004-arquitectura-de-espacos.md)).
- **Privacidade / E2EE por Espaço**: espaços sensíveis criptografados (ciphertext-only), retenção e cross-space com política explícita ([ADR-0004](decisions/0004-arquitectura-de-espacos.md)).
- **Autonomia determinística 9×4**: previsível, auditável e escalonável por tier ([ADR-0003](decisions/0003-niveis-de-autonomia.md)).
- **Memória por Espaço**: editável, auditável, com camadas e TTLs ([ADR-0005](decisions/0005-memoria-e-auto-evolucao.md)).
- **Marketplace de skills + CEO Agent (Enterprise)**: extensibilidade + moat por catálogo; visão agregada com guardrails (k-anon ≥ 5) ([ADR-0006](decisions/0006-skills-marketplace-e-ceo-agent.md)).

---

## 3. Frente 1 — Concorrentes (profundo em Fireflies + comparação)

### 3.1 Mapa rápido (diretos, indiretos, substitutos)

> Base factual parcial vem de `00_VALIDATION.md` e do conhecimento de produto geral; detalhes de pricing/feature flags atuais devem ser validados.

| Produto | Tipo | Onde é forte | Onde tende a falhar (para a nossa tese) | Como o CloudVoice deve competir |
|---|---|---|---|---|
| **Fireflies.ai** | Direto (B2B meeting assistant) | Captura/assistente de reuniões com integrações; resumo, itens de ação e busca; distribuição via “bot” e integrações | Multi-domínio fora de “work”; privacidade granular por contexto; E2EE; autonomia configurável por categoria; “vida inteira” | Não copiar “apenas reuniões”; usar “work” como porta de entrada e expandir para Espaços + privacidade + autonomia |
| **Otter.ai** | Direto (notes/transcripts) | Transcrição e notas de reunião; UX maduro; marca forte | “Ação” e execução; multi-domínio; privacidade/E2EE; flows de agência | Superar com roteador de Espaços + execução de ações + templates por Espaço |
| **Granola** | Direto (AI notes) | Notas de reuniões agendadas; “it just works” em um contexto | Foco estreito em reuniões; sem automação ampla; sem multi-domínio | Diferenciar com captura por sessão fora do calendário + Espaços |
| **Limitless** | Indireto (always-on + hardware) | Captura ambiente via hardware (memória contínua) | Hardware + custo + medo de vigilância; menor controle por contexto | Vencer com mobile-first, consentimento por sessão e privacidade por Espaço; não competir em hardware na Onda 1 |
| **Plaud** | Indireto (hardware recorder) | Gravação simples e acessível; “aperto e grava” | Ecossistema fechado; baixa “orquestração de vida” | Tratar como input: importar/auto-sync de áudios (Onda 1/2) + processar em Espaços |

### 3.2 Fireflies.ai — análise profunda (sem internet: hipóteses + pontos a validar)

#### 3.2.1 Tese de produto (o que Fireflies “é”)

- **Fireflies é um “sistema de registro e busca” do trabalho em reuniões**, com:
  - captura automática (geralmente via bot),
  - transcrição/summary,
  - extração de itens e highlights,
  - distribuição (compartilhar com time),
  - integrações para colar saída em CRM/PM tools.

**Hipótese:** o moat principal do Fireflies é **distribuição + integrações + hábito do time** (não a qualidade do STT/LLM em si, que é commodity).

#### 3.2.2 Como Fireflies ganha (mecanismos)

- **Aquisição**: o produto “entra” via reuniões e convites; cada reunião gravada expõe o bot a mais participantes.
- **Retenção**: times voltam para procurar “o que foi decidido” e “quem ficou responsável”.
- **Expansão**: integrações e seats (modelo B2B típico).

**Implicação:** competir “me-too” em reuniões implica entrar em **ciclo de integrações + compliance + conectores** — caro e lento.

#### 3.2.3 Onde Fireflies é vulnerável ao reposicionamento “Espaços”

| Vetor | Vulnerabilidade provável | Como transformar em diferencial CloudVoice |
|---|---|---|
| Multi-domínio | Produtos B2B raramente tratam “família/igreja/saúde mental” como first-class | Catálogo de Espaços canônicos com UI+agente específicos (não apenas tags) |
| Privacidade | “Bot na reunião” ativa alarmes de vigilância; “dados do time” e “dados pessoais” misturam | Privacidade por Espaço: isolamento, retenção por Espaço, cross-space com política explícita, E2EE em sensíveis |
| Autonomia | B2B tende a “sempre pedir confirmação” ou “só sugerir” para reduzir risco | Matriz 9×4 determinística com undo e auditoria; escalona por tier |
| Marketplace | Integrações são construídas pela empresa; difícil cobrir nichos culturais | Marketplace + builder: criadores cobrem nichos (MEI BR, Planning Center, etc.) |
| Enterprise exec | “Executive insights” sem violar privacidade é complexo | CEO Agent agregado com k-anon hard-coded + audit log (ADR-0006) |

#### 3.2.4 Comparação “tática” (features) — onde precisamos igualar vs superar

> O objetivo não é copiar tudo, e sim decidir o **mínimo competitivo** do Espaço `work` (porta de entrada) e onde o resto do produto deve ser “outro jogo”.

| Capacidade (Work) | Precisamos igualar? | Superar? | Comentário |
|---|:---:|:---:|---|
| Transcrição/summary rápido | ✅ | (talvez) | Commodity: “bom o suficiente” com custo previsível |
| Itens de ação extraídos | ✅ | ✅ | Diferenciar ligando a **execução** (autonomia 9×4) |
| Busca e recall | ✅ | ✅ | Diferenciar com “AskCloud” cross-space com policy |
| Integrações (CRM/PM) | ❌ (Onda 1) | ✅ (Onda 2) | Em Onda 1: construir tarefas nativas + 1–2 integrações |
| Colaboração/RBAC | ✅ (básico) | ✅ | Já entra no PRD como must-have |
| Governança/privacidade | ✅ | ✅✅ | “Privacidade por Espaço” é o nosso outdoor |

#### 3.2.5 Perguntas para validar sobre Fireflies (redução de risco)

- Pricing atual (B2B): por seat? por minutos? tiers e limites? (VALIDAR)
- Grau de automação: ele executa ações em ferramentas ou só sugere? (VALIDAR)
- Posição sobre E2EE / retenção / export: existe? (VALIDAR)
- Quais integrações movem conversão (top 5)? (VALIDAR)

### 3.3 O que replicar / o que evitar (lições de concorrentes)

- Replicar:
  - **Time-to-value muito curto**: “gravei → recebi resumo+ações em < 30s” (`01_PRD.md`).
  - **Busca muito útil** (mesmo que simples inicialmente).
  - **UX sem fricção em iniciar sessão** (atalhos e auto-arm contextual).
- Evitar:
  - “Bot em toda reunião” como único modo de captura (vira discurso de vigilância).
  - Prometer “sempre ligado” antes de ter unit economics e aprovação de loja (já tratado na validação).

---

## 4. Frente 2 — Alternativas/OSS (o que reutilizar vs evitar)

### 4.1 OSS e bibliotecas relevantes (com decisão)

> Baseado no inventário já citado em `00_VALIDATION.md` e ADRs; faltam validações de saúde/manutenção e eventuais CVEs (pendência).

| Opção | Categoria | Licença | Maturidade (hipótese) | Lock-in | Decisão | Notas |
|---|---|---|---|---|---|---|
| `openai/whisper` | STT | MIT | Alta (estável) | Baixo | CONDICIONAL | Útil como base; streaming exige wrapper (ex.: `whisper.cpp`/`faster-whisper`) |
| `SYSTRAN/faster-whisper` | STT | MIT | Alta (ativo) | Baixo | CONDICIONAL | Se rodarmos STT próprio; comparar custo/latência com Deepgram |
| `snakers4/silero-vad` | VAD | MIT | Alta (ativo) | Baixo | APROVAR | Diferencial custo+privacidade; on-device/wasm |
| LiveKit Agents | Orquestração voz→ação | Apache 2.0 | Média-alta | Médio | CONDICIONAL | Bom se Onda 2 exigir voz conversacional; Onda 1 pode ser home-grown |
| Pipecat | Orquestração | BSD-2 | Média | Médio | CONDICIONAL | Opção Python; avaliar se encaixa no stack |
| Microsoft Presidio | PII redaction | Apache 2.0 | Alta | Baixo | APROVAR | Redação antes de embeddings/inferência (ADR-0005/`00_VALIDATION.md`) |
| `pgvector` | Vetores no Postgres | PostgreSQL license | Alta | Baixo | APROVAR | Memória e busca sem serviço extra (ADR-0005) |
| SeaweedFS (S3) | Object storage | Apache 2.0 (HIPÓTESE) | Média | Médio | APROVAR | Decisão já tomada (ADR-0008) — validar operação/backup |

> **Pendência de compliance:** confirmar licenças e versões exatas (especialmente SeaweedFS) e revisar riscos de uso comercial de quaisquer libs auxiliares.

### 4.2 Alternativas “buy” (SaaS) que aparecem no domínio

Sem internet, esta lista é **guia** (não uma recomendação final):

- **STT**: Deepgram / AssemblyAI / OpenAI Whisper API (já assumido no PRD).
- **Orquestração**: Vapi / Retell (citado na validação) — risco de lock-in.
- **Memória gerenciada**: mem0 / Letta / Zep (citados no ADR-0005) — avaliar em 6 meses (não no MVP).

---

## 5. Frente 3 — Comunidades e tendências (voz do mercado)

### 5.1 Dores e linguagem do usuário (a partir da validação + tendências gerais)

Com base em `00_VALIDATION.md` (que já cita Reddit/Product Hunt/HN como fontes):

- Dores recorrentes:
  - “Perco decisões/compromissos entre conversas”.
  - “Preciso digitar TODO depois”.
  - “Isso me dá medo de privacidade / vigilância”.
  - “Quero algo que funcione fora de reunião formal”.
- Linguagem provável do usuário:
  - “anota isso”, “me lembra”, “deixa salvo”, “o que combinamos”, “o que ficou decidido”.
  - Para Espaços sensíveis: “isso é pessoal”, “isso é terapia/saúde”, “não quero que apareça no trabalho”.

### 5.2 Tendências que importam para o posicionamento

- **Always-on AI** é polarizador (entusiasmo vs alarme) — comunicação e defaults “consent-first” são parte do produto.
- **Agentes pessoais** e “memórias” viram padrão; diferencial passa a ser:
  - governança,
  - privacidade por contexto,
  - extensibilidade (skills),
  - execução segura (autonomia determinística).

### 5.3 Perguntas para validar (para não construir no escuro)

- Quais Espaços “puxam” mais adoção inicial em PT-BR? (work vs family vs church vs health)
- Quais medos travam conversão? (“vigilância”, “vazar áudio”, “cobrança surpresa”)
- Quais outputs são considerados “úteis” por domínio? (work = action items; family = combinados; church = planos/calendário; health = sintomas/consultas)

---

## 6. Frente 4 — Build vs Buy (decisão por componente)

### 6.1 Tabela de decisão (o que é CORE IP vs commodity)

| Componente | Classificação | Recomendação | Por quê | Risco/lock-in |
|---|---|---|---|---|
| STT streaming | COMMODITY | Buy multi-provider | Preço/minuto e latência são variáveis; abstração reduz risco | Baixo se multi-provider |
| LLM intenção/resumos | COMMODITY | Buy multi-provider | Modelos mudam rápido; evitar casar com 1 vendor | Baixo-médio |
| VAD on-device | CORE IP (custo+privacidade) | Build em cima de Silero/WebRTC | Reduz custo e melhora privacidade; diferencial prático | Baixo |
| Roteador de Espaços (L1-L4) | CORE IP | Build | Diferencial central (ADR-0004) | Baixo |
| Políticas de privacidade por Espaço (cross-space, retenção, E2EE) | CORE IP | Build | “Produto é política”; diferencial defensável | Baixo |
| Autonomia 9×4 + auditoria + undo | CORE IP | Build | Confiança + diferenciação por tier (ADR-0003) | Baixo |
| Memória por Espaço (camadas + edição) | CORE IP | Build MVP; reavaliar vendor em 6 meses | Diferencial vs transcritor; soberania de dados (ADR-0005) | Baixo |
| Marketplace + Skill Builder | HYBRID | Build plataforma; buy scanners/infra de segurança se necessário | Moat de catálogo; precisa de curadoria (ADR-0006) | Médio (segurança) |
| CEO Agent (Enterprise) | CORE IP | Build | Pricing power + diferencial com guardrails (ADR-0006) | Médio (risco reputacional) |
| Auth/RBAC | COMMODITY | Buy (Clerk) | Já no stack; acelera B2B | Médio |
| Billing/usage/revshare | COMMODITY | Buy (Stripe) | Já no stack; Connect para marketplace | Baixo |
| Object storage de áudio | COMMODITY (com operação) | Buy “self-hosted S3” via SeaweedFS (decidido) | Portabilidade S3; alinhado a infra (ADR-0008) | Médio (ops) |

---

## 7. Implicações para produto e roadmap (Ondas 1/2/3)

### 7.1 Onda 1 (MVP): vencer por confiança + foco (não por “mais integrações”)

Prioridades que realmente diferenciam:

- **Espaços canônicos mínimos (2–5)** + roteador L1/L2/L4 bem desenhado.
- **Privacidade por Espaço** (defaults fortes: sensíveis fora de cross-space).
- **Autonomia 9×4** com UI cristalina (A confirmar / Já feito / Aprendizagem).
- **Memória por Espaço** (mínimo viável, mas visível/editável).
- **Custo previsível** (dashboards + limites por tier).

Competitivo mínimo do `work`:

- transcrição/summary,
- itens de ação,
- tarefas nativas (lista + linha do tempo),
- RBAC básico em `work`.

### 7.2 Onda 2: expandir “valor por Espaço” e distribuição (sem trair privacidade)

- Integrações (ClickUp/Trello/Slack/Asana etc.) como aceleradores de adoção no `work`.
- Skill Builder + marketplace (começar com “curadas” e permissões).
- Roteador L3 (classificação por conteúdo) com thresholds conservadores.
- iOS nativo (se confirmado no plano atual).

### 7.3 Onda 3: Enterprise e modos avançados (CEO Agent + compliance)

- CEO Agent agregado com guardrails.
- Confidential computing / políticas corporativas (conforme PRD e validação).
- Modos avançados de captura (always-on Android; phone call recording via caminhos B/C/D do ADR-0002).

---

## 8. Implicações para pricing e packaging (o que o mercado condiciona)

### 8.1 O mercado valida “tier por consumo” e “B2B por assento”

`02_MONETIZATION.md` já escolheu híbrido (planos + add-ons + overage + marketplace). O mercado (Otter/Granola/Fireflies) indica que:

- Usuário aceita pagar **$9–$19/mês** por “recall e resumos”.
- B2B aceita **$39–$69/seat** quando existe governança + integração + auditoria.

### 8.2 Como justificar preço sem competir só por transcrição

- **Pessoal/Pro**: vender “vida multi-domínio” (Espaços) + “controle de privacidade” + “autonomia que poupa tempo”.
- **Família**: vender “1 conta, 4 pessoas” + “Espaço compartilhado” (efeito rede pessoal).
- **Team/Business**: vender “execução de ações + auditoria + RBAC por Espaço”.
- **Enterprise**: vender “CEO Agent + guardrails + compliance” (não vender CEO Agent como add-on barato).

### 8.3 Hipóteses de mensagem vs concorrentes (para testar)

- “Otter/Fireflies lembram suas reuniões. CloudVoice organiza sua vida por contextos — e o que é sensível nunca vaza para o trabalho.”
- “Autonomia configurável: o agente faz sozinho o que é reversível; pede confirmação no que é irreversível.”
- “Marketplace de skills: sua cultura e seu domínio têm ‘modo nativo’ (Igreja, MEI, Saúde Mental).”

---

## 9. Checklist de validações pendentes (redução de risco antes do /design)

### 9.1 Concorrentes (Fireflies/Otter/Granola/Limitless/Plaud)

- [ ] Confirmar pricing atual e limites (planos + minutos + seats) de cada um.
- [ ] Mapear “top 5 features que convertem” e “top 5 reclamações” (reviews/G2/PH).
- [ ] Validar se oferecem E2EE, retenção por contexto, e controles de export.

### 9.2 Produto (mensagem e adesão)

- [ ] Teste de posicionamento: “Espaços + privacidade por contexto” é entendido em 30s?
- [ ] Teste de onboarding: seleção de 2 Espaços iniciais reduz abandono?
- [ ] Validar quais 2 Espaços iniciais maximizam retenção D7/D30 em PT-BR.

### 9.3 Legal/policies (alto risco)

- [ ] Parecer LGPD/GDPR (voz como dado biométrico; base legal e aviso).
- [ ] Spike de submissão (Play Store / TestFlight) com indicador de gravação e copy.
- [ ] Checklist de consentimento e “right to be forgotten” por Espaço.

### 9.4 Unit economics (alto risco)

- [ ] Simulação real com cenários light/medium/heavy com preços atuais de STT/LLM.
- [ ] Benchmark: custo por minuto com VAD on-device (quanto reduz na prática?).
- [ ] Validar margens do tier Pro sem add-ons (já sinalizado em `02_MONETIZATION.md`).

### 9.5 OSS e segurança

- [ ] Confirmar licenças e riscos (evitar GPL/AGPL).
- [ ] Verificar maturidade/atividade e CVEs dos componentes escolhidos.
- [ ] Definir baseline de sandbox/permissioning para marketplace de skills.

---

## 10. Decisões consolidadas (saída para o /design)

### 10.1 Diferenciais que viram “contrato de design”

- Espaços como primitivo: switch sempre visível; cores/ícones; templates por Espaço.
- Privacidade by default: sensíveis excluídos de cross-space; E2EE com UX claro.
- Autonomia 9×4: UI educa e dá controle; auditoria acessível.
- Marketplace: tela de permissões e confiança; ratings; sandbox.

### 10.2 Build vs Buy (confirmado)

- Confirmado comprar: auth (Clerk), billing (Stripe), STT/LLM (multi-provider).
- Confirmado construir: roteador de Espaços, policy engine, autonomia, memória por Espaço, marketplace + CEO Agent.

---

## 11. Próximos passos

- Entrar em `/design` com:
  - narrativa de produto por Espaço (work/family/church/health/finance),
  - flows de privacidade e autonomia,
  - UI do “Painel de Ações” e do “Switch de Espaços” como peças centrais.
- Abrir `03_RESEARCH.md` (Fase 1c-sup) para aprofundar escolhas técnicas pendentes (STT, pipeline voz→ação, E2EE detalhado, benchmarks).

---

## Histórico de atualizações

| Data | Alteração | Autor |
|---|---|---|
| 2026-04-25 | Reescrito e consolidado (4 frentes + implicações + checklist) | Tech Lead |
