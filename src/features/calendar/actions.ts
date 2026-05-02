"use server";
import { db } from "@/lib/db";
import { requireSession } from "@/features/auth/guards";

export type CalendarItem = {
  id: string;
  type: "task" | "recording" | "event";
  title: string;
  startsAt: string;
  endsAt: string;
  spaceId: string | null;
  spaceName: string | null;
  href: string;
  meta: Record<string, unknown>;
};

export async function getCalendarItems(opts: {
  spaceId?: string | null;
  rangeStart: Date;
  rangeEnd: Date;
  types?: Array<"task" | "recording" | "event">;
}): Promise<CalendarItem[]> {
  const session = await requireSession();
  const types = opts.types ?? ["task", "recording", "event"];
  const items: CalendarItem[] = [];

  if (types.includes("task")) {
    const tasks = await db.task.findMany({
      where: {
        dueAt: { gte: opts.rangeStart, lte: opts.rangeEnd },
        ...(opts.spaceId
          ? { spaceId: opts.spaceId }
          : { space: { ownerId: session.userId } }),
        archivedAt: null,
      },
      include: { space: { select: { id: true, name: true } } },
    });
    for (const t of tasks) {
      items.push({
        id: `task:${t.id}`,
        type: "task",
        title: t.title,
        startsAt: t.dueAt!.toISOString(),
        endsAt: t.dueAt!.toISOString(),
        spaceId: t.spaceId,
        spaceName: t.space.name,
        href: `/tasks#${t.id}`,
        meta: { priority: t.priority, status: t.status },
      });
    }
  }

  if (types.includes("recording")) {
    const recordings = await db.recording.findMany({
      where: {
        userId: session.userId,
        capturedAt: { gte: opts.rangeStart, lte: opts.rangeEnd },
        ...(opts.spaceId ? { spaceId: opts.spaceId } : {}),
      },
      include: { space: { select: { id: true, name: true } } },
    });
    for (const r of recordings) {
      items.push({
        id: `recording:${r.id}`,
        type: "recording",
        title: r.title ?? `Gravação ${r.capturedAt.toLocaleString("pt-BR")}`,
        startsAt: r.capturedAt.toISOString(),
        endsAt: new Date(
          r.capturedAt.getTime() + (r.durationSec ?? 0) * 1000,
        ).toISOString(),
        spaceId: r.spaceId,
        spaceName: r.space?.name ?? null,
        href: `/recordings/${r.id}`,
        meta: { status: r.status },
      });
    }
  }

  if (types.includes("event")) {
    const events = await db.calendarEvent.findMany({
      where: {
        userId: session.userId,
        startsAt: { gte: opts.rangeStart, lte: opts.rangeEnd },
        ...(opts.spaceId ? { spaceId: opts.spaceId } : {}),
      },
      include: { space: { select: { id: true, name: true } } },
    });
    for (const e of events) {
      items.push({
        id: `event:${e.id}`,
        type: "event",
        title: e.title,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        spaceId: e.spaceId,
        spaceName: e.space?.name ?? null,
        href: e.htmlLink ?? "#",
        meta: { source: e.source, externalId: e.externalId },
      });
    }
  }

  return items.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
