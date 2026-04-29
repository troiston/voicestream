import { db } from "@/lib/db";
import { getAccessibleSpaceIds } from "@/features/spaces/access";

export interface UsagePoint {
  day: string;
  minutes: number;
}

export interface TopIntent {
  intent: string;
  count: number;
}

export interface TopSpace {
  space: string;
  minutes: number;
}

export async function getUsageLast7d(userId: string): Promise<UsagePoint[]> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    return Array(7)
      .fill(0)
      .map((_, i) => ({ day: getDateLabel(i), minutes: 0 }));
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recordings = await db.recording.findMany({
    where: {
      spaceId: { in: accessibleSpaceIds },
      capturedAt: { gte: sevenDaysAgo },
      status: { in: ["summarized", "transcribed"] },
    },
    select: { capturedAt: true, durationSec: true },
  });

  const dayMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const day = date.toISOString().split("T")[0];
    dayMap.set(day, 0);
  }

  recordings.forEach((r) => {
    const day = r.capturedAt.toISOString().split("T")[0];
    if (dayMap.has(day)) {
      dayMap.set(day, (dayMap.get(day) || 0) + Math.round(r.durationSec / 60));
    }
  });

  const result: UsagePoint[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const day = date.toISOString().split("T")[0];
    const label = getDateLabel(i);
    result.push({
      day: label,
      minutes: dayMap.get(day) || 0,
    });
  }

  return result;
}

export async function getUsageLast30dByWeek(userId: string): Promise<UsagePoint[]> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    return [
      { day: "Sem 1", minutes: 0 },
      { day: "Sem 2", minutes: 0 },
      { day: "Sem 3", minutes: 0 },
      { day: "Sem 4", minutes: 0 },
    ];
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recordings = await db.recording.findMany({
    where: {
      spaceId: { in: accessibleSpaceIds },
      capturedAt: { gte: thirtyDaysAgo },
      status: { in: ["summarized", "transcribed"] },
    },
    select: { capturedAt: true, durationSec: true },
  });

  // Agrupa por semana (começando de 30 dias atrás)
  const weeks: UsagePoint[] = [];
  for (let week = 0; week < 4; week++) {
    let minutesSum = 0;
    const weekStart = new Date(thirtyDaysAgo.getTime() + week * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    recordings.forEach((r) => {
      if (r.capturedAt >= weekStart && r.capturedAt < weekEnd) {
        minutesSum += Math.round(r.durationSec / 60);
      }
    });

    weeks.push({
      day: `Sem ${week + 1}`,
      minutes: minutesSum,
    });
  }

  return weeks;
}

export async function getTopIntents(_userId: string): Promise<TopIntent[]> {
  // TODO: implementar NLP real quando disponível
  // Por enquanto, retorna tasks agrupadas por priority (top 5)
  // Placeholder vazio — será implementado quando NLP chegar
  return [];
}

export async function getTopSpaces(userId: string): Promise<TopSpace[]> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    return [];
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recordings = await db.recording.findMany({
    where: {
      spaceId: { in: accessibleSpaceIds },
      capturedAt: { gte: thirtyDaysAgo },
      status: { in: ["summarized", "transcribed"] },
    },
    select: { spaceId: true, durationSec: true },
  });

  const spaceMap = new Map<string, number>();
  recordings.forEach((r) => {
    spaceMap.set(r.spaceId, (spaceMap.get(r.spaceId) || 0) + Math.round(r.durationSec / 60));
  });

  // Obtém os nomes dos espaços
  const spaceIds = Array.from(spaceMap.keys());
  const spaces = await db.space.findMany({
    where: { id: { in: spaceIds } },
    select: { id: true, name: true },
  });

  const spaceNameMap = new Map(spaces.map((s) => [s.id, s.name]));

  // Ordena por minutos (desc) e pega top 5
  const result = Array.from(spaceMap.entries())
    .map(([spaceId, minutes]) => ({
      space: spaceNameMap.get(spaceId) || spaceId,
      minutes,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  return result;
}

export async function getSubscriptionLimitAndUsage(userId: string): Promise<{
  limitMinutes: number;
  usedMinutesThisMonth: number;
  percentageUsed: number;
}> {
  // Obtém a subscription do usuário
  const subscription = await db.subscription.findFirst({
    where: { userId },
  });

  // Mapeia stripePriceId para limites
  const limitMap: Record<string, number> = {
    // Valores padrão — ajustar conforme Stripe setup
    free: 200,
    pro: 2000,
    enterprise: 10000,
  };

  // Detecta o plano pela priceId (simplificado)
  let limitMinutes = 200; // default Free
  if (subscription) {
    if (subscription.stripePriceId.includes("pro")) limitMinutes = 2000;
    if (subscription.stripePriceId.includes("enterprise")) limitMinutes = 10000;
  }

  // Calcula uso neste mês (desde dia 1 do mês corrente)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);
  let usedMinutes = 0;

  if (accessibleSpaceIds.length > 0) {
    const usage = await db.recording.aggregate({
      where: {
        spaceId: { in: accessibleSpaceIds },
        capturedAt: { gte: monthStart },
        status: { in: ["summarized", "transcribed"] },
      },
      _sum: { durationSec: true },
    });

    usedMinutes = Math.round((usage._sum.durationSec || 0) / 60);
  }

  return {
    limitMinutes,
    usedMinutesThisMonth: usedMinutes,
    percentageUsed: Math.round((usedMinutes / limitMinutes) * 100),
  };
}

function getDateLabel(daysAgo: number): string {
  const now = new Date();
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const day = date.getDay();
  const days = ["D", "S", "T", "Q", "Q", "S", "S"];
  return days[day];
}
