"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { MockIntegration } from "@/lib/mocks/integrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface IntegrationsViewProps {
  integrations: MockIntegration[];
}

export function IntegrationsView({ integrations }: IntegrationsViewProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<MockIntegration | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleBase = useId();

  const open = (i: MockIntegration) => {
    setActive(i);
  };

  const close = () => {
    dialogRef.current?.close();
    setActive(null);
  };

  useEffect(() => {
    if (active) {
      dialogRef.current?.showModal();
    }
  }, [active]);

  const titleId = active ? `${titleBase}-${active.id}` : `${titleBase}-empty`;

  return (
    <>
      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((item, i) => (
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
              delay: reduce ? 0 : Math.min(i * 0.06, 0.42),
            }}
          >
            <article
              className={cn(
                "flex h-full flex-col rounded-[var(--radius-lg)] p-4 text-left transition-all motion-reduce:transform-none",
                item.status === "connected"
                  ? "gradient-border"
                  : "border border-border/60 bg-surface-1 opacity-70 hover:opacity-90",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-snug text-foreground">{item.name}</h3>
                <Badge variant={item.status === "connected" ? "success" : "muted"}>
                  {item.status === "connected" ? "Ligada" : "Disponível"}
                </Badge>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.category}
              </p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{item.description}</p>
              <Button
                type="button"
                variant={item.status === "connected" ? "primary" : "secondary"}
                size="sm"
                className={cn("mt-4 min-h-11 w-full", item.status === "connected" && "btn-gradient")}
                onClick={() => open(item)}
                aria-haspopup="dialog"
              >
                {item.status === "connected" ? "Gerir (mock)" : "Ver detalhes"}
              </Button>
            </article>
          </motion.li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed top-1/2 left-1/2 w-[min(100%,28rem)] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
          "glass-card rounded-[var(--radius-xl)] p-0 shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        )}
        aria-labelledby={titleId}
        onClose={() => setActive(null)}
      >
        {active ? (
          <div className="p-6">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {active.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{active.detail}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={active.status === "connected" ? "success" : "muted"}>
                {active.status === "connected" ? "Estado: ligada" : "Estado: disponível"}
              </Badge>
              <Badge variant="outline">{active.category}</Badge>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" className="min-h-11" onClick={close}>
                Fechar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="btn-gradient min-h-11"
                onClick={close}
                aria-label={
                  active.status === "connected"
                    ? "Guardar alterações simuladas"
                    : "Ligar integração simulada"
                }
              >
                {active.status === "connected" ? "Guardar (mock)" : "Ligar (mock)"}
              </Button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
