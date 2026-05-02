import { env } from "../env";

export type Plan = "free" | "pro" | "enterprise";
export type PlanSpaces = number | "unlimited";

export type BillingPlan = {
  key: Plan;
  label: string;
  priceCents: number;
  minutesPerMonth: number;
  spaces: PlanSpaces;
  description: string;
  features: string[];
};

export type BillingAddOn = {
  key: "extraMinutes200";
  label: string;
  priceCents: number;
  minutes: number;
  description: string;
};

export const BILLING_PLAN_ORDER: Plan[] = ["free", "pro", "enterprise"];

export const BILLING_PLANS: Record<Plan, BillingPlan> = {
  free: {
    key: "free",
    label: "Gratuito",
    priceCents: 0,
    minutesPerMonth: 60,
    spaces: 1,
    description: "Para começar com um único espaço e uma cota curta de uso mensal.",
    features: ["60 minutos/mês", "1 espaço", "Transcrição básica"],
  },
  pro: {
    key: "pro",
    label: "Pro",
    priceCents: 5900,
    minutesPerMonth: 500,
    spaces: "unlimited",
    description: "Para profissionais que precisam de mais volume e espaço para crescer.",
    features: ["500 minutos/mês", "Espaços ilimitados", "Transcrição avançada", "Exportação CSV"],
  },
  enterprise: {
    key: "enterprise",
    label: "Empresa",
    priceCents: 24900,
    minutesPerMonth: 2000,
    spaces: "unlimited",
    description: "Para equipas que precisam de escala, governança e suporte comercial.",
    features: ["2000 minutos/mês", "Espaços ilimitados", "Acesso à API", "SSO / SAML", "Suporte prioritário"],
  },
};

export const BILLING_ADD_ONS: Record<"extraMinutes200", BillingAddOn> = {
  extraMinutes200: {
    key: "extraMinutes200",
    label: "+200 min",
    priceCents: 2900,
    minutes: 200,
    description: "Pacote adicional de minutos para ampliar a cota mensal.",
  },
};

export const PLAN_LIMITS: Record<Plan, { minutesPerMonth: number; spaces: PlanSpaces; label: string }> = {
  free: {
    minutesPerMonth: BILLING_PLANS.free.minutesPerMonth,
    spaces: BILLING_PLANS.free.spaces,
    label: BILLING_PLANS.free.label,
  },
  pro: {
    minutesPerMonth: BILLING_PLANS.pro.minutesPerMonth,
    spaces: BILLING_PLANS.pro.spaces,
    label: BILLING_PLANS.pro.label,
  },
  enterprise: {
    minutesPerMonth: BILLING_PLANS.enterprise.minutesPerMonth,
    spaces: BILLING_PLANS.enterprise.spaces,
    label: BILLING_PLANS.enterprise.label,
  },
};

export function formatBRLFromCents(amountCents: number): string {
  const amount = amountCents / 100;
  return amount % 1 === 0 ? `R$ ${amount.toFixed(0)}` : `R$ ${amount.toFixed(2).replace(".", ",")}`;
}

/** Mapeia priceId Stripe → plano. Retorna "free" se priceId não casar com nenhum env. */
export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (env.STRIPE_PRICE_PRO && priceId === env.STRIPE_PRICE_PRO) return "pro";
  if (env.STRIPE_PRICE_ENTERPRISE && priceId === env.STRIPE_PRICE_ENTERPRISE) return "enterprise";
  return "free";
}

/** Considera ativa: status `active` ou `trialing` e currentPeriodEnd >= now */
export const ACTIVE_SUB_STATUSES = ["active", "trialing"] as const;
