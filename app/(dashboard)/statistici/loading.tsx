import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-8 h-4 w-80" />

      {/* carduri luna curentă */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-8 w-24" />
          </Card>
        ))}
      </div>

      {/* breakdown */}
      <Skeleton className="mb-3 mt-8 h-3 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="mt-4 h-7 w-24" />
          </Card>
        ))}
      </div>

      {/* grafice */}
      <Skeleton className="mb-3 mt-8 h-3 w-40" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className={`p-5 ${i === 2 ? "lg:col-span-2" : ""}`}>
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-72 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
