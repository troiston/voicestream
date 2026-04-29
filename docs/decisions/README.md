# Architecture Decision Records (ADR)

> Decisões arquiteturais são documentadas aqui usando o template [MADR](https://adr.github.io/madr/).  
> **Skills:** `/using-superpowers` `/architecture-decision-records` `/architecture-patterns`  
> **Responsável por criar ADRs:** Tech Lead  
> **Quando criar:** toda decisão técnica com trade-offs relevantes ou impacto em segurança/UX

---

## Quando criar um ADR

Crie um ADR sempre que a decisão:
- Envolver escolha de stack, biblioteca ou serviço externo
- Definir um padrão arquitetural que o time deverá seguir
- Mudar fronteiras de módulo ou contratos públicos
- Ter impacto em segurança, compliance ou UX
- For questionada ou precisar ser rastreada no futuro

Decisões simples (ex: nome de variável, ordem de imports) **não** precisam de ADR.

---

## Como usar

1. Copie `template-madr.md` para um novo arquivo: `NNNN-titulo-com-hifens.md`  
   Ex: `0001-escolha-stack-nextjs.md`
2. Preencha todas as seções obrigatórias
3. Atualize o índice abaixo ao adicionar a decisão
4. Referencie o ADR no documento de fase correspondente:
   - Decisão de arquitetura → `06_SPECIFICATION.md` seção 12
   - Decisão executada → `07_IMPLEMENTATION.md` seção ADRs

---

## Índice

| ID | Título | Fase | Status | Data | Autor |
|---|---|---|---|---|---|
| [0001](0001-reposicionamento-copiloto-de-vida.md) | Reposicionamento — copiloto de vida com Espaços | 0 | accepted | 2026-04-25 | Tech Lead |
| [0002](0002-phone-call-recording.md) | Estratégia de gravação de chamadas telefónicas | 0 | accepted | 2026-04-25 | Tech Lead |
| [0003](0003-niveis-de-autonomia.md) | Níveis de autonomia do agente (9×4) | 0 | accepted | 2026-04-25 | Tech Lead |
| [0004](0004-arquitectura-de-espacos.md) | Arquitectura de Espaços (isolamento, roteador, agentes) | 0 | accepted | 2026-04-25 | Tech Lead |
| [0005](0005-memoria-e-auto-evolucao.md) | Memória multi-camada e auto-evolução de agentes | 0 | accepted | 2026-04-25 | Tech Lead |
| [0006](0006-skills-marketplace-e-ceo-agent.md) | Skills marketplace e CEO Agent (Enterprise) | 0 | accepted | 2026-04-25 | Tech Lead |
| [0007](0007-hosting-vps-self-hosted.md) | Hosting VPS self-hosted (Swarm + Traefik + Portainer) | 2 | accepted | 2026-04-25 | Tech Lead |
| [0008](0008-audio-storage-strategy.md) | Estratégia de storage de áudio (SeaweedFS S3-compatible) | 2 | accepted | 2026-04-25 | Tech Lead |

---

## Status possíveis

| Status | Significado |
|---|---|
| `proposed` | Proposta aberta para discussão |
| `accepted` | Decisão aceita e em vigor |
| `deprecated` | Decisão superada, mas não substituída |
| `superseded by ADR-XXXX` | Substituída por uma nova decisão |

---

## Referência

- [MADR](https://adr.github.io/madr/) — Markdown Architectural Decision Records
- [npm madr](https://www.npmjs.com/package/madr) — `npm install madr`
- [`S03_SKILLS_INDEX.md`](../S03_SKILLS_INDEX.md) — skills de arquitetura: `/architecture-decision-records` `/architecture-patterns`
