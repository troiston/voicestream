"use client";

import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tab = { id: string; label: string; content: ReactNode };

export function SimpleTabs({ items }: { items: ReadonlyArray<Tab> }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const id = useId();
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <div
        className="flex min-h-11 flex-wrap gap-1 border-b border-border p-0"
        role="tablist"
        aria-label="Seção"
      >
        {items.map((t) => {
          const isSel = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              id={`${id}-tab-${t.id}`}
              className={cn(
                "min-h-11 rounded-t-[var(--radius-md)] px-4 text-sm font-medium",
                isSel
                  ? "bg-surface-1 text-foreground ring-1 ring-b-0 ring-border"
                  : "text-foreground/50 hover:text-foreground",
              )}
              role="tab"
              aria-selected={isSel}
              aria-controls={`${id}-panel-${t.id}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {items.map((t) => {
        if (t.id !== active) {
          return null;
        }
        return (
          <div
            key={t.id}
            id={`${id}-panel-${t.id}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${t.id}`}
            className="rounded-b-[var(--radius-lg)] border border-t-0 border-border bg-surface-1 p-4"
          >
            {t.content}
          </div>
        );
      })}
    </div>
  );
}
