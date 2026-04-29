import type { Metadata } from "next";

import { MOCK_INTEGRATIONS } from "@/lib/mocks/integrations";
import { IntegrationsViewEnhanced } from "@/components/integrations/integrations-view-enhanced";

export const metadata: Metadata = {
  title: "Integrações",
  description: "Catálogo de integrações e estados de ligação (mock).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Ligue ferramentas externas ao CloudVoice. Abaixo vê um catálogo agrupado por categoria com estados
          «conectado» ou «disponível» e um fluxo de ligação em 3 passos.
        </p>
      </header>
      <section aria-labelledby="integrations-catalog-heading" className="space-y-8">
        <IntegrationsViewEnhanced integrations={MOCK_INTEGRATIONS} />
      </section>
    </div>
  );
}
