import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "O conteúdo procurado não está disponível.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Não encontrámos esta página</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        A rota pode ter mudado ou o endereço está incorreto. Tente o início ou utilize o botão
        abaixo.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Ir para o início
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface-1 px-6 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Contato
        </Link>
      </div>
    </div>
  );
}
