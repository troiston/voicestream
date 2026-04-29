import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Filter pills skeleton */}
      <div className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4">
        <Skeleton className="h-4 w-20 mb-3 rounded-md" />
        <div className="flex gap-2 mb-4 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-20 mb-3 rounded-md" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
