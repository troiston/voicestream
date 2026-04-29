# 0004 — Arquitetura de Espaços: isolamento, roteador e agentes especializados

> **Fase que originou:** 0 (Validação)
> **Documento relacionado:** [`01_PRD.md`](../01_PRD.md), [`05_DESIGN.md`](../05_DESIGN.md), [`06_SPECIFICATION.md`](../06_SPECIFICATION.md), [`12_THREAT_MODEL.md`](../12_THREAT_MODEL.md)
> **Skills usadas:** `/architecture-decision-records` `/architecture-patterns` `/agent-native-architecture`
> **Responsável:** Tech Lead
> **Revisores:** PM, Designer, Jurídico

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Resultado do reposicionamento ADR-0001 |
| 2026-04-25 | accepted | Tech Lead | Após desenho de privacidade por contexto |

---

## Contexto e Problema

ADR-0001 estabelece que CloudVoice é um copiloto de vida organizado em Espaços. Este ADR define a arquitetura técnica e de produto desses Espaços:

1. **Como dados são isolados entre Espaços?** (LGPD, GDPR, e confiança do utilizador exigem mais que separação visual)
2. **Como uma fala é classificada no Espaço certo?** ("Sofia escola" → Família, "deal Acme" → Trabalho)
3. **Como cada Espaço tem um agente especializado?** (Trabalho fala formal; Diário fala íntimo; Saúde tem compliance reforçado)
4. **Como o usuário pesquisa/consulta entre Espaços sem violar isolamento?** (cross-space search com regras)

---

## Decisão

**Espaço** é primitivo de produto, segurança e arquitetura — não apenas etiqueta. Cada Espaço tem:

- **Tabela própria de transcrições/sessões** (logical schema com `space_id` + RLS no Supabase Postgres)
- **Encryption key derivada por Espaço** (KMS envelope; espaços sensíveis = E2EE com chave do device)
- **Política de retenção própria**
- **Política de partilha própria**
- **Agente próprio** (system prompt + skills + memória — ver ADR-0005 e ADR-0006)
- **UI específica** (templates de tarefa, vocabulário, vista padrão)

### Catálogo canónico de Espaços (10)

| ID | Nome | Sensibilidade | Default cross-space | E2EE | Vista padrão |
|---|---|---|:---:|:---:|---|
| `work` | Trabalho | Média | ✅ | Opcional | Kanban |
| `family` | Família | Média-alta | ✅ | Opcional | Linha-tempo |
| `health` | Saúde | **Alta** | ❌ | **Mandatório** | Lista cronológica |
| `church` | Igreja/Comunidade | Média | ✅ | Opcional | Calendário |
| `finance` | Financeiro | **Alta** | ❌ | **Mandatório** | Lista + dashboard |
| `journal` | Diário | **Alta** | ❌ | **Mandatório** | Linha-tempo |
| `studies` | Estudos | Baixa | ✅ | Opcional | Lista |
| `home` | Casa | Baixa | ✅ | Opcional | Kanban |
| `mental_health` | Saúde Mental | **Crítica** | ❌ | **Mandatório** | Linha-tempo |
| `personal` | Pessoal (catch-all) | Baixa | ✅ | Opcional | Lista |

**Sub-espaços:** cada Espaço suporta sub-espaços hierárquicos (e.g., `work/clientes/acme`, `family/sofia`). Sub-espaços herdam regras do parent salvo override explícito.

### Roteador de Espaços (4 camadas)

A fala chega ao sistema; precisa ser atribuída a um Espaço. A decisão é tomada em cascata:

1. **L1 — Pre-tag manual:** o usuário disse "modo trabalho" antes de gravar, ou usou shortcut específico (ex.: Watch tap em Espaço Saúde) → atribui diretamente.
2. **L2 — Auto-arm contextual:** calendário/localização/hora → ex.: Google Calendar diz "reunião com Acme das 10–11" → arma `work`. Localização "Igreja Batista" + domingo manhã → arma `church`.
3. **L3 — Classificação de conteúdo:** LLM ligeiro (Mistral Nemo ou Gemini Flash-Lite) classifica transcrição em Espaço com confidence. Confidence ≥ 0,75 → atribui. Caso contrário → cai para L4.
4. **L4 — Pergunta ao usuário:** UI mostra "Onde guardar isto?" com top 3 sugestões (segundos para responder; default = `personal` se ignorar).

**Reclassificação:** o usuário pode mover sessão entre Espaços a qualquer momento; o sistema reaprende vocabulário (alimenta L3).

### Cross-space intelligence (AskCloud)

- O usuário pode fazer perguntas semânticas:
  - **Single-space:** "o que combinámos com o Acme?" → busca em `work` apenas
  - **Cross-space:** "tenho consulta médica e meeting na mesma hora?" → busca em `health` + `work`
- **Regras invioláveis:**
  - Espaços `health`, `journal`, `mental_health`, `finance` são **excluídos** de cross-space por default — só entram se utilizador opt-in explicitamente para essa query (com confirmação)
  - Em planos `Família`, `Team`, `Business`, `Enterprise`: dados de outros utilizadores nunca entram em cross-space individual; CEO Agent (ver ADR-0006) tem regras próprias

### Visualizações disponíveis (selecionável por Espaço)

- **Lista** — cronológica simples
- **Kanban** — colunas configuráveis por Espaço (ex.: Trabalho → "A fazer / Em curso / Bloqueado / Feito"; Igreja → "Pedidos de oração / Em oração / Atendidos")
- **Calendário** — eventos e tarefas com data
- **Linha-tempo** — narrativa cronológica com snippets

---

## Opções Consideradas

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| A. Apenas tags em tabela única | Simples; fácil de pesquisar | Sem garantia de isolamento; viola LGPD em dados sensíveis | Compliance |
| B. Schema Postgres por Espaço por utilizador | Isolamento físico forte | Explosão de schemas; impossível de operar | Operacional |
| C. **Tabela única com `space_id` + RLS + encryption envelope (escolhida)** | Isolamento lógico forte; performante; auditável | Complexidade de RLS; risco de bug expor cross-space | — |
| D. Bases separadas por Espaço (multi-database) | Isolamento físico máximo | Custo operacional; perda de joins; mau para AskCloud | Sobre-engenharia |

---

## Justificativa da Escolha

- **C oferece isolamento que satisfaz LGPD/GDPR** sem custo operacional proibitivo
- RLS do Supabase é maduro e auditável; envelope encryption acrescenta camada para Espaços sensíveis
- Manter tabela única permite AskCloud cross-space eficiente quando autorizado
- Estrutura suporta sub-espaços e herança de regras de forma natural

---

## Consequências

### Positivas

- Privacidade torna-se vantagem competitiva publicável ("o que está em Saúde nunca entra na busca de Trabalho")
- Onboarding pode oferecer 2 Espaços por padrão e ir crescendo
- Facilita compliance: DPIA por Espaço; retenção configurável por Espaço; portabilidade por Espaço

### Negativas / Trade-offs

- Cada migration precisa de garantir RLS antes de release (gate em CI obrigatório)
- AskCloud precisa de motor de policy explícito — não é só "select where space_id in (...)"
- E2EE em Espaços sensíveis impede algumas capacidades server-side (ex.: search semântica server-side em Saúde requer chave do device)

### Neutras

- Modelo é familiar — Notion (workspaces), Slack (channels), Apple Health (categories) — utilizadores adoptam intuitivamente

---

## Impacto em Segurança e UX

- **Segurança:**
  - RLS Supabase obrigatório em todas as tabelas com `space_id`
  - Envelope encryption por Espaço; chave master em KMS; chave de Espaço em tabela protegida
  - Espaços `health`, `journal`, `finance`, `mental_health` exigem chave de device (E2EE) — server vê apenas blob encriptado
  - Auditoria de toda query cross-space; alerta de comportamento anómalo
- **UX:**
  - Cor + ícone distintos por Espaço (consistência visual no app)
  - Switch de Espaço claro no topo do app; "Espaço actual" sempre visível
  - Templates de tarefa por Espaço (Saúde tem campos de "data consulta", "médico", "exames"; Igreja tem "oração", "ministério", "membros")
  - Vocabulário do agente adapta-se: agente Igreja não diz "deliverable", agente Trabalho não diz "louvor"

---

## Critérios de Revisão

- Trigger: novo Espaço pedido por > 10% de utilizadores activos; ou descoberta de bug de isolamento
- Owner: Tech Lead
- Prazo: revisão trimestral

---

## Referências

- [Supabase RLS docs](https://supabase.com/docs/guides/auth/row-level-security)
- [LGPD Art. 7 (bases legais) e Art. 11 (dados sensíveis)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [GDPR Art. 9 (dados especiais)](https://gdpr.eu/article-9-categories-personal-data/)
- ADR-0001 — Reposicionamento; ADR-0005 — Memória; ADR-0006 — Skills
