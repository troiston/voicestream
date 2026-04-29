import { db } from "@/lib/db";
import { ACTIVE_SUB_STATUSES, planFromPriceId, type Plan } from "./plans";

async function getActiveSub(userId: string) {
  return db.subscription.findFirst({
    where: { userId, status: { in: [...ACTIVE_SUB_STATUSES] }, currentPeriodEnd: { gte: new Date() } },
    orderBy: { currentPeriodEnd: "desc" },
  });
}

/** Plano efetivo do usuário no momento. "free" se não houver subscription ativa. */
export async function getCurrentPlan(
  userId: string
): Promise<{ plan: Plan; subscription: Awaited<ReturnType<typeof getActiveSub>> | null }> {
  const subscription = await getActiveSub(userId);
  if (!subscription) return { plan: "free", subscription: null };
  return { plan: planFromPriceId(subscription.stripePriceId), subscription };
}
