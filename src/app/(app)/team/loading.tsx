import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Membros com acesso à organização e convites pendentes (mock).
        </p>
      </div>

      {/* Members section skeleton */}
      <section>
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-24" />
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Invites section skeleton */}
      <section>
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <div className="space-y-2 p-4">
              {[1].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
