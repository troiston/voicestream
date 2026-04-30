"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { planComparisonRows } from "@/lib/mocks/invoices";
import { cn } from "@/lib/utils";

export interface BillingUpgradeDialogProps {
  className?: string;
  currentPlan?: "free" | "pro" | "enterprise";
}

export function BillingUpgradeDialog({ className, currentPlan = "free" }: BillingUpgradeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const titleId = useId();
  const descId = useId();

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleUpgrade = useCallback(
    async (plan: "pro" | "enterprise") => {
      if (plan === currentPlan) {
        toast.info("Você já está neste plano");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Falha ao gerar checkout");
        }

        const data = await response.json();
        window.location.href = data.url;
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error(
          error instanceof Error ? error.message : "Erro ao processar upgrade"
        );
        setIsLoading(false);
      }
    },
    [currentPlan]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <div className={cn(className)}>
      <Button type="button" variant="primary" size="md" className="min-h-11" onClick={open}>
        Comparar e subir de plano
      </Button>
      {isOpen ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <div
            className="absolute inset-0 bg-foreground/30"
            role="presentation"
            onClick={close}
            aria-hidden="true"
          />
          <div
            id="e2e-billing-compare-dlg"
            data-testid="e2e-billing-compare-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={cn(
              "fixed top-1/2 left-1/2 z-50 w-[min(100%,40rem)] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
              "rounded-[var(--radius-lg)] border border-border bg-surface-1 p-0 shadow-md",
            )}
          >
            <div className="border-b border-border px-6 py-4">
              <h2 id={titleId} className="text-lg font-semibold">
                Pro vs Empresa
              </h2>
              <p id={descId} className="mt-1 text-sm text-foreground/60">
                Dados de exemplo. O upgrade real será ligado ao fornecedor de pagamentos na fase de
                implementação.
              </p>
            </div>
            <div className="max-h-[min(70vh,28rem)] overflow-auto px-6 py-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[20rem] border-collapse text-sm">
                  <caption className="sr-only">Comparação entre plano Pro e Empresa</caption>
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th scope="col" className="py-2 pe-4 font-medium text-foreground/70">
                        Funcionalidade
                      </th>
                      <th scope="col" className="py-2 pe-4 font-semibold">
                        Pro (atual)
                      </th>
                      <th scope="col" className="py-2 font-semibold text-brand">
                        Empresa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {planComparisonRows.map((row) => (
                      <tr key={row.label} className="border-b border-border/80">
                        <th scope="row" className="py-3 pe-4 font-normal text-foreground/80">
                          {row.label}
                        </th>
                        <td className="py-3 pe-4">{row.pro}</td>
                        <td className="py-3 font-medium">{row.business}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border bg-surface-1 px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={close}
                disabled={isLoading}
              >
                Fechar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleUpgrade("enterprise")}
                disabled={isLoading || currentPlan === "enterprise"}
              >
                {isLoading ? "Processando..." : "Upgrade para Empresa"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
