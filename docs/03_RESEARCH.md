# 03_RESEARCH.md — Pesquisa Técnica

> **Skills:** `/using-superpowers` `/api-design-principles` `/architecture-patterns` `/nodejs-backend-patterns`  
> **Fase:** 1c-suporte (complementa a pesquisa de mercado)  
> **Gate de saída:** Riscos técnicos mapeados com alternativas avaliadas  
> **Responsável:** Tech Lead  
> **Referência cruzada:** `docs/01_PRD.md` (requisitos), `docs/04_MARKET_AND_REFERENCES.md` (mercado)

Status: DRAFT (parcial — infra alinhada aos ADRs; faltam decisões técnicas do MVP)  
Data: 2026-04-25  
Autor: Tech Lead

> **Nota:** este documento existe para **fechar decisões técnicas pendentes** (provedores STT/LLM/VAD/pipeline) e alimentar `docs/06_SPECIFICATION.md`.  
> As seções 1–7 abaixo não podem permanecer como “[preencher]” quando a Fase 2 começar.

---

## Hosting & Infra

> Objetivo: documentar a stack operacional escolhida para o MVP e um checklist prático de provisionamento.

### Stack escolhida (MVP)

- **Hosting**: VPS self-hosted (1 nó inicialmente)
- **Orquestração**: Docker Swarm (single-manager no MVP)
- **Ingress / TLS**: Traefik (ACME / Let's Encrypt)
- **UI operacional**: Portainer (para Swarm)
- **Banco**: Postgres 17 self-hosted + pgvector
- **Cache/filas/locks**: Dragonfly (compatível com Redis)
- **Object storage de áudio**: SeaweedFS (S3-compatible) (ADR-0008)

ADRs relacionados:
- ADR-0007: VPS self-hosted + Swarm/Traefik/Portainer
- ADR-0008: estratégia de storage de áudio (SeaweedFS)

---

### Checklist de provisionamento (MVP)

#### Acesso e hardening do host
- [ ] Criar usuário não-root; SSH por chave; desabilitar login root
- [ ] Atualizações automáticas de segurança + janela de manutenção
- [ ] Firewall: permitir apenas `80/tcp`, `443/tcp`, `22/tcp` (SSH idealmente restrito por IP)
- [ ] Fail2ban (ou equivalente)
- [ ] NTP/time sync configurado
- [ ] Rotação de logs no host

#### Docker / Swarm
- [ ] Instalar Docker Engine
- [ ] Inicializar Swarm (single-manager)
- [ ] Criar redes: `public` (ingress) e `private` (internos)
- [ ] Configurar volumes persistentes (mínimo):
  - [ ] `postgres_data`
  - [ ] `traefik_acme` (certificados ACME)
  - [ ] volumes do SeaweedFS (metadata/volumes) conforme topologia

#### Traefik (ingress + TLS)
- [ ] Subir Traefik no Swarm
- [ ] Validar emissão e renovação ACME
- [ ] Forçar HTTP→HTTPS e HSTS
- [ ] Garantir que apenas Traefik expõe portas públicas

#### Portainer
- [ ] Subir Portainer no Swarm com acesso restrito
- [ ] Habilitar autenticação forte e limitar usuários

#### Postgres 17 + pgvector
- [ ] Subir Postgres 17 com volume persistente
- [ ] Garantir extensão `vector` (pgvector) habilitada
- [ ] Definir política de backup + retenção + restore testado

#### Dragonfly
- [ ] Subir Dragonfly somente na rede privada
- [ ] Definir política de persistência (se aplicável) e limites de memória
- [ ] Confirmar estratégia de uso: cache, filas, locks e retries

#### SeaweedFS (S3-compatible)
- [ ] Subir SeaweedFS (topologia MVP em 1 nó)
- [ ] Habilitar S3 gateway e testar operações básicas (PUT/GET via SDK S3)
- [ ] Definir buckets/prefixos por ambiente e por tenant
- [ ] Definir backup/restore e monitoramento de disco

#### Segredos e variáveis
- [ ] Definir padrão: Swarm secrets (preferido) vs env vars
- [ ] Inventariar segredos: Stripe/Clerk/DB/S3/cripto
- [ ] Rotação e auditoria (mínimo: procedimentos documentados)

#### Observabilidade mínima
- [ ] Endpoint `/health` funcionando e usado por healthchecks
- [ ] Logs estruturados e rotação
- [ ] Alertas básicos: uptime, disco (DB + volumes), CPU/RAM

---

## 1. Integração com Serviços Externos

| Serviço | Propósito | API/SDK | Limitações | Alternativas | Decisão |
|---------|-----------|---------|-----------|-------------|---------|
| [preencher] | [preencher] | [preencher] | [preencher] | [preencher] | [preencher] |

---

## 2. Riscos Técnicos Identificados

| Risco | Probabilidade | Impacto | Mitigação | Owner |
|-------|-------------|---------|-----------|-------|
| [preencher] | Alta/Média/Baixa | Alto/Médio/Baixo | [preencher] | [preencher] |

---

## 3. Trade-offs Arquiteturais

| Decisão | Opção A | Opção B | Escolha | Justificativa |
|---------|---------|---------|---------|--------------|
| [preencher] | [preencher] | [preencher] | [preencher] | [preencher] |

> Decisões de alto impacto devem gerar ADR em `docs/decisions/`

---

## 4. Dependências e Licenças

| Pacote | Versão | Licença | Manutenção | CVEs Conhecidos | Aprovado |
|--------|--------|---------|-----------|----------------|----------|
| [preencher] | [preencher] | [preencher] | Ativo/Baixo/Abandonado | [preencher] | [ ] Sim [ ] Não |

---

## 5. Limites e Constraints do Stack

- **Database:** [limites de conexões, storage, etc.]
- **API:** [rate limits, quotas, etc.]
- **Hosting:** [limites de recursos, single-node SPOF, estratégia de backups, etc.]
- **Auth:** [limites de usuários, sessions, etc.]

---

## 6. Impacto em Segurança e Privacidade

- **Dados sensíveis envolvidos:** [preencher]
- **Compliance:** [ ] LGPD [ ] GDPR [ ] SOC2 [ ] Outro: [preencher]
- **Superfície de ataque:** [preencher]
- **Mitigações planejadas:** [preencher]

---

## 7. Veredito

- **Riscos críticos:** [preencher ou "nenhum"]
- **Bloqueios para implementação:** [preencher ou "nenhum"]
- **Próximos passos:** [preencher]

### Status: [ ] APROVADO [ ] REPROVADO — Requer investigação adicional
