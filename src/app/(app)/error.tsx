"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-dashed border-border bg-surface-1 p-6"
      role="alert"
    >
      <h2 className="text-lg font-semibold">O painel falhou a carregar</h2>
      <p className="mt-2 text-sm text-muted-foreground">Os dados de sessão podem estar desatualizados.</p>
      {error.digest ? (
        <p className="mt-1 text-xs text-foreground/40" aria-label="Código de erro">
          Ref. {error.digest}
        </p>
      ) : null}
      <div className="mt-4">
        <Button type="button" variant="primary" onClick={reset}>
          Atualizar secção
        </Button>
      </div>
    </div>
  );
}
