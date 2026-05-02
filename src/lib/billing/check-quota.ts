import { getMonthlyMinutesUsed } from "./get-monthly-usage";
import { getCurrentPlan } from "./get-current-plan";
import { PLAN_LIMITS } from "./plans";

export type QuotaCheckResult = {
  allowed: boolean;
  plan: "free" | "pro" | "enterprise";
  usedMinutes: number;
  limitMinutes: number;
  remainingMinutes: number;
};

/**
 * Verifica se o user tem capacidade para gravar mais X minutos.
 */
export async function checkRecordingQuota(
  userId: string,
  additionalSeconds: number
): Promise<QuotaCheckResult> {
  const { plan } = await getCurrentPlan(userId);
  const limit = PLAN_LIMITS[plan].minutesPerMonth;
  const used = await getMonthlyMinutesUsed(userId);
  const additionalMinutes = Math.ceil(additionalSeconds / 60);
  const allowed = used + additionalMinutes <= limit;
  return {
    allowed,
    plan,
    usedMinutes: used,
    limitMinutes: limit,
    remainingMinutes: Math.max(0, limit - used),
  };
}
