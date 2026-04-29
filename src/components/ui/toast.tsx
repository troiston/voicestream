"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type ToastT = { id: string; title: string; body?: string; kind?: "info" | "success" | "error" };

const ToastCtx = createContext<{
  show: (t: Omit<ToastT, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const show = useCallback((t: Omit<ToastT, "id">) => {
    const id = `${Date.now()}`;
    setToasts((c) => [...c, { ...t, id }]);
    window.setTimeout(() => {
      setToasts((c) => c.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <ul
        className="pointer-events-none fixed end-3 bottom-3 z-[200] flex max-w-sm flex-col gap-2 p-0"
        aria-label="Notificações"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <li
            key={t.id}
            className={cn(
              "pointer-events-auto flex flex-col gap-1 rounded-[var(--radius-md)] border p-3 text-sm shadow-md",
              t.kind === "error"
                ? "border-danger/40 bg-surface-1"
                : t.kind === "success"
                  ? "border-success/40 bg-surface-1"
                  : "border-border bg-surface-1",
            )}
          >
            <span className="font-semibold text-foreground">{t.title}</span>
            {t.body ? <span className="text-muted-foreground">{t.body}</span> : null}
          </li>
        ))}
      </ul>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const t = useContext(ToastCtx);
  if (!t) {
    throw new Error("useToast requer <ToastProvider>.");
  }
  return t;
}

// Radix slot-free optional hook id for tests
export function useToastId() {
  return useId();
}
