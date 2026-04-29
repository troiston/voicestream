# 0005 — Memória e auto-evolução de agentes por Espaço

> **Fase que originou:** 0 (Validação)
> **Documento relacionado:** [`01_PRD.md`](../01_PRD.md), [`06_SPECIFICATION.md`](../06_SPECIFICATION.md), [`08_SECURITY.md`](../08_SECURITY.md)
> **Skills usadas:** `/architecture-decision-records` `/agent-native-architecture` `/react-state-management`
> **Responsável:** Tech Lead
> **Revisores:** PM, Designer

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Pergunta explícita do utilizador sobre evolução do agente |
| 2026-04-25 | accepted | Tech Lead | Após análise de mem0/Letta/Zep e custo de fine-tuning |

---

## Contexto e Problema

Para o agente "saber" o usuário, ser pessoal e melhorar com o tempo, precisa de memória. Há três caminhos:

1. **Fine-tuning por utilizador:** caro ($100s por utilizador), lento, difícil de actualizar.
2. **System prompt fixo:** simples mas estático — não evolui.
3. **System prompt + memória externa estruturada:** dinâmico, barato, auditável, editável.

A premissa do produto é que **o agente conhece o dia-a-dia do utilizador**, adapta vocabulário, lembra preferências, aprende com correcções. Sem isso, o produto vira "transcritor com IA" como qualquer outro.

---

## Decisão

Implementar **memória multi-camada por Espaço por usuário**, com 5 tipos:

| Camada | Conteúdo | Exemplo | TTL | Onde |
|---|---|---|---|---|
| **Imediata** | Contexto da sessão atual | Últimas 5 mensagens da conversa | sessão | Redis |
| **Curta** | Threads ativas das últimas 24 h | "Acme proposal — em revisão" | 24 h | Redis |
| **Trabalho** | Foco ativo dos últimos 7 dias | "Esta semana: Acme + Reunião pais Sofia" | 7 d | Postgres |
| **Longa** | Factos e preferências consolidados | "Esposa: Joana", "Médica: Dra. Lúcia", "Não gosta de emails antes das 8h" | ∞ | Postgres + pgvector |
| **Episódica** | Eventos significativos com timestamp | "27/abr — fechou deal Acme R$ 80k" | ∞ | Postgres |

### Sinais de aprendizagem

| Sinal | O que actualiza |
|---|---|
| Usuário edita ação sugerida | Preferência de formato/conteúdo dessa categoria |
| Usuário rejeita ação | Reforço negativo no padrão que originou |
| Usuário confirma 5× ações iguais | Pode subir nível de autonomia (ver ADR-0003) |
| Usuário dá feedback explícito ("não me chame assim") | Instrução guardada em "Longa" |
| Padrão temporal detectado (ex.: toda 4ª-feira ao meio-dia almoço com X) | Adicionado a "Episódica + sugestão proativa" |
| Usuário adiciona nova entidade (pessoa/cliente/projeto) | Vocabulário do agente atualiza |

### Editabilidade e auditoria

- Settings → "Memória do meu agente [Espaço X]" → usuário vê tudo o que o agente "sabe", com:
  - Lista pesquisável
  - Botão **Apagar** por item
  - Botão **Marcar como sensível — não usar em sugestões**
  - Botão **Exportar** (JSON, LGPD Art. 18)
  - Botão **Limpar tudo**
- Acessível também por voz: "Cloudy, esquece o que falei sobre [X]"

### Evolução do system prompt

- Cada agente tem **prompt base** (template do Espaço) + **prompt overlay** (regenerado mensalmente a partir das memórias)
- Job nightly:
  - Identifica top 50 fatos/prefs por relevância (recency × frequency × usuário thumbed)
  - Gera resumo estruturado em ≤ 800 tokens — entra como prefácio do system prompt
- Versão antiga é guardada como auditoria (usuário pode reverter)

### Stack técnica

- **Embedding:** `text-embedding-3-small` da OpenAI (US$ 0,02/M tokens) ou Cohere embed-multilingual-v3 (paridade)
- **Vector store:** `pgvector` no mesmo Postgres (Supabase) — sem novo serviço
- **Estruturadas:** JSON-B em tabela `agent_memory` com colunas `space_id`, `user_id`, `layer`, `content`, `embedding`, `created_at`, `last_used_at`, `confidence`
- **Cache curto prazo:** Redis (já no stack)
- **Decisão sobre [mem0](https://mem0.ai), [Letta](https://letta.com), [Zep](https://www.getzep.com):** avaliar adopção em 6 meses; MVP usa solução própria sobre pgvector

### Limites e custo

| Tier | Mem longa por Espaço | Episódica máx | Embedding refresh | Estimativa custo IA mem./mês |
|---|---|---|---|---|
| Free | 100 itens | 100 ev. | mensal | $0,02 |
| Pessoal | 500 | 500 | semanal | $0,10 |
| Pro | ilimitado | ilimitado | semanal | $0,40 |
| Família | mesmo Pro × 4 utilizadores | | semanal | $1,60 |
| Team | ilimitado | ilimitado | diário | $1,00/seat |
| Business | ilimitado | ilimitado | diário | $1,50/seat |
| Enterprise | ilimitado + cross-team aggregations | | diário | $2,50/seat |

---

## Opções Consideradas

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| A. Fine-tuning por utilizador | Forte personalização | Caro, lento, hard de auditar e apagar | Custo + LGPD |
| B. System prompt fixo | Simples | Estático, não evolui | Sem diferencial |
| C. **Memória multi-camada (escolhida)** | Dinâmico, barato, auditável, editável | Complexidade de stack; precisa de gestão de relevância | — |
| D. Adoptar mem0 / Letta como vendor | Velocidade | Lock-in cedo demais; soberania de dados questionável | Avaliar em 6 meses |

---

## Justificativa da Escolha

- **Auditoria + editabilidade são requisitos LGPD** — opção A não satisfaz facilmente
- **Custo controlável:** memórias activas e relevantes consomem fração de cents por utilizador/mês
- **Reverte risco de fine-tune drift:** factos errados podem ser apagados sem retreinar modelo
- **Mantém soberania:** dados ficam no nosso Postgres — sem serviço externo a deter conhecimento sobre o utilizador

---

## Consequências

### Positivas

- Cada agente fica genuinamente pessoal ao longo do tempo
- Memória editável é diferencial vs ChatGPT memories (que são opaca)
- Modelo escala bem com ARPU (utilizadores premium têm mais memória → mais valor)
- LGPD direito-de-acesso e direito-de-apagamento implementados de forma natural

### Negativas / Trade-offs

- Pipeline de memória é peça crítica — bug pode levar agente a "esquecer" tudo ou inventar factos
- Refresh nightly de prompts adiciona custo de LLM ao pipeline
- Embedding storage cresce com uso — necessária política de archive

### Neutras

- Alinha com tendência de "agent memory" (Mem0, Letta, ChatGPT memories, Claude projects) — vento favorável

---

## Impacto em Segurança e UX

- **Segurança:**
  - Memória é dado pessoal: storage com mesma encryption do Espaço (E2EE em `health`, `journal`, etc.)
  - Job de refresh deve correr em VPC privada; sem export de embeddings para fora
  - Inputs do utilizador para memória passam por filtro de PII (Microsoft Presidio) antes de embedding
  - Audit log de toda escrita/leitura de memória sensível
- **UX:**
  - Onboarding mostra 1 ecrã sobre "como o agente aprende" para criar expectativa correcta
  - Settings têm secção dedicada "Memória do agente" por Espaço
  - Cada acção que use memória recente é explicável: "decidi isto porque na semana passada disseste X"

---

## Critérios de Revisão

- Trigger: precisão de memória cai abaixo de 90% (medido por correcções de utilizador / acções totais); ou aparição de produto OSS estável que substitua infra própria
- Owner: Tech Lead
- Prazo: 6 meses (avaliar mem0/Letta/Zep como infra)

---

## Referências

- [mem0.ai](https://mem0.ai)
- [Letta](https://letta.com)
- [Zep](https://www.getzep.com)
- [pgvector](https://github.com/pgvector/pgvector)
- [Microsoft Presidio](https://github.com/microsoft/presidio) — redaction
- [LGPD Art. 18 — direitos do titular](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- ADR-0001, ADR-0003, ADR-0004
