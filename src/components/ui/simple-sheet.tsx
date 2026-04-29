"use client";

import { useId, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SimpleSheetProps = {
  children: ReactNode;
  title: string;
  sideLabel: string;
};

export function SimpleSheet({ children, title, sideLabel }: SimpleSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const titleId = `${id}-sheet-title`;
  const handleClose = () => {
    ref.current?.close();
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          ref.current?.showModal();
        }}
      >
        {sideLabel}
      </Button>
      <dialog
        ref={ref}
        className={cn(
          "fixed end-0 top-0 m-0 h-dvh w-[min(100%,22rem)] max-w-full",
          "rounded-s-[var(--radius-lg)] border border-s border-t border-b-0 border-border bg-surface-1 p-0 shadow-md",
        )}
        aria-labelledby={titleId}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 id={titleId} className="text-sm font-semibold">
              {title}
            </h2>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm text-foreground/80">
            {children}
          </div>
        </div>
      </dialog>
    </>
  );
}
