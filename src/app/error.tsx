"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Não registe detalhes sensíveis; digest ajuda a correlacionar em suporte
    if (error.digest) {
      // intencionalmente mínimo em produção
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-sm font-semibold text-danger">Erro inesperado</p>
      <h1 className="text-2xl font-bold">Algo correu mal</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Tente novamente. Se o problema continuar, contacte o suporte e indique o código{" "}
        {error.digest ? <span className="font-mono text-foreground/80">{error.digest}</span> : "—"}.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="primary" onClick={reset}>
          Tentar de novo
        </Button>
        <Link
          className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-4 text-sm font-semibold text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="/"
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
