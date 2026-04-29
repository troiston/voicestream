import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpaceDetailView } from "@/components/app/space-detail-view";
import { getMockFeedForSpace, getMockSpaceById } from "@/lib/mocks/spaces";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const space = getMockSpaceById(id);
  if (!space) {
    return { title: "Espaço" };
  }
  return {
    title: space.name,
    description: space.description,
    robots: { index: false, follow: false },
  };
}

export default async function SpaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const space = getMockSpaceById(id);
  if (!space) {
    notFound();
  }
  const feed = getMockFeedForSpace(space.id);
  return <SpaceDetailView space={space} initialFeed={feed} />;
}
