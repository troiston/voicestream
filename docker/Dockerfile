# syntax=docker/dockerfile:1.7

# Stage 1 — dependências
FROM node:22.13-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Stage 2 — build
FROM node:22.13-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Gera Prisma Client antes do build do Next
RUN npx prisma generate

# Dummy env vars para satisfazer Zod validation em src/lib/env.ts durante `next build`.
# Em runtime, o entrypoint sobrescreve com valores reais lidos de /run/secrets/*.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build \
    NEXT_PUBLIC_APP_URL=https://voicestream.com.br \
    BETTER_AUTH_SECRET=build_time_dummy_secret_min_16_chars \
    BETTER_AUTH_URL=https://voicestream.com.br \
    S3_ENDPOINT=http://localhost:8333 \
    S3_ACCESS_KEY=build \
    S3_SECRET_KEY=build \
    S3_BUCKET=build \
    DEEPGRAM_API_KEY=build \
    REDIS_URL=redis://localhost:6379 \
    ANTHROPIC_API_KEY=build \
    ENCRYPTION_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    STRIPE_SECRET_KEY=sk_build_dummy \
    STRIPE_WEBHOOK_SECRET=whsec_build_dummy \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_build_dummy

RUN npm run build

# Stage 3 — runtime
FROM node:22.13-alpine AS runner
RUN apk add --no-cache libc6-compat curl tini
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Saída standalone do Next + assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma

# Entrypoint que carrega secrets de /run/secrets/* como env vars
COPY --chown=nextjs:nodejs docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
