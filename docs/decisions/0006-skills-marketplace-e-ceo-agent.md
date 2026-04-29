# 0006 — Skills marketplace e CEO Agent (Enterprise)

> **Fase que originou:** 0 (Validação)
> **Documento relacionado:** [`01_PRD.md`](../01_PRD.md), [`02_MONETIZATION.md`](../02_MONETIZATION.md), [`06_SPECIFICATION.md`](../06_SPECIFICATION.md)
> **Skills usadas:** `/architecture-decision-records` `/agent-native-architecture`
> **Responsável:** Tech Lead
> **Revisores:** PM, Jurídico

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Pedido explícito por skills instaláveis e CEO Agent |
| 2026-04-25 | accepted | Tech Lead | Após desenho de monetização e governança Enterprise |

---

## Contexto e Problema

ADR-0001 estabeleceu o reposicionamento; ADR-0004 definiu Espaços; ADR-0005 cobriu memória. Falta:

1. **Como agentes ganham capacidades novas?** Cada Espaço pode beneficiar de funções que o usuário instala on-demand (ex.: "skill MEI" para o Espaço Trabalho de freelancers; "skill Planning Center" para Espaço Igreja).
2. **Como expandir capacidades sem inflar a app?** Marketplace é resposta natural; pergunta é o modelo de governance e revenue share.
3. **Como Enterprise extrai valor agregado dos Espaços de toda a organização sem violar privacidade individual?** Necessidade explícita levantada pelo utilizador: "agente para o CEO ou CEOs com contexto da empresa inteira".

---

## Decisão

### Parte A — Skills

**Skill** = unidade modular instalável que adiciona uma capacidade ao agente de um Espaço. Compõe-se de:

- **System prompt overlay** específico
- **Function calls** (tools) que o agente pode chamar
- **Templates de tarefa/output** (ex.: skill "Pregação" gera estrutura "tema/texto base/pontos/aplicações")
- **Integração externa** (opcional)
- **Memória de domínio** (vocabulário, entidades — fundida na memória do Espaço)

**Origem das skills:**

| Origem | Exemplos | Custo | Onda |
|---|---|---|---|
| **Built-in (free)** | Trello, Notion, Google Calendar, Gmail, Slack, Resumo executivo, Daily standup, Pregação básica | $0 | 1 |
| **Built-in premium (incluída em planos)** | Salesforce, HubSpot, Pipedrive, ClickUp, Asana, Jira, Open Finance | $0 dentro do plano | 1–2 |
| **Marketplace gratuita** | Comunidade contribui (ex.: skill "Bíblia em 1 ano") | $0 | 3 |
| **Marketplace paga** | Skill "Vendas Imobiliárias" $5/mês; "Médico de Família" $10/mês | criador define | 3 |
| **Custom (utilizador cria)** | "Quando falo X, faz Y no Z" | $0 (Pro+) | 2 |
| **Privadas Enterprise** | Skill exclusiva da org integrada a sistemas internos | sob contrato | 3 |

**Skill Builder (Pro+):** linguagem natural — "Sempre que entro na academia registra hábito Notion + lembrete de saída em 1h". LLM gera skill, o usuário testa em sandbox, salva privada ou publica na marketplace.

**Marketplace:**
- **Revenue share:** 70% criador / 30% plataforma (modelo App Store-like)
- **Curadoria:** revisão automática (linter de skill + scan de segurança) + revisão manual antes de publicação
- **Permissões claras:** cada skill declara quais dados de Espaços acessa; o usuário autoriza explicitamente na instalação
- **Auditoria por skill:** logs de toda chamada da skill; o usuário pode revogar permissão a qualquer momento
- **Ratings + reviews** públicos
- **Sandbox obrigatório:** skills não podem chamar APIs externas sem permissão; rate-limited per skill

### Parte B — CEO Agent (Enterprise only)

**Problema:** líderes de organização precisam de visão agregada (tendências, riscos, oportunidades) sem violar privacidade individual de colaboradores.

**Solução:** *CEO Agent* é uma persona Enterprise especial com:

- **Acesso somente a Espaços organizacionais marcados como compartilhados** (ex.: `work` da org). Nunca a Espaços pessoais (`personal`, `family`, `health`, etc. dos colaboradores)
- **Visibilidade individual = OFF por default:** o agente vê apenas agregações (counts, trends, anomalias). Drill-down a uma sessão individual exige duplo consentimento (colaborador + auditoria)
- **Diferencial dashboards e perguntas estratégicas:**
  - "Que tópicos a equipa de vendas falou esta semana?"
  - "Que clientes estão em risco baseado em sentimento de chamadas?"
  - "Que decisões foram tomadas e ainda não viraram acção?"
  - "Onde está cada deal do pipeline na cadência típica?"
- **Aggregation pipeline isolado:** workers que processam Espaços organizacionais geram embeddings agregados (não-PII) numa partição separada acedível pelo CEO Agent
- **Audit log obrigatório:** toda query do CEO Agent regista quem perguntou, o quê, quando, e que dados consultou — visível ao DPO da org
- **Defaults conservadores:**
  - Se < 5 colaboradores na agregação → CEO Agent recusa responder ("dados insuficientes para preservar anonimato")
  - Sem capacidade de exportar transcrições brutas
  - Sem memória persistente sobre indivíduos (apenas sobre tópicos / projectos / clientes)

**Capacidades exclusivas:**
- Skill "Pulse semanal" — relatório automático de tendências
- Skill "Risk radar" — detecta sinais fracos (sentiment shift, mentions de competidores, pedidos repetidos)
- Skill "Decision tracker" — toda decisão tomada em meetings sob `work` é catalogada e segue-se até execução
- Skill "OKR alignment" — relaciona conversas com OKRs definidos

**Pricing:** CEO Agent é exclusivo do tier Enterprise (≥ $15k/ano por org). Não vendido como add-on de tiers inferiores.

---

## Opções Consideradas

### Skills

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| A. Apenas built-in fixas | Simples, controlado | Estagnação; não escala em casos de uso | Limitação |
| B. **Built-in + marketplace + builder (escolhida)** | Extensibilidade; revenue share; comunidade | Curadoria intensa; risco segurança/qualidade | — |
| C. Apenas marketplace aberto | Velocidade de catálogo | Risco enorme de skills más / maliciosas | Risco |

### CEO Agent

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| A. Sem CEO Agent | Privacy by absence | Perde proposta Enterprise | Pricing power |
| B. CEO Agent com acesso individual livre | Máximo valor para CEO | Inaceitável legal e culturalmente | Confiança |
| C. **CEO Agent agregado com guardrails (escolhida)** | Valor real para Enterprise; preserva privacidade | Complexidade de pipeline; precisa de DPIA forte | — |

---

## Justificativa da Escolha

- **Skills marketplace** abre vector de monetização recorrente (revshare) e cresce TAM através de criadores externos
- **Skill Builder** transforma utilizadores Pro+ em criadores — efeito de rede aumenta retenção
- **CEO Agent agregado** entrega valor real para tier Enterprise sem violar a promessa central de privacidade — diferencial vs Otter/Granola/Fireflies
- **Defaults conservadores no CEO Agent** (mínimo de 5 utilizadores, audit log, sem export bruto) protegem o produto de incidentes

---

## Consequências

### Positivas

- Marketplace cria moat ao longo do tempo (catálogo de skills é difícil de replicar)
- CEO Agent justifica preço Enterprise (≥ $15k/ano) sem precisar de feature work à medida
- Builder dá poder a power users — diferencia tier Pro
- Revenue share alinha incentivos com criadores

### Negativas / Trade-offs

- Marketplace exige equipa de curadoria/segurança (custo operacional)
- CEO Agent tem complexidade técnica significativa (pipeline de agregação, guardrails, audit)
- Risco reputacional alto — uma skill maliciosa ou um leak no CEO Agent destrói confiança

### Neutras

- Modelo familiar — Apple App Store, Notion templates, Zapier apps directory

---

## Impacto em Segurança e UX

- **Segurança:**
  - **Skills:** sandbox obrigatório; declaração de permissões por skill; scan de segurança automático em pipeline de publicação; rate limit per skill per user; audit log per skill
  - **CEO Agent:** k-anonymity (mínimo 5 utilizadores) hard-coded; audit log obrigatório a cada query; sem export de transcrição bruta; permissões geridas por owner da org; DPIA completo antes de release Enterprise
- **UX:**
  - Marketplace navegável dentro do app + web; categorias por Espaço; ratings; "skills sugeridas para si"
  - Instalação 1-click com ecrã de permissões claro
  - CEO Agent acessível só por roles `owner` / `admin_org`; UI distinta com banner "Modo executivo — agregado"
  - Builder: editor low-code/no-code com preview e teste em sandbox

---

## Critérios de Revisão

- Trigger marketplace: cobertura de casos de uso < 70% após 6 meses, ou taxa de skills maliciosas > 1%
- Trigger CEO Agent: pedido recorrente para drill-down individual, ou incidente de privacidade percebido
- Owner: PM (marketplace), Tech Lead (CEO Agent)
- Prazo: revisão a cada 6 meses

---

## Referências

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — modelo de curadoria
- [Notion Templates Marketplace](https://www.notion.so/templates) — modelo de UGC
- [Zapier Apps Directory](https://zapier.com/apps) — modelo de marketplace de integrações
- [k-anonymity](https://en.wikipedia.org/wiki/K-anonymity) — guardrail de agregação
- ADR-0001, ADR-0004, ADR-0005
