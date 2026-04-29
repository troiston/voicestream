# 11_RELEASE_READINESS.md — Checklist Go/No-Go

> **Skills:** `/using-superpowers` `/release` `/pr` `/verification-before-completion` `/finishing-a-development-branch` `/changelog-automation`  
> **Prompt pack:** `12_PROMPT_PACKS.md` → Fase Final  
> **Responsável:** Tech Lead (decisão) + QA Jr. (verificação)  
> **Regra:** Nenhum PR pode ser aberto sem este documento preenchido com decisão GO ou GO WITH RISK

Status: DRAFT  
Release: [preencher — ex: v1.0.0]  
Owner: [preencher]  
Data: [preencher]

---

## 1. Entradas Obrigatórias

| Documento | Status | Veredito |
|---|---|---|
| `docs/05_IMPLEMENTATION.md` | ⬜ | |
| `docs/06_SECURITY.md` | ⬜ | APROVADO / REPROVADO |
| `docs/07_TESTS.md` | ⬜ | APROVADO / REPROVADO |
| `docs/08_DEBUG.md` | ⬜ | PRONTO / NÃO PRONTO |
| `docs/09_UX_AUDIT.md` | ⬜ | READY / NOT READY |
| `docs/10_THREAT_MODEL.md` | ⬜ | READY / NOT READY |

---

## 2. Gate Técnico

| Checklist | Status | Observação |
|---|---|---|
| Typecheck verde (`npm run typecheck`) | ⬜ | |
| Lint verde (`npm run lint`) | ⬜ | |
| Testes automatizados verdes (`npm run test`) | ⬜ | |
| Testes E2E verdes (`npm run test:e2e`) | ⬜ | |
| Sem migration pendente não revisada | ⬜ | |
| `npm audit` sem vulnerabilidades críticas | ⬜ | |
| Changelog gerado (`/changelog-automation`) | ⬜ | |

---

## 3. Gate de Segurança

| Checklist | Status | Observação |
|---|---|---|
| Zero vulnerabilidade crítica aberta (06_SECURITY.md) | ⬜ | |
| Threat model revisado para esta release | ⬜ | |
| Risco residual com owner e data de revisão | ⬜ | |
| Secrets e variáveis de ambiente revisados | ⬜ | |
| `npm audit` executado — sem críticos | ⬜ | |

---

## 4. Gate de UX e A11y

| Checklist | Status | Observação |
|---|---|---|
| Fluxos críticos sem fricção bloqueante | ⬜ | |
| WCAG AA mínimo nos fluxos principais | ⬜ | |
| Estados completos (loading/empty/error/success) | ⬜ | |
| Microcopy de erro e confirmação revisado | ⬜ | |
| Testes manuais concluídos (teclado, mobile) | ⬜ | |

---

## 5. Gate Operacional

| Checklist | Status | Observação |
|---|---|---|
| Logs estruturados (JSON) em fluxos críticos | ⬜ | |
| Alertas configurados (error rate, latência) | ⬜ | |
| Health check endpoint funcional | ⬜ | |
| Rastreamento de requests (trace ID) | ⬜ | |
| Plano de rollback definido e testado | ⬜ | Ver `20_DEPLOYMENT.md` |
| Runbook de incidente atualizado | ⬜ | Ver `16_RUNBOOK.md` |
| Responsáveis de plantão definidos (primário + backup) | ⬜ | |

---

## 6. Plano de Comunicação

| Público | Canal | Mensagem | Responsável | Prazo |
|---|---|---|---|---|
| Time interno | | | | Antes do deploy |
| Usuários (se breaking change) | | | | |

---

## 7. Procedimento de Deploy e Rollback

- Janela de deploy: [preencher — horário de menor tráfego]
- Procedimento: ver `20_DEPLOYMENT.md`
- Critério de rollback automático: [ex: error rate > X% em 10 min]
- Owner do rollback: [preencher]

---

## 8. Decisão Final

| Gate | Status | Observação |
|---|---|---|
| Técnico | ⬜ | |
| Segurança | ⬜ | |
| UX / A11y | ⬜ | |
| Operacional | ⬜ | |

**Decisão:**
- [ ] ✅ GO — todos os gates aprovados
- [ ] 🟡 GO WITH RISK — risco aceito e documentado abaixo
- [ ] ❌ NO-GO — bloqueios: [listar]

**Justificativa:**

**Risco aceito (se GO WITH RISK):**
- Descrição do risco:
- Mitigação durante a janela de risco:
- Owner e prazo de resolução:

---

## Assinaturas

| Papel | Nome | Data | Decisão |
|---|---|---|---|
| Engineering (Tech Lead) | | | GO / NO-GO |
| Product | | | GO / NO-GO |
| Security | | | GO / NO-GO |
