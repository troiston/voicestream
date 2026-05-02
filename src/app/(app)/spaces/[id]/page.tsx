import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { SpaceDetailView } from "@/components/app/space-detail-view";
import type { SpaceItem, SpaceFeedItem, TaskListItem, TaskColumnItem } from "@/types/domain";
import { decryptTranscriptIfNeeded } from "@/lib/crypto/transcripts";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const space = await db.space.findUnique({ where: { id } });
  if (!space) {
    return { title: "Espaço" };
  }
  return {
    title: space.name,
    description: space.description || "",
    robots: { index: false, follow: false },
  };
}

export default async function SpaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireSession();

  // Check access: user is owner OR active member
  const [space, isMember] = await Promise.all([
    db.space.findUnique({ where: { id } }),
    db.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId: id, userId: session.userId } },
    }),
  ]);

  if (!space || (space.ownerId !== session.userId && (!isMember || isMember.status !== "active"))) {
    notFound();
  }

  // Fetch recordings, tasks, and columns in parallel
  const [recordings, tasks, columns] = await Promise.all([
    db.recording.findMany({
      where: { spaceId: id },
      include: {
        user: { select: { name: true } },
        transcription: { select: { text: true, encrypted: true } },
        summary: { select: { abstract: true } },
      },
      orderBy: { capturedAt: "desc" },
      take: 20,
    }),
    db.task.findMany({
      where: { spaceId: id },
      include: {
        space: { select: { name: true } },
        recording: { select: { title: true, capturedAt: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    db.taskColumn.findMany({
      where: { spaceId: id },
      orderBy: { order: "asc" },
    }),
  ]);

  const feed: SpaceFeedItem[] = recordings.map((r) => {
    const decrypted = decryptTranscriptIfNeeded(r.transcription, r.userId);
    return {
      id: r.id,
      spaceId: r.spaceId,
      author: r.user.name || "Anónimo",
      body:
        r.summary?.abstract ||
        decrypted?.text?.substring(0, 200) ||
        `Gravação: ${r.title || "Sem título"}`,
      at: r.capturedAt.toISOString(),
      kind: "voice" as const,
    };
  });

  const initialTasks: TaskListItem[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueAt: task.dueAt ? task.dueAt.toISOString().split("T")[0] : null,
    spaceId: task.spaceId,
    spaceName: task.space.name,
    recordingId: task.recordingId,
    recordingTitle: task.recording?.title ?? null,
    recordingCapturedAt: task.recording?.capturedAt
      ? task.recording.capturedAt.toISOString().split("T")[0]
      : null,
    columnId: task.columnId,
    order: task.order,
  }));

  const initialColumns: TaskColumnItem[] = columns.map((c) => ({
    id: c.id,
    spaceId: c.spaceId,
    name: c.name,
    order: c.order,
  }));

  const adaptedSpace: SpaceItem = {
    id: space.id,
    name: space.name,
    description: space.description || "",
    lastActivity: space.updatedAt.toISOString(),
    memberCount: 1,
    color: space.color || "oklch(58% 0.1 240)",
    icon: space.icon || "default",
  };

  return (
    <SpaceDetailView
      space={adaptedSpace}
      initialFeed={feed}
      initialTasks={initialTasks}
      initialColumns={initialColumns}
      userId={session.userId}
    />
  );
}
