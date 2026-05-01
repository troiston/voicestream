import { db } from "@/lib/db";
import { getAccessibleSpaceIds } from "@/features/spaces/access";

export interface DashboardKPIs {
  minutes7d: number;
  minutes7dPrevious: number;
  sessions7d: number;
  tasksTotal: number;
  tasksPending: number;
  integrationsActive: number;
}

export interface DashboardMinutes7d {
  values: number[];
  labels: string[];
}

export interface RecentSpace {
  id: string;
  name: string;
  color: string;
  lastActivity: Date;
  memberCount: number;
}

export async function getDashboardKPIs(userId: string): Promise<DashboardKPIs> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    return {
      minutes7d: 0,
      minutes7dPrevious: 0,
      sessions7d: 0,
      tasksTotal: 0,
      tasksPending: 0,
      integrationsActive: 0,
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Minutos transcritos (últimos 7 dias)
  const current7d = await db.recording.aggregate({
    where: {
      spaceId: { in: accessibleSpaceIds },
      capturedAt: { gte: sevenDaysAgo },
      status: { in: ["summarized", "transcribed"] },
    },
    _sum: { durationSec: true },
  });

  const minutes7d = Math.round((current7d._sum.durationSec || 0) / 60);

  // Minutos transcritos (14-7 dias atrás para comparação)
  const previous7d = await db.recording.aggregate({
    where: {
      spaceId: { in: accessibleSpaceIds },
      capturedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      status: { in: ["summarized", "transcribed"] },
    },
    _sum: { durationSec: true },
  });

  const minutes7dPrevious = Math.round((previous7d._sum.durationSec || 0) / 60);

  // Sessões STT (count de recordings com status transcribed/summarized)
  const sessions7d = await db.recording.count({
    where: {
      spaceId: { in: accessibleSpaceIds },
      capturedAt: { gte: sevenDaysAgo },
      status: { in: ["transcribed", "summarized"] },
    },
  });

  // Tarefas extraídas (total de tasks com recordingId NOT NULL)
  const tasksTotal = await db.task.count({
    where: {
      spaceId: { in: accessibleSpaceIds },
      recordingId: { not: null },
    },
  });

  // Tarefas pendentes revisão
  const tasksPending = await db.task.count({
    where: {
      spaceId: { in: accessibleSpaceIds },
      recordingId: { not: null },
      status: "pendente",
    },
  });

  // Integrações ativas — por enquanto 0 (mock mantido)
  const integrationsActive = 0;

  return {
    minutes7d,
    minutes7dPrevious,
    sessions7d,
    tasksTotal,
    tasksPending,
    integrationsActive,
  };
}

export async function getDashboardMinutes7d(userId: string): Promise<DashboardMinutes7d> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    return {
      values: [0, 0, 0, 0, 0, 0, 0],
      labels: ["S", "T", "Q", "Q", "S", "S", "D"],
    };
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

  // Agrupa por dia (UTC)
  const dayMap = new Map<string, number>();
  const labels = ["S", "T", "Q", "Q", "S", "S", "D"];

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

  const values: number[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const day = date.toISOString().split("T")[0];
    values.push(dayMap.get(day) || 0);
  }

  return { values, labels };
}

export async function getRecentSpaces(userId: string): Promise<RecentSpace[]> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    return [];
  }

  const spaces = await db.space.findMany({
    where: { id: { in: accessibleSpaceIds } },
    select: {
      id: true,
      name: true,
      color: true,
      updatedAt: true,
      members: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  return spaces.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color || "#9333ea",
    lastActivity: s.updatedAt,
    memberCount: s.members.length + 1, // +1 para o owner
  }));
}
