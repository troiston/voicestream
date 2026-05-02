import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { SpaceDetailView } from "@/components/app/space-detail-view";
import type {
  RecordingDetailItem,
  SpaceItem,
  SpaceFeedItem,
  SpaceMemberOption,
  TaskListItem,
  TaskColumnItem,
} from "@/types/domain";
import {
  decryptSegmentIfNeeded,
  decryptTranscriptIfNeeded,
} from "@/lib/crypto/transcripts";
import { getRecordingStatusView } from "@/lib/recordings/presentation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ recording?: string }>;
};

async function loadSuggestedTasks(recordingIds: string[]) {
  if (recordingIds.length === 0) return new Map<string, RecordingDetailItem["suggestedTasks"]>();

  const columnRows = await db.$queryRaw<Array<{ exists: boolean }>>`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'summary'
        and column_name = 'suggestedTasks'
    ) as "exists"
  `;
  if (columnRows[0]?.exists !== true) {
    return new Map<string, RecordingDetailItem["suggestedTasks"]>();
  }

  const rows = await db.$queryRaw<Array<{ recordingId: string; suggestedTasks: unknown }>>`
    select "recordingId", "suggestedTasks"
    from "summary"
    where "recordingId" in (${Prisma.join(recordingIds)})
  `;

  return new Map(
    rows.map((row) => [
      row.recordingId,
      Array.isArray(row.suggestedTasks)
        ? (row.suggestedTasks as RecordingDetailItem["suggestedTasks"])
        : [],
    ]),
  );
}

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

export default async function SpaceDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const highlightedRecordingId = (await searchParams)?.recording;
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
  const [recordings, tasks, columns, memberRows] = await Promise.all([
    db.recording.findMany({
      where: { spaceId: id },
      include: {
        user: { select: { name: true } },
        transcription: {
          select: {
            id: true,
            text: true,
            encrypted: true,
            segments: {
              select: {
                id: true,
                speaker: true,
                startMs: true,
                endMs: true,
                text: true,
                encrypted: true,
              },
              orderBy: { startMs: "asc" },
            },
          },
        },
        summary: {
          select: {
            abstract: true,
            decisions: true,
            nextSteps: true,
          },
        },
      },
      orderBy: { capturedAt: "desc" },
      take: 20,
    }),
    db.task.findMany({
      where: { spaceId: id },
      include: {
        space: { select: { name: true } },
        recording: { select: { title: true, capturedAt: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    db.taskColumn.findMany({
      where: { spaceId: id },
      orderBy: { order: "asc" },
    }),
    db.spaceMember.findMany({
      where: { spaceId: id, status: "active" },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { invitedAt: "asc" },
    }),
  ]);
  const suggestedTasksByRecordingId = await loadSuggestedTasks(recordings.map((r) => r.id));

  const members: SpaceMemberOption[] = [
    { id: space.ownerId, name: "Dono do espaço" },
    ...memberRows.map((member) => ({ id: member.user.id, name: member.user.name })),
  ];

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

  const detailedRecordings: RecordingDetailItem[] = recordings.map((r) => {
    const decrypted = decryptTranscriptIfNeeded(r.transcription, r.userId);
    const status = getRecordingStatusView(r.status);
    const summary = r.summary as
      | {
          abstract: string;
          decisions: string[];
          nextSteps: string[];
        }
      | null;
    const suggestedTasks = suggestedTasksByRecordingId.get(r.id) ?? [];

    return {
      id: r.id,
      title: r.title,
      status: r.status,
      statusLabel: status.label,
      statusClassName: status.className,
      capturedAt: r.capturedAt.toISOString(),
      durationSec: r.durationSec,
      streamUrl: `/api/recordings/${r.id}/audio`,
      author: r.user.name || "Anónimo",
      abstract: summary?.abstract ?? null,
      decisions: summary?.decisions ?? [],
      nextSteps: summary?.nextSteps ?? [],
      transcript: decrypted?.text ?? null,
      segments:
        decrypted?.segments?.map((segment) => {
          const item = decryptSegmentIfNeeded(segment, r.userId);
          return {
            id: item.id,
            speaker: item.speaker,
            startMs: item.startMs,
            endMs: item.endMs,
            text: item.text,
          };
        }) ?? [],
      suggestedTasks,
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
    assigneeUserId: task.assigneeUserId,
    assigneeName: task.assignee?.name ?? null,
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
      recordings={detailedRecordings}
      members={members}
      highlightedRecordingId={highlightedRecordingId}
      initialTasks={initialTasks}
      initialColumns={initialColumns}
      userId={session.userId}
    />
  );
}
