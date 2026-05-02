import { db } from "@/lib/db";
import { BILLING_PLANS, BILLING_PLAN_ORDER, type Plan } from "@/lib/billing/plans";
import { ACTIVE_SUB_STATUSES, planFromPriceId } from "@/lib/billing/plans";

/**
 * Retorna limites e uso atual do mês para um usuário.
 * Usa a tabela Usage: type="minutes_transcribed" para minutos consumidos,
 * type="addon-200" para bônus de add-on comprado.
 */
export async function getUserLimits(userId: string) {
  const sub = await db.subscription.findFirst({
    where: { userId, status: { in: [...ACTIVE_SUB_STATUSES] }, currentPeriodEnd: { gte: new Date() } },
    orderBy: { currentPeriodEnd: "desc" },
  });

  const planId: Plan = sub ? planFromPriceId(sub.stripePriceId) : "free";
  const plan = BILLING_PLANS[planId];

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  // Minutos transcritos no mês corrente
  const usageAgg = await db.usage.aggregate({
    where: { userId, type: "minutes_transcribed", createdAt: { gte: monthStart } },
    _sum: { quantity: true },
  });

  // Add-ons comprados no mês corrente (cada linha de addon-200 tem quantity=200)
  const addonAgg = await db.usage.aggregate({
    where: { userId, type: "addon-200", createdAt: { gte: monthStart } },
    _sum: { quantity: true },
  });

  const minutesUsed = usageAgg._sum.quantity ?? 0;
  const minutesBonus = addonAgg._sum.quantity ?? 0;

  return {
    plan,
    minutesUsed,
    minutesIncluded: plan.minutesPerMonth,
    minutesBonus,
    minutesRemaining: Math.max(0, plan.minutesPerMonth + minutesBonus - minutesUsed),
  };
}

/** Expõe a ordem canônica de planos para uso em UI */
export { BILLING_PLAN_ORDER as PLAN_ORDER };
