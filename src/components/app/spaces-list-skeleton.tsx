import { Skeleton } from "@/components/ui/skeleton";

export function SpacesListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-56" />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="rounded-[var(--radius-lg)] border border-border bg-surface-1 p-4">
            <Skeleton className="h-5 w-[55%]" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
            <Skeleton className="mt-4 h-9 w-24" />
          </li>
        ))}
      </ul>
    </div>
  );
}
