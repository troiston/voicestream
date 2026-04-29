# 0001 — Reposicionamento: de "voz → tarefas profissionais" para "copiloto de vida com Espaços"

> **Fase que originou:** 0 (Validação)
> **Documento relacionado:** [`00_VALIDATION.md`](../00_VALIDATION.md), [`01_PRD.md`](../01_PRD.md), [`02_MONETIZATION.md`](../02_MONETIZATION.md)
> **Skills usadas:** `/architecture-decision-records` `/brainstorming` `/validate`
> **Responsável:** Tech Lead
> **Revisores:** PM, Designer

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Discussão exploratória de escopo |
| 2026-04-25 | accepted | Tech Lead | Aprovação após análise de competidores e expansão de personas |

---

## Contexto e Problema

A formulação inicial do CloudVoice foi "assistente de voz para profissionais que extrai ações de reuniões". Essa proposta tem fit comprovado (Otter.ai, Granola, Fireflies, Limitless validaram o mercado), mas chega tarde — concorrentes já cobrem essa fatia com bom UX e preço agressivo.

A análise da Fase 0 evidenciou três oportunidades de reposicionamento:

1. **Diferenciação vertical é cara:** competir com Fireflies em vendas, ou com Otter em academia, exige integrações específicas que demoram trimestres a maturar.
2. **Vidas das pessoas são multi-contexto:** a mesma pessoa é profissional, pai/mãe, líder de igreja, paciente, estudante. Hoje ela usa **N apps** desconexos para gerir cada faceta.
3. **PT-BR + cultura latina sub-servida:** nenhum competidor trata "Igreja", "Família" ou "Saúde Mental" como cidadãos de primeira classe; vocabulário, integrações e regras de privacidade são genéricos.

A premissa é que um único agente pessoal que organiza **toda a vida** (com isolamento por contexto e regras adequadas a cada um) é mais defensável que mais um "agente de reuniões".

---

## Decisão

CloudVoice é reposicionado como **copiloto de vida pessoal e profissional, organizado em Espaços** (Trabalho, Família, Saúde, Igreja, Financeiro, Diário, Estudos, Casa, Saúde Mental, Pessoal). Cada Espaço tem agente próprio, dados isolados, regras de privacidade próprias e UI específica. O posicionamento de marketing fica: *"voz → ação para a vida toda — sem perder nada, sem partilhar o que não deve, sem precisar pensar onde guardar."*

---

## Opções Consideradas

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| A. Vertical "vendas/CS" (estilo Fireflies/Gong) | Mercado claro; ARPU alto | Competidores fortes; B2B-only limita aquisição | Janela competitiva fechada |
| B. Horizontal "reuniões + ações" (estilo Otter) | Mercado amplo | Competidor já dominante; sem diferencial | Comoditizado |
| C. **Copiloto de vida com Espaços (escolhida)** | Diferencial defensável; PT-BR + cultura latina; ARPU expansível via add-ons; LTV alto | Complexidade de produto maior; risco de perder foco; gestão de privacidade exigente | — |
| D. Hardware dedicado (estilo Limitless) | Diferencial claro | CapEx pesado; risco de execução; foco fora do core de software | Capital intensivo |

---

## Justificativa da Escolha

Escolhemos **C** porque:

- **Diferencial estrutural, não incremental:** "agente único que organiza tudo" é categoria distinta de "transcritor de reuniões". Compete em outro espaço.
- **Brasil-first:** Espaço Igreja, Espaço MEI/Pequeno Negócio, integração Open Finance Brasil, vocabulário em PT-BR cobrem mercado de 200M+ que competidores em inglês ignoram.
- **ARPU expansível por add-ons:** o mesmo utilizador paga base $19 e add 4–6 módulos premium chegando a $30–50/mês ARPU. Modelo já provado por Notion, ClickUp, Apple One.
- **LTV mais alto:** quem confia ao agente a vida toda muda menos de produto que quem só usa para reuniões.
- **Privacidade granular como vantagem:** Espaços com isolamento por contexto resolvem objecções LGPD/GDPR melhor que produtos "vê tudo".

---

## Consequências

### Positivas

- Categoria de produto nova e defensável
- Múltiplos vectores de monetização (planos + add-ons + skills)
- Tese de retenção mais forte (efeito-rede pessoal: quanto mais o utilizador usa, mais o agente sabe sobre ele, mais difícil sair)
- Suporte a casos de uso B2C (família, igreja, saúde) e B2B (trabalho, enterprise) sob mesmo produto

### Negativas / Trade-offs

- Complexidade de produto significativamente maior (10 espaços vs 1 contexto)
- Risco de "produto que faz tudo, nada bem" — mitigado por agentes especializados
- Marketing precisa de mensagem clara para evitar percepção de "mais um app de tudo"
- Onboarding mais elaborado — mitigado por defaults inteligentes (utilizador escolhe 2 Espaços iniciais; resto é progressivo)

### Neutras

- Alinha com tendência de "agentes pessoais" (Apple Intelligence, Google Gemini, ChatGPT memories) — pode ser vento favorável ou competitivo
- Exige investimento em infra de memória/aprendizagem desde dia 1 (ver ADR-0005)

---

## Impacto em Segurança e UX

- **Segurança:** Isolamento por Espaço é primitivo de segurança (não só de UX). Espaços `Saúde`, `Diário` e `Saúde Mental` ficam fora de busca cross-space por default. Ver ADR-0004.
- **UX:** Onboarding de 3 ecrãs com pergunta direta "que áreas da sua vida quer organizar?"; defaults inteligentes activam 2 Espaços iniciais; restantes são opt-in progressivo.

---

## Critérios de Revisão

- Trigger: NPS < 25 ou retenção D30 < 20% após 90 dias do MVP, ou churn alto explicado por "muito complexo"
- Owner: PM
- Prazo: 90 dias após primeiro release público

---

## Referências

- [`00_VALIDATION.md` — Parte II §22 (Modelos de negócio alternativos)](../00_VALIDATION.md)
- Notion (modelo "tudo numa app" com workspaces como inspiração)
- Apple One (bundle de serviços como inspiração de monetização)
- Granola, Otter, Fireflies — competidores diretos no escopo "reuniões"
