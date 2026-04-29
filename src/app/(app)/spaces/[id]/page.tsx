import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { getAccessibleSpaceIds } from "@/features/spaces/access";
import { SpaceDetailView } from "@/components/app/space-detail-view";
import type { MockSpace, MockSpaceFeedItem } from "@/lib/mocks/spaces";

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

  // Fetch latest 20 recordings for feed
  const recordings = await db.recording.findMany({
    where: { spaceId: id },
    include: {
      user: { select: { name: true } },
      transcription: { select: { text: true } },
      summary: { select: { abstract: true } },
    },
    orderBy: { capturedAt: 'desc' },
    take: 20,
  });

  // Adapt to MockSpaceFeedItem shape
  const feed: MockSpaceFeedItem[] = recordings.map(r => ({
    id: r.id,
    spaceId: r.spaceId,
    author: r.user.name || 'Anónimo',
    body: r.summary?.abstract || r.transcription?.text?.substring(0, 200) || `Gravação: ${r.title || 'Sem título'}`,
    at: r.capturedAt.toISOString(),
    kind: 'voice' as const,
  }));

  // Adapt space to MockSpace shape
  const adaptedSpace: MockSpace = {
    id: space.id,
    name: space.name,
    description: space.description || '',
    lastActivity: space.updatedAt.toISOString(),
    members: 1,
    color: space.color || 'oklch(58% 0.1 240)',
    icon: space.icon || 'default'
  };

  return <SpaceDetailView space={adaptedSpace} initialFeed={feed} />;
}
