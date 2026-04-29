"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error.digest) {
      // mínimo
    }
  }, [error]);

  return (
    <section
      className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center"
      aria-labelledby="mkt-err-h"
    >
      <h1 id="mkt-err-h" className="text-xl font-bold text-foreground">
        Não foi possível carregar esta secção
      </h1>
      <p className="text-sm text-muted-foreground">Pode tentar de novo ou voltar ao início.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="primary" onClick={reset}>
          Repetir
        </Button>
        <Button type="button" variant="secondary" onClick={() => (window.location.href = "/")}>
          Início
        </Button>
        <Link
          className="min-h-11 px-3 text-sm text-accent underline-offset-2 hover:underline"
          href="/contact"
        >
          Contato
        </Link>
      </div>
    </section>
  );
}
