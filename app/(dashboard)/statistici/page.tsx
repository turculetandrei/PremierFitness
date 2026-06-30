import { BarChart3 } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { StatisticiClient } from "@/components/statistici/statistici-client";
import type { Abonament } from "@/types";

export const dynamic = "force-dynamic";

export default async function StatisticiPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("abonamente")
    .select("id, membru_id, tip, pret, data_start, data_sfarsit, created_at");

  const abonamente = (data ?? []) as Abonament[];

  // Stare goală — nicio dată încă
  if (abonamente.length === 0) {
    return (
      <div>
        <PageHeader
          titlu="Statistici"
          subtitlu="Evoluția veniturilor și a membrilor"
        />
        <Card className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-muted">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="font-semibold">Nu există încă date pentru statistici</p>
          <p className="max-w-sm text-sm text-muted">
            Adaugă abonamente membrilor pentru a vedea graficele de venituri și
            evoluția numărului de membri activi.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titlu="Statistici"
        subtitlu="Evoluția veniturilor și a membrilor"
      />
      <StatisticiClient abonamente={abonamente} />
    </div>
  );
}
