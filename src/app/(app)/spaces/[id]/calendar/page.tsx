import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { getCalendarItems } from "@/features/calendar/actions";
import { CalendarView } from "@/components/calendar/calendar-view";
import { buildCalendarEntries } from "@/components/calendar/calendar-utils";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Calendário do Espaço",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function SpaceCalendarPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const space = await db.space.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.userId },
        { members: { some: { userId: session.userId, status: "active" } } },
      ],
    },
    select: { id: true, name: true },
  });

  if (!space) notFound();

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

  const calItems = await getCalendarItems({
    spaceId: id,
    rangeStart,
    rangeEnd,
  });

  // Map CalendarItems to calendar-utils shape
  const taskItems = calItems
    .filter((i) => i.type === "task")
    .map((i) => ({
      id: i.id.replace("task:", ""),
      title: i.title,
      description: "",
      dueAt: i.startsAt.split("T")[0],
      spaceId: i.spaceId ?? id,
      spaceName: i.spaceName ?? space.name,
      status: ((i.meta.status as TaskStatus) ?? "todo") as TaskStatus,
      priority: ((i.meta.priority as TaskPriority) ?? "medium") as TaskPriority,
      kind: "task" as const,
    }));

  const recordingItems = calItems
    .filter((i) => i.type === "recording")
    .map((i) => ({
      id: i.id.replace("recording:", ""),
      title: i.title,
      capturedAt: i.startsAt,
      durationSec:
        (new Date(i.endsAt).getTime() - new Date(i.startsAt).getTime()) / 1000,
      spaceId: i.spaceId ?? id,
      spaceName: i.spaceName ?? space.name,
      kind: "recording" as const,
    }));

  const googleItems = calItems
    .filter((i) => i.type === "event")
    .map((i) => ({
      id: i.id.replace("event:", ""),
      title: i.title,
      description: "",
      startAt: i.startsAt,
      endAt: i.endsAt,
      spaceId: i.spaceId ?? "__google_calendar__",
      spaceName: i.spaceName ?? "Google Calendar",
      kind: "google_event" as const,
    }));

  const entries = buildCalendarEntries(taskItems, recordingItems, googleItems);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Calendário — {space.name}
        </h1>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Visualize tarefas, gravações e eventos deste espaço.
        </p>
      </header>
      <CalendarView
        entries={entries}
        spaces={[{ id: space.id, name: space.name }]}
        googleStatus="disconnected"
        googleConnectedAt={null}
      />
    </div>
  );
}
