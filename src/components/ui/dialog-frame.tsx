"use client";

import { useId, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SimpleDialogProps = {
  children: ReactNode;
  title: string;
  description?: string;
  trigger: ReactNode;
  variant?: "info" | "danger";
  confirmLabel: string;
};

export function SimpleDialog({
  children,
  title,
  description,
  trigger,
  variant = "info",
  confirmLabel,
}: SimpleDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const titleId = `${id}-title`;
  const descId = description ? `${id}-desc` : undefined;

  const open = () => {
    ref.current?.showModal();
  };

  const close = () => {
    ref.current?.close();
  };

  return (
    <>
      <button
        type="button"
        className="min-h-11 rounded-[var(--radius-md)] text-sm font-semibold text-accent underline-offset-2 hover:underline"
        onClick={open}
      >
        {trigger}
      </button>
      <dialog
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 w-[min(100%,28rem)] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
          "rounded-[var(--radius-lg)] border border-border bg-surface-1 p-0 shadow-md",
        )}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
          }
        }}
      >
        <div className="border-b border-border px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description ? (
            <p id={descId} className="mt-1 text-sm text-foreground/60">
              {description}
            </p>
          ) : null}
        </div>
        <div className="px-6 py-4">{children}</div>
        <div className="flex justify-end gap-3 border-t border-border bg-surface-1 px-6 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={close}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={close}
          >
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
