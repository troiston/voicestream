import { Suspense } from "react";
import type { Metadata } from "next";

import { SpacesListSkeleton } from "@/components/app/spaces-list-skeleton";
import { SpacesPageClient } from "@/components/app/spaces-page-client";
import { mockSpaces } from "@/lib/mocks/spaces";

export const metadata: Metadata = {
  title: "Espaços",
  description: "Liste e crie espaços para agrupar conversas e notas.",
  robots: { index: false, follow: false },
};

async function SpacesData() {
  if (!process.env.CI) {
    await new Promise((r) => setTimeout(r, 420));
  }
  return <SpacesPageClient initialSpaces={mockSpaces} />;
}

export default function SpacesPage() {
  return (
    <Suspense fallback={<SpacesListSkeleton />}>
      <SpacesData />
    </Suspense>
  );
}
