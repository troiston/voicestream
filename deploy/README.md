# VoiceStream — Production Deploy (Docker Swarm)

Production stack for `voicestream.com.br`. Runs on a self-hosted VPS with
Docker Swarm + Portainer + Traefik. Portainer is configured to read
`deploy/stack.yml` from this repo and auto-redeploy on push to `main`.

## External dependencies (already running on the VPS)

These are NOT defined in `stack.yml`. The `internal` overlay network resolves
them by service name:

| Service     | Address (inside `internal`)   |
|-------------|-------------------------------|
| Postgres    | `postgres:5432`               |
| SeaweedFS   | `seaweedfs:8333` (S3 API)     |
| Dragonfly   | `dragonfly:6379` (Redis API)  |
| Traefik     | attached to `traefik-public`  |

Make sure each of those stacks attaches itself to the `internal` overlay
network (after this stack creates it for the first time) so the web/worker
services can reach them.

## 1. Bootstrap secrets (run once on a Swarm manager)

All 14 secrets are `external: true` — they must exist before the stack is
deployed. Names are lowercase; the container entrypoint uppercases them
into env vars (`database_url` -> `DATABASE_URL`).

```bash
printf '%s' 'postgresql://voicestream:...@postgres:5432/voicestream'  | docker secret create database_url -
printf '%s' '<openssl rand -base64 48>'                                | docker secret create better_auth_secret -
printf '%s' '<google oauth client id>'                                 | docker secret create google_client_id -
printf '%s' '<google oauth client secret>'                             | docker secret create google_client_secret -
printf '%s' 're_xxx'                                                   | docker secret create resend_api_key -
printf '%s' '<seaweedfs access key>'                                   | docker secret create s3_access_key -
printf '%s' '<seaweedfs secret key>'                                   | docker secret create s3_secret_key -
printf '%s' '<deepgram api key>'                                       | docker secret create deepgram_api_key -
printf '%s' 'sk-ant-xxx'                                               | docker secret create anthropic_api_key -
printf '%s' 'redis://dragonfly:6379'                                   | docker secret create redis_url -
printf '%s' 'sk_live_xxx'                                              | docker secret create stripe_secret_key -
printf '%s' 'whsec_xxx'                                                | docker secret create stripe_webhook_secret -
printf '%s' '<openssl rand -hex 32>'                                   | docker secret create encryption_key -
printf '%s' 'https://xxx@sentry.io/yyy'                                | docker secret create sentry_dsn -
```

To rotate a secret, create a new versioned name (e.g. `database_url_v2`),
update `stack.yml` to reference it, and redeploy. Docker does not allow
overwriting an existing secret in place.

## 2. Deploy the stack

```bash
docker stack deploy -c deploy/stack.yml voicestream
```

Verify services:

```bash
docker stack services voicestream
docker service logs -f voicestream_web
```

Portainer's Git integration handles subsequent deploys automatically on
push to `main`.

## 3. Database migrations

Run Prisma migrations as a one-off task on the same overlay network so it
can reach Postgres. The `database_url` value here can be sourced from the
secret file on a manager node, or passed inline:

```bash
docker run --rm \
  --network voicestream_internal \
  -e DATABASE_URL="$(docker secret inspect --format '{{.Spec.Name}}' database_url >/dev/null && cat /var/lib/docker/secrets/database_url 2>/dev/null || echo 'paste-here')" \
  ghcr.io/troiston/voicestream-web:latest \
  npx prisma migrate deploy
```

In practice, run migrations from a manager via a temporary service that
mounts the secret:

```bash
docker service create --name vs-migrate \
  --network voicestream_internal \
  --secret database_url \
  --restart-condition none \
  --entrypoint /app/docker/entrypoint.sh \
  ghcr.io/troiston/voicestream-web:latest \
  npx prisma migrate deploy

docker service logs -f vs-migrate
docker service rm vs-migrate
```

## 4. Rolling updates

The stack is configured for zero-downtime rolling updates: `parallelism: 1`,
`delay: 30s`, `order: start-first`, `failure_action: rollback`.

Force a redeploy of the web service to pull a new `:latest` image:

```bash
docker service update --image ghcr.io/troiston/voicestream-web:latest \
  --force voicestream_web
```

Same for the worker:

```bash
docker service update --image ghcr.io/troiston/voicestream-worker:latest \
  --force voicestream_worker
```

Manual rollback if a deploy goes bad:

```bash
docker service rollback voicestream_web
```

## 5. Healthcheck

The web service uses `wget --spider http://localhost:3000/` as a placeholder
healthcheck. **TODO**: implement a dedicated `/api/health` endpoint that
returns `200` only when the DB and Redis are reachable, then update the
`healthcheck.test` line in `stack.yml` to hit it.

## 6. Notes

- All sensitive values flow via Docker Swarm secrets, never `environment:`.
- `docker/entrypoint.sh` reads `/run/secrets/*` and exports each as an
  uppercased env var before starting Node.
- The `internal` overlay is `attachable: true` so one-off `docker run`
  containers (migrations, debugging) can join it.
- Traefik must already be running and attached to the `traefik-public`
  network with a `letsencrypt` certresolver and `web`/`websecure`
  entrypoints configured.
