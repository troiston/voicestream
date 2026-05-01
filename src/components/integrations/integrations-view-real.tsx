"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Provider catalog (static — never from DB)
// ---------------------------------------------------------------------------

type ProviderKey =
  | "google_calendar"
  | "notion"
  | "slack"
  | "zapier"
  | "hubspot"
  | "microsoft";

type ProviderMeta = {
  key: ProviderKey;
  name: string;
  description: string;
  category: string;
  comingSoon: boolean;
};

const PROVIDERS: ProviderMeta[] = [
  {
    key: "google_calendar",
    name: "Google Calendar",
    description: "Sincronize reuniões e lembretes com o seu calendário.",
    category: "Calendário",
    comingSoon: false,
  },
  {
    key: "notion",
    name: "Notion",
    description: "Exporte transcrições e tarefas para bases e páginas.",
    category: "Produtividade",
    comingSoon: true,
  },
  {
    key: "slack",
    name: "Slack",
    description: "Envie resumos e clips para canais ou mensagens diretas.",
    category: "Comunicação",
    comingSoon: true,
  },
  {
    key: "zapier",
    name: "Zapier",
    description: "Automatize fluxos com milhares de apps.",
    category: "Automação",
    comingSoon: true,
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description: "Associe conversas a negócios e contactos CRM.",
    category: "CRM",
    comingSoon: true,
  },
  {
    key: "microsoft",
    name: "Microsoft Teams",
    description: "Importe gravações e presenças das reuniões Teams.",
    category: "Comunicação",
    comingSoon: true,
  },
];

const CATEGORY_ORDER = ["Produtividade", "Comunicação", "Calendário", "CRM", "Automação"];

function groupByCategory(providers: ProviderMeta[]) {
  return providers.reduce<Record<string, ProviderMeta[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IntegrationsViewRealProps {
  /** Map of provider key → status from DB; missing key means "disconnected" */
  statusByProvider: Record<string, "disconnected" | "connected" | "error">;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntegrationsViewReal({ statusByProvider }: IntegrationsViewRealProps) {
  const reduce = useReducedMotion();
  const grouped = groupByCategory(PROVIDERS);

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai >= 0 ? ai : 999) - (bi >= 0 ? bi : 999);
  });

  return (
    <>
      {sortedCategories.map((category, catIndex) => {
        const items = grouped[category];
        return (
          <section key={category} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {category}
            </h3>
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => {
                const status = statusByProvider[item.key] ?? "disconnected";
                const isConnected = status === "connected";
                const itemIndex = catIndex * 10 + i;

                return (
                  <motion.li
                    key={item.key}
                    className="list-none"
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-48px" }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 28,
                      delay: reduce ? 0 : Math.min(itemIndex * 0.06, 0.42),
                    }}
                  >
                    <article
                      className={cn(
                        "flex h-full flex-col rounded-[var(--radius-lg)] p-4 text-left transition-all motion-reduce:transform-none",
                        isConnected
                          ? "gradient-border"
                          : "border border-border/60 bg-surface-1 opacity-70 hover:opacity-90",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0"
                            style={{
                              background: "var(--brand)/15",
                              color: "var(--brand)",
                            }}
                          >
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold leading-snug text-foreground">
                              {item.name}
                            </h3>
                            <Badge variant="outline" className="mt-1 text-[10px]">
                              {item.category}
                            </Badge>
                          </div>
                        </div>

                        {item.comingSoon ? (
                          <Badge variant="outline" className="shrink-0">
                            Em breve
                          </Badge>
                        ) : (
                          <Badge
                            variant={
                              isConnected
                                ? "success"
                                : status === "error"
                                  ? "destructive"
                                  : "muted"
                            }
                            className="shrink-0"
                          >
                            {isConnected ? "Conectado" : status === "error" ? "Erro" : "Disponível"}
                          </Badge>
                        )}
                      </div>

                      <p className="mt-2 flex-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>

                      {item.comingSoon ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="mt-4 min-h-11 w-full"
                          disabled
                          aria-disabled="true"
                        >
                          Em breve
                        </Button>
                      ) : (
                        // TODO (fase 10.H): substituir por redirect OAuth real em /api/integrations/google/connect
                        <Link
                          href="/api/integrations/google/connect"
                          className={cn(
                            "mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors",
                            isConnected
                              ? "btn-gradient bg-brand text-brand-foreground hover:bg-brand/90"
                              : "border border-border bg-surface-1 text-foreground hover:bg-surface-2",
                          )}
                        >
                          {isConnected ? "Gerenciar conexão" : "Conectar"}
                        </Link>
                      )}
                    </article>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
