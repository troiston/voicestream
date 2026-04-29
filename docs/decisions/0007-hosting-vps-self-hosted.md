# 0007 — Hosting VPS self-hosted (Docker Swarm + Traefik + Portainer)

> **Fase que originou:** 2 (Especificação Técnica)  
> **Documento relacionado:** [`06_SPECIFICATION.md`](../06_SPECIFICATION.md), [`OPS01_DEPLOYMENT.md`](../OPS01_DEPLOYMENT.md)  
> **Skills usadas:** `/architecture-decision-records` `/architecture-patterns` `/secrets-management`  
> **Responsável:** Tech Lead  
> **Revisores:** Infra/DevOps, Segurança

---

## Status

`accepted`

**Histórico:**
| Data | Status | Autor | Motivo |
|---|---|---|---|
| 2026-04-25 | proposed | Tech Lead | Formalizar o caminho de infra do MVP em VPS |
| 2026-04-25 | accepted | Tech Lead | Escolha explícita do usuário: VPS + Swarm + Traefik + Portainer + Postgres 17 + Dragonfly + SeaweedFS |

---

## Contexto e Problema

O CloudVoice precisa operar com custo previsível e **controle operacional** (sem “snowflake server”), mantendo:
- **Segurança e privacidade** (voz e transcrições; alguns Espaços são sensíveis).
- **Deploy e rollback confiáveis** (mudanças pequenas, rastreáveis).
- **Backups e restore testado** (sem isso, a operação é frágil).
- **Observabilidade mínima** (saúde, logs, alertas básicos).

O usuário decidiu hospedar o MVP em **VPS self-hosted**, com um stack de containers que precisa ser padronizado e documentado para evitar drift.

---

## Decisão

Para o MVP (Onda 1), vamos hospedar em **VPS self-hosted (1 nó inicialmente)** usando:
- **Docker Swarm** (single-manager no MVP),
- **Traefik** como reverse proxy/ingress (TLS ACME),
- **Portainer** para UI de operação (observação/gestão do Swarm),
- **Postgres 17 self-hosted + pgvector** como banco principal,
- **Dragonfly (compatível com Redis)** para cache/filas/locks,
- **SeaweedFS** como object storage **S3-compatible** para áudio (ver ADR-0008).

---

## Opções Consideradas

| Opção | Prós | Contras | Descartada por |
|---|---|---|---|
| **A. VPS + Swarm + Traefik + Portainer (escolhida)** | Padroniza deploy/rollback; caminha para multi-nó; Traefik automatiza TLS/rotas; Portainer reduz fricção operacional | Swarm tem menos “mindshare” que K8s; exige disciplina de secrets/healthchecks/limits | — |
| B. VPS + Docker Compose + Caddy/Nginx | Mais simples no 1 nó | Migração para multi-nó vira projeto; operação vira “ad hoc”; divergência de runbook | Escala futura e consistência |
| C. PaaS (Vercel/Fly/Render) + serviços gerenciados | Menos operação no início | Custos/limites variáveis; lock-in; workers/storage exigem contornos | Estratégia “self-hosted” explícita |
| D. Kubernetes (1 nó) | Padrão enterprise; poderoso | Overkill no MVP; operação e custo de complexidade | Escopo |

---

## Justificativa da Escolha

Escolhemos **VPS + Swarm + Traefik + Portainer** porque:
- Dá **controle e previsibilidade** no MVP, com caminho natural para **2–3 nós** sem trocar de ferramentas.
- Traefik reduz configuração manual (TLS/hosts/rotas por labels) e padroniza entrada 80/443.
- Portainer facilita visibilidade e operação sem depender de acesso SSH para tarefas rotineiras.
- Alinha a infraestrutura com requisitos de segurança/privacidade sem introduzir lock-in de plataforma.

---

## Consequências

### Positivas
- Deploy reproduzível e rollback rápido no nível de serviço.
- Infra modular (web/worker/db/cache/storage) com healthchecks e limites.
- Caminho de evolução para HA (multi-nó) sem refazer a arquitetura.

### Negativas / Trade-offs
- **Single node é SPOF** no MVP (falha do host derruba tudo). Backups e restore precisam ser tratados como “feature”.
- Operação de Postgres/SeaweedFS self-hosted adiciona responsabilidade (tuning, discos, restore, incident response).

### Neutras
- Mantém abertura para migrar para K8s ou PaaS no futuro, se/quando o custo operacional justificar.

---

## Hardening (mínimo obrigatório)

### Host / VPS
- SSH por chave; desabilitar login root; usuário não-root com sudo.
- Atualizações automáticas de segurança + janela de manutenção.
- Firewall: expor apenas `80/tcp`, `443/tcp`, `22/tcp` (idealmente restrito por IP).
- Fail2ban (ou equivalente) para SSH.
- Sincronização de tempo (NTP) e rotação de logs.

### Rede e segmentação
- Rede “public” apenas para Traefik.
- Rede “private” para serviços internos (app/worker/postgres/dragonfly/seaweedfs).
- Postgres e Dragonfly **nunca** expostos publicamente.

---

## Secrets

- Segredos devem ser injetados via **Swarm secrets** (preferido) ou mecanismo equivalente com:
  - rotação planejada,
  - mínimo de exposição em logs,
  - acesso restrito no host.
- Proibir commit de `.env` e qualquer credencial.
- Segredos típicos: `DATABASE_URL` (se incluir senha), chaves Clerk/Stripe, chaves S3 do SeaweedFS (separadas por ambiente), chaves de criptografia application-level.

---

## Backups e Restore (obrigatório no MVP)

### Postgres 17 + pgvector
- Backup lógico diário (ex.: `pg_dump`) + retenção (ex.: 7/30 dias) + **offsite**.
- Teste de restore periódico (ex.: mensal) com validação de integridade.
- Para mudanças com migrations: backup antes de aplicar.

### SeaweedFS (object storage de áudio)
- Estratégia mínima no MVP:
  - backup offsite do volume de metadata e/ou snapshots,
  - rotina de verificação (listagem + amostragem de objetos),
  - teste de restore (pelo menos trimestral no MVP).
- Planejar desde já a evolução para replicação (ver ADR-0008).

### Traefik (ACME/TLS)
- Persistir storage do ACME em volume e incluir no backup (certificados/estado de emissão).

---

## Observabilidade (mínimo + evolução)

**Mínimo MVP:**
- Endpoint de healthcheck (`GET /health`) usado pelo Traefik/Swarm.
- Logs estruturados em stdout/stderr com rotação no host.
- Alertas básicos: uptime, disco (DB e volumes), CPU/RAM, falhas de deploy.

**Evolutivo (post-MVP):**
- Centralização de logs, métricas e traces (stack a definir na Fase 4).

---

## Rollback

- **App/worker**: rollback via atualização de serviço no Swarm (voltar para a imagem anterior).
- **Migrations**: evitar migrations destrutivas no MVP; usar padrões “expand/contract” quando necessário.
- **Config de Traefik**: labels e stack versionados; rollback revertendo o stack.

---

## Critérios de Revisão

- Trigger de revisão:
  - necessidade de HA real (multi-nó) e SLA > 99,5%,
  - crescimento de dados/áudio exigindo replicação/DR formal,
  - custo operacional superar benefícios do self-host.
- Owner da revisão: Tech Lead
- Prazo: 90 dias após o primeiro deploy em produção

---

## Referências

- `docs/OPS01_DEPLOYMENT.md` — runbook de deploy
- ADR-0004 — Espaços (privacidade/retenção)
- `docs/12_THREAT_MODEL.md` — ameaças e mitigação (quando existir)
