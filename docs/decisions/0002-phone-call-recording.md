# 0002 — Estratégia de gravação de chamadas telefônicas

> **Fase que originou:** 0 (Validação)
> **Documento relacionado:** [`00_VALIDATION.md`](../00_VALIDATION.md), [`01_PRD.md`](../01_PRD.md)
> **Skills usadas:** `/architecture-decision-records` `/validate`
> **Responsável:** Tech Lead
> **Revisores:** PM, Jurídico

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Pergunta explícita do utilizador sobre gravação de chamadas |
| 2026-04-25 | accepted | Tech Lead | Após pesquisa de viabilidade técnica e legal |

---

## Contexto e Problema

A premissa inicial do utilizador incluía "gravar chamadas telefónicas e processá-las com IA". Existe ambiguidade sobre o que é viável:

1. Apple e Google não expõem APIs públicas para terceiros gravarem áudio do dialer nativo (caminho A).
2. Google Play Policy (Abr/2022) baniu uso de Accessibility API para gravar chamadas; reforçado em 2025.
3. Apps como TapeACall, Rev e Otter Phone gravam chamadas hoje, mas usam **conference call trick** (caminho C), não interceção do dialer.
4. Telefones Samsung, Pixel, Xiaomi têm gravador OEM nativo no firmware (caminho B) — terceiros podem ler arquivos gerados, mas não controlar a gravação.
5. Construir VoIP próprio (caminho D) é viável mas é um projecto à parte (3–6 meses de engenharia + carrier deals).

Há também restrições legais (LGPD/GDPR/CCPA) sobre gravação com terceiros e direito-de-aviso obrigatório em vários jurisdições.

---

## Decisão

CloudVoice **não suporta o caminho A** (interceptação do dialer nativo) por ser proibido pelas plataformas. Suporta os outros três caminhos progressivamente:

- **MVP (Onda 1):** caminho B — usuário faz upload manual de arquivos gerados pelo gravador OEM; CloudVoice processa transcrição + resumo + ações como qualquer outra sessão.
- **Onda 1 (Auto-Sync):** monitoramento da pasta do gravador OEM em Android (Samsung, Xiaomi, Pixel, OPPO, Vivo) via Storage Access Framework — quando aparece nova gravação, o app pergunta "quer processar?".
- **Onda 3 (add-on `Ligar Gravando`):** caminho C via Twilio — utilizador inicia chamada outbound através do CloudVoice; aviso legal automático no início; gravação completa.
- **Enterprise sob pedido:** caminho D — VoIP integrado com número dedicado.

Documenta-se explicitamente como **anti-feature** no `01_PRD.md` a "interceptação transparente do dialer nativo" — para evitar mal-entendido com usuários e proteção em revisões de loja.

---

## Opções Consideradas

| Caminho | Como funciona | iOS | Android | Decisão |
|---|---|:---:|:---:|---|
| A. Intercetar dialer nativo via API | API de sistema | ❌ | ❌ | **Não suportado** (impossível) |
| B. Ler arquivos do gravador OEM | Watch folder / SAF / upload | n/a (sem gravador OEM acessível) | ✅ Samsung, Pixel, Xiaomi, OPPO, Vivo | **MVP — auto-sync inteligente** |
| C. Conference call trick via Twilio | App liga via número CloudVoice; grava server-side | ✅ | ✅ | **Onda 3 — add-on `Ligar Gravando` $5/mês + $0,02/min** |
| D. VoIP integrado próprio | App é o dialer; usa SIP trunking | ✅ | ✅ | **Sob demanda Enterprise** |

---

## Justificativa da Escolha

- **Caminho B no MVP:** zero custo de infra adicional; cobre ~80% dos usuários Android brasileiros; respeita políticas das lojas; é apenas leitura de arquivos que o usuário já gera intencionalmente.
- **Caminho C como add-on Onda 3:** custo controlado ($0,0085/min Twilio + $0,26/h STT ≈ $0,35/h all-in); preço publicável; aviso legal obrigatório embutido; UX intuitiva para utilizadores leigos (1 botão "Ligar Gravando").
- **Caminho A nunca:** mesmo que houvesse forma técnica, custos de violação de policy (banimento da Play Store / App Store) excedem benefícios.

---

## Consequências

### Positivas

- Política clara para suporte e marketing — "sim, dá para gravar chamada, e estes são os 3 modos"
- Risco zero de banimento de loja por violação de policy
- Compliance LGPD/GDPR mais defensável (caminho C tem aviso obrigatório embutido)

### Negativas / Trade-offs

- Caminho B só funciona em Android e depende do usuário ter gravador OEM (cobre ~80% Android BR, 0% iOS)
- Caminho C tem custo variável que precisa de gestão por tier
- O usuário pode ficar confuso com 3 caminhos — mitigado por detecção automática de device no onboarding e recomendação do modo certo

### Neutras

- iOS fica "menos atendido" no MVP (sem caminho B nativo) — alinhado com decisão de iOS PWA-first na Onda 1

---

## Impacto em Segurança e UX

- **Segurança:** Caminho B exige permissão `MANAGE_EXTERNAL_STORAGE` (Android 11+) com justificação clara na ficha da Play Store; SAF preferido onde funciona. Caminho C tem aviso de gravação automático (script configurável; default cumpre PT-BR/EN).
- **UX:** Onboarding detecta `Build.MANUFACTURER` em Android e ativa modo certo. Em iOS, default é caminho C (Onda 3) ou upload manual (Onda 1). Botão único "Ligar Gravando" na home do app.

---

## Critérios de Revisão

- Trigger: mudança nas políticas Apple/Google (improvável a curto prazo); pedido recorrente de utilizadores Enterprise por caminho D
- Owner: Tech Lead
- Prazo: rever na Onda 3, ou a qualquer mudança de policy

---

## Referências

- [Google Play Developer Program Policy — Permissions](https://support.google.com/googleplay/android-developer/answer/9888170)
- [Apple — CallKit documentation](https://developer.apple.com/documentation/callkit) (não expõe gravação)
- [Twilio Voice Pricing](https://www.twilio.com/voice/pricing)
- TapeACall, Rev Call Recorder, Otter Phone — exemplos de implementação caminho C
