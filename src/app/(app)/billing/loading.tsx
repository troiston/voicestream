import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Faturação</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vista geral do plano, histórico de faturas e cartões guardados (dados mock).
        </p>
      </div>

      {/* Plan cards skeleton */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          Planos disponíveis
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border/60 bg-surface-1">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="mt-3 h-8 w-32" />
                <div className="mt-4 space-y-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="mt-6 h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Plan usage skeleton */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border border-border/60 bg-surface-1 lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Invoices skeleton */}
      <section>
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Payment methods skeleton */}
      <section>
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
