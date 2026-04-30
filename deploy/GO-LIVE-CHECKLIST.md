# VoiceStream — Go-Live Checklist

Passo a passo operacional para subir produção. Cada item é bloqueante.

## 1. GitHub

- [ ] Renomear repositório `troiston/cloudvoice` → `troiston/voicestream` (Settings → General → Repository name)
- [ ] Localmente: `git remote set-url origin https://github.com/troiston/voicestream.git`
- [ ] Configurar secrets em Settings → Secrets and variables → Actions:
  - `DATABASE_URL` (para o workflow `migrate.yml`)
- [ ] Adicionar environment "production" em Settings → Environments com required reviewer (você mesmo) — exigido pelo `migrate.yml`

## 2. DNS

- [ ] A record `voicestream.com.br` → IP da VPS
- [ ] A record `staging.voicestream.com.br` → mesmo IP
- [ ] (Opcional) `www.voicestream.com.br` → CNAME `voicestream.com.br`

## 3. Provisionamento Docker secrets na VPS

Pelo SSH na VPS, criar 14 secrets. Cada `docker secret create <name> -` lê de stdin (Ctrl-D para encerrar) ou pipe um arquivo.

```bash
# Exemplo (adapte com seus valores reais):
echo -n "postgresql://user:pass@postgres:5432/voicestream" | docker secret create database_url -
echo -n "<gerar com: openssl rand -hex 32>" | docker secret create better_auth_secret -
echo -n "<google client id>" | docker secret create google_client_id -
echo -n "<google client secret>" | docker secret create google_client_secret -
echo -n "<resend api key>" | docker secret create resend_api_key -
echo -n "<seaweedfs access key>" | docker secret create s3_access_key -
echo -n "<seaweedfs secret key>" | docker secret create s3_secret_key -
echo -n "<deepgram api key>" | docker secret create deepgram_api_key -
echo -n "<anthropic api key>" | docker secret create anthropic_api_key -
echo -n "redis://dragonfly:6379" | docker secret create redis_url -
echo -n "<stripe LIVE secret key>" | docker secret create stripe_secret_key -
echo -n "<stripe LIVE webhook secret>" | docker secret create stripe_webhook_secret -
echo -n "$(openssl rand -base64 32)" | docker secret create encryption_key -
echo -n "<sentry DSN url>" | docker secret create sentry_dsn -
```

Verificar: `docker secret ls` mostra 14 entries.

## 4. Portainer

- [ ] Stacks → Add stack → Repository
  - Repository URL: `https://github.com/troiston/voicestream`
  - Reference: `refs/heads/main`
  - Compose path: `deploy/stack.yml`
  - Authentication: deploy key ou token GitHub
  - Auto-update: GitOps with polling 1 min OR webhook
- [ ] Stack name: `voicestream`
- [ ] Deploy → confirmar que `voicestream_web` (3/3) e `voicestream_worker` (2/2) sobem

## 5. Stripe (modo LIVE)

- [ ] Trocar para LIVE mode no dashboard
- [ ] Atualizar Docker secret `stripe_secret_key` com a key live (`sk_live_...`)
- [ ] Criar webhook endpoint em Developers → Webhooks:
  - URL: `https://voicestream.com.br/api/webhooks/stripe`
  - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.trial_will_end`, `invoice.payment_succeeded`, `invoice.payment_failed`
- [ ] Copiar signing secret → atualizar Docker secret `stripe_webhook_secret`
- [ ] Verificar produtos/preços em LIVE mode (rodar `scripts/create-stripe-products.mjs` apontando para LIVE se necessário)

## 6. Sentry

- [ ] Criar projeto em sentry.io (platform: Next.js)
- [ ] Copiar DSN (formato `https://xxx@oXXX.ingest.sentry.io/YYY`)
- [ ] Atualizar Docker secret `sentry_dsn`

## 7. Google OAuth

- [ ] Console → OAuth consent screen → Mover de Testing para Production
- [ ] Verificar `voicestream.com.br` no Google Search Console (pré-requisito)
- [ ] Adicionar redirect URI prod: `https://voicestream.com.br/api/auth/callback/google`

## 8. Resend (email transacional)

- [ ] Domain verify para `voicestream.com.br` (DNS DKIM/SPF/DMARC)
- [ ] `RESEND_FROM=alertas@voicestream.com.br` (ou similar) no `.env` produção
- [ ] Testar enviando 1 email de signup

## 9. Database migration

- [ ] GitHub Actions → Run workflow `migrate.yml` (production environment exige sua aprovação)
- [ ] Confirmar logs `prisma migrate deploy` sem erros

## 10. Smoke test produção

- [ ] `curl https://voicestream.com.br/api/health` → 200 `{status:"ok"}`
- [ ] `curl https://voicestream.com.br/api/ready` → 200 `{status:"ready"}`
- [ ] Browser: signup com email novo → recebe email Resend → click link → `/verify-email` confirma
- [ ] Login → criar space → gravar 30s → ver transcrição + resumo + tarefa
- [ ] Upgrade Pro Stripe LIVE (use cartão real R$ 0,50 teste) → webhook atualiza plan
- [ ] Stripe Dashboard → Webhooks → confirmar evento processado em <2s

## 11. Monitoramento (primeiros 60 min)

- [ ] Sentry — sem novos erros
- [ ] Portainer logs — `voicestream_web` e `voicestream_worker` sem panics
- [ ] Traefik dashboard — rota `voicestream.com.br` healthy
- [ ] Postgres — connection count estável
- [ ] Dragonfly — sem erros de timeout

## 12. Rollback (se necessário)

```bash
# rollback do serviço web (Swarm guarda revisão anterior)
docker service rollback voicestream_web

# rollback do worker
docker service rollback voicestream_worker

# DB migrations são forward-only — se schema novo quebrar:
# rodar `prisma migrate resolve --rolled-back <name>` manualmente
```

## 13. Pós-go-live (em 7 dias)

- [ ] Implementar cron job de purga LGPD (delete users com `deletedAt < now() - 30 days`)
- [ ] Revisar métricas de uso e ajustar quotas se necessário
- [ ] Configurar alertas Sentry para erros de produção
