import { Suspense } from "react";
import type { Metadata } from "next";

import { CaptureWorkspace } from "@/components/app/capture-workspace";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Captura",
  description: "Gravação de voz com histórico e estados de fluxo.",
  robots: { index: false, follow: false },
};

async function CaptureData() {
  const { mockCaptureHistory } = await import("@/lib/mocks/captures");
  if (!process.env.CI) {
    await new Promise((r) => setTimeout(r, 280));
  }
  return <CaptureWorkspace history={mockCaptureHistory} />;
}

function CaptureSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row" aria-busy="true" aria-live="polite">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />
      </div>
      <Skeleton className="h-80 w-full shrink-0 lg:max-w-xs" />
    </div>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={<CaptureSkeleton />}>
      <CaptureData />
    </Suspense>
  );
}
