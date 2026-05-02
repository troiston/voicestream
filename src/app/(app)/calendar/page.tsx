import type { Metadata } from "next";

import { requireSession } from "@/features/auth/guards";
import { getAccessibleSpaceIds } from "@/features/spaces/access";
import { CalendarView } from "@/components/calendar/calendar-view";
import {
  buildCalendarEntries,
  type CalendarGoogleEventSource,
} from "@/components/calendar/calendar-utils";
import { decryptTranscriptText } from "@/lib/crypto/envelope";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Calendário",
  description: "Calendário interno do VoiceStream com tarefas, gravações e eventos Google em leitura.",
  robots: { index: false, follow: false },
};

type GoogleCalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

async function fetchGoogleEvents(accessToken: string | null): Promise<CalendarGoogleEventSource[]> {
  if (!accessToken) return [];

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59).toISOString();

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${new URLSearchParams({
        singleEvents: "true",
        orderBy: "startTime",
        timeMin,
        timeMax,
        maxResults: "80",
      }).toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) return [];

    const payload = (await response.json()) as { items?: GoogleCalendarEvent[] };
    return (payload.items ?? [])
      .map((event) => {
        const startAt = event.start?.dateTime ?? event.start?.date;
        if (!event.id || !startAt) return null;
        return {
          id: event.id,
          title: event.summary || "Evento sem título",
          description: event.description || "",
          startAt,
          endAt: event.end?.dateTime ?? event.end?.date ?? null,
          spaceId: "__google_calendar__",
          spaceName: "Google Calendar",
          kind: "google_event" as const,
        };
      })
      .filter((event): event is CalendarGoogleEventSource => Boolean(event));
  } catch {
    return [];
  }
}

export default async function CalendarPage() {
  const session = await requireSession();
  const accessibleSpaceIds = await getAccessibleSpaceIds(session.userId);

  const [spaces, tasks, recordings, googleIntegration] = await Promise.all([
    db.space.findMany({
      where: { id: { in: accessibleSpaceIds }, isArchived: false },
      select: { id: true, name: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.task.findMany({
      where: {
        spaceId: { in: accessibleSpaceIds },
        archivedAt: null,
        dueAt: { not: null },
      },
      include: { space: { select: { name: true } } },
      orderBy: { dueAt: "asc" },
      take: 200,
    }),
    db.recording.findMany({
      where: { spaceId: { in: accessibleSpaceIds } },
      include: { space: { select: { name: true } } },
      orderBy: { capturedAt: "desc" },
      take: 120,
    }),
    db.integration.findUnique({
      where: {
        userId_provider: {
          userId: session.userId,
          provider: "google_calendar",
        },
      },
      select: { status: true, accessToken: true, connectedAt: true },
    }),
  ]);

  const accessToken =
    googleIntegration?.status === "connected" && googleIntegration.accessToken
      ? decryptTranscriptText(googleIntegration.accessToken, session.userId)
      : null;
  const googleEvents = await fetchGoogleEvents(accessToken);

  const entries = buildCalendarEntries(
    tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      dueAt: task.dueAt ? task.dueAt.toISOString().split("T")[0] : "",
      spaceId: task.spaceId,
      spaceName: task.space.name,
      status: task.status,
      priority: task.priority,
      kind: "task" as const,
    })),
    recordings.map((recording) => ({
      id: recording.id,
      title: recording.title || "Gravação sem título",
      capturedAt: recording.capturedAt.toISOString(),
      durationSec: recording.durationSec,
      spaceId: recording.spaceId,
      spaceName: recording.space.name,
      kind: "recording" as const,
    })),
    googleEvents,
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Organize prazos, reuniões e gravações do VoiceStream em uma visão global ou por espaço.
        </p>
      </header>
      <CalendarView
        entries={entries}
        spaces={spaces}
        googleStatus={
          (googleIntegration?.status as "connected" | "disconnected" | "error" | undefined) ??
          "disconnected"
        }
        googleConnectedAt={googleIntegration?.connectedAt?.toISOString() ?? null}
      />
    </div>
  );
}
