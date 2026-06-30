import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  titlu,
  valoare,
  icon: Icon,
  hint,
}: {
  titlu: string;
  valoare: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card glow className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            {titlu}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">
            {valoare}
          </p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
