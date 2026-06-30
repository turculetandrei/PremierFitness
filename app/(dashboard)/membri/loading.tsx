import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      <Skeleton className="mb-4 h-10 w-full max-w-md" />

      <div className="rounded-card border border-border bg-surface p-4">
        <Skeleton className="mb-4 h-8 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
