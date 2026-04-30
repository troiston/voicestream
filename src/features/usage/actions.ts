import { db } from "@/lib/db";
import { getAccessibleSpaceIds } from "@/features/spaces/access";
import { getCurrentPlan } from "@/lib/billing/get-current-plan";
import { PLAN_LIMITS } from "@/lib/billing/plans";
import { getMonthlyMinutesUsed } from "@/lib/billing/get-monthly-usage";

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
  // NLP placeholder — pós-MVP, ver issue #TODO
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
  const { plan } = await getCurrentPlan(userId);
  const limitMinutes = PLAN_LIMITS[plan].minutesPerMonth;
  const usedMinutes = await getMonthlyMinutesUsed(userId);

  return {
    limitMinutes,
    usedMinutesThisMonth: usedMinutes,
    percentageUsed: limitMinutes > 0 ? Math.round((usedMinutes / limitMinutes) * 100) : 0,
  };
}

function getDateLabel(daysAgo: number): string {
  const now = new Date();
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const day = date.getDay();
  const days = ["D", "S", "T", "Q", "Q", "S", "S"];
  return days[day];
}
