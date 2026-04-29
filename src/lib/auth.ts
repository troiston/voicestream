import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  appName: env.NEXT_PUBLIC_APP_NAME,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // TODO Fase 1.C: enviar via Resend
      console.warn("[auth] reset-password email pendente (Fase 1.C):", user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // TODO Fase 1.C: enviar via Resend
      console.warn("[auth] verify-email pendente (Fase 1.C):", user.email, url);
    },
  },

  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  // nextCookies() deve ser o ÚLTIMO plugin para interceptar todas as respostas
  // e propagar Set-Cookie via cookies() do Next.js (necessário em server actions).
  plugins: [twoFactor(), nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
