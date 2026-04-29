import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("CloudVoice"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  BETTER_AUTH_SECRET: z.string().min(16).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
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
