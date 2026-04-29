import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsageLoading() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Uso</h1>
        <p className="mt-2 text-foreground/60">
          Visualização de consumo e exportação de relatório em CSV (mock, sem backend).
        </p>
      </div>

      {/* Control skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-surface-1 border border-border/60">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card className="bg-surface-1 border border-border/60">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>

      {/* Bottom cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-surface-1 border border-border/60">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
