import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("VoiceStream"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  STRIPE_PRICE_PRO: z.preprocess((v) => (v === "" ? undefined : v), z.string().startsWith("price_").optional()),
  STRIPE_PRICE_ENTERPRISE: z.preprocess((v) => (v === "" ? undefined : v), z.string().startsWith("price_").optional()),
  STRIPE_PRICE_ADDON_200: z.preprocess((v) => (v === "" ? undefined : v), z.string().startsWith("price_").optional()),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.preprocess(
    (v) => (typeof v === "string" && v === "" ? undefined : v),
    z.string().optional(),
  ),
  GOOGLE_CLIENT_SECRET: z.preprocess(
    (v) => (typeof v === "string" && v === "" ? undefined : v),
    z.string().optional(),
  ),
  GOOGLE_CALENDAR_CLIENT_ID: z.preprocess(
    (v) => (typeof v === "string" && v === "" ? undefined : v),
    z.string().optional(),
  ),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.preprocess(
    (v) => (typeof v === "string" && v === "" ? undefined : v),
    z.string().optional(),
  ),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  S3_ENDPOINT: z.string().url(),
  S3_PUBLIC_ENDPOINT: z.preprocess(
    (v) => (typeof v === "string" && v === "" ? undefined : v),
    z.string().url().optional(),
  ),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_FORCE_PATH_STYLE: z.string().default("true").transform((v) => v === "true"),
  DEEPGRAM_API_KEY: z.string().min(1),
  REDIS_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  ENCRYPTION_KEY: z
    .string()
    .min(1, "ENCRYPTION_KEY é obrigatório")
    .refine(
      (v) => {
        try {
          return Buffer.from(v, "base64").length === 32;
        } catch {
          return false;
        }
      },
      "ENCRYPTION_KEY deve ser base64 de 32 bytes"
    ),
  SENTRY_DSN: z.preprocess(
    (v) => (typeof v === "string" && (v === "" || !v.startsWith("http")) ? undefined : v),
    z.string().url().optional(),
  ),
  CRON_SECRET: z.preprocess(
    (v) => (typeof v === "string" && v === "" ? undefined : v),
    z.string().min(16).optional(),
  ),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const details = Object.entries(flattened)
      .map(([key, messages]) => `${key}: ${(messages ?? []).join(", ")}`)
      .join(" | ");
    console.error("Variáveis de ambiente inválidas:", flattened);
    throw new Error(
      `Falha ao iniciar: variáveis de ambiente inválidas. ${details || "Verifique seu .env."}`
    );
  }
  return parsed.data;
}

export const env = getEnv();
