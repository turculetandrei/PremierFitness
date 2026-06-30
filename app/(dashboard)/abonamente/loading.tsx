import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-2 h-9 w-52" />
      <Skeleton className="mb-8 h-4 w-40" />

      <div className="mb-4 flex gap-4">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-44" />
      </div>

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
