"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { MockIntegration } from "@/lib/mocks/integrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IntegrationConnectionDialog } from "./integration-connection-dialog";

export interface IntegrationsViewEnhancedProps {
  integrations: MockIntegration[];
}

function groupIntegrationsByCategory(
  integrations: MockIntegration[]
): Record<string, MockIntegration[]> {
  return integrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<string, MockIntegration[]>
  );
}

const CATEGORY_ORDER = ["Produtividade", "Comunicação", "Calendário", "CRM", "Automação"];

export function IntegrationsViewEnhanced({ integrations }: IntegrationsViewEnhancedProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<MockIntegration | null>(null);
  const titleBase = useId();
  const grouped = groupIntegrationsByCategory(integrations);

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    const aOrder = indexA >= 0 ? indexA : 999;
    const bOrder = indexB >= 0 ? indexB : 999;
    return aOrder - bOrder;
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
                const itemIndex = catIndex * 10 + i;
                return (
                  <motion.li
                    key={item.id}
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
                        item.status === "connected"
                          ? "gradient-border"
                          : "border border-border/60 bg-surface-1 opacity-70 hover:opacity-90"
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
                        <Badge
                          variant={
                            item.status === "connected"
                              ? "success"
                              : item.status === "available"
                                ? "muted"
                                : "outline"
                          }
                          className="shrink-0"
                        >
                          {item.status === "connected"
                            ? "Conectado"
                            : item.status === "available"
                              ? "Disponível"
                              : "Em breve"}
                        </Badge>
                      </div>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.description}</p>
                      <Button
                        type="button"
                        variant={item.status === "connected" ? "primary" : "secondary"}
                        size="sm"
                        className={cn(
                          "mt-4 min-h-11 w-full",
                          item.status === "connected" && "btn-gradient"
                        )}
                        onClick={() => setActive(item)}
                        aria-haspopup="dialog"
                      >
                        {item.status === "connected" ? "Gerir" : "Conectar"}
                      </Button>
                    </article>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {active && (
        <IntegrationConnectionDialog
          integration={active}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
