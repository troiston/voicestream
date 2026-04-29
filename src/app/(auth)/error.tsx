"use client";

import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-border bg-surface-1 p-6 text-center"
      role="alert"
    >
      <h2 className="text-lg font-semibold">Erro neste passo de autenticação</h2>
      <p className="mt-2 text-sm text-muted-foreground">Tente novamente.</p>
      {error.digest ? (
        <p className="mt-2 text-xs text-foreground/40" aria-label="Código de erro">
          Ref. {error.digest}
        </p>
      ) : null}
      <div className="mt-4 flex justify-center">
        <Button type="button" variant="primary" onClick={reset}>
          Repetir
        </Button>
      </div>
    </div>
  );
}
