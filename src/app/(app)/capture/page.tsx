import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { CaptureWorkspace } from "@/components/app/capture-workspace";

export const metadata: Metadata = {
  title: "Captura",
  description: "Gravação de voz com upload e histórico.",
  robots: { index: false, follow: false },
};

export default async function CapturePage() {
  const session = await requireSession();
  const userId = session.userId;

  // Spaces where user is owner OR active member
  const spaces = await db.space.findMany({
    where: {
      isArchived: false,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              status: "active",
            },
          },
        },
      ],
    },
    select: { id: true, name: true, kind: true },
    orderBy: { createdAt: "asc" },
  });

  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Captura de voz</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Você ainda não tem nenhum espaço. Crie um espaço primeiro para começar a gravar.
        </p>
        <Link
          href="/spaces"
          className="btn-gradient inline-flex items-center gap-2 rounded-[var(--radius-lg)] px-5 py-2.5 text-sm font-semibold"
        >
          Ir para Espaços
        </Link>
      </div>
    );
  }

  const spaceIds = spaces.map((s) => s.id);

  const recordings = await db.recording.findMany({
    where: { spaceId: { in: spaceIds } },
    orderBy: { capturedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      capturedAt: true,
      durationSec: true,
      status: true,
      space: { select: { name: true } },
    },
  });

  const history = recordings.map((r) => ({
    id: r.id,
    title: r.title,
    capturedAt: r.capturedAt.toISOString(),
    durationSec: r.durationSec,
    status: r.status,
    spaceName: r.space.name,
  }));

  return (
    <CaptureWorkspace
      spaces={spaces.map((s) => ({ id: s.id, name: s.name, kind: s.kind }))}
      history={history}
    />
  );
}
