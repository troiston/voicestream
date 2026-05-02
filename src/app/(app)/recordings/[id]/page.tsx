import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { RecordingDetail } from "@/components/recordings/recording-detail/recording-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const recording = await db.recording.findUnique({
    where: { id },
    select: { title: true, capturedAt: true },
  });
  if (!recording) return { title: "Gravação não encontrada" };
  return {
    title: recording.title ?? `Gravação de ${recording.capturedAt.toLocaleDateString("pt-BR")}`,
  };
}

export default async function RecordingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireSession({ nextPath: `/recordings/${id}` });

  const recording = await db.recording.findUnique({
    where: { id },
    include: {
      space: { select: { id: true, name: true, ownerId: true } },
      suggestions: {
        where: { status: { not: "discarded" } },
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      transcription: {
        select: { text: true },
        include: { segments: { orderBy: { startMs: "asc" } } },
      },
      summary: {
        select: { abstract: true, decisions: true, nextSteps: true, title: true },
      },
    },
  });

  if (!recording) notFound();

  // Access check: owner of recording OR space member
  const isRecordingOwner = recording.userId === session.userId;
  const isSpaceOwner = recording.space.ownerId === session.userId;
  if (!isRecordingOwner && !isSpaceOwner) {
    const membership = await db.spaceMember.findFirst({
      where: { spaceId: recording.spaceId, userId: session.userId, status: "active" },
      select: { id: true },
    });
    if (!membership) notFound();
  }

  // Space members for assignee dropdown
  const members = await db.spaceMember.findMany({
    where: { spaceId: recording.spaceId, status: "active" },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { user: { name: "asc" } },
  });

  const spaceMembers = members.map((m) => ({ id: m.user.id, name: m.user.name }));

  return (
    <RecordingDetail
      recording={{
        id: recording.id,
        title: recording.title,
        capturedAt: recording.capturedAt.toISOString(),
        durationSec: recording.durationSec,
        status: recording.status,
        errorMessage: recording.errorMessage,
        spaceId: recording.spaceId,
        spaceName: recording.space.name,
        transcript: recording.transcription?.text ?? null,
        transcriptSegments: recording.transcription?.segments.map((s) => ({
          id: s.id,
          speaker: s.speaker,
          startMs: s.startMs,
          endMs: s.endMs,
          text: s.text,
        })) ?? [],
        topicalSummary: (recording as { topicalSummary?: string | null }).topicalSummary ?? null,
        summary: recording.summary?.abstract ?? null,
        decisions: recording.summary?.decisions ?? [],
        nextSteps: recording.summary?.nextSteps ?? [],
        suggestions: recording.suggestions.map((s) => ({
          id: s.id,
          what: s.what,
          why: s.why,
          who: s.who,
          assigneeId: s.assigneeId,
          assigneeName: s.assignee?.name ?? null,
          assigneeMatch: s.assigneeMatch,
          whenText: s.whenText,
          whenDate: s.whenDate?.toISOString() ?? null,
          whereText: s.whereText,
          how: s.how,
          howMuch: s.howMuch,
          sourceSnippet: s.sourceSnippet,
          status: s.status,
          createdTaskId: s.createdTaskId,
        })),
      }}
      spaceMembers={spaceMembers}
    />
  );
}
