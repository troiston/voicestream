import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="mt-2 h-5 w-96 rounded-md" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Left navigation */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
