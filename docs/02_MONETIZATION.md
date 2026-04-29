# 02_MONETIZATION.md — Modelo de Monetização

> **Skills:** `/using-superpowers` `/brainstorming` `/writing-plans`
> **Fase:** 1b (entre PRD e Market)
> **Gate de saída:** Modelo escolhido com justificativa + integração técnica definida + tiers, add-ons e bundles validados em unit economics
> **Responsável:** Tech Lead
> **Referência cruzada:** [`00_VALIDATION.md`](00_VALIDATION.md), [`01_PRD.md`](01_PRD.md), [ADR-0001](decisions/0001-reposicionamento-copiloto-de-vida.md), [ADR-0006](decisions/0006-skills-marketplace-e-ceo-agent.md)

Status: APPROVED
Data: 2026-04-25
Autor: Tech Lead (CloudVoice)

---

## 1. Contexto do Produto

- **Produto:** CloudVoice — copiloto de vida com Espaços
- **Público-alvo:**
  - **B2C primário:** profissionais 28–50 anos, Brasil + EUA + LATAM, multi-contexto (trabalho + família + faith + saúde + finanças); paying willingness $10–30/mês
  - **B2C secundário:** famílias inteiras (1 pagador, 4 utilizadores), $25–35/mês
  - **B2B small/mid:** equipas 5–25 colaboradores, $35–70/seat
  - **B2B large:** organizações 100+ com necessidade de CEO Agent e compliance Enterprise, ≥ $15k/ano
- **Proposta de valor:** "Voz → ação para a vida toda — sem perder nada, sem partilhar o que não deve, sem precisar pensar onde guardar."
- **Tipo de uso:** **Híbrido** (recorrente + uso variável + add-ons + marketplace)

---

## 2. Modelos Avaliados (resumo)

| Modelo | Score (0-5) | Veredito |
|---|:---:|---|
| Assinatura pura | 3 | Insuficiente — não captura heavy users |
| Créditos / pay-per-use puro | 2 | Erode previsibilidade; má experiência para utilizador |
| Freemium | 4 | Essencial para aquisição mas não como modelo único |
| **Híbrido (assinatura + uso + add-ons + marketplace) — escolhido** | **5** | Alinha valor, captura excedente, abre 4 vectores de receita |
| Pagamento único | 1 | Inviável (custos operacionais contínuos) |

**Decisão:** **Híbrido com 4 vectores de receita** — (1) planos recorrentes; (2) add-ons modulares; (3) overage por uso acima do tier; (4) revshare de skills marketplace.

---

## 3. Tiers (7 níveis)

> Pricing publicado em USD; PT-BR usa tabela paralela em BRL com paridade de poder de compra (~50% do USD).

### 3.1 Free — Onboarding

| | |
|---|---|
| **Preço** | $0 |
| **Para quem** | Curiosos, estudantes, evaluators |
| **Espaços ativos** | 2 (escolhe entre todos) |
| **Agente** | 1 generalista |
| **Auto-evolução** | Memória básica (últimas 30 correcções, sem refresh nightly) |
| **Skills** | 5 built-in fixas |
| **Captura** | 300 min/mês (≈ 10 min/dia) |
| **STT** | Padrão (Deepgram Nova-2) |
| **LLM** | GPT-4o-mini |
| **Cross-space search** | ❌ |
| **Integrações** | Calendar (read-only) |
| **Vista padrão** | Lista |
| **Retenção áudio** | 7 dias |
| **Auto-execution** | Apenas categoria 1 (resumir/transcrever) |
| **Ads** | Não (jamais — privacidade é core) |
| **Suporte** | Comunitário |

### 3.2 Pessoal — $9/mês ($90/ano com 17% desconto)

| | |
|---|---|
| **Para quem** | Indivíduo que quer organizar a vida pessoal |
| **Espaços ativos** | 5 (incluindo 1 sensível: Saúde, Diário ou Saúde Mental) |
| **Agentes** | 3 especialistas + 1 generalista |
| **Auto-evolução** | Memória 3 meses + refresh semanal |
| **Skills** | 15 built-in + access marketplace gratuita |
| **Captura** | 1.500 min/mês |
| **STT** | Padrão |
| **LLM** | GPT-4o-mini |
| **Cross-space search** | ✅ (excluindo sensíveis) |
| **Integrações** | Calendar, Gmail, Notion, Apple Health/Google Fit (opt-in) |
| **Vista padrão** | Lista + Linha-tempo |
| **Retenção áudio** | 30 dias (configurável) |
| **Auto-execution** | Categorias 1, 2, 3 |
| **Suporte** | Email |

### 3.3 Pro — $19/mês ($190/ano)

| | |
|---|---|
| **Para quem** | Power user; profissional autónomo / freelancer / consultor |
| **Espaços ativos** | 8 |
| **Agentes** | 5 especialistas + 1 generalista |
| **Auto-evolução** | Memória ilimitada + refresh semanal + cross-space patterns |
| **Skills** | Built-in completo + Skill Builder + marketplace gratuita + 1 paga incluída |
| **Captura** | 4.500 min/mês |
| **STT** | Padrão + Premium (Anthropic Claude Haiku 3.5 para resumos) sob demanda |
| **LLM** | GPT-4o-mini default + Claude Haiku para resumos longos |
| **Cross-space search** | ✅ |
| **Integrações** | Todas built-in (Trello, ClickUp, Notion, Slack, Asana, Salesforce, HubSpot, Pipedrive) |
| **Vista padrão** | Lista, Kanban, Calendário, Linha-tempo |
| **Retenção áudio** | 90 dias (configurável) |
| **Auto-execution** | Categorias 1, 2, 3, 4 (com undo) |
| **Quiet Hours / Boundary Mode** | ✅ |
| **Cost dashboard** | ✅ |
| **Suporte** | Email + chat (4 h SLA) |

### 3.4 Família — $29/mês ($290/ano) | até 4 utilizadores

| | |
|---|---|
| **Para quem** | Famílias / casais que querem organizar vida partilhada |
| **Espaços ativos por utilizador** | 8 |
| **Espaço Família partilhado** | ✅ (todos os 4 utilizadores acedem com permissões individuais) |
| **Espaço Casal** | ✅ (sub-espaço para 2 dos 4) |
| **Agentes** | Mesmo que Pro × 4 utilizadores |
| **Captura** | 6.000 min/mês total (≈ 1.500/utilizador) |
| **Skills** | Mesmo que Pro |
| **Visibility cross-utilizador** | Apenas em `family` partilhado; Espaços individuais ficam isolados |
| **Auto-execution** | Mesmo que Pro |
| **Permissões parentais** | ✅ (filtros para Espaços de menores) |
| **Suporte** | Email + chat (4 h SLA) |

### 3.5 Team — $39/seat/mês ($390/seat/ano) | mín. 3 seats

| | |
|---|---|
| **Para quem** | Equipas pequenas (3–25); agências, squads B2B |
| **Espaços ativos** | 8 |
| **Agentes especializados** | 5 + 1 generalista |
| **RBAC org** | owner, admin, member, viewer |
| **Captura** | 4.000 min/seat/mês |
| **Skills** | Mesmo que Pro + 3 skills custom org-level |
| **Integrações** | Todas + Slack/Teams para org |
| **Auditoria org-level** | ✅ |
| **Espaço `work` partilhado** | ✅ (Kanban e calendário com colaboração) |
| **Auto-execution** | Categorias 1–6 (com undo) |
| **Cost dashboard org-level** | ✅ |
| **Suporte** | Email + chat (2 h SLA) |

### 3.6 Business — $69/seat/mês ($690/seat/ano) | mín. 10 seats

| | |
|---|---|
| **Para quem** | Empresas mid-market (25–250 colaboradores) |
| **Espaços ativos** | 10 |
| **Agentes** | Todos especialistas + Skill Builder org-level |
| **Captura** | 8.000 min/seat/mês |
| **Skills** | Marketplace completa + skills privadas org-level (até 20) |
| **Integrações** | Todas + SAML SSO + SCIM provisioning |
| **Auto-execution** | Categorias 1–8 (com undo) |
| **Cross-team aggregations** | ✅ (anonimizado, k-anon ≥ 5) |
| **DPIA por Espaço** | ✅ |
| **Audit log avançado** | ✅ (export para SIEM) |
| **Confidential computing opcional** | ✅ ($+10/seat) |
| **Suporte** | Email + chat (1 h SLA) + CSM partilhado |

### 3.7 Enterprise — desde $15k/ano (custom; tipicamente $150–300/seat/mês)

| | |
|---|---|
| **Para quem** | Organizações 100+ com requisitos compliance / governança |
| **Espaços ativos** | Ilimitados + Espaços customizados |
| **Agentes** | Todos + skills privadas ilimitadas |
| **CEO Agent** | ✅ (única tier com este recurso) |
| **Captura** | Ilimitada |
| **Confidential computing** | Incluído (Nitro Enclaves) |
| **Self-hosted opcional** | ✅ ($50k+/ano com SLAs reforçados) |
| **DPO partilhado** | ✅ |
| **MSA + DPA + sub-processadores** | Negociáveis |
| **SAML, SCIM, SSO, RBAC granular** | ✅ |
| **Integrações custom** | ✅ |
| **Auto-execution** | Categorias 1–8 (com undo); cat 9 sempre Confirm |
| **Suporte** | CSM dedicado + on-call |
| **Onboarding** | White-glove (até 4 semanas) |

### 3.8 Resumo comparativo

| | Free | Pessoal | Pro | Família | Team | Business | Enterprise |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Preço/mês** | $0 | $9 | $19 | $29 | $39/seat | $69/seat | $150+/seat |
| **Espaços** | 2 | 5 | 8 | 8 | 8 | 10 | ∞ |
| **Agentes especialistas** | 0 | 3 | 5 | 5 | 5 | 9 | 9+ |
| **Captura/mês** | 300m | 1,5k | 4,5k | 6k total | 4k/seat | 8k/seat | ∞ |
| **Skill Builder** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Marketplace pago** | ❌ | view-only | 1 grátis/mês | 1 grátis/mês | 2 grátis/mês | 5 grátis/mês | ilimitado |
| **CEO Agent** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Cross-space search** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **E2EE Espaços sensíveis** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Auto-execution** | cat 1 | cat 1-3 | cat 1-4 | cat 1-4 | cat 1-6 | cat 1-8 | cat 1-8 |

---

## 4. Add-ons modulares

> Add-ons são compráveis por cima de qualquer tier ≥ Pessoal. Renovam mensalmente; cancelam imediato.

| Add-on | Preço | Aplicável | O que dá |
|---|---|---|---|
| **Pacote Captura+** | $5/mês | Pessoal+ | +1.500 min/mês |
| **Pacote Captura++** | $15/mês | Pro+ | +5.000 min/mês |
| **Ligar Gravando** | $5/mês + $0,02/min | Pessoal+ | Conference call recording via Twilio (Onda 3) |
| **Recall Bot** | $9/mês | Pro+ | Bot em Zoom/Meet/Teams para reuniões com terceiros sem CloudVoice |
| **Premium STT** (Whisper Large + diarização) | $7/mês | Pro+ | Maior precisão PT-BR + speaker ID |
| **LLM Premium** (Claude Opus / GPT-4o full) | $9/mês | Pro+ | Resumos e análises com modelo maior |
| **Storage+** | $3/mês por 50 GB | Pessoal+ | Mais áudio guardado / retenção mais longa |
| **Pacote Compliance LGPD/GDPR** | $19/mês | Team+ | DPIA template, audit log avançado, exportação programada |
| **CEO Agent Lite** | $99/mês | Business | Aggregations cross-team sem persona executiva (substitui 1 → muitos: cluster de departamento) |
| **Skill Pack Vendas** | $12/mês | Pessoal+ | 10 skills curadas para vendas (cadência, follow-up, objections) |
| **Skill Pack Igreja** | $7/mês | Pessoal+ | Pregação, ministério, oração, devocional, Planning Center |
| **Skill Pack Saúde Mental** | $9/mês | Pessoal+ | Diário emocional, técnicas, padrões, integração com terapeutas (com consent) |
| **Skill Pack Finanças BR** | $14/mês | Pessoal+ | Open Finance Brasil, Pluggy/Belvo, controle MEI |
| **Skill Pack Estudos** | $7/mês | Pessoal+ | Resumos pedagógicos, flashcards, plano de estudo |
| **Hardware Trigger** | $99 one-time | Pro+ | Botão Bluetooth físico para iniciar captura (custom-branded) |
| **Speaker ID com biometria** | $5/mês | Pro+ | Distingue quem fala (com consentimento explícito) |

---

## 5. Bundles (combinações)

| Bundle | Tiers compatíveis | Inclui | Preço | Desconto |
|---|---|---|---|---|
| **Pessoal + Família** | base Pessoal + plano Família | 5 Espaços individuais para o pagador + 4 acessos família | $32/mês | 11% |
| **Pro Trabalho** | Pro | Skill Pack Vendas + Recall Bot + Premium STT | $42/mês | 22% |
| **Pro Vida Espiritual** | Pro | Skill Pack Igreja + Storage+ + Speaker ID | $34/mês | 19% |
| **Pro Saúde Total** | Pro | Skill Pack Saúde Mental + Storage+ + Premium STT | $36/mês | 18% |
| **Pessoal MEI BR** | Pessoal | Skill Pack Finanças BR + Captura+ + Skill Pack Vendas | $35/mês | 12% |
| **Família Devocional** | Família | Skill Pack Igreja + Storage+ | $36/mês | 14% |
| **Team Vendas** | Team | Skill Pack Vendas + Recall Bot org-wide + Premium STT | $52/seat/mês | 17% |
| **Business Compliance** | Business | Pacote Compliance + Confidential Computing + Speaker ID | $99/seat/mês | 12% |

---

## 6. Marketplace de Skills (revenue share)

> Skills publicáveis por terceiros; ver [ADR-0006](decisions/0006-skills-marketplace-e-ceo-agent.md).

- **Revenue share:** 70% criador / 30% plataforma
- **Skills pagas avg esperado:** $3–15/mês
- **Take-rate plataforma após scale (12 meses):** $0,5–2 por utilizador activo (estimativa conservadora)

### Exemplos hipotéticos

| Skill | Criador | Preço | Estimativa de utilizadores em 12 m |
|---|---|---|---|
| Skill "Vendas Imobiliárias BR" | terceiro | $5/mês | 10k |
| Skill "Médico de Família" | terceiro | $10/mês | 3k |
| Skill "Pastoral Avançada" | terceiro | $7/mês | 5k |
| Skill "Investidor PJ Brasil" | terceiro | $12/mês | 2k |

**Revenue plataforma estimado em 12 meses (apenas dos 4 acima):** $1,5–3M ARR a margens 30%.

---

## 7. Integração Técnica

### Provedor de pagamento

- **Stripe** (escolhido)
- **Justificativa:** já presente no stack (`README.md`); Checkout, Customer Portal, Subscriptions, Usage Records nativos; Stripe Tax para impostos globais; Stripe Connect para revshare de marketplace
- **Alternativas avaliadas:** Paddle (rejeitado por custos mais altos e menos controle de granularidade); LemonSqueezy (rejeitado por limitações em B2B)

### Eventos críticos Stripe

- `checkout.session.completed` → conceder acesso ao tier
- `customer.subscription.updated` → aplicar mudança de plano
- `customer.subscription.deleted` → revogar acesso (grace period 7 dias)
- `invoice.payment_succeeded` → estender período + reset de meters de uso
- `invoice.payment_failed` → notificar utilizador + degradar a Free após 3 falhas
- `usage_record.created` → registar overage de captura/skills
- `transfer.created` → revshare automático para criadores de skills (Stripe Connect)

### Meters de uso (overage)

- `transcription_minutes` — minutos transcritos sobre quota do tier
- `llm_tokens` — tokens de LLM premium (se add-on activo)
- `storage_gb` — GB acima do limite do tier
- `marketplace_calls` — chamadas a skills externas pagas

Overage é cobrado mensalmente em factura única, com aviso a 80% do tier e bloqueio opcional configurável (default: aceitar overage até 200% do tier; acima disso, pausa).

---

## 8. Unit Economics

### 8.1 Custos de IA por utilizador (estimativas)

> Baseado em Deepgram Nova-2 ($0,0043/min STT) + GPT-4o-mini ($0,15/M input + $0,60/M output) + **proxy** de custo de storage a preço de mercado S3 (ex.: $0,021/GB/mês). VAD on-device reduz STT real em ~40%.

| Tier | Captura | STT efectivo (após VAD) | Tokens LLM | Storage | **Custo IA/mês** | **ARPU** | **Margem bruta** |
|---|---|---|---|---|:---:|:---:|:---:|
| Free | 300 min | 180 min × $0,0043 = $0,77 | 200k → $0,15 | 1 GB → $0,02 | **$0,94** | $0 | **-$0,94** (CAC justify) |
| Pessoal | 1500 min | 900 min × $0,0043 = $3,87 | 1M → $0,75 | 5 GB → $0,11 | **$4,73** | $9 | **47%** |
| Pro | 4500 min | 2700 min × $0,0043 = $11,61 | 3M → $2,25 | 15 GB → $0,32 | **$14,18** | $19 | **25%** ❌ |
| Pro com 1 add-on média ($7) | + skill pack | mesmo | mesmo | mesmo | **$14,18** | $26 | **45%** |
| Família | 6000 min total | 3600 min × $0,0043 = $15,48 | 4M → $3,00 | 20 GB → $0,42 | **$18,90** | $29 | **35%** |
| Team | 4000 min × seat | 2400 min × $0,0043 = $10,32/seat | 2,5M → $1,88/seat | 12 GB → $0,25/seat | **$12,45/seat** | $39/seat | **68%** |
| Business | 8000 min × seat | 4800 min × $0,0043 = $20,64/seat | 5M → $3,75/seat | 25 GB → $0,53/seat | **$24,92/seat** | $69/seat | **64%** |
| Enterprise | ilimitado (cap negociado) | varia | varia | varia | $50–80/seat | $150+/seat | **70%+** |

### 8.2 Observações

- **Pro tier puro tem margem apertada (25%)** — cobre-se com add-ons; modelo conta com ARPU efectivo Pro de $24–28 (≥ 1 add-on em ~50% dos utilizadores)
- **Free tem custo negativo** ($0,94 mensal) — aceitável até 5–8 free users por pago (CAC orgânico)
- **Tiers B2B (Team/Business/Enterprise) têm margem 60–70%** — sustentam crescimento e investimento
- **Família é eficiência: 4 utilizadores num único billing reduz CAC e churn**
- **Marketplace é margem incremental sobre stack já paga** (~30% do GMV de skills é receita líquida sem custo adicional)

### 8.3 Sensibilidades

| Cenário | Impacto |
|---|---|
| STT cai 50% (Deepgram cuts; OSS Whisper.cpp matures) | margem Pro sobe para 50%; Business para 80%+ |
| GPT-4o-mini sobe 2× | margem Pro cai para 18%; Pro precisa subir $2 |
| Free convert rate < 2% após 6 meses | reduzir Free para 200 min; aceitar trade-off de aquisição |
| Marketplace falha em decolar | revshare $0; principal receita continua planos |
| CEO Agent vendas Enterprise abaixo de plan | Enterprise quota não atinge $1M ARR ano 1 — risco mitigável |

---

## 9. Projecção de Receita (12 meses pós-lançamento)

> Conservadora — assumindo aquisição orgânica + paid ads $50k/mês a partir do mês 3.

| Mês | Free | Pessoal | Pro | Família | Team | Business | Enterprise (org) | MRR | ARR run-rate |
|---|---|---|---|---|---|---|---|:---:|:---:|
| M1 | 500 | 50 | 30 | 10 | 0 | 0 | 0 | $1.6k | $19k |
| M3 | 5k | 600 | 350 | 80 | 15 | 0 | 0 | $17k | $200k |
| M6 | 25k | 3k | 2k | 400 | 80 | 5 | 1 | $94k | $1.1M |
| M9 | 60k | 8k | 5,5k | 1k | 200 | 20 | 3 | $250k | $3.0M |
| M12 | 120k | 18k | 12k | 2,5k | 450 | 50 | 8 | $580k | $7.0M |

**Adicional marketplace (M12):** $20–40k MRR (estimativa).

**Total ARR run-rate target M12:** $7.0–7.5M.

---

## 10. Veredito

- **Modelo escolhido:** **Híbrido** (recorrente + uso + add-ons + marketplace revshare)
- **Justificativa:** alinha valor entregue com captura de receita; suporta tanto B2C quanto B2B; abre 4 vectores de receita reduzindo dependência de um único; permite expansão de ARPU sem upsell forçado de tier
- **Provedor:** Stripe (Subscriptions + Usage + Connect)
- **Riscos identificados:**
  1. Free tem custo negativo — gerir conversão para que ratio Free:Paid não exceda 8:1
  2. Pro margem fina sem add-ons — comunicação de bundles desde dia 1
  3. Marketplace pode demorar a decolar — não contar com receita material antes de M9
  4. CEO Agent vendas Enterprise ciclo longo (3–6 meses) — pipeline desde M2
  5. STT é commodity volátil — provider abstraction obrigatório
- **Impacto em segurança:** Stripe é PCI-compliant; webhooks com signature verification; reconciliação nightly; revshare via Stripe Connect tem KYC integrado
- **Impacto em UX:** Pricing page clara com 7 tiers (com filtros: "uso pessoal" / "uso profissional" / "uso família"); Customer Portal Stripe para self-serve; cost dashboard transparente em todos os planos pagos

### Status: ✅ APPROVED — pronto para gate de Fase 1c

---

## 11. Dados de Referência (Mercado 2026)

- Modelo híbrido (assinatura + uso) tem **21% median growth rate** — maior de todos os modelos
- 67% dos SaaS B2B combinam múltiplos modelos
- Marketplaces com revshare 70/30 são padrão (Apple App Store, Google Play, Notion templates)
- CEO Agent / executive intelligence é categoria emergente — pricing premium ($150–500/seat) suportado por valor real
- Família/multi-user plans têm churn 30–40% menor que individual (efeito-rede pessoal)
- 60% dos visitantes SaaS verificam pricing antes de qualquer demo — pricing page é página crítica de conversão

*Fontes: Pricingio 2026, Getmonetizely 2026, Stripe Annual SaaS Report 2025, OpenView Partners 2026.*
