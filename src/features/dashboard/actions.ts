import { db } from "@/lib/db";
import { getAccessibleSpaceIds } from "@/features/spaces/access";
import { formatActivityLabel, getActivityIcon, type ActivityCtx } from "@/lib/activity/format";

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export interface KpiValue {
  value: number;
  delta: number; // positive = grew, negative = shrunk
}

export interface DashboardKPIs {
  recordingsThisWeek: KpiValue;
  minutesRecorded: KpiValue;
  tasksCreated: KpiValue;
  integrationsActive: KpiValue;
}

export async function getDashboardKPIs(userId: string): Promise<DashboardKPIs> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    const integrationsActive = await db.integration.count({
      where: { userId, status: "connected" },
    });

    return {
      recordingsThisWeek: { value: 0, delta: 0 },
      minutesRecorded: { value: 0, delta: 0 },
      tasksCreated: { value: 0, delta: 0 },
      integrationsActive: { value: integrationsActive, delta: 0 },
    };
  }

  const [
    recCurrent,
    recPrevious,
    minCurrent,
    minPrevious,
    tasksCurrent,
    tasksPrevious,
    integrationsActive,
  ] = await Promise.all([
    db.recording.count({
      where: {
        spaceId: { in: accessibleSpaceIds },
        capturedAt: { gte: sevenDaysAgo },
      },
    }),
    db.recording.count({
      where: {
        spaceId: { in: accessibleSpaceIds },
        capturedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      },
    }),
    db.recording.aggregate({
      where: {
        spaceId: { in: accessibleSpaceIds },
        capturedAt: { gte: sevenDaysAgo },
      },
      _sum: { durationSec: true },
    }),
    db.recording.aggregate({
      where: {
        spaceId: { in: accessibleSpaceIds },
        capturedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      },
      _sum: { durationSec: true },
    }),
    db.task.count({
      where: {
        OR: [
          { spaceId: { in: accessibleSpaceIds }, createdAt: { gte: sevenDaysAgo } },
          { assigneeUserId: userId, createdAt: { gte: sevenDaysAgo } },
        ],
      },
    }),
    db.task.count({
      where: {
        OR: [
          {
            spaceId: { in: accessibleSpaceIds },
            createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
          },
          {
            assigneeUserId: userId,
            createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
          },
        ],
      },
    }),
    db.integration.count({ where: { userId, status: "connected" } }),
  ]);

  const minutesCurrent = Math.round((minCurrent._sum.durationSec ?? 0) / 60);
  const minutesPrevious = Math.round((minPrevious._sum.durationSec ?? 0) / 60);

  return {
    recordingsThisWeek: {
      value: recCurrent,
      delta: recCurrent - recPrevious,
    },
    minutesRecorded: {
      value: minutesCurrent,
      delta: minutesCurrent - minutesPrevious,
    },
    tasksCreated: {
      value: tasksCurrent,
      delta: tasksCurrent - tasksPrevious,
    },
    integrationsActive: {
      value: integrationsActive,
      delta: 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

export interface DashboardMinutes7d {
  values: number[];
  labels: string[];
}

export async function getDashboardMinutes7d(
  userId: string,
): Promise<DashboardMinutes7d> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);

  if (accessibleSpaceIds.length === 0) {
    return { values: [0, 0, 0, 0, 0, 0, 0], labels: ["S", "T", "Q", "Q", "S", "S", "D"] };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recordings = await db.recording.findMany({
    where: {
      spaceId: { in: accessibleSpaceIds },
      capturedAt: { gte: sevenDaysAgo },
    },
    select: { capturedAt: true, durationSec: true },
  });

  const dayMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    dayMap.set(date.toISOString().split("T")[0], 0);
  }

  recordings.forEach((r) => {
    const day = r.capturedAt.toISOString().split("T")[0];
    if (dayMap.has(day)) {
      dayMap.set(day, (dayMap.get(day) ?? 0) + Math.round(r.durationSec / 60));
    }
  });

  const values: number[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    values.push(dayMap.get(date.toISOString().split("T")[0]) ?? 0);
  }

  return { values, labels: ["S", "T", "Q", "Q", "S", "S", "D"] };
}

// ---------------------------------------------------------------------------
// Recent Activity
// ---------------------------------------------------------------------------

export interface ActivityItem {
  id: string;
  action: string;
  createdAt: string; // ISO
  entityType: string | null;
  entityId: string | null;
  label: string;
  icon: "mic" | "folder" | "check-square" | "plug" | "activity";
  href: string | null;
}

export async function getRecentActivity(
  userId: string,
  limit = 10,
): Promise<ActivityItem[]> {
  const logs = await db.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (logs.length === 0) return [];

  const recordingIds = logs
    .filter((l) => l.entityType === "Recording" && l.entityId)
    .map((l) => l.entityId as string);
  const spaceIds = logs
    .filter((l) => l.entityType === "Space" && l.entityId)
    .map((l) => l.entityId as string);
  const taskIds = logs
    .filter((l) => l.entityType === "Task" && l.entityId)
    .map((l) => l.entityId as string);
  const integrationIds = logs
    .filter((l) => l.entityType === "Integration" && l.entityId)
    .map((l) => l.entityId as string);

  const [recordings, spaces, tasks, integrations] = await Promise.all([
    recordingIds.length > 0
      ? db.recording.findMany({
          where: { id: { in: recordingIds } },
          select: { id: true, title: true, space: { select: { name: true } } },
        })
      : Promise.resolve([] as { id: string; title: string; space: { name: string } }[]),
    spaceIds.length > 0
      ? db.space.findMany({
          where: { id: { in: spaceIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([] as { id: string; name: string }[]),
    taskIds.length > 0
      ? db.task.findMany({
          where: { id: { in: taskIds } },
          select: { id: true, title: true },
        })
      : Promise.resolve([] as { id: string; title: string }[]),
    integrationIds.length > 0
      ? db.integration.findMany({
          where: { id: { in: integrationIds } },
          select: { id: true, provider: true },
        })
      : Promise.resolve([] as { id: string; provider: string }[]),
  ]);

  const recMap = new Map(recordings.map((r) => [r.id, r]));
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const intMap = new Map(integrations.map((i) => [i.id, i]));

  return logs.map((log) => {
    const ctx: ActivityCtx = {};
    let href: string | null = null;

    if (log.entityType === "Recording" && log.entityId) {
      const rec = recMap.get(log.entityId);
      ctx.recordingTitle = rec?.title ?? undefined;
      ctx.spaceName = rec?.space?.name ?? undefined;
      href = `/recordings/${log.entityId}`;
    } else if (log.entityType === "Space" && log.entityId) {
      const sp = spaceMap.get(log.entityId);
      ctx.spaceName = sp?.name ?? undefined;
      href = `/spaces/${log.entityId}`;
    } else if (log.entityType === "Task" && log.entityId) {
      const tk = taskMap.get(log.entityId);
      ctx.taskTitle = tk?.title ?? undefined;
    } else if (log.entityType === "Integration" && log.entityId) {
      const intg = intMap.get(log.entityId);
      ctx.provider = intg ? providerLabel(intg.provider) : undefined;
    }

    return {
      id: log.id,
      action: log.action,
      createdAt: log.createdAt.toISOString(),
      entityType: log.entityType,
      entityId: log.entityId,
      label: formatActivityLabel(log.action, ctx),
      icon: getActivityIcon(log.action),
      href,
    };
  });
}

function providerLabel(provider: string): string {
  const map: Record<string, string> = {
    google_calendar: "Google Agenda",
    slack: "Slack",
    notion: "Notion",
    linear: "Linear",
    jira: "Jira",
  };
  return map[provider] ?? provider;
}

// ---------------------------------------------------------------------------
// Recent Spaces (kept for RecentSpaces component)
// ---------------------------------------------------------------------------

export interface RecentSpace {
  id: string;
  name: string;
  color: string;
  lastActivity: Date;
  memberCount: number;
}

export async function getRecentSpaces(userId: string): Promise<RecentSpace[]> {
  const accessibleSpaceIds = await getAccessibleSpaceIds(userId);
  if (accessibleSpaceIds.length === 0) return [];

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
    memberCount: s.members.length + 1,
  }));
}
