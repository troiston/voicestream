# 06_SPECIFICATION.md — Especificação Técnica

> **Skills:** `/using-superpowers` `/spec` `/api-design-principles` `/openapi-spec-generation` `/postgresql-table-design` `/architecture-decision-records` `/typescript-advanced-types`  
> **Responsável:** Tech Lead  
> **Depende de:** `docs/01_PRD.md` + `docs/05_DESIGN.md` (preview aprovado)  
> **Gate de saída:** Plano implementável sem ambiguidades; zero TODO aberto

Status: DRAFT (BLOQUEADO — aguarda preview de design aprovado)  
Data: 2026-04-25  
Autor: Tech Lead

> **Nota de processo (VibeCoding):** este documento pode existir como rascunho, mas **a Fase 2 (/spec) não começa** enquanto o preview de design (`docs/05_DESIGN.md`) não estiver aprovado.  
> Até lá, as seções 1–10 abaixo devem ser tratadas como **esqueleto + TODOs explícitos**, não como contrato final.

---

## Infraestrutura (MVP)

> Seção adicionada para documentar o “como subir” do MVP na VPS self-hosted, alinhado às decisões aceitas.

### Topologia (1 nó — MVP)

- **VPS**: 1 nó (SPOF no MVP; mitigado por backups + restore testado)
- **Orquestração**: Docker Swarm (single-manager)
- **Ingress/TLS**: Traefik (ACME)
- **Operação**: Portainer
- **DB**: Postgres 17 self-hosted + pgvector
- **Cache/filas/locks**: Dragonfly (redis-compatible)
- **Object storage de áudio**: SeaweedFS (S3-compatible)

ADRs relacionados:
- ADR-0007: hosting VPS self-hosted (Swarm + Traefik + Portainer)
- ADR-0008: storage de áudio (SeaweedFS S3-compatible)

---

### Serviços (Swarm)

| Serviço | Responsabilidade | Rede | Exposição | Persistência |
|---|---|---|---|---|
| `traefik` | Reverse proxy, TLS, roteamento | `public` + `private` | 80/443 | `traefik_acme` |
| `portainer` | UI operacional do Swarm | `private` | via Traefik (restrito) | volume próprio |
| `web` | Next.js app | `private` | via Traefik | stateless |
| `worker` | Jobs assíncronos | `private` | sem exposição pública | stateless |
| `postgres` | Postgres 17 + pgvector | `private` | sem exposição pública | `postgres_data` |
| `dragonfly` | Cache/filas/locks | `private` | sem exposição pública | opcional |
| `seaweedfs-*` | Master/Volume/Filer/S3 gateway | `private` | S3 gateway via Traefik (se necessário) | volumes próprios |

---

### Redes

- `public`: apenas ingress (Traefik)
- `private`: todos os serviços internos

Regras:
- Postgres/Dragonfly/SeaweedFS não expostos diretamente na internet.
- Somente Traefik expõe 80/443.

---

### Volumes

Mínimo:
- `traefik_acme`: estado ACME/certificados
- `postgres_data`: dados do Postgres
- `seaweedfs_*`: volumes do SeaweedFS (definir por topologia)

---

### Env vars e secrets

> **Regra:** segredos não ficam em repositório. Preferir Swarm secrets para credenciais.

#### Banco (Postgres 17 + pgvector)
- `DATABASE_URL` (**secret**)
- Garantir `pgvector` habilitado (`CREATE EXTENSION vector;`) e compatibilidade com Postgres 17.

#### Dragonfly
- `DRAGONFLY_URL` ou `REDIS_URL` (a depender do cliente) (**secret** se incluir senha)

#### SeaweedFS (S3-compatible)
- `AUDIO_STORAGE_DRIVER=s3`
- `AUDIO_STORAGE_ENDPOINT` (S3 gateway)
- `AUDIO_STORAGE_BUCKET`
- `AUDIO_STORAGE_ACCESS_KEY_ID` (**secret**)
- `AUDIO_STORAGE_SECRET_ACCESS_KEY` (**secret**)

#### App (web/worker)
- `APP_URL`
- `CLERK_SECRET_KEY` (**secret**)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY` (**secret**)
- `STRIPE_WEBHOOK_SECRET` (**secret**)

---

### Ordem de bring-up (primeiro deploy)

1. Provisionar VPS + hardening (SSH, firewall, updates).
2. Instalar Docker e inicializar Swarm.
3. Subir Traefik (ACME/TLS) e validar certificados.
4. Subir Portainer com acesso restrito (via Traefik).
5. Subir Postgres 17 e habilitar `pgvector`.
6. Subir Dragonfly na rede privada.
7. Subir SeaweedFS (incluindo S3 gateway) e validar PUT/GET com SDK S3.
8. Rodar migrations (Prisma) com backup prévio.
9. Subir `web`, validar `/health`.
10. Subir `worker`, validar processamento básico de jobs.
11. Configurar webhooks (Stripe/Clerk) apontando para domínio público.
12. Ativar backups + testar restore (mínimo: checklist e um restore dry-run).

---

### Backups, observabilidade e rollback (MVP)

- **Backups**:
  - Postgres: dump diário + retenção + offsite + restore testado.
  - SeaweedFS: backup/restore e plano de evolução para replicação (ADR-0008).
  - Traefik ACME: incluir no backup.
- **Observabilidade mínima**:
  - `/health`, logs estruturados, alertas de uptime/disco/CPU/RAM.
- **Rollback**:
  - Swarm: rollback de serviço para imagem anterior.
  - Migrations: evitar destrutivas; expand/contract quando necessário.

---

## 1. Arquivos a Criar / Modificar

| Arquivo | Ação (criar/modificar) | Responsabilidade | Bloco de implementação |
|---|---|---|---|
| | | | |

---

## 2. Tipos e Interfaces TypeScript

```typescript
// [preencher]
```

---

## 3. Contratos de API

| Endpoint | Método | Request | Response | Erros |
|---|---|---|---|---|
| | | | | |

---

## 4. Dependências Novas

| Pacote | Versão | Licença | Justificativa |
|---|---|---|---|
| | | | |

---

## 5. Variáveis de Ambiente

| Variável | Obrigatória | Exemplo | Descrição |
|---|---|---|---|
| | ☑ | | |

---

## 6. Ordem de Implementação

> Blocos pequenos e independentes. Cada bloco deve ter testes antes da implementação (TDD).

| # | Bloco | Depende de | Responsável | Status |
|---|---|---|---|---|
| 1 | | — | | ⬜ |
| 2 | | Bloco 1 | | ⬜ |

---

## 7. Checklist de Qualidade por Fluxo

| Fluxo | Typecheck | Lint | Teste unitário | Teste E2E | Segurança | UX/A11y |
|---|---|---|---|---|---|---|
| | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 8. Critérios de Rollback

- Trigger para rollback:
- Procedimento:
- Owner do rollback:

---

## 9. Abuse Cases

| Fluxo sensível | Abuso possível | Controle implementado |
|---|---|---|
| | | |

---

## 10. Requisitos UX por Página

| Página | Estados obrigatórios | A11y | Microcopy |
|---|---|---|---|
| | loading/empty/error/success | WCAG AA | |

### Matriz de páginas (rota, propósito, estados)

Documento vivo para alinhar builders e QA; expandir quando novas rotas forem mergeadas.

| Rota | Propósito | Estados |
|------|-----------|---------|
| `/dashboard` | Painel: KPIs mock (transcrição, STT, tarefas, integrações), sparkline 7d, feed de atividade, atalhos para captura/espaços/tarefas/integrações/onboarding/settings | **success** (dados mock); **empty** reservado para conta sem uso; **error** boundary global |
| `/onboarding` | Configuração inicial: privacidade de áudio, idioma/STT, toggles de integrações; stepper e **Saltar** | **idle** por passo; **success** implícito ao concluir (redirect); sem persistência nesta fase |
| `/settings` | Definições em abas (Perfil, Preferências, Voz, Notificações, Dispositivos, Segurança) | **success** (UI estática + forms não persistidos); **error** ao integrar API (futuro) |
| `/spaces`, `/capture`, `/tasks`, `/integrations`, `/billing`, `/usage`, `/team` | Fluxos core PRD — ver PRD § journeys | loading/empty/error/success por entrega |
| Páginas marketing/legal | Conteúdo estático + forms contacto onde aplicável | Ver `docs/05_DESIGN.md` matriz complementar |

---

## 11. TODOs em Aberto

> **Regra:** esta seção deve estar vazia antes de avançar para Fase 3.  
> Lacuna sem solução = bloqueio explícito registrado aqui.

| # | Descrição | Bloqueio | Owner | Prazo |
|---|---|---|---|---|
| 1 | Definir **estrutura de pastas** e lista de arquivos a criar/modificar (web/worker/shared/mobile) alinhada ao repo | Depende de preview aprovado em `docs/05_DESIGN.md` + consolidação de escopo (Onda 1) | Tech Lead | Antes de iniciar Fase 2 |
| 2 | Especificar **modelos e tabelas** (Prisma) e chaves/RLS por `space_id` conforme ADR-0004 | Depende de decisão final de multi-tenant (org vs user) e UX de Espaços | Tech Lead | Antes de iniciar Fase 2 |
| 3 | Fechar **contratos de API** (REST + WS) para: sessões, STT proxy, intents, ações/confirm, tarefas, auditoria, usage metering | Depende do desenho de UX (telas/estados) + decisão LiveKit Agents vs WS home-grown | Tech Lead | Antes de iniciar Fase 2 |
| 4 | Definir **contratos de storage S3** (SeaweedFS) e política de retenção por Espaço (TTL, delete job, export) | Depende do desenho de configurações (settings) e sensibilidade por Espaço | Tech Lead | Antes de iniciar Fase 2 |
| 5 | Consolidar **esquemas Zod** de entradas externas (requests, webhooks, env vars) | Depende dos endpoints e eventos finais | Tech Lead | Antes de iniciar Fase 2 |
| 6 | Definir **ordem de implementação em slices** (TDD) com testes mínimos por fluxo | Depende da lista final de entidades/endpoints | Tech Lead | Antes de iniciar Fase 2 |
| 7 | Preencher **abuse cases** e controles (rate limit, authz, audit fail-closed, E2EE onde aplicável) | Depende do threat model detalhado (Fase 4e) — mas precisamos do baseline agora | Tech Lead | Antes de iniciar Fase 2 |
| 8 | Confirmar **decisões pendentes** (STT/LLM/VAD/pipeline) e criar ADRs se necessário | Depende dos benchmarks em `docs/03_RESEARCH.md` | Tech Lead | Antes de iniciar Fase 2 |

---

## 12. Decisões de Arquitetura (ADRs)

| # | Decisão | Alternativas descartadas | Justificativa |
|---|---|---|---|
| ADR-0007 | VPS self-hosted com Swarm + Traefik + Portainer | PaaS / K8s / Compose puro | Controle operacional + caminho de escala |
| ADR-0008 | SeaweedFS S3-compatible para áudio | R2/B2/S3 / MinIO | Self-host + portabilidade S3 |

---

## 13. Impacto em Segurança e UX

> Preencher mesmo quando "sem impacto" — obrigatório pelo processo.

- Segurança:
- UX:
