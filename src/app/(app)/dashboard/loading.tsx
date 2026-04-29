import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-xl" />
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
        <Skeleton className="lg:col-span-3 h-64 rounded-xl" />
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Recent spaces */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
