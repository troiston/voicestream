import type { Metadata } from "next";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { IntegrationsViewReal } from "@/components/integrations/integrations-view-real";

export const metadata: Metadata = {
  title: "Integrações",
  description: "Conecte ferramentas externas ao VoiceStream.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function IntegrationsPage() {
  const session = await requireSession();

  const rows = await db.integration.findMany({
    where: { userId: session.userId },
    select: { provider: true, status: true, connectedAt: true },
  });

  const statusByProvider = Object.fromEntries(
    rows.map((r) => [r.provider, r.status as "disconnected" | "connected" | "error"]),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Conecte ferramentas externas ao VoiceStream para automatizar transcrições, tarefas e
          notificações.
        </p>
      </header>
      <section aria-labelledby="integrations-catalog-heading" className="space-y-8">
        <IntegrationsViewReal statusByProvider={statusByProvider} />
      </section>
    </div>
  );
}
