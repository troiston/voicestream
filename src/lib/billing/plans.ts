import { env } from "@/lib/env";

export type Plan = "free" | "pro" | "enterprise";

export const PLAN_LIMITS: Record<Plan, { minutesPerMonth: number; spaces: number | "unlimited"; label: string }> = {
  free: { minutesPerMonth: 200, spaces: 1, label: "Gratuito" },
  pro: { minutesPerMonth: 2000, spaces: "unlimited", label: "Pro" },
  enterprise: { minutesPerMonth: 10000, spaces: "unlimited", label: "Empresa" },
};

/** Mapeia priceId Stripe → plano. Retorna "free" se priceId não casar com nenhum env. */
export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (env.STRIPE_PRICE_PRO && priceId === env.STRIPE_PRICE_PRO) return "pro";
  if (env.STRIPE_PRICE_ENTERPRISE && priceId === env.STRIPE_PRICE_ENTERPRISE) return "enterprise";
  return "free";
}

/** Considera ativa: status `active` ou `trialing` e currentPeriodEnd >= now */
export const ACTIVE_SUB_STATUSES = ["active", "trialing"] as const;
