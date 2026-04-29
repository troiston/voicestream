# 0008 — Estratégia de storage de áudio (SeaweedFS S3-compatible)

> **Fase que originou:** 2 (Especificação Técnica)  
> **Documento relacionado:** [`06_SPECIFICATION.md`](../06_SPECIFICATION.md), [`OPS01_DEPLOYMENT.md`](../OPS01_DEPLOYMENT.md), ADR-0007  
> **Skills usadas:** `/architecture-decision-records` `/architecture-patterns` `/secrets-management`  
> **Responsável:** Tech Lead  
> **Revisores:** Infra/DevOps, Segurança

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Definir estratégia de storage do áudio no MVP |
| 2026-04-25 | accepted | Tech Lead | Escolha explícita do usuário: SeaweedFS self-hosted (S3-compatible) |

---

## Contexto e Problema

O CloudVoice captura/gera artefatos de áudio (chunks e/ou arquivo final), que podem ser:
- grandes em volume,
- sensíveis por natureza (voz),
- sujeitos a políticas de retenção por Espaço (ex.: apagar automaticamente após X dias),
- necessários para reprocessamento/debug (quando permitido).

Precisamos de uma estratégia de storage que:
- seja **S3-compatible** para manter portabilidade (SDKs, tooling, migração),
- permita **URLs assinadas** (upload/download sem passar pelo app),
- suporte controles adicionais para dados sensíveis (incluindo E2EE por Espaços, quando aplicável),
- tenha plano claro de **backup/restore** e caminho de migração.

---

## Decisão

Para o MVP (Onda 1), vamos armazenar áudio em **SeaweedFS self-hosted** expondo uma interface **S3-compatible**.

Regras principais:
- A aplicação trata o storage como **S3** (endpoint + bucket), evitando dependência em APIs proprietárias.
- Upload/download será feito preferencialmente via **URLs pré-assinadas** com TTL curto.
- Para **Espaços sensíveis**, adotaremos **criptografia application-level** (E2EE por Espaço) antes de enviar ao object storage, de modo que o SeaweedFS armazene apenas ciphertext.

---

## Opções Consideradas

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| **A. SeaweedFS self-hosted (S3-compatible) (escolhida)** | Self-hosted completo; S3 API; integração simples; evolui para replicação; bom custo/controle | Operação (disco, upgrades, backups); no single-node é SPOF sem DR; requer disciplina de restore | — |
| B. Cloud storage S3-compatible (R2/B2/S3) | Menos operação; durabilidade alta; DR mais simples | Dependência externa; custos e egress; data residency e contratos | Usuário escolheu self-hosted |
| C. MinIO self-hosted | S3 API madura; tooling amplo | Exigiria operação semelhante; escolha do usuário foi SeaweedFS | Preferência do usuário |

---

## Justificativa da Escolha

Escolhemos **SeaweedFS** porque:
- atende ao requisito de **self-hosted** do MVP,
- preserva portabilidade via **S3-compatible API**,
- permite evoluir para topologias mais resilientes (replicação) quando o produto escalar,
- reduz lock-in do provedor de storage.

---

## Riscos e Mitigações

### 1) Perda de dados (disco / corrupção / erro operacional)
- **Mitigação (MVP):**
  - backups offsite regulares (ver “Backup/Restore” abaixo),
  - monitoramento de disco e alertas (uso, I/O, erros),
  - rotina de verificação (amostragem de objetos + checksums quando disponível).
- **Evolução:** replicação (multi-volume / multi-node), e DR formal com RPO/RTO definidos.

### 2) Single point of failure (SeaweedFS no mesmo VPS)
- **Mitigação (MVP):** backups + restore testado; limites de retenção para reduzir blast radius.
- **Evolução:** separar storage para outro nó/disco dedicado, depois replicar.

### 3) Crescimento de volume (custos e saturação de disco)
- **Mitigação (MVP):**
  - políticas de retenção por Espaço (expirar áudio automaticamente),
  - compressão/formatos padronizados (quando aplicável),
  - quotas por tenant (a definir na SPEC).
- **Evolução:** tiering (hot/cold), storage dedicado, ou migração para cloud.

### 4) Segurança (acesso indevido a áudio)
- **Mitigação (MVP):**
  - buckets/prefixos segregados por ambiente (`dev`/`staging`/`prod`) e por tenant (`orgId/spaceId/...`),
  - credenciais S3 com menor privilégio,
  - URLs pré-assinadas com TTL curto,
  - para Espaços sensíveis: **E2EE por Espaço** (ciphertext-only no storage).

---

## Interface S3 (contrato)

- **Endpoint**: SeaweedFS S3 gateway (interno na rede privada; exposto apenas via Traefik quando necessário).
- **Buckets**: por ambiente (obrigatório) e opcionalmente por tenant (a decidir).
- **Prefixo recomendado**:
  - `org/{orgId}/space/{spaceId}/session/{sessionId}/audio/{objectKey}`
- **URLs assinadas**:
  - `PUT` para upload e `GET` para download,
  - TTL curto (ex.: 5–15 minutos),
  - scope mínimo (um único objeto) e validação de ownership no app antes de assinar.

---

## E2EE por Espaços sensíveis (ciphertext-only)

Para Espaços marcados como sensíveis:
- O cliente (ou o servidor, dependendo do modelo de chaves definido no ADR de Espaços) criptografa o áudio **antes do upload**.
- O storage (SeaweedFS) armazena apenas ciphertext; operadores do servidor não conseguem ler o conteúdo sem a chave do Espaço.
- Metadados minimizados (evitar PII em nomes de objetos).

> Nota: a mecânica de chaves/derivação/rotação deve ser definida na SPEC e alinhada com ADR-0004 (Espaços).

---

## Backup/Restore (obrigatório)

### Backup
- Backups offsite regulares (frequência e retenção definidas na SPEC).
- Proteger backups com criptografia e controle de acesso.

### Restore testado
- Teste de restore periódico (mínimo: trimestral no MVP), com:
  - restauração em ambiente isolado,
  - verificação de leitura de amostras,
  - validação do pipeline de URLs assinadas.

---

## Caminho de Migração

### SeaweedFS → Cloud (S3/R2/B2)
- Manter uma **camada de abstração S3** na aplicação (endpoint/bucket/credentials por ambiente).
- Exportar/copy incremental por prefixo, validando integridade.
- Janela de “dual-read” (ler antigo e novo) e corte do “write-path”.

### Cloud → SeaweedFS (ou vice-versa)
- Mesmo plano: como o contrato é S3, a troca é majoritariamente de endpoint/credenciais + migração de objetos.

---

## Rollback

Se SeaweedFS degradar (incidente operacional):
- Pausar novos uploads (fail-closed para Espaços sensíveis).
- Fallback temporário para um backend S3 cloud (se configurado) mantendo o mesmo contrato.
- Retomar operação após restore/mitigação, com auditoria.

---

## Critérios de Revisão

- Trigger de revisão:
  - volume de áudio exigir replicação/HA,
  - incidentes recorrentes com disco/restore,
  - necessidade de data residency específica ou DR multi-região,
  - custo operacional superar benefícios do self-host.
- Owner da revisão: Tech Lead
- Prazo: 90 dias após o primeiro deploy em produção

---

## Referências

- ADR-0007 — hosting VPS self-hosted
- ADR-0004 — Espaços (privacidade, retenção e sensibilidade)
- `docs/OPS01_DEPLOYMENT.md` — runbook de deploy
