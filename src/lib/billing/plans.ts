import { env } from "../env";

export type Plan = "free" | "pro" | "enterprise";
/** Alias for consumers using PlanId naming convention */
export type PlanId = Plan;
export type PlanSpaces = number | "unlimited";

export type BillingPlan = {
  key: Plan;
  label: string;
  priceCents: number;
  /** Preço em BRL (R$), inteiro */
  priceBRL: number;
  /** Preço formatado para exibição (ex: "R$ 59 / mês") */
  priceFormatted: string;
  minutesPerMonth: number;
  spaces: PlanSpaces;
  description: string;
  features: string[];
  /** Nome da env var do Stripe Price ID, ou null para free */
  stripePriceEnv: "STRIPE_PRICE_PRO" | "STRIPE_PRICE_ENTERPRISE" | null;
};

export type BillingAddOn = {
  key: "extraMinutes200";
  /** Alias id para compatibilidade com ADDON_MINUTES */
  id: "minutes-200";
  label: string;
  /** Nome exibível */
  name: string;
  priceCents: number;
  priceBRL: number;
  priceFormatted: string;
  minutes: number;
  description: string;
  stripePriceEnv: "STRIPE_PRICE_ADDON_200";
};

export const BILLING_PLAN_ORDER: Plan[] = ["free", "pro", "enterprise"];
/** Alias para compatibilidade */
export const PLAN_ORDER: Plan[] = BILLING_PLAN_ORDER;

export const BILLING_PLANS: Record<Plan, BillingPlan> = {
  free: {
    key: "free",
    label: "Free",
    priceCents: 0,
    priceBRL: 0,
    priceFormatted: "Grátis",
    minutesPerMonth: 60,
    spaces: 1,
    description: "Para começar com um único espaço e uma cota curta de uso mensal.",
    features: ["60 minutos por mês", "1 espaço", "Transcrição automática", "Resumo simples"],
    stripePriceEnv: null,
  },
  pro: {
    key: "pro",
    label: "Pro",
    priceCents: 5900,
    priceBRL: 59,
    priceFormatted: "R$ 59 / mês",
    minutesPerMonth: 500,
    spaces: "unlimited",
    description: "Para profissionais que precisam de mais volume e espaço para crescer.",
    features: ["500 minutos por mês", "Espaços ilimitados", "Tarefas sugeridas com 5W2H", "Calendário interno", "Suporte por e-mail"],
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
  enterprise: {
    key: "enterprise",
    label: "Empresa",
    priceCents: 24900,
    priceBRL: 249,
    priceFormatted: "R$ 249 / mês",
    minutesPerMonth: 2000,
    spaces: "unlimited",
    description: "Para equipas que precisam de escala, governança e suporte comercial.",
    features: ["2.000 minutos por mês", "Espaços ilimitados", "Time com convites", "Sincronização com Google Calendar", "Suporte prioritário"],
    stripePriceEnv: "STRIPE_PRICE_ENTERPRISE",
  },
};

/** Alias para consumers usando convenção PLANS */
export const PLANS = BILLING_PLANS;

export const BILLING_ADD_ONS: Record<"extraMinutes200", BillingAddOn> = {
  extraMinutes200: {
    key: "extraMinutes200",
    id: "minutes-200",
    label: "+200 min",
    name: "+200 minutos",
    priceCents: 2900,
    priceBRL: 29,
    priceFormatted: "R$ 29",
    minutes: 200,
    description: "Pacote adicional de minutos para ampliar a cota mensal.",
    stripePriceEnv: "STRIPE_PRICE_ADDON_200",
  },
};

/** Alias para consumers usando convenção ADDON_MINUTES */
export const ADDON_MINUTES = BILLING_ADD_ONS.extraMinutes200;

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
