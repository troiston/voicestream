# 0003 — Níveis de Autonomia do Agente: 9 categorias × 4 níveis

> **Fase que originou:** 0 (Validação)
> **Documento relacionado:** [`01_PRD.md`](../01_PRD.md), [`05_DESIGN.md`](../05_DESIGN.md), [`12_THREAT_MODEL.md`](../12_THREAT_MODEL.md)
> **Skills usadas:** `/architecture-decision-records` `/agent-native-architecture`
> **Responsável:** Tech Lead
> **Revisores:** PM, Designer

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Necessidade de balancear automação vs confiança |
| 2026-04-25 | accepted | Tech Lead | Após desenho do fluxo dia-a-dia do tier Business |

---

## Contexto e Problema

CloudVoice executa ações por voz. Há uma tensão central:

- **Confirmar tudo** = o usuário desliga (fricção alta, perde valor da automação).
- **Executar tudo** = um erro destrói confiança e pode causar dano externo (email enviado errado, deal fechado errado, calendário bagunçado).

Precisamos de regras objetivas que deem o máximo de automação possível, com confirmação apenas onde é genuinamente necessária. Sem regras, cada usuário configura à mão e o produto fica ininteligível.

---

## Decisão

Adotar matriz **9 categorias de ação × 4 níveis de autonomia**, com defaults sensatos por tier de plano e override por categoria. O sistema é totalmente determinístico — o usuário sempre sabe o que vai ser automático vs perguntado.

### As 9 categorias

| # | Categoria | Reversível? | Externa? | Custo de erro |
|---|---|:---:|:---:|---|
| 1 | Resumir, transcrever, classificar | ✅ | ❌ | Baixo |
| 2 | Tarefa interna (módulo nativo, Trello, ClickUp, Notion) | ✅ | ❌ | Baixo |
| 3 | Evento de calendário sem participantes externos | ✅ | ❌ | Baixo |
| 4 | Update CRM (notas, fases) | ✅ | ❌ | Médio |
| 5 | Post em canal Slack/Teams pré-aprovado | Difícil | Parcial | Médio |
| 6 | Email para colega interno | Difícil | Sim | Médio-alto |
| 7 | Email para cliente externo | Difícil | Sim | **Alto** |
| 8 | Evento calendário com convidados externos | Difícil | Sim | **Alto** |
| 9 | Ação financeira ou contratual (aprovar desconto, gerar contrato, transferência) | ❌ | Sim | **Crítico** |

### Os 4 níveis de autonomia

| Nível | Comportamento |
|---|---|
| 0 — `Suggest` | Agente propõe; usuário executa manualmente |
| 1 — `Confirm` | Agente prepara; pede confirmação humana antes de executar |
| 2 — `Auto + Undo` | Agente executa; janela de 1 h de undo automático; aparece em "Já feito" |
| 3 — `Auto silencioso` | Agente executa; aparece apenas no log de auditoria (default das categorias 1, 2 reversíveis) |

### Defaults por tier (matriz)

| Categoria | Free | Pessoal | Pro | Família | Team | Business | Enterprise |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1. Resumir/transcrever | 3 | 3 | 3 | 3 | 3 | 3 | 3 |
| 2. Tarefa interna | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| 3. Calendário sem externos | 1 | 1 | 2 | 2 | 2 | 2 | 2 |
| 4. CRM update | n/a | n/a | 1 | n/a | 2 | 2 | 2 |
| 5. Slack canal pré-aprovado | n/a | n/a | 1 | 1 | 2 | 2 | 2 |
| 6. Email colega interno | n/a | 0 | 1 | 1 | 1 | 2 | 2 |
| 7. Email cliente externo | n/a | 0 | 1 | 1 | 1 | 1 | 1 |
| 8. Calendário com externos | n/a | 0 | 1 | 1 | 1 | 1 | 1 |
| 9. Acção financeira/contratual | — | — | 1 | 1 | 1 | 1 | 1 |

Heurística de design: **se um erro do agente é desfazível pelo usuário em < 30 s sem ofender ninguém → Auto. Caso contrário → Confirm.**

### Salvaguardas obrigatórias (todos os tiers)

1. **Janela de undo de 1 h** para qualquer acção em nível 2 ou 3
2. **Limite diário de auto-executions** (configurável; default Business: 50/dia; ao atingir, tudo passa a Confirm)
3. **Quarentena de novidade:** quando o usuário adiciona nova integração ou contato novo, as primeiras 5 ações nesse domínio passam a Confirm mesmo se nível 2/3 estiver ativo
4. **Modo "tudo Confirm" disponível com 1 toque** ("Quiet Mode") — útil para reuniões sensíveis, viagens, feriados
5. **Auditoria total**: cada ação automática tem trace explicável ("Por que você decidiu isto?")

---

## Opções Consideradas

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| A. Confirmar tudo | Zero erros visíveis | Fricção mata produto; utilizador desliga | Insustentável |
| B. Executar tudo silenciosamente | Máxima magia | Um erro grave = churn imediato | Risco inaceitável |
| C. **Matriz 9×4 com defaults por tier (escolhida)** | Determinístico; configurável; robusto | Complexidade de UI; precisa de educação no onboarding | — |
| D. Confiança progressiva (sobe nível com uso) | Curva de adopção natural | Imprevisível; difícil debugar; comportamento difere por utilizador | Falta determinismo |

---

## Justificativa da Escolha

Escolhemos **C** porque:

- **Determinístico:** utilizador consegue prever sempre o que vai acontecer.
- **Tier-aware:** plano mais alto justifica mais automação — alinha valor com preço.
- **Configurável:** override por categoria a qualquer momento.
- **Auditável:** todas decisões automáticas têm explicação rastreável.
- **Reverso fácil:** janela de undo + auditoria reduz custo de erro mesmo em nível 3.

---

## Consequências

### Positivas

- Modelo de confiança claro publicável em marketing ("o que o agente faz sozinho, o que pergunta")
- Diferenciação concreta entre tiers (Business automatiza mais que Pro; Enterprise quase tudo)
- Onboarding pode ser simplificado — usuário escolhe 1 de 3 perfis (Conservador / Balanceado / Agressivo) que mapeia para presets

### Negativas / Trade-offs

- Settings têm complexidade visível; precisa de UX cuidadosa
- Janela de undo exige infra técnica (snapshot pré-ação, replay, etc.)
- Auditoria total gera storage adicional (~5 KB/ação; ~500 ações/usuário/mês = 2,5 MB)

### Neutras

- Alinha com práticas de outros agentes ambientais (Cursor, Claude Code, Devin, Replit Ghostwriter) — fluência cognitiva alta para early adopters

---

## Impacto em Segurança e UX

- **Segurança:** Categorias 7, 8, 9 nunca podem subir a nível 3 (só até 2 com undo, ou ficam em 1). Categoria 9 nunca passa de 1 sem aprovação manual de owner da org. Auditoria fail-closed (sem auditoria → sem execução).
- **UX:** "Painel de Ações" é a peça central do app — 3 seções (A confirmar / Já feito / Aprendizagem). Swipe-right aprova, swipe-left ignora, tap edita. Desfazer com 1 toque até 1 h após.

---

## Critérios de Revisão

- Trigger: taxa de erro do agente > 5% por 2 semanas → forçar todos os utilizadores para nível ≤ 1 e re-treinar. Ou: pedido recorrente para auto-execution mais agressiva
- Owner: Tech Lead
- Prazo: revisão trimestral em Onda 1 e 2

---

## Referências

- [`01_PRD.md` §RF-006 — Confirmação default ON](../01_PRD.md)
- [Anthropic Constitutional AI](https://www.anthropic.com/research/constitutional-ai) — modelo de "confirmar quando irrevogável"
- [Cursor Agent Mode docs](https://docs.cursor.com/agent) — paralelo de modos auto/ask
