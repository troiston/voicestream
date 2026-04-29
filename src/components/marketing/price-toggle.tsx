"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type PriceToggleProps = {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
};

export function PriceToggle({ isAnnual, onToggle }: PriceToggleProps) {
  const a = useId();
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label="Período de faturamento">
      <span className="text-sm text-foreground/70" id={a} aria-hidden>
        {isAnnual ? "Anual" : "Mensal"}
      </span>
      <button
        type="button"
        role="switch"
        className="relative h-7 w-12 min-h-11 min-w-12 rounded-full border border-border bg-surface-2 p-0"
        id={`${a}-b`}
        aria-label="Alternar entre preço anual e mensal"
        aria-describedby={a}
        aria-checked={isAnnual}
        onClick={() => onToggle(!isAnnual)}
      >
        <span
          className={cn(
            "absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-accent transition-transform duration-200 motion-reduce:transition-none",
            isAnnual ? "translate-x-5" : "translate-x-0",
          )}
        />
        <span className="sr-only" aria-hidden>
          Clique para alternar entre preços anuais e mensais. Preços anuais têm desconto de 20%.
        </span>
      </button>
    </div>
  );
}
