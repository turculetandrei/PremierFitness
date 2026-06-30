import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-2 h-4 w-36" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <Card className="mb-8 p-6">
        <Skeleton className="h-16 w-full" />
      </Card>

      <Card className="p-5">
        <Skeleton className="mb-4 h-5 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
