# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev               # Start Next.js dev server
npm run dev:e2e           # Dev server with deterministic auth for E2E tests
npm run build             # Production build
npm run typecheck         # TypeScript check (no emit)
npm run lint              # ESLint over src/

# Tests
npm run test              # Vitest (unit/component) — single run
npm run test:watch        # Vitest in watch mode
npm run test:e2e          # Playwright E2E (smoke + flows)

# Database
npx prisma migrate dev    # Apply migrations
npm run db:seed           # Seed demo users/subscriptions/usage (idempotent upserts)
npm run db:demo:wipe      # Delete only isDemo=true rows (blocked in production)

# Verification (run before closing a phase)
npm run verify            # verify-docs + verify-framework + verify-docs-integrity + verify-commands
npm run check:metadata    # Check frontmatter contract on docs
npm run manifest          # Regenerate docs/web-excellence/framework-manifest.json

# Bootstrap (first time)
bash scripts/bootstrap.sh
```

To run a single Vitest test file: `npx vitest run src/path/to/file.test.ts`

## Architecture

**Next.js 16 App Router** with three route groups:

- `(marketing)` — public pages (landing, blog, pricing, legal)
- `(auth)` — login, register, MFA, email verification, password reset
- `(app)` — authenticated product (dashboard, spaces, tasks, settings, billing, usage)

### Layers

| Layer | Location | Rule |
|---|---|---|
| Route handlers / pages | `src/app/` | Thin — validate with Zod, delegate to services |
| Domain components | `src/components/{app,auth,marketing,settings,…}/` | No direct Prisma access |
| UI primitives | `src/components/ui/` | shadcn/ui components |
| Server actions / services | `src/features/*/actions.ts`, `src/lib/*.ts` | Business logic lives here |
| DB client | `src/lib/db.ts` | Single Prisma instance |
| Env validation | `src/lib/env.ts` | Zod-validated at startup — never read `process.env` directly |

**Server Components by default.** Add `"use client"` only when required (event handlers, browser APIs).

### Auth

Session is a **mock cookie-based system** (`cv_session`) encoded as base64url JSON — not a production auth library. Located in `src/features/auth/session.ts`. Guards live in `src/features/auth/guards.ts`. The `E2E_DETERMINISTIC_AUTH=1` env var enables Playwright testing with a fixed session.

### Database (Prisma + PostgreSQL)

Schema: `User → Account, Session, Subscription, Usage`. Generated client outputs to `src/generated/prisma/`. The `User.isDemo` flag marks seed data — `db:demo:wipe` cascades deletes on it.

### Payments (Stripe)

Stripe logic in `src/lib/stripe.service.ts`. Webhook handler at `src/app/api/webhooks/stripe/route.ts` — HMAC-SHA256 signature verification is mandatory. Middleware excludes `/api/webhooks` from CSP enforcement.

### Content

Blog posts and changelog live in `content/` as MDX files, rendered via `next-mdx-remote`. Metadata utilities in `src/lib/content.ts` and `src/lib/blog-mdx.tsx`.

### Mock data

`src/lib/mocks/` contains static fixtures used while real API integrations are pending. Pages that consume mocks should be replaced with real data calls as features are implemented.

## Key Constraints

- Components never import Prisma directly — use services in `src/lib/` or server actions in `src/features/`.
- All external input validated with Zod (route handlers, server actions, env).
- Stripe webhooks must verify the `stripe-signature` header before processing any event.
- `db:demo:wipe` is blocked in `NODE_ENV=production`; never commit real rows tagged `isDemo=true`.
- Run `npm run verify` (exit 0) before closing any development phase.
