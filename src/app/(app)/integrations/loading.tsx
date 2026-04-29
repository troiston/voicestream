import { Skeleton } from "@/components/ui/skeleton";

export default function IntegrationsLoading() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Ligue ferramentas externas ao CloudVoice. Abaixo vê um catálogo agrupado por categoria com estados
          «conectado» ou «disponível» e um fluxo de ligação em 3 passos.
        </p>
      </header>

      {/* Category sections skeleton */}
      {[1, 2, 3].map((catIndex) => (
        <section key={catIndex} className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="list-none">
                <div className="flex h-full flex-col rounded-[var(--radius-lg)] p-4 border border-border/60 bg-surface-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
