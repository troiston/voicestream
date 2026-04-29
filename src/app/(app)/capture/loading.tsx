import { Skeleton } from "@/components/ui/skeleton";

export default function CaptureLoading() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row" aria-busy="true">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />
      </div>
      <Skeleton className="h-80 w-full shrink-0 lg:max-w-xs" />
    </div>
  );
}
