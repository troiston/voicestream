import { Suspense } from "react";
import type { Metadata } from "next";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { getAccessibleSpaceIds } from "@/features/spaces/access";
import { SpacesListSkeleton } from "@/components/app/spaces-list-skeleton";
import { SpacesPageClient } from "@/components/app/spaces-page-client";
import type { MockSpace } from "@/lib/mocks/spaces";

export const metadata: Metadata = {
  title: "Espaços",
  description: "Liste e crie espaços para agrupar conversas e notas.",
  robots: { index: false, follow: false },
};

async function SpacesData() {
  const session = await requireSession();

  // Get all space IDs user has access to
  const spaceIds = await getAccessibleSpaceIds(session.userId);

  // Fetch spaces with counts
  const spaces = await db.space.findMany({
    where: { id: { in: spaceIds } },
    include: {
      _count: {
        select: { members: true, recordings: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Adapt to MockSpace shape for component compatibility
  const adaptedSpaces: MockSpace[] = spaces.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    lastActivity: s.updatedAt.toISOString(),
    members: s._count.members,
    color: s.color || 'oklch(58% 0.1 240)',
    icon: s.icon || 'default'
  }));

  return <SpacesPageClient initialSpaces={adaptedSpaces} />;
}

export default function SpacesPage() {
  return (
    <Suspense fallback={<SpacesListSkeleton />}>
      <SpacesData />
    </Suspense>
  );
}
