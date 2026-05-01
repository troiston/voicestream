import { getMonthlyMinutesUsed } from "./get-monthly-usage";

// NOTE: Os imports abaixo serão criados pelo outro subagent.
// Em produção, o TypeScript resolverá os imports reais.
// Por enquanto, usamos tipos implícitos e imports dinâmicos se necessário.

// Importados do outro subagent (em src/lib/billing/get-current-plan.ts e src/lib/billing/plans.ts)
let getCurrentPlan: ((userId: string) => Promise<{ plan: "free" | "pro" | "enterprise" }>) | null = null;
let PLAN_LIMITS: Record<"free" | "pro" | "enterprise", { minutesPerMonth: number }> | null = null;

// Initialize imports at module load time
async function initializeImports() {
  try {
    const getCP = await import("./get-current-plan").then((m) => m.getCurrentPlan).catch(() => null);
    if (getCP) getCurrentPlan = getCP;
  } catch {
    // fallback to stub
  }

  try {
    const limits = await import("./plans").then((m) => m.PLAN_LIMITS).catch(() => null);
    if (limits) PLAN_LIMITS = limits;
  } catch {
    // fallback to stub
  }

  // Fallback defaults se os imports falharem
  if (!getCurrentPlan) {
    getCurrentPlan = async () => ({ plan: "free" });
  }
  if (!PLAN_LIMITS) {
    PLAN_LIMITS = {
      free: { minutesPerMonth: 200 },
      pro: { minutesPerMonth: 2000 },
      enterprise: { minutesPerMonth: 10000 },
    };
  }
}

// Initialize at module load
void initializeImports();

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
  if (!getCurrentPlan || !PLAN_LIMITS) {
    throw new Error("getCurrentPlan or PLAN_LIMITS not initialized");
  }
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
